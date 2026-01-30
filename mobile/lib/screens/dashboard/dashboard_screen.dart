import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/admin_service.dart';
import '../../widgets/bottom_navigation.dart';
import '../../widgets/app_drawer.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';
import '../notifications/notifications_screen.dart';
import '../admin/admin_dashboard_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final AdminService _adminService = AdminService();
  Map<String, dynamic>? _adminStats;
  bool _loadingAdmin = false;
  BottomNavItem _currentNavItem = BottomNavItem.home;

  @override
  void initState() {
    super.initState();
    _loadAdminStats();
  }

  Future<void> _loadAdminStats() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.roles.contains('admin')) return;
    setState(() => _loadingAdmin = true);
    try {
      final stats = await _adminService.getDashboardStats();
      if (!mounted) return;
      setState(() => _adminStats = stats);
    } catch (_) {
      // ignore for now
    } finally {
      if (mounted) setState(() => _loadingAdmin = false);
    }
  }

  void _handleNavTap(BottomNavItem item) {
    setState(() => _currentNavItem = item);
    switch (item) {
      case BottomNavItem.home:
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
          (route) => false,
        );
        break;
      case BottomNavItem.search:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen()));
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
        Navigator.push(context, MaterialPageRoute(builder: (_) => const MyListingsScreen()));
        break;
      case BottomNavItem.saved:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const SavedPropertiesScreen()));
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
          Navigator.push(context, MaterialPageRoute(builder: (_) => const BuyerRequirementsScreen()));
          return;
        }
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile screen coming soon')),
        );
        break;
      case BottomNavItem.cs:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const CsDashboardScreen()));
        break;
    }
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 12, bottom: 8),
      child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
    );
  }

  Widget _metricCard(String label, Object? value) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blueGrey.shade100),
        color: Colors.blueGrey.shade50,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.black54)),
          const SizedBox(height: 6),
          Text('${value ?? 0}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final roles = authProvider.roles;
    final isAdmin = roles.contains('admin');
    final isBuyer = roles.contains('buyer');
    final isSeller = roles.contains('seller') || roles.contains('agent');
    final isCs = roles.contains('customer_service');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            onPressed: _loadAdminStats,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      drawer: const AppDrawer(),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (isAdmin) ...[
            _sectionTitle('Admin Overview'),
            if (_loadingAdmin) const LinearProgressIndicator(),
            GridView.count(
              crossAxisCount: 2,
              childAspectRatio: 1.6,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              children: [
                _metricCard('Total Users', _adminStats?['totalUsers']),
                _metricCard('Pending Properties', _adminStats?['pendingVerificationProperties']),
                _metricCard('Flagged Reviews', _adminStats?['flaggedReviews']),
                _metricCard('Total Revenue', _adminStats?['totalRevenue']),
              ],
            ),
            const SizedBox(height: 8),
            ListTile(
              leading: const Icon(Icons.admin_panel_settings_outlined),
              title: const Text('Admin Panel'),
              subtitle: const Text('Manage users, approvals, and reports'),
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminDashboardScreen()));
              },
            ),
          ],
          if (isBuyer) ...[
            _sectionTitle('Buyer Workspace'),
            ListTile(
              leading: const Icon(Icons.home_outlined),
              title: const Text('Browse Properties'),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HomeScreen())),
            ),
            ListTile(
              leading: const Icon(Icons.assignment_outlined),
              title: const Text('Buyer Requirements'),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const BuyerRequirementsScreen())),
            ),
            ListTile(
              leading: const Icon(Icons.favorite_border),
              title: const Text('Saved Properties'),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SavedPropertiesScreen())),
            ),
          ],
          if (isSeller) ...[
            _sectionTitle('Seller Workspace'),
            ListTile(
              leading: const Icon(Icons.home_work_outlined),
              title: const Text('My Listings'),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MyListingsScreen())),
            ),
            ListTile(
              leading: const Icon(Icons.search),
              title: const Text('Search Properties'),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen())),
            ),
          ],
          if (isCs) ...[
            _sectionTitle('Customer Service Workspace'),
            ListTile(
              leading: const Icon(Icons.verified_outlined),
              title: const Text('CS Dashboard'),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CsDashboardScreen())),
            ),
            ListTile(
              leading: const Icon(Icons.notifications_outlined),
              title: const Text('Notifications'),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
            ),
          ],
        ],
      ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentNavItem,
        onTap: _handleNavTap,
      ),
    );
  }
}
