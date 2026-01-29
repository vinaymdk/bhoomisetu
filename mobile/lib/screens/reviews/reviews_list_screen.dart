import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/review.dart';
import '../../providers/auth_provider.dart';
import '../../services/reviews_service.dart';
import '../../widgets/review_card.dart';
import 'create_review_screen.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../subscriptions/subscriptions_screen.dart';
import '../subscriptions/payments_history_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';

class ReviewsListScreen extends StatefulWidget {
  final String? propertyId;
  final String? revieweeId;
  final String? title;
  final BottomNavItem initialTab;

  const ReviewsListScreen({
    super.key,
    this.propertyId,
    this.revieweeId,
    this.title,
    this.initialTab = BottomNavItem.home,
  });

  @override
  State<ReviewsListScreen> createState() => _ReviewsListScreenState();
}

class _ReviewsListScreenState extends State<ReviewsListScreen> {
  final ReviewsService _service = ReviewsService();
  bool _loading = true;
  String? _error;
  int _page = 1;
  int _total = 0;
  final List<Review> _reviews = [];
  Review? _myReview;

  @override
  void initState() {
    super.initState();
    _load(reset: true);
    _loadMyReview();
  }

  Future<void> _load({bool reset = false}) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response = widget.propertyId != null
          ? await _service.getByProperty(widget.propertyId!,
              page: reset ? 1 : _page + 1, limit: 10)
          : widget.revieweeId != null
              ? await _service.getBySeller(widget.revieweeId!,
                  page: reset ? 1 : _page + 1, limit: 10)
              : await _service.list(page: reset ? 1 : _page + 1, limit: 10);
      setState(() {
        if (reset) {
          _reviews
            ..clear()
            ..addAll(response.reviews);
        } else {
          _reviews.addAll(response.reviews);
        }
        _page = response.page;
        _total = response.total;
      });
    } catch (e) {
      setState(() {
        _error = e
            .toString()
            .replaceAll('Exception: ', '')
            .replaceAll('DioException [bad response]: ', '');
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _loadMyReview() async {
    if (widget.propertyId == null) return;
    try {
      final response = await _service.listMine(
          propertyId: widget.propertyId, limit: 1, page: 1);
      if (mounted) {
        setState(() => _myReview =
            response.reviews.isNotEmpty ? response.reviews.first : null);
      }
    } catch (_) {
      // Ignore failures; review button will remain visible.
    }
  }

  Future<void> _vote(String reviewId, bool helpful) async {
    await _service.voteHelpful(reviewId, helpful);
    await _load(reset: true);
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
            const SnackBar(
                content: Text('Seller/Agent role required to list properties')),
          );
          return;
        }
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const MyListingsScreen()),
        );
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
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final roles = authProvider.roles;
        final canBuy = roles.contains('buyer') || roles.contains('admin');
        if (canBuy) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const BuyerRequirementsScreen()),
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
          MaterialPageRoute(builder: (_) => const CsDashboardScreen()),
        );
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final isBuyer = authProvider.roles.contains('buyer') ||
        authProvider.roles.contains('admin');
    final canEditReview =
        _myReview == null || ['pending', 'flagged'].contains(_myReview!.status);
    final title = widget.title ??
        (widget.propertyId != null ? 'Property Reviews' : 'Reviews');
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      floatingActionButton: isBuyer
          ? FloatingActionButton.extended(
              onPressed: canEditReview
                  ? () async {
                      await Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => CreateReviewScreen(
                            propertyId: widget.propertyId,
                            revieweeId: widget.revieweeId,
                            reviewId: _myReview?.id,
                          ),
                        ),
                      );
                      await _loadMyReview();
                      await _load(reset: true);
                    }
                  : null,
              label: Text(_myReview != null
                  ? (canEditReview ? 'Edit Review' : 'Review submitted')
                  : 'Write Review'),
              icon: const Icon(Icons.rate_review),
            )
          : null,
      bottomNavigationBar: BottomNavigation(
        currentIndex: widget.initialTab,
        onTap: _handleNavTap,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _reviews.isEmpty
                  ? const Center(child: Text('No reviews yet.'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _reviews.length + 1,
                      itemBuilder: (context, index) {
                        if (index == _reviews.length) {
                          if (_reviews.length >= _total) {
                            return const SizedBox.shrink();
                          }
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: ElevatedButton(
                              onPressed: () => _load(reset: false),
                              child: const Text('Load more'),
                            ),
                          );
                        }
                        final review = _reviews[index];
                        final currentUserId = authProvider.userData?['id']?.toString();
                        final canVote = currentUserId != null && currentUserId != review.reviewerId;
                        return ReviewCard(
                          review: review,
                          canVote: canVote,
                          onHelpful: () => _vote(review.id, true),
                          onNotHelpful: () => _vote(review.id, false),
                        );
                      },
                    ),
    );
  }
}
