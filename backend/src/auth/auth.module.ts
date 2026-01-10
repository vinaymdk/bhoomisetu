import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
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
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PRODUCTION',
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

