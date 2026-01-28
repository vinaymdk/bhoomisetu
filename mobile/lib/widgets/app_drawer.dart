import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../screens/home/home_screen.dart';
import '../screens/search/search_screen.dart';
import '../screens/properties/my_listings_screen.dart';
import '../screens/properties/saved_properties_screen.dart';
import '../screens/buyer_requirements/buyer_requirements_screen.dart';
import '../screens/customer_service/cs_dashboard_screen.dart';
import '../screens/ai/ai_chat_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/profile/settings_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/subscriptions/subscriptions_screen.dart';
import '../screens/subscriptions/payments_history_screen.dart';

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
    final canList = roles.contains('seller') || roles.contains('agent');
    final canBuy = roles.contains('buyer') || roles.contains('admin');
    final canVerify = roles.contains('customer_service') || roles.contains('admin');

    void navigate(Widget screen) {
      Navigator.pop(context);
      Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
    }

    return Drawer(
        child: Column(
        children: [
          DrawerHeader(
            margin: EdgeInsets.zero,
            decoration: BoxDecoration(color: Theme.of(context).colorScheme.primary),
              child: Center(
                child: isAuthenticated
                    ? Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircleAvatar(
                            radius: 30,
                            backgroundColor: Colors.white24,
                            backgroundImage:
                                avatarUrl != null && avatarUrl.isNotEmpty ? NetworkImage(avatarUrl) : null,
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
                            fullName != null && fullName.isNotEmpty ? fullName : title,
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          if (primaryPhone != null && primaryPhone.isNotEmpty)
                            Text(
                              primaryPhone,
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                          if (primaryEmail != null && primaryEmail.isNotEmpty)
                            Text(
                              primaryEmail,
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                        ],
                      )
                    : Text(
                        title,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                      ),
              ),
          ),
          ListTile(
            leading: const Icon(Icons.dashboard_outlined),
            title: const Text('Dashboard'),
            onTap: () => navigate(const HomeScreen()),
          ),
          ListTile(
            leading: const Icon(Icons.search),
            title: const Text('Search'),
            onTap: () => navigate(const SearchScreen()),
          ),
          if (canBuy)
            ListTile(
              leading: const Icon(Icons.favorite_outline),
              title: const Text('Saved'),
              onTap: () => navigate(const SavedPropertiesScreen()),
            ),
          if (canBuy)
            ListTile(
              leading: const Icon(Icons.assignment_outlined),
              title: const Text('Buyer Requirements'),
              onTap: () => navigate(const BuyerRequirementsScreen()),
            ),
          if (canList)
            ListTile(
              leading: const Icon(Icons.home_work_outlined),
              title: const Text('My Listings'),
              onTap: () => navigate(const MyListingsScreen()),
            ),
          if (canVerify)
            ListTile(
              leading: const Icon(Icons.verified_outlined),
              title: const Text('CS Dashboard'),
              onTap: () => navigate(const CsDashboardScreen()),
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
          const Spacer(),
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
    );
  }
}
