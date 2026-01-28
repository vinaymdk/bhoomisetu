import '../config/api_client.dart';
import '../models/payment.dart';
import '../models/subscription.dart';

class PaymentsService {
  final ApiClient _apiClient = ApiClient();

  Future<List<SubscriptionPlan>> getPlans({String? planType}) async {
    final response = await _apiClient.dio.get(
      '/payments/plans',
      queryParameters: planType != null ? {'planType': planType} : null,
    );
    return (response.data as List? ?? [])
        .map((e) => SubscriptionPlan.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<SubscriptionPlan> getPlanById(String planId) async {
    final response = await _apiClient.dio.get('/payments/plans/$planId');
    return SubscriptionPlan.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<PaymentOrderResponse> createPaymentOrder({
    required String planId,
    String? gateway,
    String? paymentMethodId,
    String? propertyId,
  }) async {
    final payload = <String, dynamic>{
      'planId': planId,
      if (gateway != null) 'gateway': gateway,
      if (paymentMethodId != null) 'paymentMethodId': paymentMethodId,
      if (propertyId != null) 'propertyId': propertyId,
    };
    final response = await _apiClient.dio.post('/payments/orders', data: payload);
    return PaymentOrderResponse.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<Payment> verifyPayment({
    required String paymentId,
    required String gatewayPaymentId,
    String? gatewaySignature,
  }) async {
    final payload = <String, dynamic>{
      'paymentId': paymentId,
      'gatewayPaymentId': gatewayPaymentId,
      if (gatewaySignature != null && gatewaySignature.isNotEmpty) 'gatewaySignature': gatewaySignature,
    };
    final response = await _apiClient.dio.post('/payments/verify', data: payload);
    return Payment.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<List<PaymentMethod>> getPaymentMethods() async {
    final response = await _apiClient.dio.get('/payments/methods');
    return (response.data as List? ?? [])
        .map((e) => PaymentMethod.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<PaymentsListResponse> getPayments({int page = 1, int limit = 20}) async {
    final response = await _apiClient.dio.get(
      '/payments',
      queryParameters: {'page': page, 'limit': limit},
    );
    return PaymentsListResponse.fromJson(Map<String, dynamic>.from(response.data as Map));
  }

  Future<Payment> getPaymentById(String paymentId) async {
    final response = await _apiClient.dio.get('/payments/$paymentId');
    return Payment.fromJson(Map<String, dynamic>.from(response.data as Map));
  }
}
