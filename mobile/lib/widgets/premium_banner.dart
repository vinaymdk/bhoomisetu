import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PremiumBanner extends StatefulWidget {
  final VoidCallback? onUpgrade;
  
  const PremiumBanner({
    super.key,
    this.onUpgrade,
  });

  @override
  State<PremiumBanner> createState() => _PremiumBannerState();
}

class _PremiumBannerState extends State<PremiumBanner> {
  bool _dismissed = false;

  @override
  void initState() {
    super.initState();
    _checkDismissed();
  }

  Future<void> _checkDismissed() async {
    final prefs = await SharedPreferences.getInstance();
    final dismissed = prefs.getBool('premium_banner_dismissed') ?? false;
    if (mounted) {
      setState(() {
        _dismissed = dismissed;
      });
    }
  }

  Future<void> _dismiss() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('premium_banner_dismissed', true);
    if (mounted) {
      setState(() {
        _dismissed = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_dismissed) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).colorScheme.primary,
            Theme.of(context).colorScheme.primary.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        '✨ Unlock Premium Features',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Get featured listings, priority support, and advanced search capabilities',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: widget.onUpgrade,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Theme.of(context).colorScheme.primary,
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                        ),
                        child: const Text(
                          'Upgrade Now',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            top: 8,
            right: 8,
            child: IconButton(
              icon: const Icon(Icons.close, color: Colors.white),
              onPressed: _dismiss,
              tooltip: 'Dismiss',
            ),
          ),
        ],
      ),
    );
  }
}
