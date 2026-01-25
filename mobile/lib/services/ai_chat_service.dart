import '../config/api_client.dart';

class AiChatService {
  final _apiClient = ApiClient();

  Future<Map<String, dynamic>> sendMessage({
    required String message,
    required String language,
    String? conversationId,
  }) async {
    final response = await _apiClient.dio.post('/ai-chat/message', data: {
      'message': message,
      'language': language,
      if (conversationId != null) 'conversationId': conversationId,
    });
    return Map<String, dynamic>.from(response.data);
  }
}
