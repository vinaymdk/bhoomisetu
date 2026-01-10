import { Injectable, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { AiService } from '../ai/ai.service';
import { FirebaseService } from '../firebase/firebase.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { LoginSession, LoginProvider } from './entities/login-session.entity';
import { OtpLog, OtpChannel, OtpPurpose } from './entities/otp-log.entity';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  roles: string[];
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly aiService: AiService,
    private readonly firebaseService: FirebaseService,
    @InjectRepository(LoginSession)
    private readonly loginSessionRepository: Repository<LoginSession>,
    @InjectRepository(OtpLog)
    private readonly otpLogRepository: Repository<OtpLog>,
  ) {}

  async requestOtp(dto: RequestOtpDto, ipAddress?: string, userAgent?: string): Promise<{ success: boolean; message: string }> {
    // AI Fraud Detection: Check risk before sending OTP
    const fraudScore = await this.aiService.scoreFraudRisk({
      phone: dto.channel === 'sms' ? dto.destination : undefined,
      email: dto.channel === 'email' ? dto.destination : undefined,
      ipAddress,
      userAgent,
      requestType: 'otp_request',
      timestamp: new Date().toISOString(),
    });

    // Block if high risk
    if (fraudScore.shouldBlock) {
      throw new ForbiddenException(
        `OTP request blocked: ${fraudScore.reasons.join(', ')}`,
      );
    }

    // Check for recent OTP requests (rate limiting)
    const recentOtpLogs = await this.otpLogRepository.count({
      where: {
        destination: dto.destination,
        channel: dto.channel,
        createdAt: MoreThan(new Date(Date.now() - 60 * 1000)), // Last 1 minute
        isUsed: false,
      },
    });

    if (recentOtpLogs >= 3) {
      throw new ForbiddenException('Too many OTP requests. Please wait before requesting again.');
    }

    // Note: Firebase handles OTP sending on the client side
    // This endpoint just logs the request and performs fraud checks
    // Client should use Firebase SDK: firebase.auth().signInWithPhoneNumber() or similar
    
    const otpLog = this.otpLogRepository.create({
      channel: dto.channel,
      destination: dto.destination,
      purpose: dto.purpose || 'login',
      otpHash: crypto.createHash('sha256').update(`${dto.destination}-${Date.now()}`).digest('hex'), // Placeholder hash
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      fraudRiskScore: fraudScore.riskScore,
      metadata: {
        ipAddress,
        userAgent,
        fraudReasons: fraudScore.reasons,
        note: 'Firebase handles OTP delivery on client side',
      },
    });
    await this.otpLogRepository.save(otpLog);

    return {
      success: true,
      message: dto.channel === 'sms' 
        ? 'OTP will be sent to your phone via Firebase. Use Firebase SDK on client to receive OTP.'
        : 'OTP will be sent to your email via Firebase. Use Firebase SDK on client to receive OTP.',
    };
  }

  async verifyOtp(dto: VerifyOtpDto, ipAddress?: string, userAgent?: string, deviceId?: string): Promise<AuthResult> {
    // Validate Firebase ID token (client verifies OTP and gets ID token)
    if (!dto.idToken) {
      throw new BadRequestException('ID token is required. Client must verify OTP using Firebase SDK first.');
    }

    let firebaseUser;
    try {
      // Verify Firebase ID token
      firebaseUser = await this.firebaseService.verifyIdToken(dto.idToken);
    } catch (error: any) {
      throw new UnauthorizedException(`Invalid Firebase token: ${error.message}`);
    }

    // Extract phone or email from Firebase user
    const phone = dto.channel === 'sms' ? firebaseUser.phoneNumber : undefined;
    const email = dto.channel === 'email' ? firebaseUser.email : undefined;

    if (!phone && !email) {
      throw new BadRequestException('Phone number or email not found in Firebase token');
    }

    // Find or create user
    const user = await this.usersService.findOrCreateByFirebaseUid({
      firebaseUid: firebaseUser.uid,
      phone: phone || null,
      email: email || null,
      fullName: firebaseUser.displayName || null,
    });

    // Update OTP log as verified
    const otpLog = await this.otpLogRepository.findOne({
      where: {
        destination: phone || email || '',
        channel: dto.channel,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (otpLog) {
      otpLog.isUsed = true;
      otpLog.verifiedAt = new Date();
      await this.otpLogRepository.save(otpLog);
    }

    // AI Duplicate Detection: Check for duplicate accounts
    const duplicateCheck = await this.aiService.detectDuplicateAccounts({
      phone: user.primaryPhone || undefined,
      email: user.primaryEmail || undefined,
      firebaseUid: user.firebaseUid || undefined,
      deviceId,
      ipAddress,
      timestamp: new Date().toISOString(),
    });

    // Update user fraud risk score if duplicate detected
    if (duplicateCheck.isDuplicate && duplicateCheck.confidence > 0.7) {
      // Increase fraud risk score
      user.fraudRiskScore = Math.min(user.fraudRiskScore + 20, 100);
      await this.usersService['userRepository'].save(user);
    }

    // Load real roles from user_roles table
    const roles = await this.usersService.getUserRoles(user.id);

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // AI Session Risk Assessment: Check session risk before creating session
    const previousSession = await this.loginSessionRepository.findOne({
      where: { userId: user.id, isRevoked: false },
      order: { createdAt: 'DESC' },
    });

    const sessionRisk = await this.aiService.assessSessionRisk({
      userId: user.id,
      ipAddress,
      userAgent,
      deviceId,
      previousIpAddress: previousSession?.ipAddress || undefined,
      previousDeviceId: previousSession?.deviceId || undefined,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      currentTimestamp: new Date().toISOString(),
      loginProvider: dto.channel === 'sms' ? 'phone_otp' : 'email_otp',
    });

    // Store risk score in session
    const riskScore = sessionRisk.riskScore;

    // Generate JWT tokens and save session
    const tokens = await this.generateTokens(
      user.id,
      roles,
      user.primaryEmail,
      user.primaryPhone,
      dto.channel === 'sms' ? 'phone_otp' : 'email_otp',
      deviceId,
      ipAddress,
      userAgent,
      riskScore,
    );

    return { user, roles, tokens };
  }

  async socialLogin(dto: SocialLoginDto, ipAddress?: string, userAgent?: string, deviceId?: string): Promise<AuthResult> {
    // Verify Firebase ID token (for social login, client gets ID token from Firebase)
    let firebaseUser;
    try {
      firebaseUser = await this.firebaseService.verifyIdToken(dto.idToken);
    } catch (error: any) {
      throw new UnauthorizedException(`Invalid Firebase token: ${error.message}`);
    }

    // AI Fraud Detection: Check risk before social login
    const fraudScore = await this.aiService.scoreFraudRisk({
      email: firebaseUser.email,
      phone: firebaseUser.phoneNumber,
      firebaseUid: firebaseUser.uid,
      ipAddress,
      userAgent,
      deviceId,
      requestType: 'login',
      timestamp: new Date().toISOString(),
    });

    if (fraudScore.shouldBlock) {
      throw new ForbiddenException(
        `Social login blocked: ${fraudScore.reasons.join(', ')}`,
      );
    }

    // Find or create user
    const user = await this.usersService.findOrCreateByFirebaseUid({
      firebaseUid: firebaseUser.uid,
      phone: firebaseUser.phoneNumber || null,
      email: firebaseUser.email || null,
      fullName: firebaseUser.displayName || null,
    });

    // AI Duplicate Detection
    const duplicateCheck = await this.aiService.detectDuplicateAccounts({
      email: user.primaryEmail || undefined,
      firebaseUid: user.firebaseUid || undefined,
      deviceId,
      ipAddress,
      timestamp: new Date().toISOString(),
    });

    if (duplicateCheck.isDuplicate && duplicateCheck.confidence > 0.7) {
      user.fraudRiskScore = Math.min(user.fraudRiskScore + 20, 100);
      await this.usersService['userRepository'].save(user);
    }

    // Load real roles from user_roles table
    const roles = await this.usersService.getUserRoles(user.id);

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // AI Session Risk Assessment
    const previousSession = await this.loginSessionRepository.findOne({
      where: { userId: user.id, isRevoked: false },
      order: { createdAt: 'DESC' },
    });

    const provider: LoginProvider = dto.provider === 'google' ? 'google' : 
                                    dto.provider === 'facebook' ? 'facebook' : 'apple';

    const sessionRisk = await this.aiService.assessSessionRisk({
      userId: user.id,
      ipAddress,
      userAgent,
      deviceId,
      previousIpAddress: previousSession?.ipAddress || undefined,
      previousDeviceId: previousSession?.deviceId || undefined,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      currentTimestamp: new Date().toISOString(),
      loginProvider: provider,
    });

    const tokens = await this.generateTokens(
      user.id,
      roles,
      user.primaryEmail,
      user.primaryPhone,
      provider,
      deviceId,
      ipAddress,
      userAgent,
      sessionRisk.riskScore,
    );

    return { user, roles, tokens };
  }

  private async generateTokens(
    userId: string,
    roles: string[],
    email?: string | null,
    phone?: string | null,
    loginProvider: LoginProvider = 'phone_otp',
    deviceId?: string,
    ipAddress?: string,
    userAgent?: string,
    riskScore?: number,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: userId,
      email: email || undefined,
      phone: phone || undefined,
      roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);

    // Hash refresh token and save to login_sessions
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const loginSession = this.loginSessionRepository.create({
      userId,
      deviceId: deviceId || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      refreshTokenHash,
      expiresAt,
      isRevoked: false,
      loginProvider,
      riskScore: riskScore || null,
    });

    await this.loginSessionRepository.save(loginSession);

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
      const user = await this.usersService.findById(payload.sub);
      
      if (!user || user.status !== 'active') {
        throw new Error('User not found or inactive');
      }

      // Verify refresh token exists in login_sessions and is not revoked
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const session = await this.loginSessionRepository.findOne({
        where: {
          userId: user.id,
          refreshTokenHash,
          isRevoked: false,
        },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new Error('Invalid or expired refresh token');
      }

      // Load real roles from user_roles table
      const roles = await this.usersService.getUserRoles(user.id);

      // Revoke old session
      session.isRevoked = true;
      await this.loginSessionRepository.save(session);

      return await this.generateTokens(
        user.id,
        roles,
        user.primaryEmail,
        user.primaryPhone,
        session.loginProvider,
        session.deviceId || undefined,
        session.ipAddress || undefined,
        session.userAgent || undefined,
      );
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

