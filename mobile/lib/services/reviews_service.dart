import '../config/api_client.dart';
import '../models/review.dart';

class ReviewsService {
  final ApiClient _apiClient = ApiClient();

  Future<ReviewListResponse> list({
    String? propertyId,
    String? revieweeId,
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _apiClient.dio.get(
      '/reviews',
      queryParameters: {
        if (propertyId != null) 'propertyId': propertyId,
        if (revieweeId != null) 'revieweeId': revieweeId,
        'page': page,
        'limit': limit,
      },
    );
    return ReviewListResponse.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<ReviewListResponse> listMine({String? propertyId, int page = 1, int limit = 20}) async {
    final response = await _apiClient.dio.get(
      '/reviews/mine',
      queryParameters: {
        if (propertyId != null) 'propertyId': propertyId,
        'page': page,
        'limit': limit,
      },
    );
    return ReviewListResponse.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<Review> getById(String id) async {
    final response = await _apiClient.dio.get('/reviews/$id');
    return Review.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<ReviewListResponse> getByProperty(String propertyId, {int page = 1, int limit = 20}) async {
    final response = await _apiClient.dio.get(
      '/reviews/property/$propertyId',
      queryParameters: {'page': page, 'limit': limit},
    );
    return ReviewListResponse.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<ReviewListResponse> getBySeller(String revieweeId, {int page = 1, int limit = 20}) async {
    final response = await _apiClient.dio.get(
      '/reviews/seller/$revieweeId',
      queryParameters: {'page': page, 'limit': limit},
    );
    return ReviewListResponse.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<Review> create(Map<String, dynamic> payload) async {
    final response = await _apiClient.dio.post('/reviews', data: payload);
    return Review.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<Review> update(String id, Map<String, dynamic> payload) async {
    final response = await _apiClient.dio.patch('/reviews/$id', data: payload);
    return Review.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<void> voteHelpful(String id, bool isHelpful) async {
    await _apiClient.dio.post('/reviews/$id/helpful', data: {'isHelpful': isHelpful});
  }

  Future<void> report(String id, String reason, {String? details}) async {
    await _apiClient.dio.post('/reviews/$id/report', data: {
      'reportReason': reason,
      if (details != null) 'reportDetails': details,
    });
  }

  Future<void> reply(String id, String replyText) async {
    await _apiClient.dio.post('/reviews/$id/reply', data: {'replyText': replyText});
  }
}
