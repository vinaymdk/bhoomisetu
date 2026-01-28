import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/saved_properties_service.dart';
import '../../services/badge_service.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';
import '../subscriptions/subscriptions_screen.dart';
import '../subscriptions/payments_history_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final SavedPropertiesService _savedService = SavedPropertiesService();
  final BadgeService _badgeService = BadgeService();
  bool _savedBadgeEnabled = true;
  bool _listBadgeEnabled = true;
  bool _reqsBadgeEnabled = true;
  String _userId = 'guest';
  BottomNavItem _currentNavItem = BottomNavItem.profile;

  @override
  void initState() {
    super.initState();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _userId = authProvider.userData?['id']?.toString() ?? 'guest';
    _loadBadgePreferences();
  }

  Future<void> _loadBadgePreferences() async {
    final savedEnabled = await _savedService.getBadgeEnabled(_userId);
    final listEnabled = await _badgeService.getListBadgeEnabled(_userId);
    final reqsEnabled = await _badgeService.getReqsBadgeEnabled(_userId);
    if (mounted) {
      setState(() {
        _savedBadgeEnabled = savedEnabled;
        _listBadgeEnabled = listEnabled;
        _reqsBadgeEnabled = reqsEnabled;
      });
    }
  }

  void _handleNavTap(BottomNavItem item) {
    setState(() {
      _currentNavItem = item;
    });
    switch (item) {
      case BottomNavItem.home:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const HomeScreen()));
        break;
      case BottomNavItem.search:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen()));
        break;
      case BottomNavItem.list:
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final roles = authProvider.roles;
        final canList = roles.contains('seller') || roles.contains('agent');
        if (!canList) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Seller/Agent role required to list properties')),
          );
          return;
        }
        Navigator.push(context, MaterialPageRoute(builder: (_) => const MyListingsScreen()));
        break;
      case BottomNavItem.saved:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const SavedPropertiesScreen()));
        break;
      case BottomNavItem.subscriptions:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const SubscriptionsScreen()));
        break;
      case BottomNavItem.payments:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentsHistoryScreen()));
        break;
      case BottomNavItem.profile:
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final roles = authProvider.roles;
        final canBuy = roles.contains('buyer') || roles.contains('admin');
        if (!canBuy) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Buyer role required to view requirements')),
          );
          return;
        }
        Navigator.push(context, MaterialPageRoute(builder: (_) => const BuyerRequirementsScreen()));
        break;
      case BottomNavItem.cs:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const CsDashboardScreen()));
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Badge Preferences',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 12),
                  CheckboxListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Show Saved Count'),
                    value: _savedBadgeEnabled,
                    onChanged: (value) async {
                      if (value == null) return;
                      await _savedService.setBadgeEnabled(_userId, value);
                      if (mounted) setState(() => _savedBadgeEnabled = value);
                    },
                  ),
                  CheckboxListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Show Listings Count'),
                    value: _listBadgeEnabled,
                    onChanged: (value) async {
                      if (value == null) return;
                      await _badgeService.setListBadgeEnabled(_userId, value);
                      if (mounted) setState(() => _listBadgeEnabled = value);
                    },
                  ),
                  CheckboxListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Show Reqs Count'),
                    value: _reqsBadgeEnabled,
                    onChanged: (value) async {
                      if (value == null) return;
                      await _badgeService.setReqsBadgeEnabled(_userId, value);
                      if (mounted) setState(() => _reqsBadgeEnabled = value);
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentNavItem,
        onTap: _handleNavTap,
      ),
    );
  }
}
