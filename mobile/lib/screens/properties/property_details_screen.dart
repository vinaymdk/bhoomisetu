import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/properties_service.dart';
import '../../models/property.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../../providers/auth_provider.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../../services/saved_properties_service.dart';
import '../../services/mediation_service.dart';

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
  final SavedPropertiesService _savedService = SavedPropertiesService();
  final MediationService _mediationService = MediationService();
  Property? _property;
  bool _loading = true;
  String? _error;
  int _activeImage = 0;
  final PageController _pageController = PageController();
  bool _isSaved = false;
  String _userId = 'guest';

  @override
  void initState() {
    super.initState();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _userId = authProvider.userData?['id']?.toString() ?? 'guest';
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
      final isSaved = await _savedService.isSaved(_userId, widget.propertyId);
      setState(() {
        _property = property;
        _isSaved = isSaved;
      });
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
        appBar: AppBar(
          title: const Text('Property Details'),
          backgroundColor: Theme.of(context).colorScheme.primary,
          foregroundColor: Colors.white,
        ),
        body: Center(child: Text(_error ?? 'Property not found')),
      );
    }

    final property = _property!;
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isBuyer = authProvider.roles.contains('buyer') || authProvider.roles.contains('admin');
    return Scaffold(
      appBar: AppBar(
        title: const Text('Property Details'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(_isSaved ? Icons.favorite : Icons.favorite_border),
            onPressed: () async {
              final next = await _savedService.toggle(_userId, widget.propertyId);
              if (mounted) {
                setState(() {
                  _isSaved = next;
                });
              }
            },
          ),
        ],
      ),
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
            if (isBuyer) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue.shade100),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Express Interest',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Customer service will mediate and connect you after verification.',
                      style: TextStyle(color: Colors.blueGrey.shade700),
                    ),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      onPressed: () => _showInterestDialog(property.id),
                      child: const Text('Submit Interest'),
                    ),
                  ],
                ),
              ),
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

  Future<void> _showInterestDialog(String propertyId) async {
    String message = '';
    String type = 'viewing';
    String priority = 'normal';
    await showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Express Interest'),
          content: SingleChildScrollView(
            child: Column(
              children: [
                DropdownButtonFormField<String>(
                  value: type,
                  decoration: const InputDecoration(labelText: 'Interest Type'),
                  items: const [
                    DropdownMenuItem(value: 'viewing', child: Text('Viewing')),
                    DropdownMenuItem(value: 'offer', child: Text('Offer')),
                    DropdownMenuItem(value: 'negotiation', child: Text('Negotiation')),
                    DropdownMenuItem(value: 'serious_intent', child: Text('Serious Intent')),
                  ],
                  onChanged: (value) => type = value ?? 'viewing',
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  value: priority,
                  decoration: const InputDecoration(labelText: 'Priority'),
                  items: const [
                    DropdownMenuItem(value: 'low', child: Text('Low')),
                    DropdownMenuItem(value: 'normal', child: Text('Normal')),
                    DropdownMenuItem(value: 'high', child: Text('High')),
                    DropdownMenuItem(value: 'urgent', child: Text('Urgent')),
                  ],
                  onChanged: (value) => priority = value ?? 'normal',
                ),
                const SizedBox(height: 10),
                TextField(
                  decoration: const InputDecoration(labelText: 'Message (optional)'),
                  maxLines: 3,
                  onChanged: (value) => message = value,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                try {
                  await _mediationService.expressInterest({
                    'propertyId': propertyId,
                    'message': message.trim().isEmpty ? null : message.trim(),
                    'interestType': type,
                    'priority': priority,
                  });
                  if (context.mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Interest submitted successfully.')),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to submit interest: $e')),
                    );
                  }
                }
              },
              child: const Text('Submit'),
            ),
          ],
        );
      },
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
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SavedPropertiesScreen()),
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
    }
  }
}
