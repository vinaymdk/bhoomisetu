import 'package:firebase_core/firebase_core.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../config/api_config.dart';

class FirebaseConfig {
  static FirebaseOptions? _options;
  static bool _initialized = false;

  // Fetch Firebase config from backend
  static Future<FirebaseOptions> getConfig() async {
    if (_initialized && _options != null) {
      return _options!;
    }

    try {
      // Use ApiConfig.baseUrl to get the correct base URL (handles Android emulator)
      final configUrl = '${ApiConfig.baseUrl}/config/firebase';
      final response = await http.get(
        Uri.parse(configUrl),
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final config = json.decode(response.body) as Map<String, dynamic>;
        
        _options = FirebaseOptions(
          apiKey: config['apiKey'] as String,
          appId: config['appId'] as String,
          messagingSenderId: config['messagingSenderId'] as String,
          projectId: config['projectId'] as String,
          authDomain: config['authDomain'] as String,
          storageBucket: config['storageBucket'] as String?,
        );

        _initialized = true;
        return _options!;
      } else {
        throw Exception('Failed to fetch Firebase config: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to fetch Firebase config from backend: $e');
    }
  }

  static Future<void> initialize() async {
    try {
      // Check if Firebase is already initialized
      if (Firebase.apps.isNotEmpty) {
        _initialized = true;
        return;
      }
      final options = await getConfig();
      await Firebase.initializeApp(options: options);
      _initialized = true;
    } catch (e) {
      _initialized = false;
      // Don't rethrow - Firebase is optional (only needed for social login)
      if (kDebugMode) {
        debugPrint('Firebase initialization failed (optional): $e');
      }
    }
  }
  
  static bool get isInitialized => _initialized && Firebase.apps.isNotEmpty;
}
