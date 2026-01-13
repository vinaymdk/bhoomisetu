# Bhoomisetu Web Frontend

React-based web application for the Bhoomisetu Real Estate Mediation Platform.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
web/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── context/         # React contexts (Auth, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── theme/           # Theme configuration
│   ├── styles/          # Global styles
│   ├── config/          # Configuration files
│   └── App.tsx          # Main app component
├── public/              # Static assets
└── package.json
```

## 🎨 Design System

The design system uses a professional real estate color palette. Colors should be extracted from the logo for final implementation.

### Key Features

- **Modern UI**: Clean, professional design
- **Responsive**: Mobile-first responsive design
- **Type-safe**: Full TypeScript support
- **State Management**: React Context + React Query
- **Routing**: React Router v7
- **API Client**: Axios with interceptors

## 📦 Key Dependencies

- **React 19**: UI library
- **TypeScript**: Type safety
- **React Router**: Routing
- **Axios**: HTTP client
- **React Query**: Server state management
- **Vite**: Build tool

## 🔐 Authentication

The app uses JWT authentication with automatic token refresh.

- Tokens stored in localStorage
- Automatic token refresh on 401 errors
- Auth context for global auth state

## 🎯 Modules Implementation Status

- [x] Project Setup
- [ ] Module 1: Authentication UI
- [ ] Module 2: Landing/Home UI
- [ ] Module 3: Property Search UI
- [ ] Module 4: Property Listing UI
- [ ] Module 5: Customer Service UI
- [ ] Module 6: Buyer Requirements UI
- [ ] Module 7: Mediation UI
- [ ] Module 8: AI Chat UI
- [ ] Module 9: Notifications UI
- [ ] Module 10: Payments UI
- [ ] Module 11: Reviews UI
- [ ] Module 12: Admin Panel UI

## 🔧 Environment Variables

See `.env.example` for required environment variables.

## 📝 Notes

- Backend API base URL: `http://localhost:3000/api` (development)
- CORS is enabled on backend
- Use logo colors from `logo-and-fav/` folder for final styling
