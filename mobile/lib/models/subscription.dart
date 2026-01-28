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

class SubscriptionPlan {
  final String id;
  final String name;
  final String displayName;
  final String? description;
  final String planType;
  final String billingPeriod;
  final double price;
  final String currency;
  final Map<String, dynamic> features;
  final int durationDays;
  final bool isActive;
  final bool isFeatured;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  SubscriptionPlan({
    required this.id,
    required this.name,
    required this.displayName,
    required this.planType,
    required this.billingPeriod,
    required this.price,
    required this.currency,
    required this.features,
    required this.durationDays,
    required this.isActive,
    required this.isFeatured,
    required this.createdAt,
    required this.updatedAt,
    this.description,
    this.metadata,
  });

  factory SubscriptionPlan.fromJson(Map<String, dynamic> json) {
    return SubscriptionPlan(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      displayName: json['displayName']?.toString() ?? '',
      description: json['description']?.toString(),
      planType: json['planType']?.toString() ?? 'premium_seller',
      billingPeriod: json['billingPeriod']?.toString() ?? 'monthly',
      price: _parseDouble(json['price']),
      currency: json['currency']?.toString() ?? 'INR',
      features: json['features'] != null ? Map<String, dynamic>.from(json['features']) : <String, dynamic>{},
      durationDays: _parseInt(json['durationDays']),
      isActive: json['isActive'] == true,
      isFeatured: json['isFeatured'] == true,
      metadata: json['metadata'] != null ? Map<String, dynamic>.from(json['metadata']) : null,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}

class Subscription {
  final String id;
  final String userId;
  final String subscriptionType;
  final String status;
  final DateTime startsAt;
  final DateTime expiresAt;
  final String? paymentId;
  final double? amountPaid;
  final String? subscriptionPlanId;
  final bool autoRenewalEnabled;
  final DateTime? nextBillingDate;
  final DateTime? cancelledAt;
  final String? cancellationReason;
  final String? paymentMethodId;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;
  final SubscriptionPlan? plan;

  Subscription({
    required this.id,
    required this.userId,
    required this.subscriptionType,
    required this.status,
    required this.startsAt,
    required this.expiresAt,
    required this.autoRenewalEnabled,
    required this.createdAt,
    required this.updatedAt,
    this.paymentId,
    this.amountPaid,
    this.subscriptionPlanId,
    this.nextBillingDate,
    this.cancelledAt,
    this.cancellationReason,
    this.paymentMethodId,
    this.metadata,
    this.plan,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      subscriptionType: json['subscriptionType']?.toString() ?? 'premium_seller',
      status: json['status']?.toString() ?? 'active',
      startsAt: DateTime.tryParse(json['startsAt']?.toString() ?? '') ?? DateTime.now(),
      expiresAt: DateTime.tryParse(json['expiresAt']?.toString() ?? '') ?? DateTime.now(),
      paymentId: json['paymentId']?.toString(),
      amountPaid: json['amountPaid'] != null ? _parseDouble(json['amountPaid']) : null,
      subscriptionPlanId: json['subscriptionPlanId']?.toString(),
      autoRenewalEnabled: json['autoRenewalEnabled'] == true,
      nextBillingDate: json['nextBillingDate'] != null ? DateTime.tryParse(json['nextBillingDate'].toString()) : null,
      cancelledAt: json['cancelledAt'] != null ? DateTime.tryParse(json['cancelledAt'].toString()) : null,
      cancellationReason: json['cancellationReason']?.toString(),
      paymentMethodId: json['paymentMethodId']?.toString(),
      metadata: json['metadata'] != null ? Map<String, dynamic>.from(json['metadata']) : null,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt']?.toString() ?? '') ?? DateTime.now(),
      plan: json['plan'] != null ? SubscriptionPlan.fromJson(Map<String, dynamic>.from(json['plan'])) : null,
    );
  }
}

class SubscriptionStatusSummary {
  final bool hasPremiumSeller;
  final bool hasPremiumBuyer;
  final bool hasActiveFeaturedListing;
  final List<Subscription> activeSubscriptions;

  SubscriptionStatusSummary({
    required this.hasPremiumSeller,
    required this.hasPremiumBuyer,
    required this.hasActiveFeaturedListing,
    required this.activeSubscriptions,
  });

  factory SubscriptionStatusSummary.fromJson(Map<String, dynamic> json) {
    return SubscriptionStatusSummary(
      hasPremiumSeller: json['hasPremiumSeller'] == true,
      hasPremiumBuyer: json['hasPremiumBuyer'] == true,
      hasActiveFeaturedListing: json['hasActiveFeaturedListing'] == true,
      activeSubscriptions: (json['activeSubscriptions'] as List? ?? [])
          .map((e) => Subscription.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
    );
  }
}

class PremiumFeaturesResponse {
  final Map<String, dynamic> premiumFeatures;
  final SubscriptionStatusSummary subscriptionStatus;

  PremiumFeaturesResponse({
    required this.premiumFeatures,
    required this.subscriptionStatus,
  });

  factory PremiumFeaturesResponse.fromJson(Map<String, dynamic> json) {
    return PremiumFeaturesResponse(
      premiumFeatures: json['premiumFeatures'] != null
          ? Map<String, dynamic>.from(json['premiumFeatures'])
          : <String, dynamic>{},
      subscriptionStatus: SubscriptionStatusSummary.fromJson(
        Map<String, dynamic>.from(json['subscriptionStatus'] ?? <String, dynamic>{}),
      ),
    );
  }
}
