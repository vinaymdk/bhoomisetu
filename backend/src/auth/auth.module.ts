// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { EmailService } from './services/email.service';
// import { SmsService } from './services/sms.service';
// import { UsersModule } from '../users/users.module';
// import { AiModule } from '../ai/ai.module';
// import { FirebaseModule } from '../firebase/firebase.module';
// import { JwtStrategy } from './strategies/jwt.strategy';
// import { LoginSession } from './entities/login-session.entity';
// import { OtpLog } from './entities/otp-log.entity';

// @Module({
//   imports: [
//     UsersModule,
//     AiModule,
//     FirebaseModule,
//     PassportModule,
//     TypeOrmModule.forFeature([LoginSession, OtpLog]),
//     JwtModule.register({
//       secret: process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PRODUCTION',
//       signOptions: {
//         expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
//       },
//     }),
//   ],
//   providers: [AuthService, EmailService, SmsService, JwtStrategy],
//   controllers: [AuthController],
//   exports: [AuthService],
// })
// export class AuthModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LoginSession } from './entities/login-session.entity';
import { OtpLog } from './entities/otp-log.entity';

@Module({
  imports: [
    UsersModule,
    AiModule,
    FirebaseModule,
    PassportModule,
    TypeOrmModule.forFeature([LoginSession, OtpLog]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
        },
      }),
    }),
  ],
  providers: [AuthService, EmailService, SmsService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
