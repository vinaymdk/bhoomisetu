class PropertyLocation {
  final String address;
  final String city;
  final String state;
  final String? pincode;
  final String? locality;
  final String? landmark;
  final double? latitude;
  final double? longitude;

  PropertyLocation({
    required this.address,
    required this.city,
    required this.state,
    this.pincode,
    this.locality,
    this.landmark,
    this.latitude,
    this.longitude,
  });

  factory PropertyLocation.fromJson(Map<String, dynamic> json) {
    return PropertyLocation(
      address: json['address'] as String,
      city: json['city'] as String,
      state: json['state'] as String,
      pincode: json['pincode'] as String?,
      locality: json['locality'] as String?,
      landmark: json['landmark'] as String?,
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
    );
  }
}

class PropertyImage {
  final String id;
  final String imageUrl;
  final bool isPrimary;
  final int order;

  PropertyImage({
    required this.id,
    required this.imageUrl,
    required this.isPrimary,
    required this.order,
  });

  factory PropertyImage.fromJson(Map<String, dynamic> json) {
    return PropertyImage(
      id: json['id'] as String,
      imageUrl: json['imageUrl'] as String,
      isPrimary: json['isPrimary'] as bool,
      order: json['order'] as int,
    );
  }
}

class PropertyFeature {
  final String id;
  final String name;
  final String? value;

  PropertyFeature({
    required this.id,
    required this.name,
    this.value,
  });

  factory PropertyFeature.fromJson(Map<String, dynamic> json) {
    return PropertyFeature(
      id: json['id'] as String,
      name: json['name'] as String,
      value: json['value'] as String?,
    );
  }
}

class Property {
  final String id;
  final String sellerId;
  final String propertyType;
  final String listingType;
  final String status;
  final PropertyLocation location;
  final String title;
  final String? description;
  final double price;
  final double area;
  final String areaUnit;
  final int? bedrooms;
  final int? bathrooms;
  final int? balconies;
  final int? floors;
  final int? floorNumber;
  final String? furnishingStatus;
  final int? ageOfConstruction;
  final List<PropertyImage>? images;
  final List<PropertyFeature>? propertyFeatures;
  final bool isFeatured;
  final bool isPremium;
  final DateTime? featuredUntil;
  final int viewsCount;
  final int interestedCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  Property({
    required this.id,
    required this.sellerId,
    required this.propertyType,
    required this.listingType,
    required this.status,
    required this.location,
    required this.title,
    this.description,
    required this.price,
    required this.area,
    required this.areaUnit,
    this.bedrooms,
    this.bathrooms,
    this.balconies,
    this.floors,
    this.floorNumber,
    this.furnishingStatus,
    this.ageOfConstruction,
    this.images,
    this.propertyFeatures,
    required this.isFeatured,
    required this.isPremium,
    this.featuredUntil,
    required this.viewsCount,
    required this.interestedCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Property.fromJson(Map<String, dynamic> json) {
    return Property(
      id: json['id'] as String,
      sellerId: json['sellerId'] as String,
      propertyType: json['propertyType'] as String,
      listingType: json['listingType'] as String,
      status: json['status'] as String,
      location: PropertyLocation.fromJson(json['location'] as Map<String, dynamic>),
      title: json['title'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toDouble(),
      area: (json['area'] as num).toDouble(),
      areaUnit: json['areaUnit'] as String,
      bedrooms: json['bedrooms'] as int?,
      bathrooms: json['bathrooms'] as int?,
      balconies: json['balconies'] as int?,
      floors: json['floors'] as int?,
      floorNumber: json['floorNumber'] as int?,
      furnishingStatus: json['furnishingStatus'] as String?,
      ageOfConstruction: json['ageOfConstruction'] as int?,
      images: json['images'] != null
          ? (json['images'] as List).map((i) => PropertyImage.fromJson(i as Map<String, dynamic>)).toList()
          : null,
      propertyFeatures: json['propertyFeatures'] != null
          ? (json['propertyFeatures'] as List).map((f) => PropertyFeature.fromJson(f as Map<String, dynamic>)).toList()
          : null,
      isFeatured: json['isFeatured'] as bool,
      isPremium: json['isPremium'] as bool,
      featuredUntil: json['featuredUntil'] != null ? DateTime.parse(json['featuredUntil'] as String) : null,
      viewsCount: json['viewsCount'] as int,
      interestedCount: json['interestedCount'] as int,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }
}

class HomeData {
  final List<Property> featuredProperties;
  final List<Property> newProperties;
  final DateTime timestamp;

  HomeData({
    required this.featuredProperties,
    required this.newProperties,
    required this.timestamp,
  });

  factory HomeData.fromJson(Map<String, dynamic> json) {
    return HomeData(
      featuredProperties: (json['featuredProperties'] as List)
          .map((p) => Property.fromJson(p as Map<String, dynamic>))
          .toList(),
      newProperties: (json['newProperties'] as List)
          .map((p) => Property.fromJson(p as Map<String, dynamic>))
          .toList(),
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}

class DashboardData extends HomeData {
  final Map<String, dynamic>? subscriptionStatus;
  final Map<String, dynamic>? premiumFeatures;

  DashboardData({
    required super.featuredProperties,
    required super.newProperties,
    required super.timestamp,
    this.subscriptionStatus,
    this.premiumFeatures,
  });

  factory DashboardData.fromJson(Map<String, dynamic> json) {
    return DashboardData(
      featuredProperties: (json['featuredProperties'] as List)
          .map((p) => Property.fromJson(p as Map<String, dynamic>))
          .toList(),
      newProperties: (json['newProperties'] as List)
          .map((p) => Property.fromJson(p as Map<String, dynamic>))
          .toList(),
      timestamp: DateTime.parse(json['timestamp'] as String),
      subscriptionStatus: json['subscriptionStatus'] as Map<String, dynamic>?,
      premiumFeatures: json['premiumFeatures'] as Map<String, dynamic>?,
    );
  }
}
