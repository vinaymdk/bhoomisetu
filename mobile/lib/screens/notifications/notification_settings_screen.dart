import 'package:flutter/material.dart';
import '../../services/notifications_service.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';
import '../subscriptions/subscriptions_screen.dart';
import '../subscriptions/payments_history_screen.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends State<NotificationSettingsScreen> {
  final NotificationsService _service = NotificationsService();
  NotificationPreferences? _preferences;
  bool _loading = true;
  BottomNavItem _currentNavItem = BottomNavItem.profile;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    setState(() => _loading = true);
    try {
      final prefs = await _service.getPreferences();
      setState(() => _preferences = prefs);
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _updatePreference(String key, bool value) async {
    final updated = await _service.updatePreferences({key: value});
    setState(() => _preferences = updated);
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
        final canList = roles.contains('seller') || roles.contains('agent');
        if (!canList) {
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
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final roles = authProvider.roles;
        final canBuy = roles.contains('buyer') || roles.contains('admin');
        if (!canBuy) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Buyer role required to view requirements')),
          );
          return;
        }
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
        title: const Text('Notification Settings'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _preferences == null
              ? const Center(child: Text('Unable to load preferences'))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Card(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Channels', style: TextStyle(fontWeight: FontWeight.bold)),
                            _buildToggleRow('Push notifications', _preferences!.pushEnabled,
                                (value) => _updatePreference('pushEnabled', value)),
                            _buildToggleRow('SMS updates', _preferences!.smsEnabled,
                                (value) => _updatePreference('smsEnabled', value)),
                            _buildToggleRow('Email updates', _preferences!.emailEnabled,
                                (value) => _updatePreference('emailEnabled', value)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Card(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Notification types', style: TextStyle(fontWeight: FontWeight.bold)),
                            _buildToggleRow('Property matches', _preferences!.propertyMatchEnabled,
                                (value) => _updatePreference('propertyMatchEnabled', value)),
                            _buildToggleRow('Price drops', _preferences!.priceDropEnabled,
                                (value) => _updatePreference('priceDropEnabled', value)),
                            _buildToggleRow('Viewing reminders', _preferences!.viewingReminderEnabled,
                                (value) => _updatePreference('viewingReminderEnabled', value)),
                            _buildToggleRow('Mediation updates', _preferences!.mediationUpdateEnabled,
                                (value) => _updatePreference('mediationUpdateEnabled', value)),
                            _buildToggleRow('AI chat escalation', _preferences!.aiChatEscalationEnabled,
                                (value) => _updatePreference('aiChatEscalationEnabled', value)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentNavItem,
        onTap: _handleNavTap,
      ),
    );
  }

  Widget _buildToggleRow(String label, bool value, ValueChanged<bool> onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: Text(label)),
          Transform.scale(
            scale: 0.85,
            child: Switch(
              value: value,
              onChanged: onChanged,
            ),
          ),
        ],
      ),
    );
  }
}
