import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/properties_service.dart';
import '../../models/property.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../../providers/auth_provider.dart';

class PropertyDetailsScreen extends StatefulWidget {
  final String propertyId;
  final BottomNavItem initialTab;
  const PropertyDetailsScreen({
    super.key,
    required this.propertyId,
    this.initialTab = BottomNavItem.home,
  });

  @override
  State<PropertyDetailsScreen> createState() => _PropertyDetailsScreenState();
}

class _PropertyDetailsScreenState extends State<PropertyDetailsScreen> {
  final PropertiesService _service = PropertiesService();
  Property? _property;
  bool _loading = true;
  String? _error;
  int _activeImage = 0;
  final PageController _pageController = PageController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final property = await _service.getPropertyById(widget.propertyId);
      setState(() => _property = property);
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
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_error != null || _property == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Property Details')),
        body: Center(child: Text(_error ?? 'Property not found')),
      );
    }

    final property = _property!;
    return Scaffold(
      appBar: AppBar(title: const Text('Property Details')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              property.title,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              '${property.location.address}, ${property.location.city}, ${property.location.state}',
              style: const TextStyle(color: Colors.black54),
            ),
            const SizedBox(height: 16),
            if (property.images != null && property.images!.isNotEmpty) ...[
              SizedBox(
                height: 220,
                child: PageView.builder(
                  controller: _pageController,
                  itemCount: property.images!.length,
                  onPageChanged: (index) => setState(() => _activeImage = index),
                  itemBuilder: (context, index) {
                    final img = property.images![index];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          img.imageUrl,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Wrap(
                  spacing: 6,
                  children: List.generate(
                    property.images!.length,
                    (index) => Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: index == _activeImage ? Colors.blueAccent : Colors.grey.shade300,
                      ),
                    ),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  _infoRow('Price', '₹${property.price.toStringAsFixed(0)}'),
                  _infoRow('Area', '${property.area} ${property.areaUnit}'),
                  _infoRow('Listing Type', property.listingType),
                  _infoRow('Property Type', property.propertyType),
                  if (property.bedrooms != null) _infoRow('Bedrooms', '${property.bedrooms}'),
                  if (property.bathrooms != null) _infoRow('Bathrooms', '${property.bathrooms}'),
                ],
              ),
            ),
            const SizedBox(height: 12),
            if (property.description != null && property.description!.isNotEmpty) ...[
              const Text('Description', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Text(property.description!),
            ],
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: widget.initialTab,
        onTap: _handleNavTap,
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.black54)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
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
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final roles = authProvider.roles;
        final canAccess = roles.contains('seller') || roles.contains('agent');
        if (!canAccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Seller/Agent role required to list properties')),
          );
          return;
        }
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const MyListingsScreen()),
        );
        break;
      case BottomNavItem.saved:
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Saved properties screen coming soon')),
        );
        break;
      case BottomNavItem.profile:
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile screen coming soon')),
        );
        break;
    }
  }
}
