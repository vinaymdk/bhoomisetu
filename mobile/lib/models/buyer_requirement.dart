class BuyerRequirement {
  final String id;
  final String buyerId;
  final String? title;
  final String? description;
  final RequirementLocation location;
  final RequirementBudget budget;
  final RequirementPropertyDetails propertyDetails;
  final String status;
  final int matchCount;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? lastMatchedAt;
  final DateTime? expiresAt;

  BuyerRequirement({
    required this.id,
    required this.buyerId,
    required this.location,
    required this.budget,
    required this.propertyDetails,
    required this.status,
    required this.matchCount,
    required this.createdAt,
    required this.updatedAt,
    this.title,
    this.description,
    this.lastMatchedAt,
    this.expiresAt,
  });

  factory BuyerRequirement.fromJson(Map<String, dynamic> json) {
    return BuyerRequirement(
      id: json['id'] as String,
      buyerId: json['buyerId'] as String,
      title: json['title'] as String?,
      description: json['description'] as String?,
      location: RequirementLocation.fromJson(Map<String, dynamic>.from(json['location'] ?? {})),
      budget: RequirementBudget.fromJson(Map<String, dynamic>.from(json['budget'] ?? {})),
      propertyDetails: RequirementPropertyDetails.fromJson(Map<String, dynamic>.from(json['propertyDetails'] ?? {})),
      status: json['status'] as String? ?? 'active',
      matchCount: _parseInt(json['matchCount']),
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt']?.toString() ?? '') ?? DateTime.now(),
      lastMatchedAt: _parseDate(json['lastMatchedAt']),
      expiresAt: _parseDate(json['expiresAt']),
    );
  }

  static int _parseInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value) ?? 0;
    return 0;
  }

  static DateTime? _parseDate(dynamic value) {
    if (value == null) return null;
    return DateTime.tryParse(value.toString());
  }
}

class RequirementLocation {
  final String city;
  final String state;
  final String? locality;
  final String? pincode;
  final String? landmark;
  final double? latitude;
  final double? longitude;

  RequirementLocation({
    required this.city,
    required this.state,
    this.locality,
    this.pincode,
    this.landmark,
    this.latitude,
    this.longitude,
  });

  factory RequirementLocation.fromJson(Map<String, dynamic> json) {
    return RequirementLocation(
      city: json['city'] as String? ?? '',
      state: json['state'] as String? ?? '',
      locality: json['locality'] as String?,
      pincode: json['pincode'] as String?,
      landmark: json['landmark'] as String?,
      latitude: _parseDouble(json['latitude']),
      longitude: _parseDouble(json['longitude']),
    );
  }

  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}

class RequirementBudget {
  final double? minBudget;
  final double maxBudget;
  final String budgetType;

  RequirementBudget({
    this.minBudget,
    required this.maxBudget,
    required this.budgetType,
  });

  factory RequirementBudget.fromJson(Map<String, dynamic> json) {
    return RequirementBudget(
      minBudget: _parseDouble(json['minBudget']),
      maxBudget: _parseDouble(json['maxBudget']) ?? 0,
      budgetType: json['budgetType'] as String? ?? 'sale',
    );
  }

  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}

class RequirementPropertyDetails {
  final String? propertyType;
  final String? listingType;
  final double? minArea;
  final double? maxArea;
  final String areaUnit;
  final int? bedrooms;
  final int? bathrooms;
  final List<String> requiredFeatures;

  RequirementPropertyDetails({
    this.propertyType,
    this.listingType,
    this.minArea,
    this.maxArea,
    required this.areaUnit,
    this.bedrooms,
    this.bathrooms,
    required this.requiredFeatures,
  });

  factory RequirementPropertyDetails.fromJson(Map<String, dynamic> json) {
    return RequirementPropertyDetails(
      propertyType: json['propertyType'] as String?,
      listingType: json['listingType'] as String?,
      minArea: _parseDouble(json['minArea']),
      maxArea: _parseDouble(json['maxArea']),
      areaUnit: json['areaUnit'] as String? ?? 'sqft',
      bedrooms: _parseInt(json['bedrooms']),
      bathrooms: _parseInt(json['bathrooms']),
      requiredFeatures: (json['requiredFeatures'] as List?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
    );
  }

  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  static int? _parseInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value);
    return null;
  }
}

class BuyerRequirementMatch {
  final Map<String, dynamic> property;
  final MatchScore match;
  final double budgetOverlapPercentage;
  final String locationMatchType;
  final List<String> matchReasons;

  BuyerRequirementMatch({
    required this.property,
    required this.match,
    required this.budgetOverlapPercentage,
    required this.locationMatchType,
    required this.matchReasons,
  });

  factory BuyerRequirementMatch.fromJson(Map<String, dynamic> json) {
    return BuyerRequirementMatch(
      property: Map<String, dynamic>.from(json['property'] ?? {}),
      match: MatchScore.fromJson(Map<String, dynamic>.from(json['match'] ?? {})),
      budgetOverlapPercentage: _parseDouble(json['budgetOverlapPercentage']) ?? 0,
      locationMatchType: json['locationMatchType'] as String? ?? '',
      matchReasons: (json['matchReasons'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}

class MatchScore {
  final double locationMatchScore;
  final double budgetMatchScore;
  final double overallMatchScore;

  MatchScore({
    required this.locationMatchScore,
    required this.budgetMatchScore,
    required this.overallMatchScore,
  });

  factory MatchScore.fromJson(Map<String, dynamic> json) {
    return MatchScore(
      locationMatchScore: _parseDouble(json['locationMatchScore']) ?? 0,
      budgetMatchScore: _parseDouble(json['budgetMatchScore']) ?? 0,
      overallMatchScore: _parseDouble(json['overallMatchScore']) ?? 0,
    );
  }

  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}

