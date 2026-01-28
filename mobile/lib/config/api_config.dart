import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  // API base URL selection based on platform

  static String get defaultBaseUrl {
    // For physical device testing - use your computer's IP address
    // const String physicalDeviceIP = '192.168.0.108'; // Home
    const String physicalDeviceIP = '192.168.0.11'; // Office

    if (Platform.isAndroid) {
      // Uncomment the one you need:
      return 'http://$physicalDeviceIP:3000/api'; // For physical device
      // return 'http://10.0.2.2:3000/api';  // For emulator
    } else {
      return 'http://$physicalDeviceIP:3000/api'; // For physical device
      // return 'http://localhost:3000/api';  // For simulator
    }
  }

  static String baseUrl = defaultBaseUrl;

  // Fetch API base URL from backend
  static Future<void> initialize() async {
    try {
      final response = await http
          .get(Uri.parse('$defaultBaseUrl/config/app'))
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final config = json.decode(response.body) as Map<String, dynamic>;
        final apiBaseUrl = config['apiBaseUrl'] as String?;
        if (apiBaseUrl != null && apiBaseUrl.isNotEmpty) {
          baseUrl = apiBaseUrl;
        }
      }
    } catch (e) {
      // Fallback to default
      baseUrl = defaultBaseUrl;
      if (kDebugMode) {
        debugPrint('API Config: Using default base URL: $baseUrl');
        debugPrint('API Config: Failed to fetch from backend: $e');
      }
    }
  }
}
