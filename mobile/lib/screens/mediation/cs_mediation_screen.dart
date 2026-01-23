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

class CsMediationScreen extends StatefulWidget {
  const CsMediationScreen({super.key});

  @override
  State<CsMediationScreen> createState() => _CsMediationScreenState();
}

class _CsMediationScreenState extends State<CsMediationScreen> {
  final MediationService _service = MediationService();
  List<InterestExpression> _items = [];
  bool _isLoading = true;
  String? _error;
  String _status = '';
  BottomNavItem _currentNavItem = BottomNavItem.profile;
  final Map<String, TextEditingController> _notes = {};
  final Map<String, TextEditingController> _scores = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    for (final controller in _notes.values) {
      controller.dispose();
    }
    for (final controller in _scores.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final resp = await _service.getPendingInterests(status: _status);
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
      case BottomNavItem.profile:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const BuyerRequirementsScreen()));
        break;
    }
  }

  TextEditingController _noteController(String id) {
    return _notes.putIfAbsent(id, () => TextEditingController());
  }

  TextEditingController _scoreController(String id) {
    return _scores.putIfAbsent(id, () => TextEditingController());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mediation Queue'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _filterRow(),
            const SizedBox(height: 12),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_error != null)
              _stateCard(_error!)
            else if (_items.isEmpty)
              _stateCard('No pending mediation tasks.')
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
              DropdownMenuItem(value: '', child: Text('Pending')),
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
    final buyerName = item.buyer?['fullName']?.toString() ?? item.buyerId;
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
            Text('Buyer: $buyerName', style: TextStyle(color: Colors.grey.shade600)),
            const SizedBox(height: 10),
            TextField(
              controller: _noteController(item.id),
              decoration: const InputDecoration(
                labelText: 'Notes / reason',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _scoreController(item.id),
              decoration: const InputDecoration(
                labelText: 'Score (0-100)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              children: [
                OutlinedButton(
                  onPressed: () async {
                    await _service.reviewBuyerSeriousness({
                      'interestExpressionId': item.id,
                      'actionType': 'buyer_seriousness_check',
                      'buyerSeriousnessScore': int.tryParse(_scoreController(item.id).text) ?? 0,
                      'buyerSeriousnessNotes': _noteController(item.id).text,
                      'outcome': 'approved',
                      'notes': _noteController(item.id).text,
                    });
                    _load();
                  },
                  child: const Text('Buyer Seriousness'),
                ),
                OutlinedButton(
                  onPressed: () async {
                    await _service.reviewSellerWillingness({
                      'interestExpressionId': item.id,
                      'actionType': 'seller_willingness_check',
                      'sellerWillingnessScore': int.tryParse(_scoreController(item.id).text) ?? 0,
                      'sellerWillingnessNotes': _noteController(item.id).text,
                      'outcome': 'approved',
                      'notes': _noteController(item.id).text,
                    });
                    _load();
                  },
                  child: const Text('Seller Willingness'),
                ),
                ElevatedButton(
                  onPressed: () async {
                    await _service.approveConnection({
                      'interestExpressionId': item.id,
                      'revealSellerContact': true,
                      'revealBuyerContact': true,
                      'notes': _noteController(item.id).text,
                    });
                    _load();
                  },
                  child: const Text('Approve'),
                ),
                OutlinedButton(
                  onPressed: () async {
                    await _service.rejectConnection(item.id, reason: _noteController(item.id).text);
                    _load();
                  },
                  child: const Text('Reject'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
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

