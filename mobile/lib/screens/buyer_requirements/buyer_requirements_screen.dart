import 'package:flutter/material.dart';
import '../../models/buyer_requirement.dart';
import '../../services/buyer_requirements_service.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import 'buyer_requirement_create_screen.dart';
import 'buyer_requirement_details_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../../providers/auth_provider.dart';
import 'package:provider/provider.dart';
import '../../services/saved_properties_service.dart';
import '../mediation/buyer_interests_screen.dart';

class BuyerRequirementsScreen extends StatefulWidget {
  const BuyerRequirementsScreen({super.key});

  @override
  State<BuyerRequirementsScreen> createState() =>
      _BuyerRequirementsScreenState();
}

class _BuyerRequirementsScreenState extends State<BuyerRequirementsScreen> {
  final BuyerRequirementsService _service = BuyerRequirementsService();
  final SavedPropertiesService _savedService = SavedPropertiesService();
  final TextEditingController _searchController = TextEditingController();
  List<BuyerRequirement> _items = [];
  bool _isLoading = true;
  String? _error;
  String _statusFilter = 'active';
  BottomNavItem _currentNavItem = BottomNavItem.profile;
  bool _savedBadgeEnabled = true;
  String _userId = 'guest';

  @override
  void initState() {
    super.initState();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _userId = authProvider.userData?['id']?.toString() ?? 'guest';
    _loadSavedBadgeSetting();
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final response = await _service.list(
        status: _statusFilter,
        search: _searchController.text.trim().isNotEmpty
            ? _searchController.text.trim()
            : null,
      );
      setState(() {
        _items = response.requirements;
      });
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

  Future<void> _loadSavedBadgeSetting() async {
    final enabled = await _savedService.getBadgeEnabled(_userId);
    if (mounted) {
      setState(() {
        _savedBadgeEnabled = enabled;
      });
    }
  }

  void _handleNavTap(BottomNavItem item) {
    setState(() {
      _currentNavItem = item;
    });
    switch (item) {
      case BottomNavItem.home:
        Navigator.push(
            context, MaterialPageRoute(builder: (_) => const HomeScreen()));
        break;
      case BottomNavItem.search:
        Navigator.push(
            context, MaterialPageRoute(builder: (_) => const SearchScreen()));
        break;
      case BottomNavItem.list:
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => const MyListingsScreen()));
        break;
      case BottomNavItem.saved:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SavedPropertiesScreen()),
        );
        break;
      case BottomNavItem.profile:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalMatches =
        _items.fold<int>(0, (sum, item) => sum + item.matchCount);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Buyer Requirements'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _summaryCard(_items.length.toString(), totalMatches.toString()),
            const SizedBox(height: 16),
            _filtersSection(),
            const SizedBox(height: 12),
            _interestsShortcut(),
            const SizedBox(height: 12),
            _savedBadgeToggle(),
            const SizedBox(height: 12),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_error != null)
              _stateCard(_error!)
            else if (_items.isEmpty)
              _stateCard(
                  'No requirements yet. Post your first requirement to get matches.')
            else
              ..._items.map((item) => _requirementCard(item)).toList(),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentNavItem,
        onTap: _handleNavTap,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
                builder: (_) => const BuyerRequirementCreateScreen()),
          ).then((_) => _load());
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _summaryCard(String totalRequirements, String totalMatches) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue.shade100),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Total Requirements',
                    style: TextStyle(color: Colors.blueGrey.shade700)),
                const SizedBox(height: 6),
                Text(totalRequirements,
                    style: const TextStyle(
                        fontSize: 22, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          Container(
            width: 1,
            height: 44,
            color: Colors.blue.shade100,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Total Matches',
                    style: TextStyle(color: Colors.blueGrey.shade700)),
                const SizedBox(height: 6),
                Text(totalMatches,
                    style: const TextStyle(
                        fontSize: 22, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _filtersSection() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Filters',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _statusFilter,
                    decoration: const InputDecoration(
                      labelText: 'Status',
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'active', child: Text('Active')),
                      DropdownMenuItem(
                          value: 'fulfilled', child: Text('Fulfilled')),
                      DropdownMenuItem(
                          value: 'cancelled', child: Text('Cancelled')),
                      DropdownMenuItem(
                          value: 'expired', child: Text('Expired')),
                    ],
                    onChanged: (value) {
                      if (value == null) return;
                      setState(() {
                        _statusFilter = value;
                      });
                      _load();
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      labelText: 'Search',
                      border: OutlineInputBorder(),
                      suffixIcon: Icon(Icons.search),
                    ),
                    onSubmitted: (_) => _load(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton(
                onPressed: _load,
                child: const Text('Apply Filters'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _savedBadgeToggle() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: SwitchListTile(
        title: const Text('Show Saved count badge'),
        subtitle: const Text('Control visibility of Saved count on bottom nav'),
        value: _savedBadgeEnabled,
        onChanged: (value) async {
          await _savedService.setBadgeEnabled(_userId, value);
          if (mounted) {
            setState(() {
              _savedBadgeEnabled = value;
            });
          }
        },
      ),
    );
  }

  Widget _interestsShortcut() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        title: const Text('My Interests'),
        subtitle: const Text('Track your mediation status and CS updates'),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const BuyerInterestsScreen()),
          );
        },
      ),
    );
  }

  Widget _requirementCard(BuyerRequirement item) {
    final title = item.title ??
        '${item.propertyDetails.propertyType ?? 'Property'} in ${item.location.city}';
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
                builder: (_) =>
                    BuyerRequirementDetailsScreen(requirementId: item.id)),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                  ),
                  _statusChip(item.status),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                '${item.location.locality != null ? '${item.location.locality}, ' : ''}${item.location.city}, ${item.location.state}',
                style: TextStyle(color: Colors.grey.shade600),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _infoItem('Budget', _formatBudget(item)),
                  _infoItem('Matches', item.matchCount.toString()),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _infoItem('Area', _formatArea(item)),
                  _infoItem('Updated', _formatDate(item.updatedAt)),
                ],
              ),
              if (item.expiresAt != null) ...[
                const SizedBox(height: 10),
                _infoItem('Expiry', _formatExpiry(item.expiresAt!)),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _statusChip(String status) {
    Color bg;
    Color text;
    switch (status) {
      case 'fulfilled':
        bg = Colors.blue.shade50;
        text = Colors.blue.shade700;
        break;
      case 'cancelled':
        bg = Colors.red.shade50;
        text = Colors.red.shade700;
        break;
      case 'expired':
        bg = Colors.grey.shade200;
        text = Colors.grey.shade700;
        break;
      default:
        bg = Colors.green.shade50;
        text = Colors.green.shade700;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(status,
          style: TextStyle(
              color: text, fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }

  Widget _infoItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _stateCard(String message) {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(message),
    );
  }

  String _formatBudget(BuyerRequirement item) {
    final minBudget = item.budget.minBudget;
    final maxBudget = item.budget.maxBudget;
    final suffix = item.budget.budgetType == 'rent' ? '/mo' : '';
    if (minBudget != null && minBudget > 0) {
      return '₹${minBudget.toStringAsFixed(0)} - ₹${maxBudget.toStringAsFixed(0)}$suffix';
    }
    return 'Up to ₹${maxBudget.toStringAsFixed(0)}$suffix';
  }

  String _formatArea(BuyerRequirement item) {
    final minArea = item.propertyDetails.minArea;
    final maxArea = item.propertyDetails.maxArea;
    if (minArea != null || maxArea != null) {
      return '${minArea?.toStringAsFixed(0) ?? '0'} - ${maxArea?.toStringAsFixed(0) ?? 'Any'} ${item.propertyDetails.areaUnit}';
    }
    return 'Flexible';
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  String _formatExpiry(DateTime date) {
    final remaining = date.difference(DateTime.now()).inDays;
    if (remaining <= 0) return 'Expired';
    return '$remaining days left';
  }
}
