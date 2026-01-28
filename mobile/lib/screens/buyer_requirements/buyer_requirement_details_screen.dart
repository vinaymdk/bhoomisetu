import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/buyer_requirement.dart';
import '../../services/buyer_requirements_service.dart';
import '../../widgets/bottom_navigation.dart';
import '../../providers/auth_provider.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/property_details_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';
import '../subscriptions/subscriptions_screen.dart';
import '../subscriptions/payments_history_screen.dart';
import 'buyer_requirement_create_screen.dart';
import 'buyer_requirements_screen.dart';

class BuyerRequirementDetailsScreen extends StatefulWidget {
  final String requirementId;

  const BuyerRequirementDetailsScreen({super.key, required this.requirementId});

  @override
  State<BuyerRequirementDetailsScreen> createState() =>
      _BuyerRequirementDetailsScreenState();
}

class _BuyerRequirementDetailsScreenState
    extends State<BuyerRequirementDetailsScreen> {
  final BuyerRequirementsService _service = BuyerRequirementsService();
  BuyerRequirement? _requirement;
  List<BuyerRequirementMatch> _matches = [];
  bool _isLoading = true;
  String? _error;
  bool _isSaving = false;
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
      final req = await _service.getById(widget.requirementId);
      final matches = await _service.getMatches(widget.requirementId);
      setState(() {
        _requirement = req;
        _matches = matches;
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

  Future<void> _updateStatus(String status) async {
    if (_requirement == null) return;
    setState(() {
      _isSaving = true;
    });
    try {
      final updated =
          await _service.update(_requirement!.id, {'status': status});
      setState(() {
        _requirement = updated;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      setState(() {
        _isSaving = false;
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
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final roles = authProvider.roles;
        final canAccess = roles.contains('seller') || roles.contains('agent');
        if (!canAccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Seller/Agent role required to list properties')),
          );
          return;
        }
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => const MyListingsScreen()));
        break;
      case BottomNavItem.saved:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SavedPropertiesScreen()),
        );
        break;
      case BottomNavItem.subscriptions:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SubscriptionsScreen()),
        );
        break;
      case BottomNavItem.payments:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const PaymentsHistoryScreen()),
        );
        break;
      case BottomNavItem.profile:
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => const BuyerRequirementsScreen()));
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
      appBar: AppBar(
        title: const Text('Requirement Details'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _stateCard(_error!)
              : _requirement == null
                  ? _stateCard('Requirement not found.')
                  : ListView(
                      padding: EdgeInsets.fromLTRB(
                        16,
                        16,
                        16,
                        MediaQuery.of(context).viewInsets.bottom + 16,
                      ),
                      children: [
                        _overviewCard(_requirement!),
                        const SizedBox(height: 12),
                        _statusActionRow(_requirement!),
                        const SizedBox(height: 16),
                        _matchStatsCard(),
                        const SizedBox(height: 20),
                        Text('Matched Properties',
                            style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 6),
                        Text(
                          'Our customer service team will connect with you shortly for the best available matches.',
                          style: TextStyle(color: Colors.blue.shade700),
                        ),
                        const SizedBox(height: 8),
                        if (_matches.isEmpty)
                          _stateCard(
                              'No matches yet. We will notify you when new properties go live.')
                        else
                          ..._matches
                              .map((match) => _matchCard(match))
                              .toList(),
                      ],
                    ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentNavItem,
        onTap: _handleNavTap,
      ),
      floatingActionButton: _requirement == null
          ? null
          : FloatingActionButton(
              onPressed: _isSaving
                  ? null
                  : () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => BuyerRequirementCreateScreen(
                              requirement: _requirement),
                        ),
                      ).then((_) => _load());
                    },
              child: const Icon(Icons.edit),
            ),
    );
  }

  Widget _overviewCard(BuyerRequirement item) {
    final title = item.title ??
        '${item.propertyDetails.propertyType ?? 'Property'} Requirement';
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title,
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            if (item.description != null && item.description!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(item.description!,
                  style: TextStyle(color: Colors.grey.shade700)),
            ],
            const Divider(height: 24),
            _detailRow('Status', item.status),
            _detailRow('Location', _formatLocation(item)),
            _detailRow('Budget', _formatBudget(item)),
            _detailRow(
                'Property Type', item.propertyDetails.propertyType ?? 'Any'),
            _detailRow(
                'Listing Type', item.propertyDetails.listingType ?? 'Any'),
            _detailRow('Area', _formatArea(item)),
            _detailRow(
                'Bedrooms', item.propertyDetails.bedrooms?.toString() ?? 'Any'),
            _detailRow('Bathrooms',
                item.propertyDetails.bathrooms?.toString() ?? 'Any'),
            _detailRow(
              'Features',
              item.propertyDetails.requiredFeatures.isNotEmpty
                  ? item.propertyDetails.requiredFeatures.join(', ')
                  : 'Flexible',
            ),
            if (item.expiresAt != null)
              _detailRow('Expires In', _formatExpiry(item.expiresAt!)),
          ],
        ),
      ),
    );
  }

  Widget _statusActionRow(BuyerRequirement item) {
    final isActive = item.status == 'active';
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: item.status == 'fulfilled'
                ? null
                : _isSaving
                    ? null
                    : () => _updateStatus(isActive ? 'cancelled' : 'active'),
            child: Text(
              _isSaving
                  ? 'Saving...'
                  : item.status == 'fulfilled'
                      ? 'Fulfilled'
                      : isActive
                          ? 'Hold'
                          : 'Resume',
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: OutlinedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => const BuyerRequirementsScreen()),
              );
            },
            child: const Text('Back to List'),
          ),
        ),
      ],
    );
  }

  Widget _matchStatsCard() {
    final topScore = _matches.isEmpty
        ? 0
        : _matches
            .map((m) => m.match.overallMatchScore)
            .reduce((a, b) => a > b ? a : b);
    final avgScore = _matches.isEmpty
        ? 0
        : _matches
                .map((m) => m.match.overallMatchScore)
                .reduce((a, b) => a + b) /
            _matches.length;
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _statItem('Matches', _matches.length.toString()),
            _statItem('Top Score', '${topScore.toStringAsFixed(0)}%'),
            _statItem('Avg Score', '${avgScore.toStringAsFixed(0)}%'),
          ],
        ),
      ),
    );
  }

  Widget _matchCard(BuyerRequirementMatch match) {
    final property = match.property;
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    property['title']?.toString() ?? 'Property',
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    '${match.match.overallMatchScore.toStringAsFixed(0)}%',
                    style: TextStyle(
                        color: Colors.blue.shade700,
                        fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '${property['locality'] != null ? '${property['locality']}, ' : ''}${property['city'] ?? ''}, ${property['state'] ?? ''}',
              style: TextStyle(color: Colors.grey.shade600),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _infoItem('Price', '₹${_parsePrice(property['price'])}'),
                _infoItem('Area',
                    '${property['area'] ?? '-'} ${property['areaUnit'] ?? ''}'),
              ],
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: match.matchReasons
                  .take(3)
                  .map((reason) => Chip(
                      label:
                          Text(reason, style: const TextStyle(fontSize: 12))))
                  .toList(),
            ),
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () {
                  if (property['id'] == null) return;
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => PropertyDetailsScreen(
                            propertyId: property['id'].toString())),
                  );
                },
                child: const Text('View Property'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: TextStyle(color: Colors.grey.shade600)),
          ),
          Expanded(
              child: Text(value,
                  style: const TextStyle(fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }

  Widget _statItem(String label, String value) {
    return Column(
      children: [
        Text(value,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(color: Colors.grey.shade600)),
      ],
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
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text(message),
      ),
    );
  }

  String _formatLocation(BuyerRequirement item) {
    final parts = <String>[];
    if (item.location.locality != null && item.location.locality!.isNotEmpty) {
      parts.add(item.location.locality!);
    }
    parts.add(item.location.city);
    parts.add(item.location.state);
    return parts.join(', ');
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

  String _formatExpiry(DateTime date) {
    final remaining = date.difference(DateTime.now()).inDays;
    if (remaining <= 0) return 'Expired';
    return '$remaining days';
  }

  String _parsePrice(dynamic value) {
    if (value is num) return value.toStringAsFixed(0);
    if (value is String)
      return double.tryParse(value)?.toStringAsFixed(0) ?? value;
    return '-';
  }
}
