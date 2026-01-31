import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/property.dart';
import '../services/saved_properties_service.dart';
import '../providers/auth_provider.dart';

class PropertyCard extends StatefulWidget {
  final Property property;
  final bool showFeaturedBadge;
  final VoidCallback? onTap;

  const PropertyCard({
    super.key,
    required this.property,
    this.showFeaturedBadge = true,
    this.onTap,
  });

  @override
  State<PropertyCard> createState() => _PropertyCardState();
}

class _PropertyCardState extends State<PropertyCard> {
  final SavedPropertiesService _savedService = SavedPropertiesService();
  bool _isSaved = false;
  String _userId = 'guest';

  @override
  void initState() {
    super.initState();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _userId = authProvider.userData?['id']?.toString() ?? 'guest';
    _loadSaved();
  }

  Future<void> _loadSaved() async {
    final saved = await _savedService.isSaved(_userId, widget.property.id);
    if (mounted) {
      setState(() => _isSaved = saved);
    }
  }

  String _formatPrice(double price) {
    if (price >= 10000000) {
      return '₹${(price / 10000000).toStringAsFixed(2)}Cr';
    } else if (price >= 100000) {
      return '₹${(price / 100000).toStringAsFixed(2)}L';
    }
    return '₹${price.toStringAsFixed(0)}';
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

  String _formatPostedDate(DateTime date) {
    final diffDays = DateTime.now().difference(date).inDays;
    if (diffDays <= 0) return 'Posted today';
    if (diffDays == 1) return 'Posted 1 day ago';
    return 'Posted $diffDays days ago';
  }

  @override
  Widget build(BuildContext context) {
    PropertyImage? primaryImage;
    if (widget.property.images != null && widget.property.images!.isNotEmpty) {
      try {
        primaryImage = widget.property.images!.firstWhere(
          (img) => img.isPrimary,
          orElse: () => widget.property.images!.first,
        );
      } catch (e) {
        primaryImage = widget.property.images!.first;
      }
    }
    
    final imageUrl = primaryImage?.imageUrl ?? '';
    final location = '${widget.property.location.city}, ${widget.property.location.state}';

    return Card(
      margin: EdgeInsets.zero,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: widget.onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with badges
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                  child: imageUrl.isNotEmpty
                      ? Image.network(
                          imageUrl,
                          height: 210,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            height: 210,
                            color: Colors.grey[200],
                            child: const Icon(Icons.image, size: 64, color: Colors.grey),
                          ),
                        )
                      : Container(
                          height: 210,
                          color: Colors.grey[200],
                          child: const Icon(Icons.image, size: 64, color: Colors.grey),
                        ),
                ),
                if (widget.showFeaturedBadge && widget.property.isFeatured)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primary,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'FEATURED',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                if (widget.property.listingType == 'rent')
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'For Rent',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                if (widget.property.listingType == 'sale')
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'For Sale',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                Positioned(
                  bottom: 8,
                  right: 8,
                  child: GestureDetector(
                    onTap: () async {
                      final next = await _savedService.toggle(_userId, widget.property.id);
                      if (mounted) setState(() => _isSaved = next);
                    },
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.45),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        _isSaved ? Icons.bookmark : Icons.bookmark_border,
                        size: 18,
                        color: _isSaved ? Colors.amber.shade700 : Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            
            // Content
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and Price
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          widget.property.title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _formatPrice(widget.property.price),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 8),
                  
                  // Location
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          location,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.grey,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 6),

                  Wrap(
                    spacing: 12,
                    runSpacing: 4,
                    children: [
                      Text(
                        _formatPostedDate(widget.property.createdAt),
                        style: const TextStyle(fontSize: 12, color: Colors.black54),
                      ),
                      if (widget.property.ageOfConstruction != null)
                        Text(
                          '${widget.property.ageOfConstruction} years old',
                          style: const TextStyle(fontSize: 12, color: Colors.black54),
                        ),
                    ],
                  ),
                  
                  const SizedBox(height: 12),
                  
                  // Details
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        if (widget.property.bedrooms != null) ...[
                          const Icon(Icons.bed, size: 16, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            '${widget.property.bedrooms} BHK',
                            style: const TextStyle(fontSize: 14, color: Colors.grey),
                          ),
                          const SizedBox(width: 16),
                        ],
                        if (widget.property.bathrooms != null) ...[
                          const Icon(Icons.bathtub, size: 16, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            '${widget.property.bathrooms} Bath',
                            style: const TextStyle(fontSize: 14, color: Colors.grey),
                          ),
                          const SizedBox(width: 16),
                        ],
                        const Icon(Icons.square_foot, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          '${widget.property.area} ${widget.property.areaUnit}',
                          style: const TextStyle(fontSize: 14, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 12),
                  
                  // Footer
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          widget.property.propertyType,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '❤ ${_formatCount(widget.property.interestedCount)}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.redAccent,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          if (widget.property.viewsCount > 0)
                            Text(
                              '${_formatCount(widget.property.viewsCount)} views',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
