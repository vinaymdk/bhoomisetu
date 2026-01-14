import 'package:flutter/material.dart';
import '../models/property.dart';

class PropertyCard extends StatelessWidget {
  final Property property;
  final bool showFeaturedBadge;
  final VoidCallback? onTap;

  const PropertyCard({
    super.key,
    required this.property,
    this.showFeaturedBadge = true,
    this.onTap,
  });

  String _formatPrice(double price) {
    if (price >= 10000000) {
      return '₹${(price / 10000000).toStringAsFixed(2)}Cr';
    } else if (price >= 100000) {
      return '₹${(price / 100000).toStringAsFixed(2)}L';
    }
    return '₹${price.toStringAsFixed(0)}';
  }

  @override
  Widget build(BuildContext context) {
    PropertyImage? primaryImage;
    if (property.images != null && property.images!.isNotEmpty) {
      try {
        primaryImage = property.images!.firstWhere(
          (img) => img.isPrimary,
          orElse: () => property.images!.first,
        );
      } catch (e) {
        primaryImage = property.images!.first;
      }
    }
    
    final imageUrl = primaryImage?.imageUrl ?? '';
    final location = '${property.location.city}, ${property.location.state}';

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
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
                if (showFeaturedBadge && property.isFeatured)
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
                if (property.listingType == 'rent')
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
                          property.title,
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
                        _formatPrice(property.price),
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
                  
                  const SizedBox(height: 12),
                  
                  // Details
                  Row(
                    children: [
                      if (property.bedrooms != null) ...[
                        const Icon(Icons.bed, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          '${property.bedrooms} BHK',
                          style: const TextStyle(fontSize: 14, color: Colors.grey),
                        ),
                        const SizedBox(width: 16),
                      ],
                      if (property.bathrooms != null) ...[
                        const Icon(Icons.bathtub, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          '${property.bathrooms} Bath',
                          style: const TextStyle(fontSize: 14, color: Colors.grey),
                        ),
                        const SizedBox(width: 16),
                      ],
                      const Icon(Icons.square_foot, size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(
                        '${property.area} ${property.areaUnit}',
                        style: const TextStyle(fontSize: 14, color: Colors.grey),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 12),
                  
                  // Footer
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          property.propertyType,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                      ),
                      if (property.viewsCount > 0)
                        Text(
                          '${property.viewsCount} views',
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
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
