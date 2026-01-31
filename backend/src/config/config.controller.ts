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

  // Development: http://192.168.0.11:3000/api
  // @Public()
  // @Get('app')
  // getAppConfig(@Req() req: Request) {
  //   const host = req.get('host');
  //   const protocol = req.protocol || 'http';
  //   const inferredBaseUrl = host ? `${protocol}://${host}/api` : undefined;
  //   return {
  //     apiBaseUrl: process.env.API_BASE_URL || inferredBaseUrl || 'http://localhost:3000/api',
  //     environment: process.env.NODE_ENV || 'development',
  //     mapboxEnabled: !!process.env.MAPBOX_API_KEY,
  //     mapboxToken: process.env.MAPBOX_API_KEY || null,
  //   };
  // }

  // Production: https://api.helpmatesolutions.in/api
  @Public()
  @Get('app')
  getAppConfig(@Req() req: Request) {
    const isProd = process.env.NODE_ENV === 'production';

    /**
     * ✅ Production:
     *   → Always return PUBLIC DOMAIN
     * ❌ Never return LAN / inferred host
     */
    const apiBaseUrl = isProd
      ? 'https://api.helpmatesolutions.in/api'
      : process.env.API_BASE_URL ||
        `${req.protocol}://${req.get('host')}/api`;

    return {
      apiBaseUrl,
      environment: process.env.NODE_ENV || 'development',
      mapboxEnabled: Boolean(process.env.MAPBOX_API_KEY),
      mapboxToken: process.env.MAPBOX_API_KEY || null,
    };
  }
}
