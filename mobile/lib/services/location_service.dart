import 'package:geolocator/geolocator.dart';
import '../config/api_client.dart';

class LocationSuggestion {
  final String id;
  final String name;
  final String placeName;
  final double latitude;
  final double longitude;

  LocationSuggestion({
    required this.id,
    required this.name,
    required this.placeName,
    required this.latitude,
    required this.longitude,
  });

  factory LocationSuggestion.fromJson(Map<String, dynamic> json) {
    final center = (json['center'] as List?) ?? [0, 0];
    return LocationSuggestion(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      placeName: json['placeName'] as String? ?? '',
      longitude: (center.isNotEmpty ? (center[0] as num).toDouble() : 0),
      latitude: (center.length > 1 ? (center[1] as num).toDouble() : 0),
    );
  }
}

class LocationService {
  final _apiClient = ApiClient();

  Future<List<LocationSuggestion>> autocomplete(String query) async {
    if (query.trim().length < 2) return [];
    final response = await _apiClient.dio.get('/locations/autocomplete', queryParameters: {'q': query.trim()});
    final list = (response.data?['suggestions'] as List?) ?? [];
    return list.map((e) => LocationSuggestion.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  Future<Map<String, dynamic>?> reverseGeocode(double lat, double lng) async {
    final response = await _apiClient.dio.get('/locations/reverse', queryParameters: {'lat': lat, 'lng': lng});
    if (response.data?['success'] != true) return null;
    return Map<String, dynamic>.from(response.data['location']);
  }

  Future<Position> getCurrentPosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return Future.error(
          'Location permissions are permanently denied, we cannot request permissions.');
    }

    return await Geolocator.getCurrentPosition();
  }
}

