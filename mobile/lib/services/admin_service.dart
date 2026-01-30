import '../config/api_client.dart';

class AdminService {
  final _apiClient = ApiClient();

  Future<Map<String, dynamic>> getDashboardStats() async {
    final response = await _apiClient.dio.get('/admin/dashboard/stats');
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<Map<String, dynamic>> listUsers({int page = 1, int limit = 20, String? search}) async {
    final response = await _apiClient.dio.get('/admin/users', queryParameters: {
      'page': page,
      'limit': limit,
      if (search != null && search.isNotEmpty) 'search': search,
    });
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<Map<String, dynamic>> listPendingProperties({int page = 1, int limit = 20}) async {
    final response = await _apiClient.dio.get('/admin/properties/pending', queryParameters: {
      'page': page,
      'limit': limit,
    });
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<void> approveProperty(String propertyId, {String? notes}) async {
    await _apiClient.dio.post('/admin/properties/$propertyId/approve', data: {
      if (notes != null && notes.isNotEmpty) 'notes': notes,
    });
  }

  Future<void> rejectProperty(String propertyId, {required String reason}) async {
    await _apiClient.dio.post('/admin/properties/$propertyId/reject', data: {
      'reason': reason,
    });
  }
}
