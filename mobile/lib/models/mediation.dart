class InterestExpression {
  final String id;
  final String buyerId;
  final String propertyId;
  final String interestType;
  final String priority;
  final String connectionStatus;
  final String? message;
  final Map<String, dynamic>? property;
  final Map<String, dynamic>? buyer;
  final DateTime createdAt;

  InterestExpression({
    required this.id,
    required this.buyerId,
    required this.propertyId,
    required this.interestType,
    required this.priority,
    required this.connectionStatus,
    this.message,
    this.property,
    this.buyer,
    required this.createdAt,
  });

  factory InterestExpression.fromJson(Map<String, dynamic> json) {
    return InterestExpression(
      id: json['id'] as String,
      buyerId: json['buyerId'] as String? ?? '',
      propertyId: json['propertyId'] as String? ?? '',
      interestType: json['interestType'] as String? ?? 'viewing',
      priority: json['priority'] as String? ?? 'normal',
      connectionStatus: json['connectionStatus'] as String? ?? 'pending',
      message: json['message'] as String?,
      property: json['property'] != null ? Map<String, dynamic>.from(json['property']) : null,
      buyer: json['buyer'] != null ? Map<String, dynamic>.from(json['buyer']) : null,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}

class MediationListResponse {
  final List<InterestExpression> interests;
  final int total;
  final int page;
  final int limit;

  MediationListResponse({
    required this.interests,
    required this.total,
    required this.page,
    required this.limit,
  });

  factory MediationListResponse.fromJson(Map<String, dynamic> json) {
    return MediationListResponse(
      interests: (json['interests'] as List? ?? [])
          .map((e) => InterestExpression.fromJson(Map<String, dynamic>.from(e)))
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

