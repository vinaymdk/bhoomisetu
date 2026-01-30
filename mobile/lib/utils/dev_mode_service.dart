import 'dart:io';
import 'package:flutter/services.dart';

class DevModeService {
  static const MethodChannel _channel = MethodChannel('bhoomisetu/security');

  static Future<bool> isDeveloperModeEnabled() async {
    // Developer options are an Android-only system setting.
    if (!Platform.isAndroid) {
      return false;
    }
    try {
      // Ask the native layer if Developer Mode is enabled.
      final result = await _channel.invokeMethod<bool>('isDeveloperModeEnabled');
      return result == true;
    } catch (_) {
      // If the platform channel fails, do not block app usage.
      return false;
    }
  }

  static Future<bool> isUsbConnectionActive() async {
    if (!Platform.isAndroid) {
      return false;
    }
    try {
      // Ask native layer for USB/File Transfer state.
      final result = await _channel.invokeMethod<bool>('isUsbConnectionActive');
      return result == true;
    } catch (_) {
      return false;
    }
  }

  static Future<void> openDeveloperOptions() async {
    if (!Platform.isAndroid) {
      return;
    }
    try {
      // Best-effort: opens Android's Developer Options screen.
      await _channel.invokeMethod<void>('openDeveloperOptions');
    } catch (_) {
      // Ignore failures; user can navigate manually.
    }
  }
}
