import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  // Lazy initialization to avoid accessing before Firebase is initialized
  firebase_auth.FirebaseAuth? _firebaseAuthInstance;
  firebase_auth.FirebaseAuth get _firebaseAuth {
    try {
      _firebaseAuthInstance ??= firebase_auth.FirebaseAuth.instance;
      return _firebaseAuthInstance!;
    } catch (e) {
      throw Exception('Firebase not initialized. Please ensure Firebase.initializeApp() is called first.');
    }
  }

  firebase_auth.User? _user;
  Map<String, dynamic>? _userData;
  List<String> _roles = [];
  bool _isLoading = false;
  bool _isAuthenticated = false;

  firebase_auth.User? get user => _user;
  Map<String, dynamic>? get userData => _userData;
  List<String> get roles => _roles;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;

  AuthProvider() {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = await _storage.read(key: 'accessToken');
      final refreshToken = await _storage.read(key: 'refreshToken');
      
      if (token != null) {
        try {
          final userData = await _authService.getCurrentUser(token);
          _userData = userData['user'];
          _roles = List<String>.from(userData['roles'] ?? []);
          _isAuthenticated = true;
        } catch (e) {
          // If token expired, try to refresh
          if (refreshToken != null && refreshToken.isNotEmpty) {
            try {
              final tokens = await _authService.refreshTokens(refreshToken);
              final newAccessToken = tokens['tokens']?['accessToken'] ?? tokens['accessToken'];
              final newRefreshToken = tokens['tokens']?['refreshToken'] ?? tokens['refreshToken'];
              
              await _storage.write(key: 'accessToken', value: newAccessToken);
              if (newRefreshToken != null) {
                await _storage.write(key: 'refreshToken', value: newRefreshToken);
              }
              
              // Retry getting user with new token
              final userData = await _authService.getCurrentUser(newAccessToken);
              _userData = userData['user'];
              _roles = List<String>.from(userData['roles'] ?? []);
              _isAuthenticated = true;
            } catch (refreshError) {
              // Refresh failed, logout
              await logout();
            }
          } else {
            // No refresh token, logout
            await logout();
          }
        }
      } else if (refreshToken != null && refreshToken.isNotEmpty) {
        // Only refresh token exists, try to refresh
        try {
          final tokens = await _authService.refreshTokens(refreshToken);
          final newAccessToken = tokens['tokens']?['accessToken'] ?? tokens['accessToken'];
          final newRefreshToken = tokens['tokens']?['refreshToken'] ?? tokens['refreshToken'];
          
          await _storage.write(key: 'accessToken', value: newAccessToken);
          if (newRefreshToken != null) {
            await _storage.write(key: 'refreshToken', value: newRefreshToken);
          }
          
          final userData = await _authService.getCurrentUser(newAccessToken);
          _userData = userData['user'];
          _roles = List<String>.from(userData['roles'] ?? []);
          _isAuthenticated = true;
        } catch (refreshError) {
          await logout();
        }
      }
    } catch (e) {
      await logout();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> login(Map<String, dynamic> authResponse) async {
    await _storage.write(key: 'accessToken', value: authResponse['tokens']['accessToken']);
    await _storage.write(key: 'refreshToken', value: authResponse['tokens']['refreshToken']);
    
    _userData = authResponse['user'];
    _roles = List<String>.from(authResponse['roles'] ?? []);
    _isAuthenticated = true;
    notifyListeners();
  }

  Future<void> logout() async {
    await _storage.delete(key: 'accessToken');
    await _storage.delete(key: 'refreshToken');
    try {
      await _firebaseAuth.signOut();
    } catch (e) {
      // Firebase might not be initialized, ignore error
    }
    
    _user = null;
    _userData = null;
    _roles = [];
    _isAuthenticated = false;
    notifyListeners();
  }

  Future<void> refreshUser() async {
    try {
      final token = await _storage.read(key: 'accessToken');
      if (token != null) {
        final userData = await _authService.getCurrentUser(token);
        _userData = userData['user'];
        _roles = List<String>.from(userData['roles'] ?? []);
        notifyListeners();
      }
    } catch (e) {
      await logout();
    }
  }
}
