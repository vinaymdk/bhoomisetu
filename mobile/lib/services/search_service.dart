import '../config/api_client.dart';
import '../models/property.dart';

class SearchResultProperty extends Property {
  final double? relevanceScore;
  final double? urgencyScore;
  final double? popularityScore;
  final List<String>? matchReasons;
  final List<String>? extractedAiTags;

  SearchResultProperty({
    required super.id,
    required super.sellerId,
    required super.propertyType,
    required super.listingType,
    required super.status,
    required super.location,
    required super.title,
    super.description,
    required super.price,
    required super.area,
    required super.areaUnit,
    super.bedrooms,
    super.bathrooms,
    super.balconies,
    super.floors,
    super.floorNumber,
    super.furnishingStatus,
    super.ageOfConstruction,
    super.images,
    super.propertyFeatures,
    required super.isFeatured,
    required super.isPremium,
    super.featuredUntil,
    required super.viewsCount,
    required super.interestedCount,
    required super.isLiked,
    required super.createdAt,
    required super.updatedAt,
    this.relevanceScore,
    this.urgencyScore,
    this.popularityScore,
    this.matchReasons,
    this.extractedAiTags,
  });

  factory SearchResultProperty.fromJson(Map<String, dynamic> json) {
    final property = Property.fromJson(json);
    return SearchResultProperty(
      id: property.id,
      sellerId: property.sellerId,
      propertyType: property.propertyType,
      listingType: property.listingType,
      status: property.status,
      location: property.location,
      title: property.title,
      description: property.description,
      price: property.price,
      area: property.area,
      areaUnit: property.areaUnit,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      balconies: property.balconies,
      floors: property.floors,
      floorNumber: property.floorNumber,
      furnishingStatus: property.furnishingStatus,
      ageOfConstruction: property.ageOfConstruction,
      images: property.images,
      propertyFeatures: property.propertyFeatures,
      isFeatured: property.isFeatured,
      isPremium: property.isPremium,
      featuredUntil: property.featuredUntil,
      viewsCount: property.viewsCount,
      interestedCount: property.interestedCount,
      isLiked: property.isLiked,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      relevanceScore: json['relevanceScore'] != null ? (json['relevanceScore'] as num).toDouble() : null,
      urgencyScore: json['urgencyScore'] != null ? (json['urgencyScore'] as num).toDouble() : null,
      popularityScore: json['popularityScore'] != null ? (json['popularityScore'] as num).toDouble() : null,
      matchReasons: json['matchReasons'] != null ? List<String>.from(json['matchReasons']) : null,
      extractedAiTags: json['extractedAiTags'] != null ? List<String>.from(json['extractedAiTags']) : null,
    );
  }
}

class ExtractedFilters {
  final Map<String, dynamic>? location;
  final String? propertyType;
  final Map<String, dynamic>? priceRange;
  final int? bedrooms;
  final int? bathrooms;
  final List<String>? aiTags;

  ExtractedFilters({
    this.location,
    this.propertyType,
    this.priceRange,
    this.bedrooms,
    this.bathrooms,
    this.aiTags,
  });

  factory ExtractedFilters.fromJson(Map<String, dynamic> json) {
    return ExtractedFilters(
      location: json['location'] != null ? Map<String, dynamic>.from(json['location']) : null,
      propertyType: json['propertyType'] as String?,
      priceRange: json['priceRange'] != null ? Map<String, dynamic>.from(json['priceRange']) : null,
      bedrooms: json['bedrooms'] != null ? (json['bedrooms'] is int ? json['bedrooms'] as int : (json['bedrooms'] as num).toInt()) : null,
      bathrooms: json['bathrooms'] != null ? (json['bathrooms'] is int ? json['bathrooms'] as int : (json['bathrooms'] as num).toInt()) : null,
      aiTags: json['aiTags'] != null
          ? (json['aiTags'] as List).where((tag) => tag is String && tag.isNotEmpty).map((tag) => tag as String).toList()
          : null,
    );
  }
}

class SearchMetadata {
  final int processingTimeMs;
  final bool aiRankingUsed;
  final bool locationNormalized;
  final int? similarPropertiesCount;

  SearchMetadata({
    required this.processingTimeMs,
    required this.aiRankingUsed,
    required this.locationNormalized,
    this.similarPropertiesCount,
  });

  factory SearchMetadata.fromJson(Map<String, dynamic> json) {
    return SearchMetadata(
      processingTimeMs: json['processingTimeMs'] is int ? json['processingTimeMs'] as int : (json['processingTimeMs'] as num).toInt(),
      aiRankingUsed: json['aiRankingUsed'] as bool? ?? false,
      locationNormalized: json['locationNormalized'] as bool? ?? false,
      similarPropertiesCount: json['similarPropertiesCount'] != null 
          ? (json['similarPropertiesCount'] is int ? json['similarPropertiesCount'] as int : (json['similarPropertiesCount'] as num).toInt())
          : null,
    );
  }
}

class AiSearchResponse {
  final List<SearchResultProperty> properties;
  final int total;
  final int page;
  final int limit;
  final String query;
  final ExtractedFilters extractedFilters;
  final List<SearchResultProperty>? similarProperties;
  final SearchMetadata searchMetadata;

  AiSearchResponse({
    required this.properties,
    required this.total,
    required this.page,
    required this.limit,
    required this.query,
    required this.extractedFilters,
    this.similarProperties,
    required this.searchMetadata,
  });

  factory AiSearchResponse.fromJson(Map<String, dynamic> json) {
    return AiSearchResponse(
      properties: (json['properties'] as List)
          .map((p) => SearchResultProperty.fromJson(p as Map<String, dynamic>))
          .toList(),
      total: json['total'] is int ? json['total'] as int : (json['total'] as num).toInt(),
      page: json['page'] is int ? json['page'] as int : (json['page'] as num).toInt(),
      limit: json['limit'] is int ? json['limit'] as int : (json['limit'] as num).toInt(),
      query: json['query'] as String? ?? '',
      extractedFilters: ExtractedFilters.fromJson(json['extractedFilters'] as Map<String, dynamic>),
      similarProperties: json['similarProperties'] != null
          ? (json['similarProperties'] as List)
              .map((p) => SearchResultProperty.fromJson(p as Map<String, dynamic>))
              .toList()
          : null,
      searchMetadata: SearchMetadata.fromJson(json['searchMetadata'] as Map<String, dynamic>),
    );
  }
}

class SearchFilters {
  String? query;
  String? listingType; // 'sale' | 'rent'
  String? propertyType;
  String? city;
  String? locality;
  String? area;
  double? latitude;
  double? longitude;
  double? radius;
  double? minPrice;
  double? maxPrice;
  int? bedrooms;
  int? bathrooms;
  double? minArea;
  double? maxArea;
  List<String>? aiTags;
  int? page;
  int? limit;
  String? rankBy; // 'relevance' | 'price' | 'popularity' | 'urgency' | 'newest'
  bool? includeSimilar;
  double? similarityThreshold;

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{};
    
    if (query != null && query!.isNotEmpty) params['query'] = query;
    if (listingType != null) params['listingType'] = listingType;
    if (propertyType != null) params['propertyType'] = propertyType;
    if (city != null) params['city'] = city;
    if (locality != null) params['locality'] = locality;
    if (area != null) params['area'] = area;
    if (latitude != null) params['latitude'] = latitude;
    if (longitude != null) params['longitude'] = longitude;
    if (radius != null) params['radius'] = radius;
    if (minPrice != null) params['minPrice'] = minPrice;
    if (maxPrice != null) params['maxPrice'] = maxPrice;
    if (bedrooms != null) params['bedrooms'] = bedrooms;
    if (bathrooms != null) params['bathrooms'] = bathrooms;
    if (minArea != null) params['minArea'] = minArea;
    if (maxArea != null) params['maxArea'] = maxArea;
    if (aiTags != null && aiTags!.isNotEmpty) params['aiTags'] = aiTags!.join(',');
    if (page != null) params['page'] = page;
    if (limit != null) params['limit'] = limit;
    if (rankBy != null) params['rankBy'] = rankBy;
    if (includeSimilar != null) params['includeSimilar'] = includeSimilar;
    if (similarityThreshold != null) params['similarityThreshold'] = similarityThreshold;

    return params;
  }
}

class SearchService {
  final _apiClient = ApiClient();

  Future<AiSearchResponse> search(SearchFilters filters) async {
    try {
      final params = filters.toQueryParams();
      final response = await _apiClient.dio.get('/search', queryParameters: params);
      return AiSearchResponse.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<List<String>> getSearchSuggestions(String query) async {
    try {
      final response = await _apiClient.dio.get(
        '/search/suggestions',
        queryParameters: {'q': query},
      );
      return List<String>.from(response.data['suggestions'] ?? []);
    } catch (e) {
      // If suggestions endpoint fails, return empty list
      return [];
    }
  }
}

