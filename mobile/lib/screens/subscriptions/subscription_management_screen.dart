import 'package:flutter/material.dart';
import '../../models/subscription.dart';
import '../../services/subscriptions_service.dart';

class SubscriptionManagementScreen extends StatefulWidget {
  const SubscriptionManagementScreen({super.key});

  @override
  State<SubscriptionManagementScreen> createState() => _SubscriptionManagementScreenState();
}

class _SubscriptionManagementScreenState extends State<SubscriptionManagementScreen> {
  final SubscriptionsService _subscriptionsService = SubscriptionsService();
  List<Subscription> _subscriptions = [];
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
      final data = await _subscriptionsService.getUserSubscriptions();
      setState(() {
        _subscriptions = data;
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

  Future<void> _toggleAutoRenewal(Subscription subscription) async {
    try {
      final updated = await _subscriptionsService.updateAutoRenewal(
        subscription.id,
        !subscription.autoRenewalEnabled,
      );
      setState(() {
        _subscriptions = _subscriptions
            .map((item) => item.id == updated.id ? updated : item)
            .toList();
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  Future<void> _cancelSubscription(Subscription subscription) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel subscription?'),
        content: const Text('This will stop future renewals.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('No')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Yes')),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      final updated = await _subscriptionsService.cancelSubscription(subscription.id);
      setState(() {
        _subscriptions = _subscriptions
            .map((item) => item.id == updated.id ? updated : item)
            .toList();
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manage Subscriptions')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error!)))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _subscriptions.isEmpty ? 1 : _subscriptions.length,
                    itemBuilder: (context, index) {
                      if (_subscriptions.isEmpty) {
                        return const Center(child: Text('No active subscriptions found.'));
                      }
                      final subscription = _subscriptions[index];
                      final title = subscription.plan?.displayName ?? subscription.subscriptionType;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 6),
                              Text('Status: ${subscription.status}'),
                              Text('Expires: ${subscription.expiresAt.toLocal().toString().split(' ').first}'),
                              const SizedBox(height: 12),
                              Wrap(
                                spacing: 8,
                                children: [
                                  OutlinedButton(
                                    onPressed: () => _toggleAutoRenewal(subscription),
                                    child: Text(
                                      subscription.autoRenewalEnabled
                                          ? 'Disable auto-renewal'
                                          : 'Enable auto-renewal',
                                    ),
                                  ),
                                  OutlinedButton(
                                    onPressed: () => _cancelSubscription(subscription),
                                    style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                                    child: const Text('Cancel subscription'),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
