import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/payment.dart';
import '../../services/payments_service.dart';
import '../../widgets/bottom_navigation.dart';
import '../../providers/auth_provider.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';

class PaymentsHistoryScreen extends StatefulWidget {
  const PaymentsHistoryScreen({super.key});

  @override
  State<PaymentsHistoryScreen> createState() => _PaymentsHistoryScreenState();
}

class _PaymentsHistoryScreenState extends State<PaymentsHistoryScreen> {
  final PaymentsService _paymentsService = PaymentsService();
  List<Payment> _payments = [];
  int _page = 1;
  int _total = 0;
  bool _loading = true;
  bool _loadingMore = false;
  String? _error;
  BottomNavItem _currentNavItem = BottomNavItem.home;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load({int page = 1, bool append = false}) async {
    if (append) {
      setState(() => _loadingMore = true);
    } else {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final response = await _paymentsService.getPayments(page: page, limit: 10);
      setState(() {
        _payments = append ? [..._payments, ...response.payments] : response.payments;
        _page = response.page;
        _total = response.total;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      setState(() {
        _loading = false;
        _loadingMore = false;
      });
    }
  }

  bool get _hasMore => _payments.length < _total;

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
      appBar: AppBar(title: const Text('Payment History')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error!)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _payments.length + (_hasMore ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index >= _payments.length) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        child: ElevatedButton(
                          onPressed: _loadingMore ? null : () => _load(page: _page + 1, append: true),
                          child: Text(_loadingMore ? 'Loading...' : 'Load more'),
                        ),
                      );
                    }
                    final payment = _payments[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        title: Text(payment.purpose.replaceAll('_', ' ')),
                        subtitle: Text(
                          '${payment.status} · ${payment.gateway} · ${payment.createdAt.toLocal().toString().split('.').first}',
                        ),
                        trailing: Text('₹${payment.amount.toStringAsFixed(0)}'),
                      ),
                    );
                  },
                ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentNavItem,
        onTap: _handleNavTap,
      ),
    );
  }
}
