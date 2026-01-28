import 'package:flutter/material.dart';
import '../services/notifications_service.dart';
import '../state/notifications_badge.dart';

class NotificationsIconButton extends StatefulWidget {
  final VoidCallback onTap;

  const NotificationsIconButton({super.key, required this.onTap});

  @override
  State<NotificationsIconButton> createState() => _NotificationsIconButtonState();
}

class _NotificationsIconButtonState extends State<NotificationsIconButton> {
  final NotificationsService _service = NotificationsService();

  @override
  void initState() {
    super.initState();
    _loadUnreadCount();
  }

  Future<void> _loadUnreadCount() async {
    try {
      final response = await _service.list(page: 1, limit: 1);
      if (!mounted) return;
      final count = response['unreadCount'] as int? ?? 0;
      setNotificationsBadgeCount(count);
    } catch (_) {
      if (!mounted) return;
      setNotificationsBadgeCount(0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: notificationsBadgeCount,
      builder: (context, count, _) {
        final badgeCount = count;
        return IconButton(
          onPressed: widget.onTap,
          icon: Stack(
            clipBehavior: Clip.none,
            children: [
              const Icon(Icons.notifications_outlined),
              if (badgeCount > 0)
                Positioned(
                  right: -6,
                  top: -6,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.redAccent,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      badgeCount > 99 ? '99+' : '$badgeCount',
                      style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
