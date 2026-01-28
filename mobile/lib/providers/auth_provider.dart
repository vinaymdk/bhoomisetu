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
      // Check if tokens exist in secure storage
      final token = await _storage.read(key: 'accessToken');
      final refreshToken = await _storage.read(key: 'refreshToken');
      
      if (token == null && refreshToken == null) {
        // No tokens stored, user is not authenticated
        _isAuthenticated = false;
        _userData = null;
        _roles = [];
      } else {
        // Tokens exist, consider user authenticated
        // The API interceptor will handle token validation and refresh automatically
        // on the first API call. Don't require getCurrentUser to succeed here because:
        // 1. It can fail temporarily (network, server issues)
        // 2. The interceptor will handle 401s and refresh tokens
        // 3. We trust the tokens are valid unless proven otherwise
        
        _isAuthenticated = true;
        
        // Try to load user data, but don't logout if it fails
        try {
          final userData = await _authService.getCurrentUser();
          _userData = userData['user'];
          _roles = List<String>.from(userData['roles'] ?? []);
        } catch (e) {
          // Log the error but don't logout
          // The token will be validated on first actual API call
          debugPrint('Initial user load failed, will be retried on first API call: $e');
          // Keep user authenticated - data will be loaded when needed
          _userData = null;
          _roles = [];
        }
      }
    } catch (e) {
      // Storage access error - logout as safety measure
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
    final refreshToken = await _storage.read(key: 'refreshToken');
    await _authService.logout(refreshToken);
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
      final userData = await _authService.getCurrentUser();
      _userData = userData['user'];
      _roles = List<String>.from(userData['roles'] ?? []);
      notifyListeners();
    } catch (e) {
      await logout();
    }
  }
}
