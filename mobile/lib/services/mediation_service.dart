import '../config/api_client.dart';
import '../models/mediation.dart';

class MediationService {
  final _apiClient = ApiClient();

  Future<InterestExpression> expressInterest(Map<String, dynamic> payload) async {
    final response = await _apiClient.dio.post('/mediation/interest', data: payload);
    return InterestExpression.fromJson(Map<String, dynamic>.from(response.data));
  }

  Future<MediationListResponse> getMyInterests({String? status, String? propertyId, int page = 1, int limit = 20}) async {
    final response = await _apiClient.dio.get('/mediation/my-interests', queryParameters: {
      if (status != null && status.isNotEmpty) 'connectionStatus': status,
      if (propertyId != null && propertyId.isNotEmpty) 'propertyId': propertyId,
      'page': page,
      'limit': limit,
    });
    return MediationListResponse.fromJson(Map<String, dynamic>.from(response.data));
  }

  Future<MediationListResponse> getPropertyInterests({String? status, int page = 1, int limit = 20}) async {
    final response = await _apiClient.dio.get('/mediation/property-interests', queryParameters: {
      if (status != null && status.isNotEmpty) 'connectionStatus': status,
      'page': page,
      'limit': limit,
    });
    return MediationListResponse.fromJson(Map<String, dynamic>.from(response.data));
  }

  Future<MediationListResponse> getPendingInterests({String? status, int page = 1, int limit = 20}) async {
    final response = await _apiClient.dio.get('/mediation/pending', queryParameters: {
      if (status != null && status.isNotEmpty) 'connectionStatus': status,
      if (status == null || status.isEmpty) 'includeAll': true,
      'page': page,
      'limit': limit,
    });
    return MediationListResponse.fromJson(Map<String, dynamic>.from(response.data));
  }

  Future<InterestExpression> reviewBuyerSeriousness(Map<String, dynamic> payload) async {
    final response = await _apiClient.dio.post('/mediation/review/buyer-seriousness', data: payload);
    return InterestExpression.fromJson(Map<String, dynamic>.from(response.data));
  }

  Future<InterestExpression> reviewSellerWillingness(Map<String, dynamic> payload) async {
    final response = await _apiClient.dio.post('/mediation/review/seller-willingness', data: payload);
    return InterestExpression.fromJson(Map<String, dynamic>.from(response.data));
  }

  Future<InterestExpression> approveConnection(Map<String, dynamic> payload) async {
    final response = await _apiClient.dio.post('/mediation/approve-connection', data: payload);
    return InterestExpression.fromJson(Map<String, dynamic>.from(response.data));
  }

  Future<InterestExpression> rejectConnection(String id, {String? reason}) async {
    final response = await _apiClient.dio.post('/mediation/reject-connection/$id', data: {'reason': reason});
    return InterestExpression.fromJson(Map<String, dynamic>.from(response.data));
  }
}

