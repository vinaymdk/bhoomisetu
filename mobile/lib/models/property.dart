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
      address: json['address'] as String? ?? '',
      city: json['city'] as String? ?? '',
      state: json['state'] as String? ?? '',
      pincode: json['pincode'] as String?,
      locality: json['locality'] as String?,
      landmark: json['landmark'] as String?,
      latitude: json['latitude'] != null ? (json['latitude'] is double ? json['latitude'] as double : (json['latitude'] as num).toDouble()) : null,
      longitude: json['longitude'] != null ? (json['longitude'] is double ? json['longitude'] as double : (json['longitude'] as num).toDouble()) : null,
    );
  }
}

class PropertyImage {
  final String id;
  final String imageUrl;
  final bool isPrimary;
  final int displayOrder;

  PropertyImage({
    required this.id,
    required this.imageUrl,
    required this.isPrimary,
    required this.displayOrder,
  });

  factory PropertyImage.fromJson(Map<String, dynamic> json) {
    return PropertyImage(
      id: json['id'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
      isPrimary: json['isPrimary'] as bool? ?? false,
      displayOrder: json['displayOrder'] != null 
          ? (json['displayOrder'] as num).toInt()
          : (json['order'] != null ? (json['order'] as num).toInt() : 0),
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
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
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
    // Handle location - can be nested object or flat structure
    Map<String, dynamic> locationData;
    if (json['location'] != null && json['location'] is Map) {
      locationData = json['location'] as Map<String, dynamic>;
    } else {
      // Fallback: create location from flat fields
      locationData = {
        'address': json['address'] ?? '',
        'city': json['city'] ?? '',
        'state': json['state'] ?? '',
        'pincode': json['pincode'],
        'locality': json['locality'],
        'landmark': json['landmark'],
        'latitude': json['latitude'],
        'longitude': json['longitude'],
      };
    }
    
    return Property(
      id: json['id'] as String,
      sellerId: json['sellerId'] as String,
      propertyType: json['propertyType'] as String,
      listingType: json['listingType'] as String,
      status: json['status'] as String,
      location: PropertyLocation.fromJson(locationData),
      title: json['title'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toDouble(),
      area: (json['area'] as num).toDouble(),
      areaUnit: json['areaUnit'] as String,
      bedrooms: json['bedrooms'] != null ? (json['bedrooms'] is int ? json['bedrooms'] as int : (json['bedrooms'] as num).toInt()) : null,
      bathrooms: json['bathrooms'] != null ? (json['bathrooms'] is int ? json['bathrooms'] as int : (json['bathrooms'] as num).toInt()) : null,
      balconies: json['balconies'] != null ? (json['balconies'] is int ? json['balconies'] as int : (json['balconies'] as num).toInt()) : null,
      floors: json['floors'] != null ? (json['floors'] is int ? json['floors'] as int : (json['floors'] as num).toInt()) : null,
      floorNumber: json['floorNumber'] != null ? (json['floorNumber'] is int ? json['floorNumber'] as int : (json['floorNumber'] as num).toInt()) : null,
      furnishingStatus: json['furnishingStatus'] as String?,
      ageOfConstruction: json['ageOfConstruction'] != null ? (json['ageOfConstruction'] is int ? json['ageOfConstruction'] as int : (json['ageOfConstruction'] as num).toInt()) : null,
      images: json['images'] != null
          ? (json['images'] as List).map((i) => PropertyImage.fromJson(i as Map<String, dynamic>)).toList()
          : null,
      propertyFeatures: json['propertyFeatures'] != null
          ? (json['propertyFeatures'] as List).map((f) => PropertyFeature.fromJson(f as Map<String, dynamic>)).toList()
          : null,
      isFeatured: json['isFeatured'] as bool,
      isPremium: json['isPremium'] as bool,
      featuredUntil: json['featuredUntil'] != null ? DateTime.parse(json['featuredUntil'] as String) : null,
      viewsCount: json['viewsCount'] is int ? json['viewsCount'] as int : (json['viewsCount'] as num).toInt(),
      interestedCount: json['interestedCount'] is int ? json['interestedCount'] as int : (json['interestedCount'] as num).toInt(),
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
    // Safely parse properties with error handling
    List<Property> featuredProperties = [];
    if (json['featuredProperties'] != null && json['featuredProperties'] is List) {
      try {
        featuredProperties = (json['featuredProperties'] as List)
            .map((p) {
              try {
                return Property.fromJson(p as Map<String, dynamic>);
              } catch (e) {
                print('Error parsing featured property: $e');
                return null;
              }
            })
            .whereType<Property>()
            .toList();
      } catch (e) {
        print('Error parsing featuredProperties: $e');
      }
    }
    
    List<Property> newProperties = [];
    if (json['newProperties'] != null && json['newProperties'] is List) {
      try {
        newProperties = (json['newProperties'] as List)
            .map((p) {
              try {
                return Property.fromJson(p as Map<String, dynamic>);
              } catch (e) {
                print('Error parsing new property: $e');
                return null;
              }
            })
            .whereType<Property>()
            .toList();
      } catch (e) {
        print('Error parsing newProperties: $e');
      }
    }
    
    return HomeData(
      featuredProperties: featuredProperties,
      newProperties: newProperties,
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
    // Safely parse properties with error handling
    List<Property> featuredProperties = [];
    if (json['featuredProperties'] != null && json['featuredProperties'] is List) {
      try {
        featuredProperties = (json['featuredProperties'] as List)
            .map((p) {
              try {
                return Property.fromJson(p as Map<String, dynamic>);
              } catch (e) {
                print('Error parsing featured property: $e');
                return null;
              }
            })
            .whereType<Property>()
            .toList();
      } catch (e) {
        print('Error parsing featuredProperties: $e');
      }
    }
    
    List<Property> newProperties = [];
    if (json['newProperties'] != null && json['newProperties'] is List) {
      try {
        newProperties = (json['newProperties'] as List)
            .map((p) {
              try {
                return Property.fromJson(p as Map<String, dynamic>);
              } catch (e) {
                print('Error parsing new property: $e');
                return null;
              }
            })
            .whereType<Property>()
            .toList();
      } catch (e) {
        print('Error parsing newProperties: $e');
      }
    }
    
    return DashboardData(
      featuredProperties: featuredProperties,
      newProperties: newProperties,
      timestamp: DateTime.parse(json['timestamp'] as String),
      subscriptionStatus: json['subscriptionStatus'] as Map<String, dynamic>?,
      premiumFeatures: json['premiumFeatures'] as Map<String, dynamic>?,
    );
  }
}
