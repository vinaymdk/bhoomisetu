import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_config.dart';
import '../services/auth_service.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  late Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  bool _isRefreshing = false;
  final List<({Completer completer, RequestOptions options})> _refreshQueue = [];

  Dio get dio => _dio;

  void initialize() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        headers: {'Content-Type': 'application/json'},
      ),
    );

    // Request interceptor to add auth token
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'accessToken');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            final requestOptions = error.requestOptions;
            
            // Don't retry refresh token endpoint
            if (requestOptions.path == '/auth/refresh') {
              handler.reject(error);
              return;
            }

            // Handle token refresh
            try {
              final newOptions = await _refreshTokenAndRetry(requestOptions);
              if (newOptions != null) {
                final response = await _dio.fetch(newOptions);
                handler.resolve(response);
                return;
              }
            } catch (e) {
              // Refresh failed, logout user
              await _storage.delete(key: 'accessToken');
              await _storage.delete(key: 'refreshToken');
              handler.reject(error);
              return;
            }
          }
          handler.next(error);
        },
      ),
    );
  }

  Future<RequestOptions?> _refreshTokenAndRetry(RequestOptions options) async {
    if (_isRefreshing) {
      // Wait for ongoing refresh
      final completer = Completer<RequestOptions?>();
      _refreshQueue.add((completer: completer, options: options));
      return completer.future;
    }

    _isRefreshing = true;

    try {
      final refreshToken = await _storage.read(key: 'refreshToken');
      if (refreshToken == null || refreshToken.isEmpty) {
        return null;
      }

      final authService = AuthService();
      final response = await authService.refreshTokens(refreshToken);
      
      final tokens = response['tokens'] ?? response;
      final newAccessToken = tokens['accessToken'] as String;
      final newRefreshToken = tokens['refreshToken'] as String?;

      await _storage.write(key: 'accessToken', value: newAccessToken);
      if (newRefreshToken != null) {
        await _storage.write(key: 'refreshToken', value: newRefreshToken);
      }

      // Retry the original request with new token
      options.headers['Authorization'] = 'Bearer $newAccessToken';
      
      // Process queued requests
      _isRefreshing = false;
      for (final item in _refreshQueue) {
        item.options.headers['Authorization'] = 'Bearer $newAccessToken';
        item.completer.complete(item.options);
      }
      _refreshQueue.clear();

      return options;
    } catch (e) {
      _isRefreshing = false;
      // Process queued requests with failure
      for (final item in _refreshQueue) {
        item.completer.complete(null);
      }
      _refreshQueue.clear();
      return null;
    }
  }
}
