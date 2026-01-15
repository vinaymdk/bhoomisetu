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
          _dashboardData = await _homeService.getDashboardData();
        } catch (e) {
          // If we get a 401 after refresh attempt, logout and fetch public data
          if (e.toString().contains('401') || e.toString().contains('Unauthorized')) {
            await authProvider.logout();
            _homeData = await _homeService.getHomeData();
          } else {
            rethrow;
          }
        }
      } else {
        // Get public home data for non-authenticated users
        _homeData = await _homeService.getHomeData();
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '').replaceAll('DioException [bad response]: ', '');
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
      case BottomNavItem.saved:
        // TODO: Navigate to saved properties screen
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Saved properties screen coming soon')),
        );
        break;
      case BottomNavItem.profile:
        // TODO: Navigate to profile screen
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile screen coming soon')),
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
    
    final data = isAuthenticated ? _dashboardData : _homeData;
    final featuredProperties = data?.featuredProperties ?? [];
    final newProperties = data?.newProperties ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bhoomisetu'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Notifications coming soon')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () {
              _handleNavTap(BottomNavItem.profile);
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 64, color: Colors.red),
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
                )
              : RefreshIndicator(
                  onRefresh: _loadHomeData,
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Premium Banner (only for authenticated users)
                        if (isAuthenticated) const PremiumBanner(),

                        // AI Search Bar
                        AISearchBar(onSearch: _handleSearch),

                        // New Properties Section
                        if (newProperties.isNotEmpty) ...[
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                          SizedBox(
                            height: 280,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              itemCount: newProperties.length,
                              itemBuilder: (context, index) {
                                return SizedBox(
                                  width: 300,
                                  child: Padding(
                                    padding: const EdgeInsets.only(right: 16),
                                    child: PropertyCard(
                                      property: newProperties[index],
                                      showFeaturedBadge: false,
                                      onTap: () {
                                        // TODO: Navigate to property details
                                      },
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Featured Properties Section
                        if (featuredProperties.isNotEmpty) ...[
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: GridView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.75,
                                crossAxisSpacing: 16,
                                mainAxisSpacing: 16,
                              ),
                              itemCount: featuredProperties.length,
                              itemBuilder: (context, index) {
                                return PropertyCard(
                                  property: featuredProperties[index],
                                  showFeaturedBadge: true,
                                  onTap: () {
                                    // TODO: Navigate to property details
                                  },
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Empty State
                        if (newProperties.isEmpty && featuredProperties.isEmpty)
                          const Padding(
                            padding: EdgeInsets.all(32),
                            child: Center(
                              child: Column(
                                children: [
                                  Icon(Icons.home_outlined, size: 64, color: Colors.grey),
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

                        // Bottom padding for navigation bar
                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
                ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentNavItem,
        onTap: _handleNavTap,
      ),
    );
  }
}
