import 'package:flutter/material.dart';
import '../services/notifications_service.dart';

class NotificationsIconButton extends StatefulWidget {
  final VoidCallback onTap;

  const NotificationsIconButton({super.key, required this.onTap});

  @override
  State<NotificationsIconButton> createState() => _NotificationsIconButtonState();
}

class _NotificationsIconButtonState extends State<NotificationsIconButton> {
  final NotificationsService _service = NotificationsService();
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _loadUnreadCount();
  }

  Future<void> _loadUnreadCount() async {
    try {
      final response = await _service.list(page: 1, limit: 1);
      if (!mounted) return;
      setState(() {
        _unreadCount = response['unreadCount'] as int? ?? 0;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _unreadCount = 0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: widget.onTap,
      icon: Stack(
        clipBehavior: Clip.none,
        children: [
          const Icon(Icons.notifications_outlined),
          if (_unreadCount > 0)
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
                  _unreadCount > 99 ? '99+' : '$_unreadCount',
                  style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
