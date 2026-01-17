import '../config/api_client.dart';

class AppConfigService {
  final _apiClient = ApiClient();

  Future<String?> getMapboxToken() async {
    final response = await _apiClient.dio.get('/config/app');
    final data = response.data as Map<String, dynamic>?;
    return data?['mapboxToken'] as String?;
  }
}


