import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../services/properties_service.dart';

class CreatePropertyScreen extends StatefulWidget {
  const CreatePropertyScreen({super.key});

  @override
  State<CreatePropertyScreen> createState() => _CreatePropertyScreenState();
}

class _CreatePropertyScreenState extends State<CreatePropertyScreen> {
  final _formKey = GlobalKey<FormState>();
  final _service = PropertiesService();
  final _picker = ImagePicker();

  bool _loading = false;
  String? _error;

  String _listingType = 'sale';
  String _propertyType = 'apartment';

  final _title = TextEditingController();
  final _description = TextEditingController();
  final _price = TextEditingController();
  final _area = TextEditingController();
  String _areaUnit = 'sqft';
  int? _bedrooms;
  int? _bathrooms;

  final _address = TextEditingController();
  final _city = TextEditingController();
  final _state = TextEditingController();
  final _pincode = TextEditingController();
  final _locality = TextEditingController();
  final _landmark = TextEditingController();
  final _latitude = TextEditingController();
  final _longitude = TextEditingController();

  List<File> _pickedImages = [];
  int _primaryIndex = 0;

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _price.dispose();
    _area.dispose();
    // no controllers for dropdowns
    _address.dispose();
    _city.dispose();
    _state.dispose();
    _pincode.dispose();
    _locality.dispose();
    _landmark.dispose();
    _latitude.dispose();
    _longitude.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    final files = await _picker.pickMultiImage(imageQuality: 85);
    if (files.isEmpty) return;
    setState(() {
      _pickedImages.addAll(files.map((x) => File(x.path)));
      if (_primaryIndex >= _pickedImages.length) _primaryIndex = 0;
    });
  }

  void _removeImage(int idx) {
    setState(() {
      _pickedImages.removeAt(idx);
      if (_pickedImages.isEmpty) {
        _primaryIndex = 0;
      } else if (_primaryIndex >= _pickedImages.length) {
        _primaryIndex = 0;
      }
    });
  }

  Future<void> _openLocationSearch() async {
    final controller = TextEditingController();
    String? errorText;
    bool searching = false;

    await showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return AlertDialog(
              title: const Text('Search Location'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: controller,
                    decoration: const InputDecoration(
                      labelText: 'Enter location',
                      hintText: 'e.g., Hitech City, Hyderabad',
                    ),
                  ),
                  if (errorText != null) ...[
                    const SizedBox(height: 8),
                    Text(errorText!, style: const TextStyle(color: Colors.red, fontSize: 12)),
                  ],
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: searching
                      ? null
                      : () async {
                          final query = controller.text.trim();
                          if (query.length < 2) {
                            setModalState(() => errorText = 'Enter at least 2 characters.');
                            return;
                          }
                          setModalState(() {
                            searching = true;
                            errorText = null;
                          });
                          try {
                            final result = await _service.geocodeLocation(query);
                            if (result == null) {
                              setModalState(() {
                                searching = false;
                                errorText = 'No results found.';
                              });
                              return;
                            }
                            setState(() {
                              _address.text = result.formattedAddress;
                              _city.text = result.city;
                              _state.text = result.state;
                              _pincode.text = result.pincode ?? '';
                              _locality.text = result.locality ?? '';
                              _landmark.text = result.landmark ?? '';
                              _latitude.text = result.latitude.toStringAsFixed(6);
                              _longitude.text = result.longitude.toStringAsFixed(6);
                            });
                            if (context.mounted) Navigator.pop(context);
                          } catch (e) {
                            setModalState(() {
                              searching = false;
                              errorText = 'Search failed. Please try again.';
                            });
                          }
                        },
                  child: searching ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Search'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _saveDraft() async {
    if (!_formKey.currentState!.validate()) return;
    if (_pickedImages.isEmpty) {
      setState(() => _error = 'Please add at least 1 photo.');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      // Upload images first
      final uploaded = await _service.uploadImages(_pickedImages);

      final images = <Map<String, dynamic>>[];
      for (int i = 0; i < uploaded.length; i++) {
        images.add({
          'imageUrl': uploaded[i].url,
          'imageType': 'photo',
          'displayOrder': i,
          'isPrimary': i == _primaryIndex,
        });
      }

      final req = CreatePropertyRequest(
        propertyType: _propertyType,
        listingType: _listingType,
        title: _title.text.trim(),
        description: _description.text.trim().isEmpty ? null : _description.text.trim(),
        price: double.parse(_price.text.trim()),
        area: double.parse(_area.text.trim()),
        areaUnit: _areaUnit,
        bedrooms: _bedrooms,
        bathrooms: _bathrooms,
        location: {
          'address': _address.text.trim(),
          'city': _city.text.trim(),
          'state': _state.text.trim(),
          if (_pincode.text.trim().isNotEmpty) 'pincode': _pincode.text.trim(),
          if (_locality.text.trim().isNotEmpty) 'locality': _locality.text.trim(),
          if (_landmark.text.trim().isNotEmpty) 'landmark': _landmark.text.trim(),
          if (_latitude.text.trim().isNotEmpty) 'latitude': double.tryParse(_latitude.text.trim()),
          if (_longitude.text.trim().isNotEmpty) 'longitude': double.tryParse(_longitude.text.trim()),
        },
        images: images,
      );

      await _service.createProperty(req);
      if (!mounted) return;
      Navigator.pop(context, true);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Listing saved as draft')));
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '').replaceAll('DioException [bad response]: ', '');
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Listing')),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (_error != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(8)),
                    child: Text(_error!, style: const TextStyle(color: Colors.red)),
                  ),
                const SizedBox(height: 12),

                _sectionTitle('Basic'),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _listingType,
                        decoration: const InputDecoration(labelText: 'Listing Type', border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(value: 'sale', child: Text('Sale')),
                          DropdownMenuItem(value: 'rent', child: Text('Rent')),
                        ],
                        onChanged: (v) => setState(() => _listingType = v ?? 'sale'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _propertyType,
                        decoration: const InputDecoration(labelText: 'Property Type', border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(value: 'apartment', child: Text('Apartment')),
                          DropdownMenuItem(value: 'house', child: Text('House')),
                          DropdownMenuItem(value: 'villa', child: Text('Villa')),
                          DropdownMenuItem(value: 'plot', child: Text('Plot')),
                          DropdownMenuItem(value: 'commercial', child: Text('Commercial')),
                          DropdownMenuItem(value: 'industrial', child: Text('Industrial')),
                          DropdownMenuItem(value: 'agricultural', child: Text('Agricultural')),
                          DropdownMenuItem(value: 'other', child: Text('Other')),
                        ],
                        onChanged: (v) => setState(() => _propertyType = v ?? 'apartment'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _title,
                  decoration: const InputDecoration(labelText: 'Title', border: OutlineInputBorder()),
                  validator: (v) => (v == null || v.trim().length < 5) ? 'Enter a valid title' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _description,
                  decoration: const InputDecoration(labelText: 'Description (optional)', border: OutlineInputBorder()),
                  maxLines: 4,
                ),
                const SizedBox(height: 16),

                _sectionTitle('Location'),
                TextFormField(
                  controller: _address,
                  decoration: const InputDecoration(labelText: 'Address', border: OutlineInputBorder()),
                  validator: (v) => (v == null || v.trim().length < 5) ? 'Enter a valid address' : null,
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _loading ? null : _openLocationSearch,
                  icon: const Icon(Icons.place_outlined),
                  label: const Text('Search location (Mapbox)'),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _city,
                        decoration: const InputDecoration(labelText: 'City', border: OutlineInputBorder()),
                        validator: (v) => (v == null || v.trim().length < 2) ? 'City required' : null,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _state,
                        decoration: const InputDecoration(labelText: 'State', border: OutlineInputBorder()),
                        validator: (v) => (v == null || v.trim().length < 2) ? 'State required' : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _pincode,
                        decoration: const InputDecoration(labelText: 'Pincode (optional)', border: OutlineInputBorder()),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _locality,
                        decoration: const InputDecoration(labelText: 'Locality (optional)', border: OutlineInputBorder()),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _landmark,
                  decoration: const InputDecoration(labelText: 'Landmark (optional)', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _latitude,
                        decoration: const InputDecoration(labelText: 'Latitude (optional)', border: OutlineInputBorder()),
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _longitude,
                        decoration: const InputDecoration(labelText: 'Longitude (optional)', border: OutlineInputBorder()),
                        keyboardType: TextInputType.number,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                _sectionTitle('Details'),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _price,
                        decoration: const InputDecoration(labelText: 'Price (₹)', border: OutlineInputBorder()),
                        keyboardType: TextInputType.number,
                        validator: (v) => (v == null || double.tryParse(v.trim()) == null) ? 'Valid price required' : null,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _area,
                        decoration: const InputDecoration(labelText: 'Area', border: OutlineInputBorder()),
                        keyboardType: TextInputType.number,
                        validator: (v) => (v == null || double.tryParse(v.trim()) == null) ? 'Valid area required' : null,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _areaUnit,
                        decoration: const InputDecoration(labelText: 'Area Unit', border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(value: 'sqft', child: Text('sqft')),
                          DropdownMenuItem(value: 'sqm', child: Text('sqm')),
                          DropdownMenuItem(value: 'acre', child: Text('acre')),
                          DropdownMenuItem(value: 'sqyrd', child: Text('sqyrd')),
                        ],
                        onChanged: (v) => setState(() => _areaUnit = v ?? 'sqft'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<int>(
                        value: _bedrooms,
                        decoration: const InputDecoration(labelText: 'Bedrooms (optional)', border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(value: 1, child: Text('1')),
                          DropdownMenuItem(value: 2, child: Text('2')),
                          DropdownMenuItem(value: 3, child: Text('3')),
                          DropdownMenuItem(value: 4, child: Text('4')),
                          DropdownMenuItem(value: 5, child: Text('5+')),
                        ],
                        onChanged: (v) => setState(() => _bedrooms = v),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<int>(
                        value: _bathrooms,
                        decoration: const InputDecoration(labelText: 'Bathrooms (optional)', border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(value: 1, child: Text('1')),
                          DropdownMenuItem(value: 2, child: Text('2')),
                          DropdownMenuItem(value: 3, child: Text('3')),
                          DropdownMenuItem(value: 4, child: Text('4+')),
                        ],
                        onChanged: (v) => setState(() => _bathrooms = v),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                _sectionTitle('Photos'),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _loading ? null : _pickImages,
                        icon: const Icon(Icons.photo_library_outlined),
                        label: Text(_pickedImages.isEmpty ? 'Add photos' : 'Add more (${_pickedImages.length})'),
                      ),
                    ),
                  ],
                ),
                if (_pickedImages.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 110,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _pickedImages.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 10),
                      itemBuilder: (context, idx) {
                        final file = _pickedImages[idx];
                        final isPrimary = idx == _primaryIndex;
                        return GestureDetector(
                          onTap: () => setState(() => _primaryIndex = idx),
                          child: Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: Image.file(file, width: 140, height: 110, fit: BoxFit.cover),
                              ),
                              Positioned(
                                top: 6,
                                left: 6,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isPrimary ? Colors.blue : Colors.black54,
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: Text(
                                    isPrimary ? 'Primary' : 'Tap',
                                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ),
                              Positioned(
                                top: 6,
                                right: 6,
                                child: InkWell(
                                  onTap: () => _removeImage(idx),
                                  child: Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(999)),
                                    child: const Icon(Icons.close, size: 14, color: Colors.white),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
                const SizedBox(height: 16),

                ElevatedButton(
                  onPressed: _loading ? null : _saveDraft,
                  child: _loading
                      ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Save Listing (Draft)'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
    );
  }
}


