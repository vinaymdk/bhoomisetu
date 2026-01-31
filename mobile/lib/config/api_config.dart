// import 'package:http/http.dart' as http;
// import 'dart:convert';
// import 'dart:io';
// import 'package:flutter/foundation.dart';

// class ApiConfig {
//   // API base URL selection based on platform

//   static String get defaultBaseUrl {
//     // For physical device testing - use your computer's IP address
//     // Dev environment IPs
//     // const String physicalDeviceIP = 'http://192.168.0.108:3000'; // Home
//     const String physicalDeviceIP = 'http://192.168.0.11:3000'; // Office

//     // production and development environment IPs
//     // const String physicalDeviceIP = 'https://api.helpmatesolutions.in'; // Office Server

//     // Dev environment
//     // if (Platform.isAndroid) {
//     //   return '$physicalDeviceIP/api'; // For physical device
//     // } else {
//     //   return '$physicalDeviceIP/api'; // For physical device
//     // }

//     // production and development environment
//     if (env === 'production') {
//       apiBaseUrl = 'https://api.helpmatesolutions.in/api';
//     } else {
//       apiBaseUrl = 'http://192.168.0.2:3000/api';
//     }
//   }

//   static String baseUrl = defaultBaseUrl;

//   // Fetch API base URL from backend
//   static Future<void> initialize() async {
//     try {
//       final response = await http
//           .get(Uri.parse('$defaultBaseUrl/config/app'))
//           .timeout(const Duration(seconds: 5));

//       if (response.statusCode == 200) {
//         final config = json.decode(response.body) as Map<String, dynamic>;
//         final apiBaseUrl = config['apiBaseUrl'] as String?;
//         if (apiBaseUrl != null && apiBaseUrl.isNotEmpty) {
//           baseUrl = apiBaseUrl;
//         }
//       }
//     } catch (e) {
//       // Fallback to default
//       baseUrl = defaultBaseUrl;
//       if (kDebugMode) {
//         debugPrint('API Config: Using default base URL: $baseUrl');
//         debugPrint('API Config: Failed to fetch from backend: $e');
//       }
//     }
//   }
//   // static Future<void> initialize() async {
//   //   try {
//   //     final response = await http
//   //         .get(Uri.parse('$defaultBaseUrl/config/app'))
//   //         .timeout(const Duration(seconds: 5));

//   //     if (response.statusCode == 200) {
//   //       final config = json.decode(response.body);

//   //       final apiBaseUrl = config['apiBaseUrl'] as String?;

//   //       // 🔥 BLOCK local IPs
//   //       if (apiBaseUrl != null &&
//   //           !apiBaseUrl.startsWith('http://192.') &&
//   //           !apiBaseUrl.startsWith('http://10.') &&
//   //           !apiBaseUrl.startsWith('http://localhost')) {
//   //         baseUrl = apiBaseUrl;
//   //       } else {
//   //         baseUrl = defaultBaseUrl;
//   //       }
//   //     }
//   //   } catch (_) {
//   //     baseUrl = defaultBaseUrl;
//   //   }

//   //   if (kDebugMode) {
//   //     debugPrint('FINAL API BASE → $baseUrl');
//   //   }
//   // }
// }

import 'package:http/http.dart' as http;
import 'dart:convert';
// import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  /// 🔐 Hard fallback (never local IP in prod)
  static String get defaultBaseUrl {
    // kReleaseMode = true only in production builds
    if (kReleaseMode) {
      return 'https://api.helpmatesolutions.in/api';
    }

    // Development fallback (local backend)
    return 'http://192.168.0.11:3000/api';
  }

  static String baseUrl = defaultBaseUrl;

  /// Fetch API base URL from backend safely
  static Future<void> initialize() async {
    try {
      final response = await http
          .get(Uri.parse('$defaultBaseUrl/config/app'))
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final config = json.decode(response.body) as Map<String, dynamic>;
        final apiBaseUrl = config['apiBaseUrl'] as String?;

        /// 🚫 Block unsafe local IPs from backend
        if (apiBaseUrl != null &&
            apiBaseUrl.isNotEmpty &&
            !_isLocalUrl(apiBaseUrl)) {
          baseUrl = apiBaseUrl;
        } else {
          baseUrl = defaultBaseUrl;
        }
      }
    } catch (_) {
      baseUrl = defaultBaseUrl;
    }

    if (kDebugMode) {
      debugPrint('FINAL API BASE → $baseUrl');
    }
  }

  /// 🔒 Utility to detect unsafe URLs
  static bool _isLocalUrl(String url) {
    return url.startsWith('http://192.') ||
        url.startsWith('http://10.') ||
        url.startsWith('http://localhost') ||
        url.startsWith('http://127.');
  }
}
