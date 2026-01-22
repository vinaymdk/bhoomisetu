import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env file from backend directory explicitly
// Try multiple paths to ensure .env is loaded correctly
const possibleEnvPaths = [
  path.resolve(__dirname, '../.env'), // When compiled (dist/)
  path.resolve(process.cwd(), '.env'), // From project root
  path.resolve(__dirname, '../../.env'), // From src/ when running from backend/
  path.join(__dirname, '..', '.env'), // Relative to dist/
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✅ .env file loaded from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

// Fallback: try loading from current working directory
if (!envLoaded) {
  dotenv.config();
  console.log('⚠️  .env file not found in expected locations, using process environment variables');
}

// console.log('DB_HOST=', process.env.DB_HOST);
// console.log('DB_PORT=', process.env.DB_PORT);
// console.log('DB_USERNAME=', process.env.DB_USERNAME);
// console.log('DB_PASSWORD=', process.env.DB_PASSWORD);
// console.log('DB_NAME=', process.env.DB_NAME);

// import { createHash } from 'crypto';

// console.log(
//   'JWT_SECRET_HASH:',
//   createHash('sha256')
//     .update(process.env.JWT_SECRET || '')
//     .digest('hex'),
// );

// console.log(
//   'JWT_REFRESH_SECRET_HASH:',
//   createHash('sha256')
//     .update(process.env.JWT_REFRESH_SECRET || '')
//     .digest('hex'),
// );

// console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
// console.log("JWT_REFRESH_SECRET exists:", !!process.env.JWT_REFRESH_SECRET);



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Bhoomisetu backend listening on port ${port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error during bootstrap', err);
  process.exit(1);
});

