import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/property.dart';
import '../../services/properties_service.dart';
import '../../widgets/property_card.dart';
import '../../widgets/bottom_navigation.dart';
import '../../providers/auth_provider.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/property_details_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';

enum PropertyListMode { featured, newest }

class PropertiesListScreen extends StatefulWidget {
  final PropertyListMode mode;
  final String title;
  final BottomNavItem initialTab;

  const PropertiesListScreen({
    super.key,
    required this.mode,
    required this.title,
    this.initialTab = BottomNavItem.home,
  });

  @override
  State<PropertiesListScreen> createState() => _PropertiesListScreenState();
}

class _PropertiesListScreenState extends State<PropertiesListScreen> {
  final PropertiesService _service = PropertiesService();
  List<Property> _properties = [];
  bool _loading = true;
  String? _error;
  BottomNavItem _currentNavItem = BottomNavItem.home;

  @override
  void initState() {
    super.initState();
    _currentNavItem = widget.initialTab;
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = widget.mode == PropertyListMode.featured
          ? await _service.getFeatured()
          : await _service.getNew();
      if (!mounted) return;
      setState(() => _properties = results);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  void _handleNavTap(BottomNavItem item) {
    setState(() {
      _currentNavItem = item;
    });
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
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SavedPropertiesScreen()),
        );
        break;
      case BottomNavItem.subscriptions:
        break;
      case BottomNavItem.payments:
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _properties.isEmpty
                  ? const Center(child: Text('No properties available.'))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _properties.length,
                        itemBuilder: (context, index) {
                          final property = _properties[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: PropertyCard(
                              property: property,
                              showFeaturedBadge: widget.mode == PropertyListMode.featured,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => PropertyDetailsScreen(
                                      propertyId: property.id,
                                      initialTab: widget.initialTab,
                                    ),
                                  ),
                                );
                              },
                            ),
                          );
                        },
                      ),
                    ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentNavItem,
        onTap: _handleNavTap,
      ),
    );
  }
}
