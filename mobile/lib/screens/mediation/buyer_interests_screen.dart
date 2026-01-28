import 'package:flutter/material.dart';
import '../../models/mediation.dart';
import '../../services/mediation_service.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../../providers/auth_provider.dart';
import 'package:provider/provider.dart';
import '../customer_service/cs_dashboard_screen.dart';
import '../subscriptions/subscriptions_screen.dart';
import '../subscriptions/payments_history_screen.dart';

class BuyerInterestsScreen extends StatefulWidget {
  const BuyerInterestsScreen({super.key});

  @override
  State<BuyerInterestsScreen> createState() => _BuyerInterestsScreenState();
}

class _BuyerInterestsScreenState extends State<BuyerInterestsScreen> {
  final MediationService _service = MediationService();
  List<InterestExpression> _items = [];
  bool _isLoading = true;
  String? _error;
  String _status = '';
  BottomNavItem _currentNavItem = BottomNavItem.profile;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final resp = await _service.getMyInterests(status: _status);
      setState(() => _items = resp.interests);
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      setState(() {
        _isLoading = false;
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
        Navigator.push(context, MaterialPageRoute(builder: (_) => const SubscriptionsScreen()));
        break;
      case BottomNavItem.payments:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentsHistoryScreen()));
        break;
      case BottomNavItem.profile:
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
        title: const Text('My Interests'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: EdgeInsets.fromLTRB(
            16,
            16,
            16,
            MediaQuery.of(context).viewInsets.bottom + 16,
          ),
          children: [
            _filterRow(),
            const SizedBox(height: 12),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_error != null)
              _stateCard(_error!)
            else if (_items.isEmpty)
              _stateCard('No interests yet. Express interest from a property.')
            else
              ..._items.map(_interestCard).toList(),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentNavItem,
        onTap: _handleNavTap,
      ),
    );
  }

  Widget _filterRow() {
    return Row(
      children: [
        Expanded(
          child: DropdownButtonFormField<String>(
            value: _status,
            decoration: const InputDecoration(
              labelText: 'Status',
              border: OutlineInputBorder(),
            ),
            items: const [
              DropdownMenuItem(value: '', child: Text('All')),
              DropdownMenuItem(value: 'pending', child: Text('Pending')),
              DropdownMenuItem(value: 'cs_reviewing', child: Text('CS Reviewing')),
              DropdownMenuItem(value: 'seller_checking', child: Text('Seller Checking')),
              DropdownMenuItem(value: 'approved', child: Text('Approved')),
              DropdownMenuItem(value: 'rejected', child: Text('Rejected')),
              DropdownMenuItem(value: 'connected', child: Text('Connected')),
            ],
            onChanged: (value) {
              if (value == null) return;
              setState(() => _status = value);
              _load();
            },
          ),
        ),
      ],
    );
  }

  Widget _interestCard(InterestExpression item) {
    final propertyTitle = item.property?['title']?.toString() ?? 'Property';
    final location =
        '${item.property?['city'] ?? ''}, ${item.property?['state'] ?? ''}'.trim();
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(propertyTitle, style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Text(location, style: TextStyle(color: Colors.grey.shade600)),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _statusPill(item.connectionStatus),
                _infoPill('Priority', item.priority),
              ],
            ),
            if (item.message != null && item.message!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text('“${item.message}”'),
            ],
          ],
        ),
      ),
    );
  }

  Widget _statusPill(String status) {
    final color = _statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Text(
        _formatStatus(status),
        style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 12),
      ),
    );
  }

  Widget _infoPill(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(label, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
      ],
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'pending':
        return Colors.orange.shade700;
      case 'cs_reviewing':
        return Colors.blue.shade700;
      case 'seller_checking':
        return Colors.deepPurple.shade400;
      case 'approved':
        return Colors.green.shade700;
      case 'rejected':
        return Colors.red.shade700;
      case 'connected':
        return Colors.teal.shade600;
      default:
        return Colors.grey.shade600;
    }
  }

  String _formatStatus(String status) {
    return status.replaceAll('_', ' ');
  }

  Widget _stateCard(String message) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(message),
    );
  }
}

