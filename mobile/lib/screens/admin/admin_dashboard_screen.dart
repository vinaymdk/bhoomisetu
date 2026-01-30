import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/admin_service.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';
import 'admin_users_screen.dart';
import 'admin_properties_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final AdminService _adminService = AdminService();
  Map<String, dynamic>? _stats;
  bool _loading = true;
  String? _error;
  BottomNavItem _currentNavItem = BottomNavItem.home;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response = await _adminService.getDashboardStats();
      if (!mounted) return;
      setState(() => _stats = response);
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

  Widget _statCard(String label, Object? value) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.blueGrey.shade100),
        borderRadius: BorderRadius.circular(12),
        color: Colors.blueGrey.shade50,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.black54)),
          const SizedBox(height: 6),
          Text('${value ?? 0}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      const Text('Key Metrics', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      GridView.count(
                        crossAxisCount: 2,
                        childAspectRatio: 1.6,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        children: [
                          _statCard('Total Users', _stats?['totalUsers']),
                          _statCard('Pending Properties', _stats?['pendingVerificationProperties']),
                          _statCard('Flagged Reviews', _stats?['flaggedReviews']),
                          _statCard('Total Revenue', _stats?['totalRevenue']),
                        ],
                      ),
                      const SizedBox(height: 20),
                      const Text('Admin Sections', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      ListTile(
                        leading: const Icon(Icons.people_outline),
                        title: const Text('User Management'),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const AdminUsersScreen()),
                          );
                        },
                      ),
                      ListTile(
                        leading: const Icon(Icons.home_work_outlined),
                        title: const Text('Property Approvals'),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const AdminPropertiesScreen()),
                          );
                        },
                      ),
                      const ListTile(
                        leading: Icon(Icons.rate_review_outlined),
                        title: Text('Review Moderation (coming soon)'),
                      ),
                      const ListTile(
                        leading: Icon(Icons.payment_outlined),
                        title: Text('Payment Reports (coming soon)'),
                      ),
                      const ListTile(
                        leading: Icon(Icons.analytics_outlined),
                        title: Text('AI Metrics (coming soon)'),
                      ),
                      const ListTile(
                        leading: Icon(Icons.support_agent),
                        title: Text('CS Activity Logs (coming soon)'),
                      ),
                    ],
                  ),
                ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentNavItem,
        onTap: _handleNavTap,
      ),
    );
  }
}
