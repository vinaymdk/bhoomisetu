# Frontend Development Setup Guide

## Overview

This project has two frontend applications:
1. **Web**: React (Responsive Web App)
2. **Mobile**: Flutter (Android & iOS - Single Codebase)

## Backend API Configuration

- **Base URL**: `http://localhost:3000/api` (development)
- **Authentication**: JWT Bearer tokens
- **CORS**: Enabled (origin: true, credentials: true)

## API Endpoints

### Authentication (Module 1)
- `POST /api/auth/otp/request` - Request OTP
- `POST /api/auth/otp/verify` - Verify OTP and login
- `POST /api/auth/social` - Social login (Google, Facebook, Apple)
- `POST /api/auth/refresh` - Refresh tokens
- `GET /api/users/me` - Get current user

### Properties (Module 2, 4)
- `GET /api/properties` - List properties
- `GET /api/properties/featured` - Featured properties
- `GET /api/properties/new` - New properties
- `GET /api/properties/:id` - Property details
- `POST /api/properties` - Create property (seller/agent)
- `POST /api/properties/images/upload` - Upload images
- `POST /api/properties/:id/submit` - Submit for verification

### Search (Module 3)
- `GET /api/search` - AI-powered property search

### Home (Module 2)
- `GET /api/home` - Public home data
- `GET /api/home/dashboard` - Authenticated dashboard

## Design System

### Logo Colors
The logo files are in `logo-and-fav/` folder. Use these colors for the UI:
- Primary colors extracted from logo
- Professional real estate theme
- Modern, clean design

### UI Guidelines
- **Mobile (Flutter)**: Sticky bottom navigation
- **Web (React)**: Header + Footer layout
- Responsive design for all screen sizes
- Professional, modern look

## Development Setup

### React Web App
```bash
cd web
npm install
npm run dev
```

### Flutter Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

## Environment Variables

### React (.env)
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_GOOGLE_MAPS_API_KEY=...
```

### Flutter (.env or config)
```
API_BASE_URL=http://localhost:3000/api
FIREBASE_API_KEY=...
GOOGLE_MAPS_API_KEY=...
```

## Next Steps

1. Set up React project structure
2. Set up Flutter project structure
3. Implement Module 1: Authentication
4. Implement Module 2: Landing/Home
5. Test integration with backend APIs
