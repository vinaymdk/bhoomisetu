# Testing Quick Start Guide

## Quick Setup (5 minutes)

### 1. Database Setup

```bash
# Option A: Using shell script
cd /path/to/bhoomisetu
./scripts/load-sample-data.sh

# Option B: Using Node.js script
node scripts/load-sample-data.js

# Option C: Manual (using psql)
psql -U postgres -d bhoomisetu_db -f db/sample-data/module1_auth_sample_data.sql
psql -U postgres -d bhoomisetu_db -f db/sample-data/module2_properties_sample_data.sql
psql -U postgres -d bhoomisetu_db -f db/sample-data/module3_search_sample_data.sql
```

### 2. Start Backend

```bash
cd backend
npm install
npm run start:dev
```

### 3. Start Web Frontend

```bash
cd web
npm install
npm run dev
```

### 4. Start Mobile App

```bash
cd mobile
flutter pub get
flutter run
```

---

## Quick Test Checklist

### Authentication (5 minutes)

**Web:**
- [ ] Go to `http://localhost:5173/login`
- [ ] Login with phone: `+91 9876543210` or email: `buyer1@example.com`
- [ ] Refresh page - should stay logged in
- [ ] Try accessing `/login` while logged in - should redirect to dashboard

**Mobile:**
- [ ] Open app
- [ ] Login with phone: `+91 9876543210` or email: `buyer1@example.com`
- [ ] Close and reopen app - should stay logged in

### Search (10 minutes)

**Web:**
- [ ] Go to `/search`
- [ ] Search: "2BHK apartment in Hyderabad"
- [ ] Apply filters (price, bedrooms, etc.)
- [ ] Check AI rankings and match reasons
- [ ] Test pagination

**Mobile:**
- [ ] Navigate to Search screen
- [ ] Search: "3BHK villa near beach"
- [ ] Open filters and apply
- [ ] Pull to refresh
- [ ] Scroll to test infinite scroll

---

## Sample User Credentials

All users use OTP authentication:

- **Buyer**: `buyer1@example.com` / `+91 9876543210`
- **Seller**: `seller1@example.com` / `+91 9876543211`
- **Agent**: `agent1@example.com` / `+91 9876543212`
- **Multi-role**: `multiuser@example.com` / `+91 9876543213`
- **CS**: `cs1@example.com` / `+91 9876543214`
- **Admin**: `admin@example.com` / `+91 9876543215`

---

## Common Issues

### Database Connection Error
```bash
# Set environment variables
export DB_NAME=bhoomisetu_db
export DB_USER=postgres
export DB_PASSWORD=your_password
export DB_HOST=localhost
export DB_PORT=5432
```

### Backend Not Starting
- Check if PostgreSQL is running
- Verify `.env` file has correct database credentials
- Check if port 3000 is available

### Mobile Build Errors
```bash
# Clean and rebuild
cd mobile
flutter clean
flutter pub get
flutter run
```

---

## Full Testing Guide

For comprehensive testing procedures, see `docs/TESTING_GUIDE.md`

---

**Last Updated**: 2024-01-14

