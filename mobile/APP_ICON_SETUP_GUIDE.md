# App Icon Setup Guide

## Overview

This guide explains how to set up the Bhoomisetu logo as the app icon for both Android and iOS.

## Logo Location

The logo file is located at:
- `mobile/assets/logo-and-fav/bhoomisetu-logo.png`

## Android App Icon Setup

### Option 1: Using Android Studio (Recommended)

1. **Open Android Studio**
   - Open the project: `mobile/android/`

2. **Use Image Asset Studio**
   - Right-click on `mobile/android/app/src/main/res/` folder
   - Go to: **New > Image Asset**
   - Select **Launcher Icons (Adaptive and Legacy)**

3. **Configure the icon**
   - **Foreground Layer**:
     - Source Asset: Click "Image" tab
     - Path: Select `mobile/assets/logo-and-fav/bhoomisetu-logo.png`
     - Resize/Position as needed
     - Trim: Uncheck if you want padding
   - **Background Layer**:
     - Color: Choose a background color (e.g., white or your brand color)
     - Or set to transparent if logo includes background

4. **Generate icons**
   - Click "Next"
   - Review the generated icons
   - Click "Finish"

5. **The generated icons will be in:**
   - `mobile/android/app/src/main/res/mipmap-*/ic_launcher.png` (various densities)

### Option 2: Manual Setup (Using online tools)

1. **Generate app icons using an online tool:**
   - Use [App Icon Generator](https://appicon.co/) or [Icon Kitchen](https://icon.kitchen/)
   - Upload `bhoomisetu-logo.png`
   - Download the generated Android icon set

2. **Replace existing icons:**
   - Replace files in `mobile/android/app/src/main/res/`:
     - `mipmap-mdpi/ic_launcher.png` (48x48)
     - `mipmap-hdpi/ic_launcher.png` (72x72)
     - `mipmap-xhdpi/ic_launcher.png` (96x96)
     - `mipmap-xxhdpi/ic_launcher.png` (144x144)
     - `mipmap-xxxhdpi/ic_launcher.png` (192x192)

3. **For adaptive icons (Android 8.0+):**
   - Also update files in `mobile/android/app/src/main/res/mipmap-anydpi-v26/`
   - Create `ic_launcher.xml` and `ic_launcher_round.xml` if needed

## iOS App Icon Setup

### Option 1: Using Xcode (Recommended)

1. **Open Xcode**
   - Open: `mobile/ios/Runner.xcworkspace`

2. **Open Assets.xcassets**
   - Navigate to: `Runner > Assets.xcassets > AppIcon`

3. **Add icon images**
   - Drag and drop your logo image into the appropriate slots
   - Required sizes:
     - 20x20 (@2x, @3x) - 40x40, 60x60
     - 29x29 (@2x, @3x) - 58x58, 87x87
     - 40x40 (@2x, @3x) - 80x80, 120x120
     - 60x60 (@2x, @3x) - 120x120, 180x180
     - 76x76 (@1x, @2x) - 76x76, 152x152 (iPad)
     - 83.5x83.5 (@2x) - 167x167 (iPad Pro)
     - 1024x1024 (@1x) - 1024x1024 (App Store)

4. **Or use a single high-resolution image:**
   - Add a 1024x1024 PNG
   - Xcode can generate other sizes automatically

### Option 2: Manual Setup

1. **Generate iOS icons using an online tool:**
   - Use [App Icon Generator](https://appicon.co/) or [Icon Kitchen](https://icon.kitchen/)
   - Upload `bhoomisetu-logo.png`
   - Download the iOS icon set

2. **Replace files in:**
   - `mobile/ios/Runner/Assets.xcassets/AppIcon.appiconset/`
   - Replace the existing icon files with your generated icons

3. **Update Contents.json:**
   - The `Contents.json` file should already be configured
   - Ensure all image file names match what's in Contents.json

## Quick Setup Script (Alternative)

You can create a script to automate icon generation, but it requires additional tools:

### Using imagemagick (Linux/Mac)

```bash
# Install imagemagick first
# sudo apt-get install imagemagick  # Linux
# brew install imagemagick          # Mac

cd mobile/assets/logo-and-fav

# Generate Android icons
mkdir -p ../../android/app/src/main/res/mipmap-mdpi
mkdir -p ../../android/app/src/main/res/mipmap-hdpi
mkdir -p ../../android/app/src/main/res/mipmap-xhdpi
mkdir -p ../../android/app/src/main/res/mipmap-xxhdpi
mkdir -p ../../android/app/src/main/res/mipmap-xxxhdpi

convert bhoomisetu-logo.png -resize 48x48 ../../android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert bhoomisetu-logo.png -resize 72x72 ../../android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert bhoomisetu-logo.png -resize 96x96 ../../android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert bhoomisetu-logo.png -resize 144x144 ../../android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert bhoomisetu-logo.png -resize 192x192 ../../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
```

## Best Practices

1. **Icon Design:**
   - Use a square logo (or add padding to make it square)
   - Ensure the logo is clear and recognizable at small sizes
   - Use high-resolution source image (at least 1024x1024)
   - Keep important elements in the center (safe area)

2. **Background:**
   - Consider adding a background color if the logo needs it
   - For adaptive icons (Android), ensure foreground/background separation

3. **File Format:**
   - Use PNG format (no transparency for iOS App Store icon)
   - Ensure files are optimized but not over-compressed

4. **Testing:**
   - Test icons on actual devices
   - Check how they look on different screen densities
   - Verify they appear correctly on home screen and app drawer

## Current Icon Locations

### Android:
- `mobile/android/app/src/main/res/mipmap-*/ic_launcher.png`
- `mobile/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml` (adaptive)

### iOS:
- `mobile/ios/Runner/Assets.xcassets/AppIcon.appiconset/`

## Notes

- After updating icons, rebuild the app:
  ```bash
  flutter clean
  flutter pub get
  flutter run
  ```

- For iOS, you may need to clean build folder in Xcode:
  - Product > Clean Build Folder (Shift+Cmd+K)

- Adaptive icons (Android 8.0+) require both foreground and background layers
- iOS icons require specific sizes for different devices and use cases
- The 1024x1024 icon is required for App Store submission
