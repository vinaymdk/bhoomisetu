import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../screens/home/home_screen.dart';
import '../screens/properties/my_listings_screen.dart';
import '../screens/buyer_requirements/buyer_requirements_screen.dart';
import '../screens/customer_service/cs_dashboard_screen.dart';
import '../screens/ai/ai_chat_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/profile/settings_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/subscriptions/subscriptions_screen.dart';
import '../screens/subscriptions/payments_history_screen.dart';
import '../screens/admin/admin_dashboard_screen.dart';
import '../screens/mediation/buyer_interests_screen.dart';
import '../screens/properties/create_property_screen.dart';

class AppDrawer extends StatelessWidget {
  final String title;
  const AppDrawer({super.key, this.title = 'BhoomiSetu'});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final roles = authProvider.roles;
    final isAuthenticated = authProvider.isAuthenticated;
    final userData = authProvider.userData;
    final fullName = userData?['fullName']?.toString().trim();
    final primaryEmail = userData?['primaryEmail']?.toString().trim();
    final primaryPhone = userData?['primaryPhone']?.toString().trim();
    final avatarUrl = userData?['avatarUrl']?.toString().trim();
    final canVerify =
        roles.contains('customer_service') || roles.contains('admin');
    final isAdmin = roles.contains('admin');

    void navigate(Widget screen) {
      Navigator.pop(context);
      Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
    }

    return Drawer(
      child: Column(
        children: [
          Container(
            color: Theme.of(context).colorScheme.primary,
            padding: EdgeInsets.fromLTRB(
              16,
              MediaQuery.of(context).padding.top + 16,
              16,
              16,
            ),
            child: Center(
              child: isAuthenticated
                  ? Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        CircleAvatar(
                          radius: 30,
                          backgroundColor: Colors.white24,
                          backgroundImage:
                              avatarUrl != null && avatarUrl.isNotEmpty
                                  ? NetworkImage(avatarUrl)
                                  : null,
                          child: (avatarUrl == null || avatarUrl.isEmpty)
                              ? Text(
                                  (fullName != null && fullName.isNotEmpty)
                                      ? fullName.substring(0, 1).toUpperCase()
                                      : 'B',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                )
                              : null,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          fullName != null && fullName.isNotEmpty
                              ? fullName
                              : title,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold),
                        ),
                        if (primaryPhone != null && primaryPhone.isNotEmpty)
                          Text(
                            primaryPhone,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                                color: Colors.white70, fontSize: 12),
                          ),
                        if (primaryEmail != null && primaryEmail.isNotEmpty)
                          Text(
                            primaryEmail,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                                color: Colors.white70, fontSize: 12),
                          ),
                      ],
                    )
                  : Text(
                      title,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold),
                    ),
            ),
          ),
          Expanded(
            child: ListView(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).padding.bottom + 24,
              ),
              children: [
                ListTile(
                  leading: const Icon(Icons.home_outlined),
                  title: const Text('Home'),
                  onTap: () => navigate(const HomeScreen()),
                ),
                if (isAuthenticated) ...[
                  ListTile(
                    leading: const Icon(Icons.assignment_outlined),
                    title: const Text('Buyer Requirements'),
                    onTap: () => navigate(const BuyerRequirementsScreen()),
                  ),
                  ListTile(
                    leading: const Icon(Icons.home_work_outlined),
                    title: const Text('My Listings'),
                    onTap: () => navigate(const MyListingsScreen()),
                  ),
                  ListTile(
                    leading: const Icon(Icons.add_business_outlined),
                    title: const Text('List Property'),
                    onTap: () => navigate(const CreatePropertyScreen()),
                  ),
                  ListTile(
                    leading: const Icon(Icons.handshake_outlined),
                    title: const Text('My Interests'),
                    onTap: () => navigate(const BuyerInterestsScreen()),
                  ),
                ],
                if (canVerify)
                  ListTile(
                    leading: const Icon(Icons.verified_outlined),
                    title: const Text('CS Dashboard'),
                    onTap: () => navigate(const CsDashboardScreen()),
                  ),
                if (isAdmin)
                  ListTile(
                    leading: const Icon(Icons.admin_panel_settings_outlined),
                    title: const Text('Admin Panel'),
                    onTap: () => navigate(const AdminDashboardScreen()),
                  ),
                if (isAuthenticated)
                  ListTile(
                    leading: const Icon(Icons.workspace_premium_outlined),
                    title: const Text('Subscriptions'),
                    onTap: () => navigate(const SubscriptionsScreen()),
                  ),
                if (isAuthenticated)
                  ListTile(
                    leading: const Icon(Icons.receipt_long_outlined),
                    title: const Text('Payment History'),
                    onTap: () => navigate(const PaymentsHistoryScreen()),
                  ),
                ListTile(
                  leading: const Icon(Icons.chat_bubble_outline),
                  title: const Text('AI Chat'),
                  onTap: () => navigate(const AIChatScreen()),
                ),
                ListTile(
                  leading: const Icon(Icons.notifications_outlined),
                  title: const Text('Notifications'),
                  onTap: () => navigate(const NotificationsScreen()),
                ),
                if (isAuthenticated)
                  ListTile(
                    leading: const Icon(Icons.person_outline),
                    title: const Text('Profile'),
                    onTap: () => navigate(const ProfileScreen()),
                  ),
                if (isAuthenticated)
                  ListTile(
                    leading: const Icon(Icons.settings_outlined),
                    title: const Text('Settings'),
                    onTap: () => navigate(const SettingsScreen()),
                  ),
                if (isAuthenticated)
                  ListTile(
                    leading: const Icon(Icons.logout),
                    title: const Text('Logout'),
                    onTap: () async {
                      await authProvider.logout();
                      Navigator.pop(context);
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                        (route) => false,
                      );
                    },
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
