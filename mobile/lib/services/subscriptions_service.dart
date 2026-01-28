import '../config/api_client.dart';
import '../models/subscription.dart';

class SubscriptionsService {
  final ApiClient _apiClient = ApiClient();

  Future<SubscriptionStatusSummary> getStatus() async {
    final response = await _apiClient.dio.get('/subscriptions/status');
    return SubscriptionStatusSummary.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<PremiumFeaturesResponse> getFeatures() async {
    final response = await _apiClient.dio.get('/subscriptions/features');
    return PremiumFeaturesResponse.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<List<Subscription>> getUserSubscriptions() async {
    final response = await _apiClient.dio.get('/subscriptions');
    return (response.data as List? ?? [])
        .map((e) => Subscription.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<Subscription> cancelSubscription(String id, {String? reason}) async {
    final response = await _apiClient.dio.put(
      '/subscriptions/$id/cancel',
      data: reason != null ? {'reason': reason} : null,
    );
    return Subscription.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<Subscription> updateAutoRenewal(String id, bool enabled) async {
    final response = await _apiClient.dio.put(
      '/subscriptions/$id/auto-renewal',
      data: {'enabled': enabled},
    );
    return Subscription.fromJson(Map<String, dynamic>.from(response.data as Map));
  }
}
