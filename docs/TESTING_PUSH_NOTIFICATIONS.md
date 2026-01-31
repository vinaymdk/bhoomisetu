# Push Notification Test Walkthrough

This checklist covers Android, iOS, and Web for foreground, background, and terminated states.

## Preconditions
- Use a test account with notifications enabled.
- Confirm device/system notification permissions are allowed.
- Ensure app is configured with correct Firebase/APNs credentials.
- Record current app version and environment (dev/staging/prod).

## Notification Types
- New Listing
- Status Update
- Chat/Message
- System/Admin
- Promotional/Broadcast (if applicable)

## Android
### Foreground
1. Open app and stay on Home.
2. Trigger each notification type from backend.
3. Verify in-app display, payload data, and badge count.

### Background
1. Send app to background.
2. Trigger each notification type.
3. Verify system tray notification; tap opens correct deep link screen.

### Terminated
1. Force close app.
2. Trigger each notification type.
3. Tap notification; app opens correct screen; payload preserved.

### Platform Checks
- FCM token generation/refresh.
- Notification channels.
- No duplicates.

## iOS
### Foreground
1. Keep app open.
2. Trigger each notification type.
3. Verify in-app handling and badge count.

### Background
1. Send app to background.
2. Trigger each notification type.
3. Tap notification; verify deep link.

### Terminated
1. Force close app.
2. Trigger each notification type.
3. Tap notification; app opens correct screen.

### Platform Checks
- APNs permissions (Allow/Deny).
- Background delivery for relevant types.
- Badge updates.

## Web
### Foreground (tab active)
1. Open web app in browser.
2. Trigger each notification type.
3. Verify notification display and deep link.

### Background (tab inactive)
1. Keep tab open, switch to another tab.
2. Trigger each notification type.
3. Verify notification appears; click opens correct screen.

### Closed Tab
1. Close the web app tab (service worker should remain).
2. Trigger notifications.
3. Verify notification appears; click opens web app and correct screen.

### Platform Checks
- Browser permission handling.
- Service worker registration.
- No duplicates.

## Expected Results
- All notification types received in all states.
- Deep links open correct screen with correct payload data.
- Badge counts update accurately.
- Silent notifications behave correctly (if used).
