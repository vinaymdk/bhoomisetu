# API Configuration Guide for Mobile App

## Overview

The mobile app needs to connect to the backend API. The configuration differs based on where you're running the app:

- **Android Emulator**: Uses `10.0.2.2` (automatically configured)
- **iOS Simulator**: Uses `localhost` (automatically configured)
- **Physical Devices**: Requires your computer's IP address (manual configuration needed)

## Current Configuration

The app automatically uses:
- **Android Emulator**: `http://10.0.2.2:3000/api`
- **iOS Simulator**: `http://localhost:3000/api`

## Configuring for Physical Devices

### Step 1: Find Your Computer's IP Address

#### On Linux/Mac:
```bash
# Find your IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or use:
ip addr show | grep "inet " | grep -v 127.0.0.1

# Common output format:
# inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
```

#### On Windows:
```cmd
ipconfig

# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100
```

### Step 2: Update API Configuration

You have two options:

#### Option A: Temporary Change (For Testing)

Edit `mobile/lib/config/api_config.dart`:

```dart
static String get defaultBaseUrl {
  if (Platform.isAndroid) {
    // For Android emulator:
    // return 'http://10.0.2.2:3000/api';
    
    // For Android physical device (replace with your IP):
    return 'http://192.168.1.100:3000/api';  // Replace with your IP
    
  } else {
    // For iOS simulator:
    // return 'http://localhost:3000/api';
    
    // For iOS physical device (replace with your IP):
    return 'http://192.168.1.100:3000/api';  // Replace with your IP
  }
}
```

#### Option B: Environment-Based Configuration (Recommended)

Create a configuration file or use environment variables:

1. Create `mobile/lib/config/app_config.dart`:

```dart
class AppConfig {
  // Set this to your computer's IP when testing on physical devices
  // Leave empty to use default (emulator/simulator settings)
  static const String? customApiBaseUrl = null;  // e.g., 'http://192.168.1.100:3000/api'
  
  static String get apiBaseUrl {
    if (customApiBaseUrl != null && customApiBaseUrl!.isNotEmpty) {
      return customApiBaseUrl!;
    }
    // Use default based on platform
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000/api';
    } else {
      return 'http://localhost:3000/api';
    }
  }
}
```

2. Update `mobile/lib/config/api_config.dart` to use `AppConfig.apiBaseUrl`

### Step 3: Ensure Backend is Accessible

1. **Backend must be running** on port 3000
2. **Firewall**: Make sure your firewall allows connections on port 3000
3. **Network**: Your phone and computer must be on the same WiFi network

#### Linux Firewall (if using UFW):
```bash
sudo ufw allow 3000/tcp
```

#### Windows Firewall:
- Open Windows Defender Firewall
- Allow an app through firewall
- Add Node.js or your backend application on port 3000

#### Mac Firewall:
- System Preferences > Security & Privacy > Firewall
- Allow Node.js/backend application

### Step 4: Test Connection

1. Start your backend server:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Verify backend is accessible from your phone's browser:
   - Open browser on your phone
   - Go to: `http://YOUR_IP:3000/api/config/app`
   - Should see JSON response

3. Run the Flutter app:
   ```bash
   cd mobile
   flutter run
   ```

## Troubleshooting

### Connection Refused Error

**Problem**: `Connection refused (OS Error: Connection refused, errno = 111)`

**Solutions**:
1. Check if backend is running: `curl http://localhost:3000/api/config/app`
2. Verify IP address is correct
3. Ensure phone and computer are on same network
4. Check firewall settings
5. Try accessing backend from phone's browser first

### Cannot Find Backend

**Problem**: App can't connect to backend

**Solutions**:
1. Check backend is running on correct port (3000)
2. Verify IP address matches your computer's current IP
3. Test with browser on phone first
4. Check backend logs for connection attempts

### Android Emulator Connection Issues

**Problem**: Emulator can't connect even with `10.0.2.2`

**Solutions**:
1. Ensure backend is running on host machine
2. Try `adb reverse tcp:3000 tcp:3000` to forward port
3. Check if using Genymotion (uses different IP: `10.0.3.2`)

### iOS Simulator Connection Issues

**Problem**: Simulator can't connect to localhost

**Solutions**:
1. Ensure backend is running
2. Verify port 3000 is not blocked
3. Try `127.0.0.1` instead of `localhost`

## Production Configuration

For production builds, you should:

1. Use environment variables or build configurations
2. Store API URL in a configuration file that's not committed to git
3. Use a proper domain name instead of IP addresses
4. Implement certificate pinning for HTTPS

Example production setup:
```dart
static const String productionApiUrl = 'https://api.bhoomisetu.com/api';
static const String stagingApiUrl = 'https://staging-api.bhoomisetu.com/api';

static String get defaultBaseUrl {
  if (kReleaseMode) {
    return productionApiUrl;
  } else if (kProfileMode) {
    return stagingApiUrl;
  } else {
    // Development
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000/api';
    } else {
      return 'http://localhost:3000/api';
    }
  }
}
```

## Quick Reference

| Platform | Default URL | Physical Device URL |
|----------|-------------|---------------------|
| Android Emulator | `http://10.0.2.2:3000/api` | `http://YOUR_IP:3000/api` |
| iOS Simulator | `http://localhost:3000/api` | `http://YOUR_IP:3000/api` |
| Android Physical | N/A | `http://YOUR_IP:3000/api` |
| iOS Physical | N/A | `http://YOUR_IP:3000/api` |

## Notes

- Replace `YOUR_IP` with your actual computer IP address (e.g., `192.168.1.100`)
- IP address may change when you reconnect to WiFi
- Both devices (phone and computer) must be on the same network
- Backend must be running and accessible
