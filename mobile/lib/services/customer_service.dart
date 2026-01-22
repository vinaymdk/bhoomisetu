import '../config/api_client.dart';
import '../models/customer_service.dart';
import '../models/property.dart';

class CustomerServiceApi {
  final _apiClient = ApiClient();

  Future<({List<PendingVerificationProperty> items, int total, int page, int limit})> getPending({
    String? status,
    String? city,
    String? propertyType,
    String? urgencyLevel,
    String? search,
    int page = 1,
    int limit = 10,
  }) async {
    final params = <String, dynamic>{
      if (status != null && status.isNotEmpty) 'status': status,
      if (city != null && city.isNotEmpty) 'city': city,
      if (propertyType != null && propertyType.isNotEmpty) 'propertyType': propertyType,
      if (urgencyLevel != null && urgencyLevel.isNotEmpty) 'urgencyLevel': urgencyLevel,
      if (search != null && search.isNotEmpty) 'search': search,
      'page': page,
      'limit': limit,
    };
    final response = await _apiClient.dio.get('/customer-service/pending', queryParameters: params);
    final data = Map<String, dynamic>.from(response.data as Map);
    final items = (data['properties'] as List? ?? [])
        .map((e) => PendingVerificationProperty.fromJson(Map<String, dynamic>.from(e)))
        .toList();
    return (
      items: items,
      total: (data['total'] as num?)?.toInt() ?? 0,
      page: (data['page'] as num?)?.toInt() ?? page,
      limit: (data['limit'] as num?)?.toInt() ?? limit,
    );
  }

  Future<PendingVerificationProperty> getProperty(String id) async {
    final response = await _apiClient.dio.get('/customer-service/properties/$id');
    return PendingVerificationProperty.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<Property> verifyProperty({
    required String propertyId,
    required String urgencyLevel,
    required String action,
    String? negotiationNotes,
    String? remarks,
    String? rejectionReason,
  }) async {
    final payload = {
      'propertyId': propertyId,
      'urgencyLevel': urgencyLevel,
      'action': action,
      if (negotiationNotes != null) 'negotiationNotes': negotiationNotes,
      if (remarks != null) 'remarks': remarks,
      if (rejectionReason != null) 'rejectionReason': rejectionReason,
    };
    final response = await _apiClient.dio.post('/customer-service/verify', data: payload);
    return Property.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<CsStats> getStats() async {
    final response = await _apiClient.dio.get('/customer-service/stats');
    return CsStats.fromJson(Map<String, dynamic>.from(response.data as Map));
  }
}
