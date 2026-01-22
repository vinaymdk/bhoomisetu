import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import '../services/app_config_service.dart';
import '../services/location_service.dart';
import '../services/properties_service.dart';
import '../models/property.dart';

class ListingImage {
  final File? file;
  final String? url;
  final bool isPrimary;

  ListingImage({this.file, this.url, required this.isPrimary});

  ListingImage copyWith({File? file, String? url, bool? isPrimary}) {
    return ListingImage(
      file: file ?? this.file,
      url: url ?? this.url,
      isPrimary: isPrimary ?? this.isPrimary,
    );
  }
}

class ListingFormViewModel extends ChangeNotifier {
  final PropertiesService _propertiesService;
  final AppConfigService _configService;
  final LocationService _locationService;

  ListingFormViewModel(
    this._propertiesService,
    this._configService,
    this._locationService,
  );

  String listingType = 'sale';
  String propertyType = 'apartment';

  final title = TextEditingController();
  final description = TextEditingController();
  final price = TextEditingController();
  final area = TextEditingController();
  String areaUnit = 'sqft';
  int? bedrooms;
  int? bathrooms;

  final address = TextEditingController();
  final city = TextEditingController();
  String state = '';
  final pincode = TextEditingController();
  final locality = TextEditingController();
  final landmark = TextEditingController();
  final latitude = TextEditingController();
  final longitude = TextEditingController();

  String? mapboxToken;
  String? error;
  bool loading = false;
  List<ListingImage> images = [];
  List<LocationSuggestion> suggestions = [];
  Timer? _suggestionTimer;

  void initFromProperty(Property? property) {
    if (property == null) return;
    listingType = property.listingType;
    propertyType = property.propertyType;
    title.text = property.title;
    description.text = property.description ?? '';
    price.text = property.price.toString();
    area.text = property.area.toString();
    areaUnit = property.areaUnit;
    bedrooms = property.bedrooms;
    bathrooms = property.bathrooms;
    address.text = property.location.address;
    city.text = property.location.city;
    state = property.location.state;
    pincode.text = property.location.pincode ?? '';
    locality.text = property.location.locality ?? '';
    landmark.text = property.location.landmark ?? '';
    latitude.text = property.location.latitude?.toString() ?? '';
    longitude.text = property.location.longitude?.toString() ?? '';
    images = (property.images ?? [])
        .toList()
        .map(
          (img) => ListingImage(
            url: img.imageUrl,
            isPrimary: img.isPrimary,
          ),
        )
        .toList();
    if (images.isNotEmpty && !images.any((i) => i.isPrimary)) {
      images[0] = images[0].copyWith(isPrimary: true);
    }
    notifyListeners();
  }

  Future<void> loadMapboxToken() async {
    mapboxToken = await _configService.getMapboxToken();
    notifyListeners();
  }

  void setListingType(String value) {
    listingType = value;
    notifyListeners();
  }

  void setPropertyType(String value) {
    propertyType = value;
    notifyListeners();
  }

  void setAreaUnit(String value) {
    areaUnit = value;
    notifyListeners();
  }

  void setStateValue(String value) {
    state = value;
    notifyListeners();
  }

  void setBedrooms(int? value) {
    bedrooms = value;
    notifyListeners();
  }

  void setBathrooms(int? value) {
    bathrooms = value;
    notifyListeners();
  }

  void setCoordinates(double lat, double lng) {
    latitude.text = lat.toStringAsFixed(6);
    longitude.text = lng.toStringAsFixed(6);
    notifyListeners();
  }

  void addImages(List<File> newFiles) {
    for (final f in newFiles) {
      images.add(ListingImage(file: f, isPrimary: false));
    }
    if (images.isNotEmpty && !images.any((i) => i.isPrimary)) {
      images[0] = images[0].copyWith(isPrimary: true);
    }
    notifyListeners();
  }

  void removeImage(int index) {
    images.removeAt(index);
    if (images.isNotEmpty && !images.any((i) => i.isPrimary)) {
      images[0] = images[0].copyWith(isPrimary: true);
    }
    notifyListeners();
  }

  void setPrimary(int index) {
    images = images.asMap().entries.map((entry) {
      return entry.value.copyWith(isPrimary: entry.key == index);
    }).toList();
    notifyListeners();
  }

  void moveImage(int index, int delta) {
    final target = index + delta;
    if (target < 0 || target >= images.length) return;
    final temp = images[index];
    images[index] = images[target];
    images[target] = temp;
    notifyListeners();
  }

  void searchSuggestions(String query) {
    _suggestionTimer?.cancel();
    _suggestionTimer = Timer(const Duration(milliseconds: 300), () async {
      if (query.trim().length < 2) {
        suggestions = [];
        notifyListeners();
        return;
      }
      // Don't show suggestions if address is already filled
      if (address.text.trim().length > 5) {
        suggestions = [];
        notifyListeners();
        return;
      }
      suggestions = await _locationService.autocomplete(query);
      notifyListeners();
    });
  }

  Future<void> applySuggestion(LocationSuggestion suggestion) async {
    // Clear suggestions immediately to hide the list
    suggestions = [];
    notifyListeners();
    
    // Update coordinates
    latitude.text = suggestion.latitude.toStringAsFixed(6);
    longitude.text = suggestion.longitude.toStringAsFixed(6);
    
    // Reverse geocode to fill other fields
    await reverseGeocode(suggestion.latitude, suggestion.longitude);
  }

  Future<void> reverseGeocode(double lat, double lng) async {
    final location = await _locationService.reverseGeocode(lat, lng);
    if (location == null) return;
    address.text = (location['formattedAddress'] as String?) ?? address.text;
    city.text = (location['city'] as String?) ?? city.text;
    state = (location['state'] as String?) ?? state;
    pincode.text = (location['pincode'] as String?) ?? pincode.text;
    locality.text = (location['locality'] as String?) ?? locality.text;
    landmark.text = (location['landmark'] as String?) ?? landmark.text;
    notifyListeners();
  }

  Future<void> autodetectLocation() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final position = await _locationService.getCurrentPosition();
      setCoordinates(position.latitude, position.longitude);
      await reverseGeocode(position.latitude, position.longitude);
    } catch (e) {
      error = e.toString();
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  bool validate() {
    error = null;
    if (title.text.trim().length < 5) {
      error = 'Title is required (min 5 chars)';
      notifyListeners();
      return false;
    }
    if (address.text.trim().length < 5) {
      error = 'Address is required';
      notifyListeners();
      return false;
    }
    if (city.text.trim().length < 2) {
      error = 'City is required';
      notifyListeners();
      return false;
    }
    if (state.trim().length < 2) {
      error = 'State is required';
      notifyListeners();
      return false;
    }
    if (double.tryParse(price.text.trim()) == null) {
      error = 'Valid price required';
      notifyListeners();
      return false;
    }
    if (double.tryParse(area.text.trim()) == null) {
      error = 'Valid area required';
      notifyListeners();
      return false;
    }
    if (images.isEmpty) {
      error = 'Please add at least 1 photo.';
      notifyListeners();
      return false;
    }
    return true;
  }

  Future<Property?> save({String? propertyId}) async {
    if (!validate()) return null;
    loading = true;
    notifyListeners();
    try {
      final newImages = images.where((i) => i.file != null).map((i) => i.file!).toList();
      List<UploadedImage> uploaded = [];
      if (newImages.isNotEmpty) {
        uploaded = await _propertiesService.uploadImages(newImages);
      }

      int uploadIdx = 0;
      final payloadImages = images.asMap().entries.map((entry) {
        final idx = entry.key;
        final img = entry.value;
        final url = img.url ?? (uploadIdx < uploaded.length ? uploaded[uploadIdx++].url : null);
        return {
          'imageUrl': url,
          'imageType': 'photo',
          'displayOrder': idx,
          'isPrimary': img.isPrimary,
        };
      }).where((i) => i['imageUrl'] != null).toList();

      final req = CreatePropertyRequest(
        propertyType: propertyType,
        listingType: listingType,
        title: title.text.trim(),
        description: description.text.trim().isEmpty ? null : description.text.trim(),
        price: double.parse(price.text.trim()),
        area: double.parse(area.text.trim()),
        areaUnit: areaUnit,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        location: {
          'address': address.text.trim(),
          'city': city.text.trim(),
          'state': state.trim(),
          if (pincode.text.trim().isNotEmpty) 'pincode': pincode.text.trim(),
          if (locality.text.trim().isNotEmpty) 'locality': locality.text.trim(),
          if (landmark.text.trim().isNotEmpty) 'landmark': landmark.text.trim(),
          if (latitude.text.trim().isNotEmpty) 'latitude': double.tryParse(latitude.text.trim()),
          if (longitude.text.trim().isNotEmpty) 'longitude': double.tryParse(longitude.text.trim()),
        },
        images: payloadImages,
      );

      if (propertyId == null) {
        final created = await _propertiesService.createProperty(req);
        return created;
      }
      final updated = await _propertiesService.updateProperty(propertyId, req);
      return updated;
    } catch (e) {
      error = e.toString();
      return null;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _suggestionTimer?.cancel();
    title.dispose();
    description.dispose();
    price.dispose();
    area.dispose();
    address.dispose();
    city.dispose();
    pincode.dispose();
    locality.dispose();
    landmark.dispose();
    latitude.dispose();
    longitude.dispose();
    super.dispose();
  }
}


