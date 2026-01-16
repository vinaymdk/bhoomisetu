import 'dart:io';
import 'package:dio/dio.dart';
import '../config/api_client.dart';
import '../models/property.dart';

class UploadedImage {
  final String url;
  final String publicId;

  UploadedImage({required this.url, required this.publicId});

  factory UploadedImage.fromJson(Map<String, dynamic> json) {
    return UploadedImage(
      url: json['url'] as String,
      publicId: json['publicId'] as String,
    );
  }
}

class GeocodedLocation {
  final String formattedAddress;
  final String city;
  final String state;
  final String? pincode;
  final String? locality;
  final String? landmark;
  final double latitude;
  final double longitude;

  GeocodedLocation({
    required this.formattedAddress,
    required this.city,
    required this.state,
    this.pincode,
    this.locality,
    this.landmark,
    required this.latitude,
    required this.longitude,
  });

  factory GeocodedLocation.fromJson(Map<String, dynamic> json) {
    final location = Map<String, dynamic>.from(json['location'] ?? {});
    final coords = Map<String, dynamic>.from(location['coordinates'] ?? {});
    return GeocodedLocation(
      formattedAddress: location['formattedAddress'] as String? ?? '',
      city: location['city'] as String? ?? '',
      state: location['state'] as String? ?? '',
      pincode: location['pincode'] as String?,
      locality: location['locality'] as String?,
      landmark: location['landmark'] as String?,
      latitude: (coords['latitude'] as num?)?.toDouble() ?? 0,
      longitude: (coords['longitude'] as num?)?.toDouble() ?? 0,
    );
  }
}

class CreatePropertyRequest {
  final String propertyType;
  final String listingType;
  final Map<String, dynamic> location;
  final String title;
  final String? description;
  final double price;
  final double area;
  final String? areaUnit;
  final int? bedrooms;
  final int? bathrooms;
  final List<Map<String, dynamic>>? images;

  CreatePropertyRequest({
    required this.propertyType,
    required this.listingType,
    required this.location,
    required this.title,
    this.description,
    required this.price,
    required this.area,
    this.areaUnit,
    this.bedrooms,
    this.bathrooms,
    this.images,
  });

  Map<String, dynamic> toJson() {
    return {
      'propertyType': propertyType,
      'listingType': listingType,
      'location': location,
      'title': title,
      if (description != null) 'description': description,
      'price': price,
      'area': area,
      if (areaUnit != null) 'areaUnit': areaUnit,
      if (bedrooms != null) 'bedrooms': bedrooms,
      if (bathrooms != null) 'bathrooms': bathrooms,
      if (images != null) 'images': images,
    };
  }
}

class PropertiesService {
  final _apiClient = ApiClient();

  Future<List<UploadedImage>> uploadImages(List<File> files) async {
    final formData = FormData();
    for (final f in files) {
      formData.files.add(
        MapEntry(
          'images',
          await MultipartFile.fromFile(f.path, filename: f.path.split('/').last),
        ),
      );
    }
    final response = await _apiClient.dio.post('/properties/images/upload', data: formData);
    final images = (response.data['images'] as List?) ?? [];
    return images.map((e) => UploadedImage.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  Future<Property> createProperty(CreatePropertyRequest request) async {
    final response = await _apiClient.dio.post('/properties', data: request.toJson());
    return Property.fromJson(Map<String, dynamic>.from(response.data));
  }

  Future<List<Property>> getMyProperties({String? status}) async {
    final response = await _apiClient.dio.get('/properties/my', queryParameters: status != null ? {'status': status} : null);
    return (response.data as List).map((p) => Property.fromJson(Map<String, dynamic>.from(p))).toList();
  }

  Future<Property> submitForVerification(String id) async {
    final response = await _apiClient.dio.post('/properties/$id/submit');
    return Property.fromJson(Map<String, dynamic>.from(response.data));
  }

  Future<GeocodedLocation?> geocodeLocation(String query) async {
    final response = await _apiClient.dio.get('/locations/geocode', queryParameters: {'q': query});
    if (response.data == null || response.data['success'] != true) return null;
    return GeocodedLocation.fromJson(Map<String, dynamic>.from(response.data));
  }
}


