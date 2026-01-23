import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/saved_properties_service.dart';

enum BottomNavItem {
  home,
  search,
  list,
  saved,
  profile,
}

class BottomNavigation extends StatefulWidget {
  final BottomNavItem currentIndex;
  final ValueChanged<BottomNavItem> onTap;

  const BottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  State<BottomNavigation> createState() => _BottomNavigationState();
}

class _BottomNavigationState extends State<BottomNavigation> {
  final SavedPropertiesService _savedService = SavedPropertiesService();
  String _userId = 'guest';
  late ValueNotifier<int> _countNotifier;
  late ValueNotifier<bool> _badgeNotifier;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final nextUserId = authProvider.userData?['id']?.toString() ?? 'guest';
    if (nextUserId != _userId) {
      _userId = nextUserId;
      _countNotifier = _savedService.countNotifier(_userId);
      _badgeNotifier = _savedService.badgeNotifier(_userId);
      _savedService.getBadgeEnabled(_userId);
      _savedService.refreshCount(_userId);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Container(
          height: 64,
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                context,
                icon: Icons.home,
                label: 'Home',
                item: BottomNavItem.home,
              ),
              _buildNavItem(
                context,
                icon: Icons.search,
                label: 'Search',
                item: BottomNavItem.search,
              ),
              _buildNavItem(
                context,
                icon: Icons.add_business,
                label: 'List',
                item: BottomNavItem.list,
              ),
              _buildSavedNavItem(
                context,
                icon: Icons.favorite_border,
                label: 'Saved',
                item: BottomNavItem.saved,
              ),
              _buildNavItem(
                context,
                icon: Icons.assignment_outlined,
                label: 'Reqs',
                item: BottomNavItem.profile,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required BottomNavItem item,
  }) {
    final isSelected = widget.currentIndex == item;
    final color =
        isSelected ? Theme.of(context).colorScheme.primary : Colors.grey[600]!;

    return Expanded(
      child: InkWell(
        onTap: () => widget.onTap(item),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: color,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: color,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSavedNavItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required BottomNavItem item,
  }) {
    return Expanded(
      child: InkWell(
        onTap: () => widget.onTap(item),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ValueListenableBuilder<bool>(
              valueListenable: _badgeNotifier,
              builder: (context, showBadge, _) {
                return ValueListenableBuilder<int>(
                  valueListenable: _countNotifier,
                  builder: (context, count, __) {
                    final isSelected = widget.currentIndex == item;
                    final color = isSelected
                        ? Theme.of(context).colorScheme.primary
                        : Colors.grey[600]!;
                    return Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Icon(
                          icon,
                          color: color,
                          size: 24,
                        ),
                        if (showBadge && count > 0)
                          Positioned(
                            right: -6,
                            top: -4,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.redAccent,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                count > 99 ? '99+' : count.toString(),
                                style: const TextStyle(color: Colors.white, fontSize: 9),
                              ),
                            ),
                          ),
                      ],
                    );
                  },
                );
              },
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: widget.currentIndex == item
                    ? Theme.of(context).colorScheme.primary
                    : Colors.grey[600]!,
                fontWeight: widget.currentIndex == item ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
