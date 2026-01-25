import 'package:dio/dio.dart';
import '../config/api_client.dart';

class UserProfileService {
  final _apiClient = ApiClient();

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> payload) async {
    final response = await _apiClient.dio.patch('/users/me', data: payload);
    return Map<String, dynamic>.from(response.data);
  }

  Future<String?> uploadAvatar(String filePath) async {
    final formData = FormData.fromMap({
      'avatar': await MultipartFile.fromFile(filePath, filename: filePath.split('/').last),
    });
    final response = await _apiClient.dio.post('/users/me/avatar', data: formData);
    return response.data['avatarUrl'] as String?;
  }
}

