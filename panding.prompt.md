- **Buyer**: buyer1@example.com / +919876543210
- **Seller**: seller1@example.com / +919876543211
- **Agent**: agent1@example.com / +919876543212
- **Multi-role**: multiuser@example.com / +919876543213
- **CS**: cs1@example.com / +919876543214
- **Admin**: admin@example.com / +919876543215
=================================================

"If you want, I can proceed with the push notification scenario walkthrough next (foreground/background/terminated across Android/iOS/web)." Yes please

Web:
  - My Listings Menus not working ("❌ Access denied. Required roles: seller, agent") fix this issue as-soon-as-posible

Mobile:
    - Home/Landing: Bottom overflowed by 2pixels
    - Create Listing: Right overflowed by 49pixels (near "Pick on map, state and Locality fields")
    - My Listings: Not showing any data error-403 (need to add permissions)

    Hanburger Menu:
      - Add some space/padding bellow th logout menu because i am not able to click it is under the mobile default buttons 

===============================================================
<!-- Module 12 Errors Prompt Start -->
Next-Step: 
   -Module 12 Development

   - If required Prepare **required sample / dummy / reference data**.sql in /db/sample-data/ and related ***.sh in /scripts/ files as well

   - Update Documentation and Roadmap
   - Parellelly Review and Test your side

   - Suggest me what can i do from my side

   Note: 
      - Perform complete application control for admin
      - If any new files will create create all the Bottom-Nav for mobile 
<!-- Module 12 Errors Prompt end -->


AI Microservice:
- Can you create(Latest-verssion) "AI_MICROSERVICE_REPO" and connect/setup with quick guide for this project 

<!-- Module 9 Errors Prompt Start -->
Next-Step: 
AI Microservice:
- Can you create(Latest-verssion) "AI_MICROSERVICE_REPO" and connect/setup with quick guide for this project 

Prompt-Guidelines:
   - Follow the ai_microservice prompt as per "./docs/Prompts/ai.microservice.repo.md" and start development
- Suggest me if any better-plan then "./docs/Prompts/ai.microservice.repo.md" just follow that as your plan 
- Prepare the project structure as per best practices
- Setup CI/CD for this repo

- If required Prepare **required sample / dummy / reference data**.sql in /db/sample-data/ and related ***.sh in /scripts/ files as well

- Update Documentation 
   - Update ./docs/Prompts/ai.microservice.repo.md with all the changes you made
   - Create README.md for this repo with all the necessary details

- Suggest me what can i do from my side
<!-- Module 9 Errors Prompt end -->

==============================================================
Parallelly Start with Module 8 Developmet
<!-- Module 8 Errors Prompt Start -->
Next-Step: (Module 8 Development)
You are instructed to proceed with Module 8 (UI and UX) for both Mobile and Web platforms without waiting for further user confirmation.

You must strictly follow this execution flow:
Plan → Status / Next Steps → Implementation → Review → Testing

Guidelines:
- Each phase must be clearly structured and documented before moving to the next.
- Treat this as an autonomous execution task.
- Use all relevant reference documentation files (e.g., *.md files) available in the /docs folder as the primary source of requirements, standards, and context.
- Ensure production-level UI/UX quality, consistency, and best practices across mobile and web.
- Use proper card sections and data good visualization 
- After completing each phase, clearly summarize outcomes and readiness for the next phase.

- If required Prepare **required sample / dummy / reference data**.sql in /db/sample-data/ and related ***.sh in /scripts/ files as well

Note: Maintain production level development
   - Maintain and use reuasable functionality/scripts at gobal level
   - Maintain existing tap-nav, bottom-nav, buttons-styles
   - Explain what can i do from my side stem-wise
<!-- Module 8 Errors Prompt end -->

Bottom-Nav: (Maintain minimum 4 menus for every user-role)
   - CS-Login:
      - Add CS Dashboard icon/menu insted of top-nav(remove cs dashboard at top-nav)

Common: (Web + Mobile)   
   - Use "floating buttons (FABs)" buttons for existing/new(screens) forms which is Add/New records (Mobile ONLY)


Need to test ...

"If you want, I can add a full Saved management section on web (saved list + badge toggle) to match mobile." Yes Please

Parallelly complete the bellow profile related development
<!-- Profile prompt start -->
Profile: (Suggest me any other profile content)

You must strictly follow this execution flow: (Profile)
Plan → Status / Next Steps → Implementation → Review → Testing
- Ensure production-level UI/UX quality, consistency, and best practices across mobile and web.
- Use proper card sections and data good visualization 
- After completing each phase, clearly summarize outcomes and readiness for the next phase.

- Add profile image (camera/gallery)
- Update personal information like full-name, phone-number, email and address
- Toggles To control show counts of Saved, List and Reqs like (Notifications-count)
   Ex.Saved Count - On/Off, List Count - On/Off Reqs Count - On/Off
- Share / Promote App from social media(WhatsApp, Facebook, etc.)
- Logout

**Database & Testing Support**
   - If requires create db-migrations
   - If requires prepare **required sample / dummy / reference data**.
   - Provide these data inserts as **module-wise `.sql` files**.
   - Prepare **.sh files to easy migrate/upload data
<!-- Profile prompt end -->

Let me know, what can i do for next-step/quick-guide for mediation module 7
cs1@example.com: No records showing (No pending mediation tasks.)
buyer1@example.com: No records showing (No pending mediation tasks.)


<!-- Module 8 Errors Prompt Start -->
Next-Step: (Module 8 Development)
You are instructed to proceed with Module 8 (UI and UX) for both Mobile and Web platforms without waiting for further user confirmation.

You must strictly follow this execution flow:
Plan → Status / Next Steps → Implementation → Review → Testing

Guidelines:
- Each phase must be clearly structured and documented before moving to the next.
- Treat this as an autonomous execution task.
- Use all relevant reference documentation files (e.g., *.md files) available in the /docs folder as the primary source of requirements, standards, and context.
- Ensure production-level UI/UX quality, consistency, and best practices across mobile and web.
- Use proper card sections and data good visualization 
- After completing each phase, clearly summarize outcomes and readiness for the next phase.

- If required Prepare **required sample / dummy / reference data**.sql in /db/sample-data/ and related ***.sh in /scripts/ files as well

Note: Maintain production level development
   - Maintain and use reuasable functionality/scripts at gobal level
   - Maintain existing tap-nav, bottom-nav, buttons-styles
   - Explain what can i do from my side stem-wise
<!-- Module 8 Errors Prompt end -->
Mobile:
- Post Requirement screen should be bottom-nav check with all screens till now designed wether bottom-nav or not

- Botton-nav want to show count of Saved-items like (Notifications-count) each user can control with visible-or-not-from-profile -> toggle buttons

Error:
- One user(buyer1@example.com) Seved items/properties are showing another user(CS1@example.com)

Note:
- Saved item/property should be different for every user

Next-Step: (Module 7 Development)
You are instructed to proceed with Module 7 (UI and UX) for both Mobile and Web platforms without waiting for further user confirmation.

You must strictly follow this execution flow:
Plan → Status / Next Steps → Implementation → Review → Testing

Guidelines:
- Each phase must be clearly structured and documented before moving to the next.
- Treat this as an autonomous execution task.
- Use all relevant reference documentation files (e.g., *.md files) available in the /docs folder as the primary source of requirements, standards, and context.
- Ensure production-level UI/UX quality, consistency, and best practices across mobile and web.
- Use proper card sections and data good visualization 
- After completing each phase, clearly summarize outcomes and readiness for the next phase.

- If required Prepare **required sample / dummy / reference data**.sql in /db/sample-data/ and related ***.sh in /scripts/ files as well

- Guide me what can i do from my side

========================================================
<!-- Module 8 Errors Prompt Start -->
Next-Step: (Module 8 Development)
You are instructed to proceed with Module 8 (UI and UX) for both Mobile and Web platforms without waiting for further user confirmation.

You must strictly follow this execution flow:
Plan → Status / Next Steps → Implementation → Review → Testing

Guidelines:
- Each phase must be clearly structured and documented before moving to the next.
- Treat this as an autonomous execution task.
- Use all relevant reference documentation files (e.g., *.md files) available in the /docs folder as the primary source of requirements, standards, and context.
- Ensure production-level UI/UX quality, consistency, and best practices across mobile and web.
- Use proper card sections and data good visualization 
- After completing each phase, clearly summarize outcomes and readiness for the next phase.

- If required Prepare **required sample / dummy / reference data**.sql in /db/sample-data/ and related ***.sh in /scripts/ files as well

Note: Maintain production level development
   - Maintain and use reuasable functionality/scripts at gobal level
   - Maintain existing tap-nav, bottom-nav, buttons-styles
   - Explain what can i do from my side stem-wise
<!-- Module 8 Errors Prompt end -->

Error: Fix the "Bottom overflowed by *** pixels" for many/all screens
=====================================================
Next Step:
- Proceed with Module 5 (UI and UX) for both mobile and web 
- Don't wait for my confirmation just doit with following manner
- Plan -> Status/Next-Steps -> Implementation -> Review -> Testing

Note: Your reference files(ex. ***.md) are in /docs/ folder

**Database & Testing Support**
   - For each module, prepare **required sample / dummy / reference data**.
   - Provide these data inserts as **module-wise `.sql` files**.
   - The SQL should be realistic enough to test real-time application behavior.
   - I will manually update the database using these SQL files to validate functionality.

# ==========================================================================
Reference smart prompting
# ==========================================================================

Your responsibility is to REVIEW, RESTRUCTURE (if required), FIX, and PRODUCTION-HARDEN
Module 4 (My Listing / Create Listing) using ADVANCED UI ARCHITECTURE
for both Web (React) and Mobile (Flutter).

==================================================
ARCHITECTURAL PRINCIPLES (MANDATORY)
==================================================
• Follow clean architecture and separation of concerns
• UI must be modular, reusable, and scalable
• Business logic must NOT live inside UI widgets/components
• Follow platform best practices:
  - Web: container/presenter pattern, hooks, memoization
  - Mobile: MVVM / Clean Architecture (UI → ViewModel → Service)
• Fix root causes, not surface symptoms
• Minimize rework and avoid breaking changes
• Ensure performance, accessibility, and maintainability

==================================================
GLOBAL RULES
==================================================
• Work strictly within the existing codebase
• Do NOT redesign visuals unless required for correctness or UX
• Identify ROOT CAUSES before coding
• Use clean, scalable, production-ready patterns
• No hardcoded values, no temporary hacks
• Ensure behavior is consistent across ALL devices
• Verify fixes through real execution flows

- Proceed with Module 3 (UI and UX) for both mobile and web 
- Don't wait for my confirmation just doit with following manner
- Plan -> Status/Next-Steps -> Implementation -> Review -> Testing

Note:
- Update Roadmap for every development / implementaion

**Database & Testing Support**
   - For each module, prepare **required sample / dummy / reference data**.
   - Provide these data inserts as **module-wise `.sql` files**.
   - The SQL should be realistic enough to test real-time application behavior.
   - I will manually update the database using these SQL files to validate functionality.

Implement standard mobile UX features:
- Pull-to-refresh
- Loading, empty, and error states
- Offline handling with retry
- Session persistence and route protection
- Pagination / infinite scroll
Ensure features follow production-level mobile UX practices.

Begin with root-cause analysis, then apply verified fixes.
# =====================================
Profile: (Suggest me any other profile content)

You must strictly follow this execution flow: (Profile)
Plan → Status / Next Steps → Implementation → Review → Testing
- Ensure production-level UI/UX quality, consistency, and best practices across mobile and web.
- Use proper card sections and data good visualization 
- After completing each phase, clearly summarize outcomes and readiness for the next phase.

- Add profile image (camera/gallery)
- Update personal information like full-name, phone-number, email and address
- Toggles To control show counts of Saved, List and Reqs like (Notifications-count)
   Ex.Saved Count - On/Off, List Count - On/Off Reqs Count - On/Off
- Share / Promote App from social media(WhatsApp, Facebook, etc.)
- Logout

**Database & Testing Support**
   - If requires create db-migrations
   - If requires prepare **required sample / dummy / reference data**.
   - Provide these data inserts as **module-wise `.sql` files**.
   - Prepare **.sh files to easy migrate/upload data
===========================================


config.controller.ts
import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';

@Controller('config')
export class ConfigController {
  @Public()
  @Get('firebase')
  getFirebaseConfig() {
    // Return Firebase client config (safe to expose)
    // These are public keys used for client-side Firebase SDK
    // Try to get from Firebase credentials file or env vars
    let projectId = process.env.FIREBASE_PROJECT_ID;
    let apiKey = process.env.FIREBASE_CLIENT_API_KEY || process.env.FIREBASE_API_KEY;
    
    // If not in env, try to read from Firebase credentials file
    if (!projectId || !apiKey) {
      try {
        const fs = require('fs');
        const path = require('path');
        const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH || 
          path.join(__dirname, '../../bhoomisetu-48706-firebase-adminsdk-fbsvc-6e896e4e57.json');
        
        if (fs.existsSync(credentialsPath)) {
          const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
          projectId = projectId || credentials.project_id;
        }
      } catch (error) {
        // Ignore errors
      }
    }

    // Construct auth domain from project ID
    const authDomain = process.env.FIREBASE_AUTH_DOMAIN || 
      (projectId ? `${projectId}.firebaseapp.com` : undefined);

    return {
      apiKey: apiKey || 'API_KEY', // Client API key (public, safe to expose)
      authDomain: authDomain,
      projectId: projectId || 'Project_ID',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (projectId ? `${projectId}.appspot.com` : undefined),
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
      appId: process.env.FIREBASE_APP_ID || 'YOUR_APP_ID',
    };
  }

  @Public()
  @Get('app')
  getAppConfig(@Req() req: Request) {
    const host = req.get('host');
    const protocol = req.protocol || 'http';
    const inferredBaseUrl = host ? `${protocol}://${host}/api` : undefined;
    return {
      apiBaseUrl: process.env.API_BASE_URL || inferredBaseUrl || 'http://localhost:3000/api',
      environment: process.env.NODE_ENV || 'development',
      mapboxEnabled: !!process.env.MAPBOX_API_KEY,
      mapboxToken: process.env.MAPBOX_API_KEY || null,
    };
  }
}

auth.service.ts
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

data.source.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  // password: process.env.DB_PASSWORD || 'postgres',
  password: process.env.DB_PASSWORD || 'vinaymdk',
  database: process.env.DB_NAME || 'bhoomisetu_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development' ? false : false, // Never use synchronize in production
  logging: process.env.NODE_ENV === 'development',
});
