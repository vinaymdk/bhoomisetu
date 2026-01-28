import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/home_service.dart';
import '../../models/property.dart';
import '../../widgets/premium_banner.dart';
import '../../widgets/ai_search_bar.dart';
import '../../widgets/property_card.dart';
import '../../widgets/bottom_navigation.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';
import '../auth/login_screen.dart';
import '../properties/property_details_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../profile/profile_screen.dart';
import '../ai/ai_chat_screen.dart';
import '../profile/settings_screen.dart';
import '../notifications/notifications_screen.dart';
import '../subscriptions/subscriptions_screen.dart';
import '../subscriptions/payments_history_screen.dart';
import '../../widgets/notifications_icon_button.dart';
import '../../widgets/app_drawer.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final HomeService _homeService = HomeService();
  HomeData? _homeData;
  DashboardData? _dashboardData;
  bool _isLoading = true;
  String? _error;
  BottomNavItem _currentNavItem = BottomNavItem.home;

  @override
  void initState() {
    super.initState();
    _loadHomeData();
  }

  Future<void> _loadHomeData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      if (authProvider.isAuthenticated) {
        // Get dashboard data for authenticated users
        // Token refresh is handled automatically by the API client interceptor
        try {
          _dashboardData = await _homeService
              .getDashboardData()
              .timeout(const Duration(seconds: 15));
        } catch (e) {
          // If we get a 401 after refresh attempt, logout and fetch public data
          if (e.toString().contains('401') ||
              e.toString().contains('Unauthorized')) {
            await authProvider.logout();
            _homeData = await _homeService
                .getHomeData()
                .timeout(const Duration(seconds: 15));
          } else {
            rethrow;
          }
        }
      } else {
        // Get public home data for non-authenticated users
        _homeData = await _homeService
            .getHomeData()
            .timeout(const Duration(seconds: 15));
      }
    } catch (e) {
      final errorMessage = e.toString();
      final formattedError = _formatError(errorMessage);
      setState(() {
        _error = formattedError;
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  String _formatError(String message) {
    if (message.contains('TimeoutException')) {
      return 'Unable to load properties. Please try again later.';
    }
    if (message.contains('SocketException') ||
        message.contains('Connection refused')) {
      return 'Connection error. Please check your internet connection.';
    }
    return message
        .replaceAll('Exception: ', '')
        .replaceAll('DioException [bad response]: ', '');
  }

  void _handleNavTap(BottomNavItem item) {
    setState(() {
      _currentNavItem = item;
    });

    // Handle navigation to different screens
    switch (item) {
      case BottomNavItem.home:
        // Already on home
        break;
      case BottomNavItem.search:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const SearchScreen()),
        );
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
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const MyListingsScreen()),
        );
        break;
      case BottomNavItem.saved:
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) => const SavedPropertiesScreen()),
        );
        break;
      case BottomNavItem.subscriptions:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const SubscriptionsScreen()),
        );
        break;
      case BottomNavItem.payments:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const PaymentsHistoryScreen()),
        );
        break;
      case BottomNavItem.profile:
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final roles = authProvider.roles;
        final canBuy = roles.contains('buyer') || roles.contains('admin');
        if (canBuy) {
          Navigator.push(
            context,
            MaterialPageRoute(
                builder: (context) => const BuyerRequirementsScreen()),
          );
          return;
        }
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile screen coming soon')),
        );
        break;
      case BottomNavItem.cs:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const CsDashboardScreen()),
        );
        break;
    }
  }

  void _handleSearch(String query) {
    // TODO: Navigate to search results
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Searching for: $query')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final isAuthenticated = authProvider.isAuthenticated;
    final roles = authProvider.roles;
    final canBuy = roles.contains('buyer') || roles.contains('admin');

    final data = isAuthenticated ? _dashboardData : _homeData;
    final featuredProperties = data?.featuredProperties ?? [];
    final newProperties = data?.newProperties ?? [];

    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('BhoomiSetu'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          NotificationsIconButton(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
              );
            },
          ),
          if (isAuthenticated)
            PopupMenuButton<String>(
              icon: const Icon(Icons.account_circle_outlined),
              onSelected: (value) async {
                if (value == 'profile') {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => const ProfileScreen()),
                  );
                } else if (value == 'settings') {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => const SettingsScreen()),
                  );
                } else if (value == 'logout') {
                  await authProvider.logout();
                  if (!mounted) return;
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(
                        builder: (context) => const LoginScreen()),
                    (route) => false,
                  );
                }
              },
              itemBuilder: (context) => const [
                PopupMenuItem(value: 'profile', child: Text('Profile')),
                PopupMenuItem(value: 'settings', child: Text('Settings')),
                PopupMenuItem(value: 'logout', child: Text('Logout')),
              ],
            ),
        ],
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline,
                              size: 64, color: Colors.red),
                          const SizedBox(height: 16),
                          Text(
                            _error!,
                            style: const TextStyle(color: Colors.red),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _loadHomeData,
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _loadHomeData,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.only(bottom: 100),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Premium Banner (only for authenticated users)
                          if (isAuthenticated)
                            PremiumBanner(
                              onUpgrade: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const SubscriptionsScreen()),
                                );
                              },
                            ),

                          // AI Search Bar
                          AISearchBar(onSearch: _handleSearch),

                          if (isAuthenticated && canBuy)
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 12),
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Colors.blue.shade50,
                                  borderRadius: BorderRadius.circular(14),
                                  border:
                                      Border.all(color: Colors.blue.shade100),
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          const Text(
                                            'Post Your Requirement',
                                            style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 6),
                                          Text(
                                            'Let us match verified listings based on your budget and location.',
                                            style: TextStyle(
                                                color:
                                                    Colors.blueGrey.shade700),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    ElevatedButton(
                                      onPressed: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                              builder: (_) =>
                                                  const BuyerRequirementsScreen()),
                                        );
                                      },
                                      child: const Text('View'),
                                    ),
                                  ],
                                ),
                              ),
                            ),

                          // New Properties Section
                          if (newProperties.isNotEmpty) ...[
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 8),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'New Properties',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: () {
                                      // TODO: Navigate to all new properties
                                    },
                                    child: const Text('See All'),
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: SizedBox(
                                height: 410,
                                width: double.infinity,
                                child: ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12),
                                  itemCount: newProperties.length,
                                  itemBuilder: (context, index) {
                                    return SizedBox(
                                      width: 300,
                                      child: Padding(
                                        padding:
                                            const EdgeInsets.only(right: 8),
                                        child: PropertyCard(
                                          property: newProperties[index],
                                          showFeaturedBadge: false,
                                          onTap: () {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (_) =>
                                                    PropertyDetailsScreen(
                                                  propertyId:
                                                      newProperties[index].id,
                                                  initialTab:
                                                      BottomNavItem.home,
                                                ),
                                              ),
                                            );
                                          },
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Featured Properties Section
                          if (featuredProperties.isNotEmpty) ...[
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 8),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Featured Properties',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: () {
                                      // TODO: Navigate to all featured properties
                                    },
                                    child: const Text('See All'),
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 12),
                              child: GridView.builder(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                gridDelegate:
                                    const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  mainAxisExtent: 410,
                                  crossAxisSpacing: 12,
                                  mainAxisSpacing: 12,
                                ),
                                itemCount: featuredProperties.length,
                                itemBuilder: (context, index) {
                                  return PropertyCard(
                                    property: featuredProperties[index],
                                    showFeaturedBadge: true,
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => PropertyDetailsScreen(
                                            propertyId:
                                                featuredProperties[index].id,
                                            initialTab: BottomNavItem.home,
                                          ),
                                        ),
                                      );
                                    },
                                  );
                                },
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Empty State
                          if (newProperties.isEmpty &&
                              featuredProperties.isEmpty)
                            const Padding(
                              padding: EdgeInsets.all(32),
                              child: Center(
                                child: Column(
                                  children: [
                                    Icon(Icons.home_outlined,
                                        size: 64, color: Colors.grey),
                                    SizedBox(height: 16),
                                    Text(
                                      'No properties available',
                                      style: TextStyle(
                                        fontSize: 16,
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const AIChatScreen()),
          );
        },
        backgroundColor: Theme.of(context).colorScheme.secondary,
        foregroundColor: Theme.of(context).colorScheme.onSecondary,
        child: const Icon(Icons.chat_bubble_outline),
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: BottomNavigation(
          currentIndex: _currentNavItem,
          onTap: _handleNavTap,
        ),
      ),
    );
  }
}
