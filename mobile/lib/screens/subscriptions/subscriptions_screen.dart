import 'package:flutter/material.dart';
import '../../models/subscription.dart';
import '../../services/payments_service.dart';
import '../../services/subscriptions_service.dart';
import 'checkout_screen.dart';
import 'payments_history_screen.dart';
import 'subscription_management_screen.dart';

class SubscriptionsScreen extends StatefulWidget {
  const SubscriptionsScreen({super.key});

  @override
  State<SubscriptionsScreen> createState() => _SubscriptionsScreenState();
}

class _SubscriptionsScreenState extends State<SubscriptionsScreen> {
  final PaymentsService _paymentsService = PaymentsService();
  final SubscriptionsService _subscriptionsService = SubscriptionsService();
  List<SubscriptionPlan> _plans = [];
  SubscriptionStatusSummary? _status;
  String _activeTab = 'all';
  bool _loading = true;
  String? _error;

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
      final results = await Future.wait([
        _paymentsService.getPlans(),
        _subscriptionsService.getStatus(),
      ]);
      setState(() {
        _plans = results[0] as List<SubscriptionPlan>;
        _status = results[1] as SubscriptionStatusSummary;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  List<SubscriptionPlan> get _filteredPlans {
    if (_activeTab == 'all') return _plans;
    return _plans.where((plan) => plan.planType == _activeTab).toList();
  }

  List<String> _buildFeatures(Map<String, dynamic> features) {
    return features.entries
        .where((entry) => entry.value == true)
        .map((entry) => entry.key.replaceAll('_', ' '))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Subscriptions'),
        actions: [
          IconButton(
            icon: const Icon(Icons.receipt_long_outlined),
            tooltip: 'Payment history',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PaymentsHistoryScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            tooltip: 'Manage subscriptions',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SubscriptionManagementScreen()),
              );
            },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(_error!, style: const TextStyle(color: Colors.red)),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      if (_status != null)
                        Card(
                          elevation: 0,
                          color: Colors.blue.shade50,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Your Premium Status',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                Text('Premium Seller: ${_status!.hasPremiumSeller ? 'Active' : 'Inactive'}'),
                                Text('Premium Buyer: ${_status!.hasPremiumBuyer ? 'Active' : 'Inactive'}'),
                                Text('Featured Listing: ${_status!.hasActiveFeaturedListing ? 'Active' : 'Inactive'}'),
                                const SizedBox(height: 8),
                                Text('Active subscriptions: ${_status!.activeSubscriptions.length}'),
                              ],
                            ),
                          ),
                        ),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        children: [
                          _buildTabChip('all', 'All Plans'),
                          _buildTabChip('premium_seller', 'Premium Seller'),
                          _buildTabChip('premium_buyer', 'Premium Buyer'),
                          _buildTabChip('featured_listing', 'Featured Listing'),
                        ],
                      ),
                      const SizedBox(height: 16),
                      if (_filteredPlans.isEmpty)
                        const Text('No plans available for this category yet.')
                      else
                        ..._filteredPlans.map((plan) {
                          final features = _buildFeatures(plan.features);
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          plan.displayName,
                                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      if (plan.isFeatured)
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: Colors.blue.shade600,
                                            borderRadius: BorderRadius.circular(20),
                                          ),
                                          child: const Text(
                                            'Popular',
                                            style: TextStyle(color: Colors.white, fontSize: 12),
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text('₹${plan.price.toStringAsFixed(0)} / ${plan.billingPeriod}'),
                                  if (plan.description != null && plan.description!.isNotEmpty) ...[
                                    const SizedBox(height: 6),
                                    Text(plan.description!, style: TextStyle(color: Colors.grey.shade700)),
                                  ],
                                  if (features.isNotEmpty) ...[
                                    const SizedBox(height: 10),
                                    ...features.map((feature) => Text('• $feature')),
                                  ],
                                  const SizedBox(height: 12),
                                  ElevatedButton(
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => CheckoutScreen(planId: plan.id),
                                        ),
                                      );
                                    },
                                    child: const Text('Choose plan'),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }),
                    ],
                  ),
                ),
    );
  }

  Widget _buildTabChip(String id, String label) {
    final selected = _activeTab == id;
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => setState(() => _activeTab = id),
    );
  }
}
