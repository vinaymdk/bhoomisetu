double _parseDouble(dynamic value) {
  if (value is double) return value;
  if (value is int) return value.toDouble();
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0;
  return 0;
}

int _parseInt(dynamic value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value) ?? 0;
  return 0;
}

class PaymentMethod {
  final String id;
  final String userId;
  final String gateway;
  final String gatewayPaymentMethodId;
  final String? cardLast4;
  final String? cardBrand;
  final String? cardType;
  final int? cardExpiryMonth;
  final int? cardExpiryYear;
  final String? billingName;
  final String? billingEmail;
  final String? billingPhone;
  final String? billingAddressLine1;
  final String? billingAddressLine2;
  final String? billingCity;
  final String? billingState;
  final String? billingCountry;
  final String? billingPincode;
  final bool isDefault;
  final bool isActive;
  final int fraudRiskScore;
  final bool duplicateCardFlagged;
  final bool locationMismatchFlagged;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  PaymentMethod({
    required this.id,
    required this.userId,
    required this.gateway,
    required this.gatewayPaymentMethodId,
    required this.isDefault,
    required this.isActive,
    required this.fraudRiskScore,
    required this.duplicateCardFlagged,
    required this.locationMismatchFlagged,
    required this.createdAt,
    required this.updatedAt,
    this.cardLast4,
    this.cardBrand,
    this.cardType,
    this.cardExpiryMonth,
    this.cardExpiryYear,
    this.billingName,
    this.billingEmail,
    this.billingPhone,
    this.billingAddressLine1,
    this.billingAddressLine2,
    this.billingCity,
    this.billingState,
    this.billingCountry,
    this.billingPincode,
    this.metadata,
  });

  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      gateway: json['gateway']?.toString() ?? 'razorpay',
      gatewayPaymentMethodId: json['gatewayPaymentMethodId']?.toString() ?? '',
      cardLast4: json['cardLast4']?.toString(),
      cardBrand: json['cardBrand']?.toString(),
      cardType: json['cardType']?.toString(),
      cardExpiryMonth: json['cardExpiryMonth'] != null ? _parseInt(json['cardExpiryMonth']) : null,
      cardExpiryYear: json['cardExpiryYear'] != null ? _parseInt(json['cardExpiryYear']) : null,
      billingName: json['billingName']?.toString(),
      billingEmail: json['billingEmail']?.toString(),
      billingPhone: json['billingPhone']?.toString(),
      billingAddressLine1: json['billingAddressLine1']?.toString(),
      billingAddressLine2: json['billingAddressLine2']?.toString(),
      billingCity: json['billingCity']?.toString(),
      billingState: json['billingState']?.toString(),
      billingCountry: json['billingCountry']?.toString(),
      billingPincode: json['billingPincode']?.toString(),
      isDefault: json['isDefault'] == true,
      isActive: json['isActive'] == true,
      fraudRiskScore: _parseInt(json['fraudRiskScore']),
      duplicateCardFlagged: json['duplicateCardFlagged'] == true,
      locationMismatchFlagged: json['locationMismatchFlagged'] == true,
      metadata: json['metadata'] != null ? Map<String, dynamic>.from(json['metadata']) : null,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}

class Payment {
  final String id;
  final String userId;
  final double amount;
  final String currency;
  final String gateway;
  final String? gatewayOrderId;
  final String? gatewayPaymentId;
  final String? signature;
  final String? paymentMethodId;
  final String status;
  final String purpose;
  final String? relatedEntityType;
  final String? relatedEntityId;
  final int fraudRiskScore;
  final bool duplicateCardDetected;
  final bool locationMismatchDetected;
  final bool aiCheckPerformed;
  final Map<String, dynamic>? aiCheckResult;
  final Map<String, dynamic>? metadata;
  final String? failureReason;
  final DateTime? initiatedAt;
  final DateTime? completedAt;
  final DateTime? failedAt;
  final DateTime? refundedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final PaymentMethod? paymentMethod;

  Payment({
    required this.id,
    required this.userId,
    required this.amount,
    required this.currency,
    required this.gateway,
    required this.status,
    required this.purpose,
    required this.fraudRiskScore,
    required this.duplicateCardDetected,
    required this.locationMismatchDetected,
    required this.aiCheckPerformed,
    required this.createdAt,
    required this.updatedAt,
    this.gatewayOrderId,
    this.gatewayPaymentId,
    this.signature,
    this.paymentMethodId,
    this.relatedEntityType,
    this.relatedEntityId,
    this.aiCheckResult,
    this.metadata,
    this.failureReason,
    this.initiatedAt,
    this.completedAt,
    this.failedAt,
    this.refundedAt,
    this.paymentMethod,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      amount: _parseDouble(json['amount']),
      currency: json['currency']?.toString() ?? 'INR',
      gateway: json['gateway']?.toString() ?? 'razorpay',
      gatewayOrderId: json['gatewayOrderId']?.toString(),
      gatewayPaymentId: json['gatewayPaymentId']?.toString(),
      signature: json['signature']?.toString(),
      paymentMethodId: json['paymentMethodId']?.toString(),
      status: json['status']?.toString() ?? 'pending',
      purpose: json['purpose']?.toString() ?? 'subscription',
      relatedEntityType: json['relatedEntityType']?.toString(),
      relatedEntityId: json['relatedEntityId']?.toString(),
      fraudRiskScore: _parseInt(json['fraudRiskScore']),
      duplicateCardDetected: json['duplicateCardDetected'] == true,
      locationMismatchDetected: json['locationMismatchDetected'] == true,
      aiCheckPerformed: json['aiCheckPerformed'] == true,
      aiCheckResult: json['aiCheckResult'] != null ? Map<String, dynamic>.from(json['aiCheckResult']) : null,
      metadata: json['metadata'] != null ? Map<String, dynamic>.from(json['metadata']) : null,
      failureReason: json['failureReason']?.toString(),
      initiatedAt: json['initiatedAt'] != null ? DateTime.tryParse(json['initiatedAt'].toString()) : null,
      completedAt: json['completedAt'] != null ? DateTime.tryParse(json['completedAt'].toString()) : null,
      failedAt: json['failedAt'] != null ? DateTime.tryParse(json['failedAt'].toString()) : null,
      refundedAt: json['refundedAt'] != null ? DateTime.tryParse(json['refundedAt'].toString()) : null,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt']?.toString() ?? '') ?? DateTime.now(),
      paymentMethod: json['paymentMethod'] != null
          ? PaymentMethod.fromJson(Map<String, dynamic>.from(json['paymentMethod']))
          : null,
    );
  }
}

class PaymentOrderResponse {
  final String paymentId;
  final String orderId;
  final double amount;
  final String currency;
  final String gateway;
  final Map<String, dynamic> orderData;

  PaymentOrderResponse({
    required this.paymentId,
    required this.orderId,
    required this.amount,
    required this.currency,
    required this.gateway,
    required this.orderData,
  });

  factory PaymentOrderResponse.fromJson(Map<String, dynamic> json) {
    return PaymentOrderResponse(
      paymentId: json['paymentId']?.toString() ?? '',
      orderId: json['orderId']?.toString() ?? '',
      amount: _parseDouble(json['amount']),
      currency: json['currency']?.toString() ?? 'INR',
      gateway: json['gateway']?.toString() ?? 'razorpay',
      orderData: json['orderData'] != null ? Map<String, dynamic>.from(json['orderData']) : <String, dynamic>{},
    );
  }
}

class PaymentsListResponse {
  final List<Payment> payments;
  final int total;
  final int page;
  final int limit;

  PaymentsListResponse({
    required this.payments,
    required this.total,
    required this.page,
    required this.limit,
  });

  factory PaymentsListResponse.fromJson(Map<String, dynamic> json) {
    return PaymentsListResponse(
      payments: (json['payments'] as List? ?? [])
          .map((e) => Payment.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
      total: _parseInt(json['total']),
      page: _parseInt(json['page']),
      limit: _parseInt(json['limit']),
    );
  }
}
