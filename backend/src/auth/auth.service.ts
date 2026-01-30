import { Injectable, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { AiService } from '../ai/ai.service';
import { FirebaseService } from '../firebase/firebase.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { LoginSession, LoginProvider } from './entities/login-session.entity';
import { OtpLog, OtpChannel, OtpPurpose } from './entities/otp-log.entity';
import { NotificationsService } from '../notifications/notifications.service';

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
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly notificationsService: NotificationsService,
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
    // Production level hide dev-otp code

    // if (dto.channel === 'email') {
    //   // Generate 6-digit OTP for email
    //   const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    //   const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
      
    //   // Store OTP in database
    //   const otpLog = this.otpLogRepository.create({
    //     channel: 'email',
    //     destination: dto.destination,
    //     purpose: dto.purpose || 'login',
    //     otpHash,
    //     expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    //     fraudRiskScore: fraudScore.riskScore,
    //     metadata: {
    //       ipAddress,
    //       userAgent,
    //       fraudReasons: fraudScore.reasons,
    //       otpCode, // Store plain OTP for verification (in production, use encryption)
    //     },
    //   });
    //   await this.otpLogRepository.save(otpLog);

    //   // Send email via Brevo
    //   try {
    //     await this.emailService.sendOtpEmail(dto.destination, otpCode, dto.purpose || 'login');
    //   } catch (error: any) {
    //     throw new BadRequestException(`Failed to send email: ${error.message}`);
    //   }

    //   const includeOtp = process.env.NODE_ENV !== 'production';
    //   return {
    //     success: true,
    //     message: 'OTP sent to your email address. Please check your inbox.',
    //     otp: includeOtp ? otpCode : undefined,
    //   };
    // } else {
    //   // Generate 6-digit OTP for SMS (same pattern as email)
    //   const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    //   const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
      
    //   // Store OTP in database
    //   const otpLog = this.otpLogRepository.create({
    //     channel: 'sms',
    //     destination: dto.destination,
    //     purpose: dto.purpose || 'login',
    //     otpHash,
    //     expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    //     fraudRiskScore: fraudScore.riskScore,
    //     metadata: {
    //       ipAddress,
    //       userAgent,
    //       fraudReasons: fraudScore.reasons,
    //       otpCode, // Store plain OTP for verification (in production, use encryption)
    //     },
    //   });
    //   await this.otpLogRepository.save(otpLog);

    //   // Send SMS via SMS service
    //   try {
    //     await this.smsService.sendOtpSms(dto.destination, otpCode, dto.purpose || 'login');
    //   } catch (error: any) {
    //     throw new BadRequestException(`Failed to send SMS: ${error.message}`);
    //   }

    //   const includeOtp = process.env.NODE_ENV !== 'production';
    //   return {
    //     success: true,
    //     message: 'OTP sent to your phone number. Please check your SMS.',
    //     otp: includeOtp ? otpCode : undefined,
    //   };
    // }

    // Production level show dev-otp code
    if (dto.channel === 'email') {
      // Generate 6-digit OTP for email
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
      
      // Store OTP in database
      const otpLog = this.otpLogRepository.create({
        channel: 'email',
        destination: dto.destination,
        purpose: dto.purpose || 'login',
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        fraudRiskScore: fraudScore.riskScore,
        metadata: {
          ipAddress,
          userAgent,
          fraudReasons: fraudScore.reasons,
          otpCode, // Store plain OTP for verification (in production, use encryption)
        },
      });
      await this.otpLogRepository.save(otpLog);

      // Send email via Brevo
      try {
        await this.emailService.sendOtpEmail(dto.destination, otpCode, dto.purpose || 'login');
      } catch (error: any) {
        throw new BadRequestException(`Failed to send email: ${error.message}`);
      }

      const includeOtp = process.env.NODE_ENV !== 'production';
      return {
        success: true,
        message: 'OTP sent to your email address. Please check your inbox.',
        otp: includeOtp ? otpCode : undefined,
      };
    } else {
      // Generate 6-digit OTP for SMS (same pattern as email)
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
      
      // Store OTP in database
      const otpLog = this.otpLogRepository.create({
        channel: 'sms',
        destination: dto.destination,
        purpose: dto.purpose || 'login',
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        fraudRiskScore: fraudScore.riskScore,
        metadata: {
          ipAddress,
          userAgent,
          fraudReasons: fraudScore.reasons,
          otpCode, // Store plain OTP for verification (in production, use encryption)
        },
      });
      await this.otpLogRepository.save(otpLog);

      // Send SMS via SMS service
      try {
        await this.smsService.sendOtpSms(dto.destination, otpCode, dto.purpose || 'login');
      } catch (error: any) {
        throw new BadRequestException(`Failed to send SMS: ${error.message}`);
      }

      const includeOtp = process.env.NODE_ENV !== 'production';
      return {
        success: true,
        message: 'OTP sent to your phone number. Please check your SMS.',
        otp: includeOtp ? otpCode : undefined,
      };
    }
  }

  async verifyOtp(dto: VerifyOtpDto, ipAddress?: string, userAgent?: string, deviceId?: string): Promise<AuthResult> {
    let user: User;
    let email: string | undefined;
    let phone: string | undefined;

    if (dto.channel === 'email' && dto.otp) {
      // Email OTP verification (via Brevo)
      if (!dto.destination) {
        throw new BadRequestException('Email destination is required for email OTP verification');
      }

      // Find OTP log
      const otpLog = await this.otpLogRepository.findOne({
        where: {
          destination: dto.destination,
          channel: 'email',
          isUsed: false,
          expiresAt: MoreThan(new Date()),
        },
        order: { createdAt: 'DESC' },
      });

      if (!otpLog) {
        throw new BadRequestException('Invalid or expired OTP. Please request a new code.');
      }

      // Verify OTP
      const otpHash = crypto.createHash('sha256').update(dto.otp).digest('hex');
      const storedOtpCode = otpLog.metadata?.otpCode;
      
      // Compare OTP (use stored plain OTP for verification)
      if (storedOtpCode !== dto.otp) {
        otpLog.attemptsCount += 1;
        await this.otpLogRepository.save(otpLog);
        
        if (otpLog.attemptsCount >= otpLog.maxAttempts) {
          throw new ForbiddenException('Too many failed attempts. Please request a new OTP.');
        }
        
        throw new BadRequestException('Invalid OTP code. Please try again.');
      }

      // Mark OTP as used
      otpLog.isUsed = true;
      otpLog.verifiedAt = new Date();
      await this.otpLogRepository.save(otpLog);

      email = dto.destination;
      
      // Find or create user by email
      user = await this.usersService.findOrCreateByEmail({
        email,
        fullName: null,
      });
      user = await this.usersService.ensureActiveForLogin(user.id);
    } else if (dto.channel === 'sms' && dto.otp) {
      // SMS OTP verification (via backend SMS service)
      if (!dto.destination) {
        throw new BadRequestException('Phone destination is required for SMS OTP verification');
      }

      // Find OTP log
      const otpLog = await this.otpLogRepository.findOne({
        where: {
          destination: dto.destination,
          channel: 'sms',
          isUsed: false,
          expiresAt: MoreThan(new Date()),
        },
        order: { createdAt: 'DESC' },
      });

      if (!otpLog) {
        throw new BadRequestException('Invalid or expired OTP. Please request a new code.');
      }

      // Verify OTP
      const storedOtpCode = otpLog.metadata?.otpCode;
      
      // Compare OTP (use stored plain OTP for verification)
      if (storedOtpCode !== dto.otp) {
        otpLog.attemptsCount += 1;
        await this.otpLogRepository.save(otpLog);
        
        if (otpLog.attemptsCount >= otpLog.maxAttempts) {
          throw new ForbiddenException('Too many failed attempts. Please request a new OTP.');
        }
        
        throw new BadRequestException('Invalid OTP code. Please try again.');
      }

      // Mark OTP as used
      otpLog.isUsed = true;
      otpLog.verifiedAt = new Date();
      await this.otpLogRepository.save(otpLog);

      phone = dto.destination;
      
      // Find or create user by phone
      user = await this.usersService.findOrCreateByPhone({
        phone,
        fullName: null,
      });
      user = await this.usersService.ensureActiveForLogin(user.id);
    } else if (dto.channel === 'sms' && dto.idToken) {
      // Phone OTP verification (via Firebase - for backward compatibility with social login)
      let firebaseUser;
      try {
        firebaseUser = await this.firebaseService.verifyIdToken(dto.idToken);
      } catch (error: any) {
        throw new UnauthorizedException(`Invalid Firebase token: ${error.message}`);
      }

      phone = firebaseUser.phoneNumber;
      if (!phone) {
        throw new BadRequestException('Phone number not found in Firebase token');
      }

      // Find or create user
      user = await this.usersService.findOrCreateByFirebaseUid({
        firebaseUid: firebaseUser.uid,
        phone: phone,
        email: null,
        fullName: firebaseUser.displayName || null,
      });
      user = await this.usersService.ensureActiveForLogin(user.id);
    } else {
      throw new BadRequestException('Invalid verification method. Provide otp+destination for SMS/email or idToken for social login.');
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

    this.notificationsService
      .notifyActionAlert(user.id, 'login', 'account', {
        ipAddress,
        loginProvider: dto.channel === 'sms' ? 'phone_otp' : 'email_otp',
      })
      .catch(() => undefined);

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
    let user = await this.usersService.findOrCreateByFirebaseUid({
      firebaseUid: firebaseUser.uid,
      phone: firebaseUser.phoneNumber || null,
      email: firebaseUser.email || null,
      fullName: firebaseUser.displayName || null,
    });
    user = await this.usersService.ensureActiveForLogin(user.id);

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

    this.notificationsService
      .notifyActionAlert(user.id, 'login', 'account', {
        ipAddress,
        loginProvider: provider,
      })
      .catch(() => undefined);

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

  async refreshTokens(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
      const user = await this.usersService.findById(payload.sub);
      
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('User not found or inactive');
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

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (session.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Load real roles from user_roles table
      const roles = await this.usersService.getUserRoles(user.id);

      // Revoke old session
      session.isRevoked = true;
      await this.loginSessionRepository.save(session);

      const tokens = await this.generateTokens(
        user.id,
        roles,
        user.primaryEmail,
        user.primaryPhone,
        session.loginProvider,
        session.deviceId || undefined,
        session.ipAddress || undefined,
        session.userAgent || undefined,
      );

      return { tokens };
    } catch (error) {
      // If it's already an HTTP exception, rethrow it
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      // JWT verification errors
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      // Other errors
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await this.loginSessionRepository.findOne({
      where: { refreshTokenHash, isRevoked: false },
    });
    if (!session) {
      return;
    }
    session.isRevoked = true;
    await this.loginSessionRepository.save(session);
    this.notificationsService
      .notifyActionAlert(session.userId, 'logout', 'account')
      .catch(() => undefined);
  }
}

