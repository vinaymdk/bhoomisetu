import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  // API base URL
  // For Android emulator: use 10.0.2.2 to access host machine's localhost
  // For iOS simulator: use localhost
  // For physical devices: use your computer's IP address (e.g., http://192.168.1.100:3000/api)
  static String get defaultBaseUrl {
    if (Platform.isAndroid) {
      // Android emulator uses 10.0.2.2 to access host machine
      return 'http://10.0.2.2:3000/api';
    } else {
      // iOS simulator or other platforms
      return 'http://localhost:3000/api';
    }
  }
  
  static String baseUrl = defaultBaseUrl;
  
  // Fetch API base URL from backend
  static Future<void> initialize() async {
    try {
      // Try to fetch config from backend
      final response = await http.get(
        Uri.parse('${defaultBaseUrl}/config/app'),
      ).timeout(const Duration(seconds: 5));
      
      if (response.statusCode == 200) {
        final config = json.decode(response.body) as Map<String, dynamic>;
        final apiBaseUrl = config['apiBaseUrl'] as String?;
        if (apiBaseUrl != null && apiBaseUrl.isNotEmpty) {
          baseUrl = apiBaseUrl;
        }
      }
    } catch (e) {
      // Use default if fetch fails (backend might not be running)
      baseUrl = defaultBaseUrl;
      if (kDebugMode) {
        debugPrint('API Config: Using default base URL: $baseUrl');
        debugPrint('API Config: Failed to fetch from backend: $e');
      }
    }
  }
  
}
