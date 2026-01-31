import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../subscriptions/subscriptions_screen.dart';
import '../subscriptions/payments_history_screen.dart';
import '../../services/app_config_service.dart';
import '../../services/location_service.dart';
import '../../services/properties_service.dart';
import '../../viewmodels/listing_form_view_model.dart';
import '../common/map_picker_screen.dart';

class CreatePropertyScreen extends StatelessWidget {
  const CreatePropertyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ListingFormViewModel(
        PropertiesService(),
        AppConfigService(),
        LocationService(),
      )..loadMapboxToken(),
      child: const _CreatePropertyView(),
    );
  }
}

class _CreatePropertyView extends StatefulWidget {
  const _CreatePropertyView();

  @override
  State<_CreatePropertyView> createState() => _CreatePropertyViewState();
}

class _CreatePropertyViewState extends State<_CreatePropertyView> {
  final _formKey = GlobalKey<FormState>();
  final _picker = ImagePicker();

  Future<void> _pickImages(ListingFormViewModel vm) async {
    final files = await _picker.pickMultiImage(imageQuality: 85);
    if (files.isEmpty) return;
    vm.addImages(files.map((x) => File(x.path)).toList());
  }

  @override
  Widget build(BuildContext context) {
    final vm = Provider.of<ListingFormViewModel>(context);

    Widget twoColumn(Widget left, Widget right) {
      return LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth < 360) {
            return Column(
              children: [
                left,
                const SizedBox(height: 12),
                right,
              ],
            );
          }
          return Row(
            children: [
              Expanded(child: left),
              const SizedBox(width: 12),
              Expanded(child: right),
            ],
          );
        },
      );
    }

    const states = [
      'Andhra Pradesh',
      'Arunachal Pradesh',
      'Assam',
      'Bihar',
      'Chandigarh',
      'Chhattisgarh',
      'Goa',
      'Gujarat',
      'Haryana',
      'Himachal Pradesh',
      'Jammu and Kashmir',
      'Jharkhand',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Odisha',
      'Punjab',
      'Rajasthan',
      'Sikkim',
      'Tamil Nadu',
      'Telangana',
      'Tripura',
      'Uttar Pradesh',
      'Uttarakhand',
      'West Bengal',
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Listing'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            padding: EdgeInsets.fromLTRB(
              16,
              16,
              16,
              MediaQuery.of(context).viewInsets.bottom + 16,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (vm.error != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                        color: Colors.red[50],
                        borderRadius: BorderRadius.circular(8)),
                    child: Text(vm.error!,
                        style: const TextStyle(color: Colors.red)),
                  ),
                const SizedBox(height: 12),
                _sectionTitle('Basic'),
                twoColumn(
                  DropdownButtonFormField<String>(
                    initialValue: vm.listingType,
                    decoration: const InputDecoration(
                        labelText: 'Listing Type *',
                        border: OutlineInputBorder()),
                    items: const [
                      DropdownMenuItem(value: 'sale', child: Text('Sale')),
                      DropdownMenuItem(value: 'rent', child: Text('Rent')),
                    ],
                    onChanged: (v) => vm.setListingType(v ?? 'sale'),
                  ),
                  DropdownButtonFormField<String>(
                    initialValue: vm.propertyType,
                    decoration: const InputDecoration(
                        labelText: 'Property Type *',
                        border: OutlineInputBorder()),
                    items: const [
                      DropdownMenuItem(
                          value: 'apartment', child: Text('Apartment')),
                      DropdownMenuItem(
                          value: 'house', child: Text('House')),
                      DropdownMenuItem(value: 'villa', child: Text('Villa')),
                      DropdownMenuItem(value: 'plot', child: Text('Plot')),
                      DropdownMenuItem(
                          value: 'commercial', child: Text('Commercial')),
                      DropdownMenuItem(
                          value: 'industrial', child: Text('Industrial')),
                      DropdownMenuItem(
                          value: 'agricultural', child: Text('Agricultural')),
                      DropdownMenuItem(value: 'other', child: Text('Other')),
                    ],
                    onChanged: (v) => vm.setPropertyType(v ?? 'apartment'),
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: vm.title,
                  decoration: const InputDecoration(
                      labelText: 'Title *', border: OutlineInputBorder()),
                  validator: (v) => (v == null || v.trim().length < 5)
                      ? 'Enter a valid title'
                      : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: vm.description,
                  decoration: const InputDecoration(
                      labelText: 'Description (optional)',
                      border: OutlineInputBorder()),
                  maxLines: 4,
                ),
                const SizedBox(height: 16),
                _sectionTitle('Location'),
                TextFormField(
                  controller: vm.address,
                  decoration: const InputDecoration(
                      labelText: 'Address *', border: OutlineInputBorder()),
                  validator: (v) => (v == null || v.trim().length < 5)
                      ? 'Enter a valid address'
                      : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  decoration: const InputDecoration(
                      labelText: 'Search location (Mapbox)',
                      border: OutlineInputBorder()),
                  onChanged: vm.searchSuggestions,
                ),
                if (vm.suggestions.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(top: 8),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: vm.suggestions
                          .map(
                            (s) => ListTile(
                              title: Text(s.name),
                              subtitle: Text(s.placeName),
                              onTap: () => vm.applySuggestion(s),
                            ),
                          )
                          .toList(),
                    ),
                  ),
                const SizedBox(height: 12),
                twoColumn(
                  OutlinedButton.icon(
                    onPressed: vm.loading ? null : vm.autodetectLocation,
                    icon: const Icon(Icons.my_location),
                    label: const Text('Use my location'),
                  ),
                  OutlinedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ChangeNotifierProvider.value(
                            value: vm,
                            child: const MapPickerScreen(),
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.map_outlined),
                    label: const Text('Pick on map'),
                  ),
                ),
                const SizedBox(height: 12),
                twoColumn(
                  TextFormField(
                    controller: vm.city,
                    decoration: const InputDecoration(
                        labelText: 'City *', border: OutlineInputBorder()),
                    validator: (v) => (v == null || v.trim().length < 2)
                        ? 'City required'
                        : null,
                  ),
                  DropdownButtonFormField<String>(
                    initialValue: vm.state.isEmpty ? null : vm.state,
                    decoration: const InputDecoration(
                        labelText: 'State *', border: OutlineInputBorder()),
                    items: states
                        .map((s) =>
                            DropdownMenuItem(value: s, child: Text(s)))
                        .toList(),
                    onChanged: (v) => vm.setStateValue(v ?? ''),
                    validator: (v) => (v == null || v.trim().length < 2)
                        ? 'State required'
                        : null,
                  ),
                ),
                const SizedBox(height: 12),
                twoColumn(
                  TextFormField(
                    controller: vm.pincode,
                    decoration: const InputDecoration(
                        labelText: 'Pincode (optional)',
                        border: OutlineInputBorder()),
                  ),
                  TextFormField(
                    controller: vm.locality,
                    decoration: const InputDecoration(
                        labelText: 'Locality (optional)',
                        border: OutlineInputBorder()),
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: vm.landmark,
                  decoration: const InputDecoration(
                      labelText: 'Landmark (optional)',
                      border: OutlineInputBorder()),
                ),
                const SizedBox(height: 12),
                twoColumn(
                  TextFormField(
                    controller: vm.latitude,
                    decoration: const InputDecoration(
                        labelText: 'Latitude (optional)',
                        border: OutlineInputBorder()),
                    keyboardType: TextInputType.number,
                  ),
                  TextFormField(
                    controller: vm.longitude,
                    decoration: const InputDecoration(
                        labelText: 'Longitude (optional)',
                        border: OutlineInputBorder()),
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(height: 16),
                _sectionTitle('Details'),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: vm.price,
                        decoration: const InputDecoration(
                            labelText: 'Price (₹) *',
                            border: OutlineInputBorder()),
                        keyboardType: TextInputType.number,
                        validator: (v) =>
                            (v == null || double.tryParse(v.trim()) == null)
                                ? 'Valid price required'
                                : null,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: vm.area,
                        decoration: const InputDecoration(
                            labelText: 'Area *', border: OutlineInputBorder()),
                        keyboardType: TextInputType.number,
                        validator: (v) =>
                            (v == null || double.tryParse(v.trim()) == null)
                                ? 'Valid area required'
                                : null,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: vm.areaUnit,
                        decoration: const InputDecoration(
                            labelText: 'Area Unit *',
                            border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(value: 'sqft', child: Text('sqft')),
                          DropdownMenuItem(value: 'sqm', child: Text('sqm')),
                          DropdownMenuItem(value: 'acre', child: Text('acre')),
                          DropdownMenuItem(
                              value: 'sqyrd', child: Text('sqyrd')),
                        ],
                        onChanged: (v) => vm.setAreaUnit(v ?? 'sqft'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<int>(
                        initialValue: vm.bedrooms,
                        decoration: const InputDecoration(
                            labelText: 'Bedrooms (optional)',
                            border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(value: 1, child: Text('1')),
                          DropdownMenuItem(value: 2, child: Text('2')),
                          DropdownMenuItem(value: 3, child: Text('3')),
                          DropdownMenuItem(value: 4, child: Text('4')),
                          DropdownMenuItem(value: 5, child: Text('5+')),
                        ],
                        onChanged: (v) => vm.setBedrooms(v),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<int>(
                        initialValue: vm.bathrooms,
                        decoration: const InputDecoration(
                            labelText: 'Bathrooms (optional)',
                            border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(value: 1, child: Text('1')),
                          DropdownMenuItem(value: 2, child: Text('2')),
                          DropdownMenuItem(value: 3, child: Text('3')),
                          DropdownMenuItem(value: 4, child: Text('4+')),
                        ],
                        onChanged: (v) => vm.setBathrooms(v),
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
                        onPressed: vm.loading ? null : () => _pickImages(vm),
                        icon: const Icon(Icons.photo_library_outlined),
                        label: Text(vm.images.isEmpty
                            ? 'Add photos'
                            : 'Add more (${vm.images.length})'),
                      ),
                    ),
                  ],
                ),
                if (vm.images.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 130,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: vm.images.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 10),
                      itemBuilder: (context, idx) {
                        final img = vm.images[idx];
                        return GestureDetector(
                          onTap: () => vm.setPrimary(idx),
                          child: Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: img.file != null
                                    ? Image.file(img.file!,
                                        width: 140,
                                        height: 110,
                                        fit: BoxFit.cover)
                                    : Image.network(img.url ?? '',
                                        width: 140,
                                        height: 110,
                                        fit: BoxFit.cover),
                              ),
                              Positioned(
                                top: 6,
                                left: 6,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: img.isPrimary
                                        ? Colors.blue
                                        : Colors.black54,
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: Text(
                                    img.isPrimary ? 'Primary' : 'Tap',
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ),
                              Positioned(
                                top: 6,
                                right: 6,
                                child: InkWell(
                                  onTap: () => vm.removeImage(idx),
                                  child: Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                        color: Colors.black54,
                                        borderRadius:
                                            BorderRadius.circular(999)),
                                    child: const Icon(Icons.close,
                                        size: 14, color: Colors.white),
                                  ),
                                ),
                              ),
                              Positioned(
                                bottom: 6,
                                right: 6,
                                child: Row(
                                  children: [
                                    IconButton(
                                      onPressed: () => vm.moveImage(idx, -1),
                                      icon: const Icon(Icons.arrow_upward,
                                          size: 16, color: Colors.white),
                                    ),
                                    IconButton(
                                      onPressed: () => vm.moveImage(idx, 1),
                                      icon: const Icon(Icons.arrow_downward,
                                          size: 16, color: Colors.white),
                                    ),
                                  ],
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
                  onPressed: vm.loading
                      ? null
                      : () async {
                          if (!_formKey.currentState!.validate()) return;
                          final saved = await vm.save();
                          if (!mounted || saved == null) return;
                          Navigator.pop(context, true);
                          ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Listing saved as draft')));
                        },
                  child: vm.loading
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Save Listing (Draft)'),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: BottomNavItem.list,
        onTap: _handleNavTap,
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
    );
  }

  void _handleNavTap(BottomNavItem item) {
    switch (item) {
      case BottomNavItem.home:
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
          (route) => false,
        );
        break;
      case BottomNavItem.search:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SearchScreen()),
        );
        break;
      case BottomNavItem.list:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const MyListingsScreen()),
        );
        break;
      case BottomNavItem.saved:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SavedPropertiesScreen()),
        );
        break;
      case BottomNavItem.subscriptions:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SubscriptionsScreen()),
        );
        break;
      case BottomNavItem.payments:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const PaymentsHistoryScreen()),
        );
        break;
      case BottomNavItem.profile:
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final roles = authProvider.roles;
        final canBuy = roles.contains('buyer') || roles.contains('admin');
        if (canBuy) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const BuyerRequirementsScreen()),
          );
          return;
        }
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile screen coming soon')),
        );
        break;
      case BottomNavItem.cs:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const CsDashboardScreen()),
        );
        break;
    }
  }
}
