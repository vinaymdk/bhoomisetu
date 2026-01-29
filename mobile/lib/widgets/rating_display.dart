import 'package:flutter/material.dart';

class RatingDisplay extends StatelessWidget {
  final double rating;
  final int max;
  final bool showValue;

  const RatingDisplay({
    super.key,
    required this.rating,
    this.max = 5,
    this.showValue = true,
  });

  @override
  Widget build(BuildContext context) {
    final safeRating = rating.clamp(0, max).toDouble();
    final stars = List.generate(
      max,
      (index) => Icon(
        index + 1 <= safeRating.round() ? Icons.star : Icons.star_border,
        size: 16,
        color: Colors.amber.shade600,
      ),
    );

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...stars,
        if (showValue) ...[
          const SizedBox(width: 6),
          Text(
            safeRating.toStringAsFixed(1),
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ],
    );
  }
}
