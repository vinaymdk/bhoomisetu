import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/property.dart';
import '../../services/properties_service.dart';
import '../../widgets/property_card.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import 'create_property_screen.dart';
import 'edit_property_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';
import 'saved_properties_screen.dart';
import '../mediation/seller_interests_screen.dart';
import '../../services/badge_service.dart';

class MyListingsScreen extends StatefulWidget {
  const MyListingsScreen({super.key});

  @override
  State<MyListingsScreen> createState() => _MyListingsScreenState();
}

class _MyListingsScreenState extends State<MyListingsScreen> {
  final _service = PropertiesService();
  final BadgeService _badgeService = BadgeService();
  bool _loading = true;
  String? _error;
  List<Property> _items = [];
  String _status = 'all';
  String _userId = 'guest';

  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    _userId = auth.userData?['id']?.toString() ?? 'guest';
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await _service.getMyProperties(
          status: _status == 'all' ? null : _status);
      setState(() => _items = data);
      _badgeService.setListCount(_userId, data.length);
    } catch (e) {
      final errorMessage = e.toString();
      final formattedError = _formatError(errorMessage);
      setState(() => _error = formattedError);
    } finally {
      setState(() => _loading = false);
    }
  }

  String _formatError(String message) {
    if (message.contains('TimeoutException')) {
      return 'Unable to load listings. Please try again later.';
    }
    if (message.contains('SocketException') ||
        message.contains('Connection refused')) {
      return 'Connection error. Please check your internet connection.';
    }
    return message
        .replaceAll('Exception: ', '')
        .replaceAll('DioException [bad response]: ', '');
  }

  Future<void> _submit(String id) async {
    try {
      await _service.submitForVerification(id);
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Submitted for verification')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Submit failed: $e')));
    }
  }

  bool _canAccess(AuthProvider auth) {
    final roles = auth.roles;
    return roles.contains('seller') || roles.contains('agent');
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final canAccess = _canAccess(auth);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Listings'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.connect_without_contact_outlined),
            tooltip: 'Property Interests',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SellerInterestsScreen()),
              );
            },
          ),
          IconButton(
            onPressed: _loading ? null : _load,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      floatingActionButton: canAccess
          ? FloatingActionButton.extended(
              onPressed: () async {
                final created = await Navigator.push<bool>(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const CreatePropertyScreen()),
                );
                if (created == true) {
                  await _load();
                }
              },
              icon: const Icon(Icons.add),
              label: const Text('Create'),
            )
          : null,
      body: !canAccess
          ? const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'Seller/Agent role required to create and manage listings.',
                  textAlign: TextAlign.center,
                ),
              ),
            )
          : _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline,
                                size: 64, color: Colors.red),
                            const SizedBox(height: 12),
                            Text(_error!,
                                textAlign: TextAlign.center,
                                style: const TextStyle(color: Colors.red)),
                            const SizedBox(height: 12),
                            ElevatedButton(
                                onPressed: _load, child: const Text('Retry')),
                          ],
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(16),
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: DropdownButtonFormField<String>(
                                  initialValue: _status,
                                  decoration: const InputDecoration(
                                    labelText: 'Status',
                                    border: OutlineInputBorder(),
                                  ),
                                  items: const [
                                    DropdownMenuItem(
                                        value: 'all', child: Text('All')),
                                    DropdownMenuItem(
                                        value: 'draft', child: Text('Draft')),
                                    DropdownMenuItem(
                                        value: 'pending_verification',
                                        child: Text('Pending Verification')),
                                    DropdownMenuItem(
                                        value: 'verified',
                                        child: Text('Verified')),
                                    DropdownMenuItem(
                                        value: 'live', child: Text('Live')),
                                    DropdownMenuItem(
                                        value: 'rejected',
                                        child: Text('Rejected')),
                                  ],
                                  onChanged: (v) async {
                                    setState(() => _status = v ?? 'all');
                                    await _load();
                                  },
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          if (_items.isEmpty)
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 40),
                              child: Center(
                                  child: Text(
                                      'No listings yet. Tap Create to add one.')),
                            )
                          else
                            ..._items.map(
                              (p) => Column(
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      _statusChip(p.status),
                                      Row(
                                        children: [
                                          TextButton(
                                            onPressed: () async {
                                              final updated =
                                                  await Navigator.push<bool>(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (_) =>
                                                      EditPropertyScreen(
                                                          property: p),
                                                ),
                                              );
                                              if (updated == true) {
                                                await _load();
                                              }
                                            },
                                            child: const Text('Edit'),
                                          ),
                                          if (p.status == 'draft')
                                            TextButton(
                                              onPressed: () => _submit(p.id),
                                              child: const Text('Submit'),
                                            ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  PropertyCard(property: p),
                                  const SizedBox(height: 16),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: BottomNavItem.list,
        onTap: _handleNavTap,
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
      case BottomNavItem.cs:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const CsDashboardScreen()),
        );
        break;
    }
  }

  Widget _statusChip(String status) {
    Color bg;
    Color fg;
    switch (status) {
      case 'draft':
        bg = Colors.orange[50]!;
        fg = Colors.orange[800]!;
        break;
      case 'pending_verification':
        bg = Colors.blue[50]!;
        fg = Colors.blue[800]!;
        break;
      case 'live':
        bg = Colors.green[50]!;
        fg = Colors.green[800]!;
        break;
      case 'rejected':
        bg = Colors.red[50]!;
        fg = Colors.red[800]!;
        break;
      default:
        bg = Colors.grey[200]!;
        fg = Colors.grey[800]!;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration:
          BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Text(status.replaceAll('_', ' '),
          style:
              TextStyle(color: fg, fontWeight: FontWeight.w600, fontSize: 12)),
    );
  }
}
