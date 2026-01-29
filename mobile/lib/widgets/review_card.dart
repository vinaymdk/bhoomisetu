import 'package:flutter/material.dart';
import '../models/review.dart';
import 'rating_display.dart';

class ReviewCard extends StatelessWidget {
  final Review review;
  final bool canVote;
  final VoidCallback? onHelpful;
  final VoidCallback? onNotHelpful;

  const ReviewCard({
    super.key,
    required this.review,
    this.canVote = false,
    this.onHelpful,
    this.onNotHelpful,
  });

  @override
  Widget build(BuildContext context) {
    final reviewer = review.isAnonymous ? 'Anonymous' : (review.reviewerName ?? 'Reviewer');
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        review.title ?? 'Review',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$reviewer • ${_formatDate(review.createdAt)}',
                        style: const TextStyle(color: Colors.black54, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                RatingDisplay(rating: review.overallRating),
              ],
            ),
            const SizedBox(height: 10),
            if (review.isVerifiedPurchase)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.green.shade100,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'Verified',
                  style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ),
            const SizedBox(height: 8),
            Text(review.comment),
            if ((review.pros ?? '').isNotEmpty || (review.cons ?? '').isNotEmpty) ...[
              const SizedBox(height: 8),
              if ((review.pros ?? '').isNotEmpty)
                Text('Pros: ${review.pros}', style: const TextStyle(color: Colors.black87)),
              if ((review.cons ?? '').isNotEmpty)
                Text('Cons: ${review.cons}', style: const TextStyle(color: Colors.black87)),
            ],
            const SizedBox(height: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Helpful ${review.helpfulCount} • Not helpful ${review.notHelpfulCount}',
                  style: const TextStyle(color: Colors.black54, fontSize: 12),
                ),
                if (canVote) ...[
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 8,
                    children: [
                      TextButton(onPressed: onHelpful, child: const Text('Helpful')),
                      TextButton(onPressed: onNotHelpful, child: const Text('Not Helpful')),
                    ],
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
