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
