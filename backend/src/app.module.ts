// import { Module } from '@nestjs/common';
// import { APP_GUARD } from '@nestjs/core';
// import { DatabaseModule } from './database/database.module';
// import { AiModule } from './ai/ai.module';
// import { FirebaseModule } from './firebase/firebase.module';
// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { PropertiesModule } from './properties/properties.module';
// import { SubscriptionsModule } from './subscriptions/subscriptions.module';
// import { HomeModule } from './home/home.module';
// import { SearchModule } from './search/search.module';
// import { CustomerServiceModule } from './customer-service/customer-service.module';
// import { BuyerRequirementsModule } from './buyer-requirements/buyer-requirements.module';
// import { MediationModule } from './mediation/mediation.module';
// import { AiChatModule } from './ai-chat/ai-chat.module';
// import { NotificationsModule } from './notifications/notifications.module';
// import { PaymentsModule } from './payments/payments.module';
// import { ReviewsModule } from './reviews/reviews.module';
// import { AdminModule } from './admin/admin.module';
// import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
// import { ConfigController } from './config/config.controller';
// import { LocationsModule } from './locations/locations.module';

// @Module({
//   imports: [
//     // Database connection
//     DatabaseModule,
//     // Firebase (Global)
//     FirebaseModule,
//     // AI service
//     AiModule,
//     // Core business modules
//     AuthModule,
//     UsersModule,
//     PropertiesModule,
//     SubscriptionsModule,
//     PaymentsModule,
//     HomeModule,
//     SearchModule,
//     CustomerServiceModule,
//     BuyerRequirementsModule,
//     MediationModule,
//     AiChatModule,
//     NotificationsModule,
//     ReviewsModule,
//     AdminModule,
//     LocationsModule,
//   ],
//   providers: [
//     {
//       provide: APP_GUARD,
//       useClass: JwtAuthGuard,
//     },
//   ],
//   controllers: [ConfigController],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config'; // ✅ ADD THIS

import { DatabaseModule } from './database/database.module';
import { AiModule } from './ai/ai.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { HomeModule } from './home/home.module';
import { SearchModule } from './search/search.module';
import { CustomerServiceModule } from './customer-service/customer-service.module';
import { BuyerRequirementsModule } from './buyer-requirements/buyer-requirements.module';
import { MediationModule } from './mediation/mediation.module';
import { AiChatModule } from './ai-chat/ai-chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SupportChatModule } from './support-chat/support-chat.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ConfigController } from './config/config.controller';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [
    // ✅ ENV LOADER (MOST IMPORTANT)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // backend/.env
    }),

    DatabaseModule,
    FirebaseModule,
    AiModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    SubscriptionsModule,
    PaymentsModule,
    HomeModule,
    SearchModule,
    CustomerServiceModule,
    BuyerRequirementsModule,
    MediationModule,
    AiChatModule,
    NotificationsModule,
    SupportChatModule,
    ReviewsModule,
    AdminModule,
    LocationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [ConfigController],
})
export class AppModule {}
