import '../config/api_client.dart';
import '../models/buyer_requirement.dart';

class BuyerRequirementListResponse {
  final List<BuyerRequirement> requirements;
  final int total;
  final int page;
  final int limit;

  BuyerRequirementListResponse({
    required this.requirements,
    required this.total,
    required this.page,
    required this.limit,
  });

  factory BuyerRequirementListResponse.fromJson(Map<String, dynamic> json) {
    return BuyerRequirementListResponse(
      requirements: (json['requirements'] as List? ?? [])
          .map((e) => BuyerRequirement.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
      total: _parseInt(json['total']),
      page: _parseInt(json['page']),
      limit: _parseInt(json['limit']),
    );
  }

  static int _parseInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value) ?? 0;
    return 0;
  }
}

class BuyerRequirementsService {
  final _apiClient = ApiClient();

  Future<BuyerRequirementListResponse> list({
    String? status,
    String? search,
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _apiClient.dio.get(
      '/buyer-requirements',
      queryParameters: {
        if (status != null) 'status': status,
        if (search != null && search.isNotEmpty) 'search': search,
        'page': page,
        'limit': limit,
      },
    );
    return BuyerRequirementListResponse.fromJson(Map<String, dynamic>.from(response.data));
  }

  Future<BuyerRequirement> getById(String id) async {
    final response = await _apiClient.dio.get('/buyer-requirements/$id');
    return BuyerRequirement.fromJson(Map<String, dynamic>.from(response.data));
  }

  Future<BuyerRequirement> create(Map<String, dynamic> payload) async {
    final response = await _apiClient.dio.post('/buyer-requirements', data: payload);
    return BuyerRequirement.fromJson(Map<String, dynamic>.from(response.data));
  }

  Future<BuyerRequirement> update(String id, Map<String, dynamic> payload) async {
    final response = await _apiClient.dio.put('/buyer-requirements/$id', data: payload);
    return BuyerRequirement.fromJson(Map<String, dynamic>.from(response.data));
  }

  Future<List<BuyerRequirementMatch>> getMatches(String id) async {
    final response = await _apiClient.dio.get('/buyer-requirements/$id/matches');
    final data = response.data as List? ?? [];
    return data.map((e) => BuyerRequirementMatch.fromJson(Map<String, dynamic>.from(e))).toList();
  }
}

