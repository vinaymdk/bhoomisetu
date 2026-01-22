import 'package:dio/dio.dart';
import '../config/api_client.dart';

class AuthService {
  final ApiClient _apiClient = ApiClient();

  // Request OTP
  Future<Map<String, dynamic>> requestOtp({
    required String channel,
    required String destination,
    required String purpose,
  }) async {
    final response = await _apiClient.dio.post('/auth/otp/request', data: {
      'channel': channel,
      'destination': destination,
      'purpose': purpose,
    });
    return response.data;
  }

  // Verify OTP (with Firebase ID token for SMS, or OTP code for email)
  Future<Map<String, dynamic>> verifyOtp({
    required String channel,
    required String destination,
    String? idToken,
    String? otp,
    String? deviceId,
  }) async {
    final response = await _apiClient.dio.post('/auth/otp/verify', data: {
      'channel': channel,
      'destination': destination,
      if (idToken != null) 'idToken': idToken,
      if (otp != null) 'otp': otp,
      if (deviceId != null) 'deviceId': deviceId,
    });
    return response.data;
  }

  // Social login
  Future<Map<String, dynamic>> socialLogin({
    required String provider,
    required String idToken,
    String? deviceId,
  }) async {
    final response = await _apiClient.dio.post('/auth/social', data: {
      'provider': provider,
      'idToken': idToken,
      if (deviceId != null) 'deviceId': deviceId,
    });
    return response.data;
  }

  // Get current user
  Future<Map<String, dynamic>> getCurrentUser() async {
    final response = await _apiClient.dio.get('/users/me');
    return response.data;
  }

  // Refresh tokens
  Future<Map<String, dynamic>> refreshTokens(String refreshToken) async {
    final response = await _apiClient.dio.post('/auth/refresh', data: {
      'refreshToken': refreshToken,
    });
    return response.data;
  }
}
