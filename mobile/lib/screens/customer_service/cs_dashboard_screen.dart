import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/customer_service.dart';
import '../../models/customer_service.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import 'cs_property_screen.dart';

class CsDashboardScreen extends StatefulWidget {
  const CsDashboardScreen({super.key});

  @override
  State<CsDashboardScreen> createState() => _CsDashboardScreenState();
}

class _CsDashboardScreenState extends State<CsDashboardScreen> {
  final CustomerServiceApi _service = CustomerServiceApi();
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _cityController = TextEditingController();
  bool _loading = true;
  String? _error;
  int _page = 1;
  int _total = 0;
  final int _limit = 10;
  String _status = 'pending_verification';
  String _propertyType = '';
  String _urgency = '';
  List<PendingVerificationProperty> _items = [];
  CsStats? _stats;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  Future<void> _load({bool reset = false}) async {
    if (reset) _page = 1;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await _service.getPending(
        status: _status,
        city: _cityController.text.trim(),
        propertyType: _propertyType.isEmpty ? null : _propertyType,
        urgencyLevel: _urgency.isEmpty ? null : _urgency,
        search: _searchController.text.trim(),
        page: _page,
        limit: _limit,
      );
      final stats = await _service.getStats();
      setState(() {
        _items = results.items;
        _total = results.total;
        _stats = stats;
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
    final totalPages = (_total / _limit).ceil().clamp(1, 999);

    return Scaffold(
      appBar: AppBar(
        title: const Text('CS Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loading ? null : () => _load(reset: true),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => _load(reset: true),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildStats(),
            const SizedBox(height: 12),
            _buildFilters(),
            const SizedBox(height: 12),
            if (_loading)
              const Center(child: CircularProgressIndicator())
            else if (_error != null)
              _buildError()
            else if (_items.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(child: Text('No properties found.')),
              )
            else
              ..._items.map(_buildCard),
            const SizedBox(height: 12),
            _buildPagination(totalPages),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: BottomNavItem.home,
        onTap: _handleNavTap,
      ),
    );
  }

  Widget _buildStats() {
    if (_stats == null) return const SizedBox.shrink();
    return Row(
      children: [
        _statTile('Pending', _stats!.pending),
        const SizedBox(width: 8),
        _statTile('Verified', _stats!.verified),
        const SizedBox(width: 8),
        _statTile('Rejected', _stats!.rejected),
        const SizedBox(width: 8),
        _statTile('Total', _stats!.total),
      ],
    );
  }

  Widget _statTile(String label, int value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.blue.shade50,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Text(label, style: const TextStyle(fontSize: 12, color: Colors.black54)),
            const SizedBox(height: 4),
            Text(value.toString(), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildFilters() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _searchController,
          decoration: const InputDecoration(
            labelText: 'Search',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _cityController,
          decoration: const InputDecoration(
            labelText: 'City',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                value: _status,
                decoration: const InputDecoration(labelText: 'Status', border: OutlineInputBorder()),
                items: const [
                  DropdownMenuItem(value: 'pending_verification', child: Text('Pending')),
                  DropdownMenuItem(value: 'rejected', child: Text('Rejected')),
                  DropdownMenuItem(value: 'live', child: Text('Live')),
                ],
                onChanged: (v) => setState(() => _status = v ?? 'pending_verification'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: DropdownButtonFormField<String>(
                value: _urgency.isEmpty ? null : _urgency,
                decoration: const InputDecoration(labelText: 'Urgency', border: OutlineInputBorder()),
                items: const [
                  DropdownMenuItem(value: '', child: Text('All')),
                  DropdownMenuItem(value: 'low', child: Text('Low')),
                  DropdownMenuItem(value: 'normal', child: Text('Normal')),
                  DropdownMenuItem(value: 'high', child: Text('High')),
                  DropdownMenuItem(value: 'urgent', child: Text('Urgent')),
                ],
                onChanged: (v) => setState(() => _urgency = v ?? ''),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _propertyType.isEmpty ? null : _propertyType,
          decoration: const InputDecoration(labelText: 'Property Type', border: OutlineInputBorder()),
          items: const [
            DropdownMenuItem(value: '', child: Text('All')),
            DropdownMenuItem(value: 'apartment', child: Text('Apartment')),
            DropdownMenuItem(value: 'house', child: Text('House')),
            DropdownMenuItem(value: 'villa', child: Text('Villa')),
            DropdownMenuItem(value: 'plot', child: Text('Plot')),
            DropdownMenuItem(value: 'commercial', child: Text('Commercial')),
            DropdownMenuItem(value: 'industrial', child: Text('Industrial')),
            DropdownMenuItem(value: 'agricultural', child: Text('Agricultural')),
            DropdownMenuItem(value: 'other', child: Text('Other')),
          ],
          onChanged: (v) => setState(() => _propertyType = v ?? ''),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: _loading ? null : () => _load(reset: true),
                child: const Text('Apply Filters'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: OutlinedButton(
                onPressed: _loading
                    ? null
                    : () {
                        setState(() {
                          _status = 'pending_verification';
                          _propertyType = '';
                          _urgency = '';
                          _searchController.clear();
                          _cityController.clear();
                        });
                        _load(reset: true);
                      },
                child: const Text('Clear'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCard(PendingVerificationProperty item) {
    final property = item.property;
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ListTile(
        title: Text(property.title),
        subtitle: Text('${property.location.city}, ${property.location.state}'),
        trailing: const Icon(Icons.chevron_right),
        onTap: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => CsPropertyScreen(propertyId: property.id)),
          );
          if (mounted) {
            _load();
          }
        },
      ),
    );
  }

  Widget _buildPagination(int totalPages) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        TextButton(
          onPressed: _page <= 1 || _loading
              ? null
              : () {
                  setState(() => _page -= 1);
                  _load();
                },
          child: const Text('Prev'),
        ),
        Text('Page $_page of $totalPages'),
        TextButton(
          onPressed: _page >= totalPages || _loading
              ? null
              : () {
                  setState(() => _page += 1);
                  _load();
                },
          child: const Text('Next'),
        ),
      ],
    );
  }

  Widget _buildError() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        children: [
          Text(_error ?? 'Something went wrong', style: const TextStyle(color: Colors.red)),
          const SizedBox(height: 8),
          ElevatedButton(onPressed: () => _load(reset: true), child: const Text('Retry')),
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
