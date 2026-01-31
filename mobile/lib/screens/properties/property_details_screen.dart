import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../services/properties_service.dart';
import '../../models/property.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../../providers/auth_provider.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../subscriptions/subscriptions_screen.dart';
import '../subscriptions/payments_history_screen.dart';
import '../../services/saved_properties_service.dart';
import '../../services/mediation_service.dart';
import '../reviews/reviews_list_screen.dart';
import '../reviews/create_review_screen.dart';
import '../../services/reviews_service.dart';
import '../../models/review.dart';
import '../../services/app_config_service.dart';

class PropertyDetailsScreen extends StatefulWidget {
  final String propertyId;
  final BottomNavItem initialTab;
  const PropertyDetailsScreen({
    super.key,
    required this.propertyId,
    this.initialTab = BottomNavItem.home,
  });

  @override
  State<PropertyDetailsScreen> createState() => _PropertyDetailsScreenState();
}

class _PropertyDetailsScreenState extends State<PropertyDetailsScreen> {
  final PropertiesService _service = PropertiesService();
  final SavedPropertiesService _savedService = SavedPropertiesService();
  final MediationService _mediationService = MediationService();
  final ReviewsService _reviewsService = ReviewsService();
  Property? _property;
  bool _loading = true;
  String? _error;
  int _activeImage = 0;
  final PageController _pageController = PageController();
  bool _isSaved = false;
  String _userId = 'guest';
  bool _interestSubmitted = false;
  Review? _existingReview;
  bool _isLiked = false;
  int _likeCount = 0;
  String? _mapboxToken;

  @override
  void initState() {
    super.initState();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _userId = authProvider.userData?['id']?.toString() ?? 'guest';
    _load();
    _loadMapToken();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final property = await _service.getPropertyById(widget.propertyId);
      final isSaved = await _savedService.isSaved(_userId, widget.propertyId);
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final isBuyer = authProvider.roles.contains('buyer') || authProvider.roles.contains('admin');
      if (isBuyer) {
        try {
          final response = await _mediationService.getMyInterests(propertyId: widget.propertyId, limit: 1, page: 1);
          _interestSubmitted = response.interests.isNotEmpty;
        } catch (_) {
          _interestSubmitted = false;
        }
        try {
          final reviewResponse = await _reviewsService.listMine(propertyId: widget.propertyId, limit: 1, page: 1);
          _existingReview = reviewResponse.reviews.isNotEmpty ? reviewResponse.reviews.first : null;
        } catch (_) {
          _existingReview = null;
        }
      }
      setState(() {
        _property = property;
        _isSaved = isSaved;
        _isLiked = property.isLiked;
        _likeCount = property.interestedCount;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '').replaceAll('DioException [bad response]: ', '');
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _loadMapToken() async {
    try {
      final token = await AppConfigService().getMapboxToken();
      if (mounted) setState(() => _mapboxToken = token);
    } catch (_) {
      if (mounted) setState(() => _mapboxToken = null);
    }
  }

  String _formatPostedDate(DateTime date) {
    final diffDays = DateTime.now().difference(date).inDays;
    if (diffDays <= 0) return 'Posted today';
    if (diffDays == 1) return 'Posted 1 day ago';
    return 'Posted $diffDays days ago';
  }

  String? _formatOptionalDate(dynamic value) {
    if (value == null) return null;
    final parsed = DateTime.tryParse(value.toString());
    return parsed != null ? '${parsed.day}/${parsed.month}/${parsed.year}' : value.toString();
  }

  String? _formatCurrency(dynamic value) {
    if (value == null) return null;
    final parsed = num.tryParse(value.toString());
    if (parsed == null) return value.toString();
    return '₹${parsed.toStringAsFixed(0)}';
  }

  Widget _buildInfoChip(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Text(
        text,
        style: const TextStyle(fontSize: 12, color: Colors.black87),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_error != null || _property == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Property Details'),
          backgroundColor: Theme.of(context).colorScheme.primary,
          foregroundColor: Colors.white,
        ),
        body: Center(child: Text(_error ?? 'Property not found')),
      );
    }

    final property = _property!;
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isBuyer = authProvider.roles.contains('buyer') || authProvider.roles.contains('admin');
    final canLike = authProvider.isAuthenticated;
    final canEditReview = _existingReview == null || ['pending', 'flagged'].contains(_existingReview!.status);
    final listingLabel = property.listingType == 'rent' ? 'For Rent' : 'For Sale';
    final features = property.features ?? {};
    final availableFrom =
        features['availableFrom'] ?? features['available_from'] ?? features['availableDate'];
    final leaseDuration =
        features['leaseDuration'] ?? features['lease_duration'] ?? features['leaseTenure'];
    final securityDeposit =
        features['securityDeposit'] ?? features['security_deposit'] ?? features['deposit'];
    final canShowMap = property.location.latitude != null &&
        property.location.longitude != null &&
        _mapboxToken != null;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Property Details'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(_isSaved ? Icons.bookmark : Icons.bookmark_border),
            onPressed: () async {
              final next = await _savedService.toggle(_userId, widget.propertyId);
              if (mounted) {
                setState(() {
                  _isSaved = next;
                });
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                OutlinedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Back to properties'),
                ),
                const SizedBox(width: 12),
                                Text(
                                  '${_formatCount(_likeCount)} likes',
                                  style: const TextStyle(color: Colors.black54),
                                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: Icon(
                    _isLiked ? Icons.favorite : Icons.favorite_border,
                    color: Colors.redAccent,
                  ),
                  onPressed: () async {
                    if (!canLike) return;
                    final response = await _service.toggleLike(property.id);
                    if (!mounted) return;
                    setState(() {
                      _isLiked = response['isLiked'] == true;
                      _likeCount = (response['interestedCount'] as num?)?.toInt() ?? _likeCount;
                    });
                  },
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              property.title,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              '${property.location.address}, ${property.location.city}, ${property.location.state}',
              style: const TextStyle(color: Colors.black54),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildInfoChip(listingLabel),
                _buildInfoChip(_formatPostedDate(property.createdAt)),
                if (property.ageOfConstruction != null)
                  _buildInfoChip('${property.ageOfConstruction} years old'),
                if (property.furnishingStatus != null && property.furnishingStatus!.isNotEmpty)
                  _buildInfoChip(property.furnishingStatus!),
                if (_formatOptionalDate(availableFrom) != null)
                  _buildInfoChip('Available: ${_formatOptionalDate(availableFrom)}'),
                if (leaseDuration != null)
                  _buildInfoChip('Lease: $leaseDuration'),
                if (_formatCurrency(securityDeposit) != null)
                  _buildInfoChip('Deposit: ${_formatCurrency(securityDeposit)}'),
              ],
            ),
            const SizedBox(height: 16),
            if (property.images != null && property.images!.isNotEmpty) ...[
              SizedBox(
                height: 220,
                child: PageView.builder(
                  controller: _pageController,
                  itemCount: property.images!.length,
                  onPageChanged: (index) => setState(() => _activeImage = index),
                  itemBuilder: (context, index) {
                    final img = property.images![index];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: GestureDetector(
                          onTap: () => _openImageViewer(index, property.images!),
                          child: Image.network(
                            img.imageUrl,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Wrap(
                  spacing: 6,
                  children: List.generate(
                    property.images!.length,
                    (index) => Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: index == _activeImage ? Colors.blueAccent : Colors.grey.shade300,
                      ),
                    ),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  _infoRow('Price', '₹${property.price.toStringAsFixed(0)}'),
                  _infoRow('Posted', _formatPostedDate(property.createdAt)),
                  _infoRow('Area', '${property.area} ${property.areaUnit}'),
                  _infoRow('Listing Type', listingLabel),
                  _infoRow('Property Type', property.propertyType),
                  if (property.ageOfConstruction != null)
                    _infoRow('Property Age', '${property.ageOfConstruction} years'),
                  if (property.furnishingStatus != null && property.furnishingStatus!.isNotEmpty)
                    _infoRow('Furnishing', property.furnishingStatus!),
                  if (_formatOptionalDate(availableFrom) != null)
                    _infoRow('Available From', _formatOptionalDate(availableFrom)!),
                  if (leaseDuration != null) _infoRow('Lease Duration', leaseDuration.toString()),
                  if (_formatCurrency(securityDeposit) != null)
                    _infoRow('Security Deposit', _formatCurrency(securityDeposit)!),
                  if (property.bedrooms != null) _infoRow('Bedrooms', '${property.bedrooms}'),
                  if (property.bathrooms != null) _infoRow('Bathrooms', '${property.bathrooms}'),
                ],
              ),
            ),
            const SizedBox(height: 12),
            if (property.description != null && property.description!.isNotEmpty) ...[
              const Text('Description', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Text(property.description!),
            ],
            if (canShowMap) ...[
              const SizedBox(height: 16),
              const Text('Location Map', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              SizedBox(
                height: 220,
                child: FlutterMap(
                  options: MapOptions(
                    initialCenter: LatLng(
                      property.location.latitude!,
                      property.location.longitude!,
                    ),
                    initialZoom: 14,
                    interactionOptions: const InteractionOptions(flags: InteractiveFlag.none),
                  ),
                  children: [
                    TileLayer(
                      urlTemplate:
                          'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=$_mapboxToken',
                      userAgentPackageName: 'com.bhoomisetu.app',
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: LatLng(
                            property.location.latitude!,
                            property.location.longitude!,
                          ),
                          width: 36,
                          height: 36,
                          child: const Icon(Icons.location_pin, color: Colors.red, size: 36),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Reviews & Feedback', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text(
                    'Verified feedback to help evaluate this listing.',
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: [
                      OutlinedButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => ReviewsListScreen(
                                propertyId: property.id,
                                revieweeId: property.sellerId,
                                title: 'Property Reviews',
                                initialTab: widget.initialTab,
                              ),
                            ),
                          );
                        },
                        child: const Text('View Reviews'),
                      ),
                      if (isBuyer)
                        ElevatedButton(
                          onPressed: (canEditReview)
                              ? () async {
                            await Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => CreateReviewScreen(
                                  propertyId: property.id,
                                  revieweeId: property.sellerId,
                                  reviewId: _existingReview?.id,
                                ),
                              ),
                            );
                            await _load();
                          }
                              : null,
                          child: Text(
                            _existingReview != null
                                ? (canEditReview ? 'Edit Review' : 'Review submitted')
                                : 'Write Review',
                          ),
                        ),
                      if (isBuyer && _existingReview != null && !canEditReview)
                        Chip(
                          label: const Text('Review submitted'),
                          backgroundColor: Colors.green.shade50,
                          labelStyle: const TextStyle(color: Colors.green),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            if (isBuyer && !_interestSubmitted) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue.shade100),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Express Interest',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Customer service will mediate and connect you after verification.',
                      style: TextStyle(color: Colors.blueGrey.shade700),
                    ),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      onPressed: () => _showInterestDialog(property.id),
                      child: const Text('Submit Interest'),
                    ),
                  ],
                ),
              ),
            ],
            if (isBuyer && _interestSubmitted) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue.shade100),
                ),
                child: const Text(
                  'Your interest request was submitted. Customer Service will contact you shortly.',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: widget.initialTab,
        onTap: _handleNavTap,
      ),
    );
  }

  Future<void> _showInterestDialog(String propertyId) async {
    String message = '';
    String type = 'viewing';
    String priority = 'normal';
    await showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Express Interest'),
          content: SingleChildScrollView(
            child: Column(
              children: [
                DropdownButtonFormField<String>(
                  value: type,
                  decoration: const InputDecoration(labelText: 'Interest Type'),
                  items: const [
                    DropdownMenuItem(value: 'viewing', child: Text('Viewing')),
                    DropdownMenuItem(value: 'offer', child: Text('Offer')),
                    DropdownMenuItem(value: 'negotiation', child: Text('Negotiation')),
                    DropdownMenuItem(value: 'serious_intent', child: Text('Serious Intent')),
                  ],
                  onChanged: (value) => type = value ?? 'viewing',
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  value: priority,
                  decoration: const InputDecoration(labelText: 'Priority'),
                  items: const [
                    DropdownMenuItem(value: 'low', child: Text('Low')),
                    DropdownMenuItem(value: 'normal', child: Text('Normal')),
                    DropdownMenuItem(value: 'high', child: Text('High')),
                    DropdownMenuItem(value: 'urgent', child: Text('Urgent')),
                  ],
                  onChanged: (value) => priority = value ?? 'normal',
                ),
                const SizedBox(height: 10),
                TextField(
                  decoration: const InputDecoration(labelText: 'Message (optional)'),
                  maxLines: 3,
                  onChanged: (value) => message = value,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                try {
                  await _mediationService.expressInterest({
                    'propertyId': propertyId,
                    'message': message.trim().isEmpty ? null : message.trim(),
                    'interestType': type,
                    'priority': priority,
                  });
                  if (context.mounted) {
                    Navigator.pop(context);
                    setState(() => _interestSubmitted = true);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Interest submitted successfully.')),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to submit interest: $e')),
                    );
                  }
                }
              },
              child: const Text('Submit'),
            ),
          ],
        );
      },
    );
  }

  void _openImageViewer(int initialIndex, List<PropertyImage> images) {
    showDialog<void>(
      context: context,
      barrierColor: Colors.black87,
      builder: (context) {
        final controller = PageController(initialPage: initialIndex);
        int activeIndex = initialIndex;
        return StatefulBuilder(
          builder: (context, setState) {
            return Dialog(
              insetPadding: const EdgeInsets.all(12),
              backgroundColor: Colors.transparent,
              child: Stack(
                children: [
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.75,
                    width: double.infinity,
                    child: PageView.builder(
                      controller: controller,
                      itemCount: images.length,
                      onPageChanged: (index) => setState(() => activeIndex = index),
                      itemBuilder: (context, index) {
                        return InteractiveViewer(
                          maxScale: 5,
                          child: Image.network(images[index].imageUrl, fit: BoxFit.contain),
                        );
                      },
                    ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                  Positioned(
                    bottom: 12,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${activeIndex + 1} / ${images.length}',
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.black54)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  String _formatCount(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    }
    if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}k';
    }
    return count.toString();
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
            const SnackBar(content: Text('Seller/Agent role required to list properties')),
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
}
