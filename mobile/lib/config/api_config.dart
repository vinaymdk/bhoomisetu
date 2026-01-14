// import 'package:http/http.dart' as http;
// import 'dart:convert';
// import 'dart:io';
// import 'package:flutter/foundation.dart';

// class ApiConfig {
//   // API base URL
//   // For Android emulator: use 10.0.2.2 to access host machine's localhost
//   // For iOS simulator: use localhost
//   // For physical devices: use your computer's IP address (e.g., http://192.168.1.100:3000/api)
//   static String get defaultBaseUrl {
//     if (Platform.isAndroid) {
//       // Android emulator uses 10.0.2.2 to access host machine
//       return 'http://10.0.2.2:3000/api';
//     } else {
//       // iOS simulator or other platforms
//       return 'http://localhost:3000/api';
//     }
//   }

//   static String baseUrl = defaultBaseUrl;

//   // Fetch API base URL from backend
//   static Future<void> initialize() async {
//     try {
//       // Try to fetch config from backend
//       final response = await http.get(
//         Uri.parse('${defaultBaseUrl}/config/app'),
//       ).timeout(const Duration(seconds: 5));

//       if (response.statusCode == 200) {
//         final config = json.decode(response.body) as Map<String, dynamic>;
//         final apiBaseUrl = config['apiBaseUrl'] as String?;
//         if (apiBaseUrl != null && apiBaseUrl.isNotEmpty) {
//           baseUrl = apiBaseUrl;
//         }
//       }
//     } catch (e) {
//       // Use default if fetch fails (backend might not be running)
//       baseUrl = defaultBaseUrl;
//       if (kDebugMode) {
//         debugPrint('API Config: Using default base URL: $baseUrl');
//         debugPrint('API Config: Failed to fetch from backend: $e');
//       }
//     }
//   }

// }

import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  // API base URL selection based on platform

  static String get defaultBaseUrl {
    // For physical device testing - use your computer's IP address
    // WiFi: 192.168.0.8, Ethernet: 192.168.0.9 of HMD Office
    // UPDATED (2026-01-13): Backend runs on Ethernet (192.168.0.9)
    // const String physicalDeviceIP = '192.168.0.8'; // Use Ethernet IP (backend location)
    // Use Home IP (backend location) 192.168.0.108
    // const String physicalDeviceIP = '192.168.0.8'; // HMD Office
    const String physicalDeviceIP = '192.168.0.108'; // Home

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
