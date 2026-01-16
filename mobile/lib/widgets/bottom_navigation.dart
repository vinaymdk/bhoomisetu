import 'package:flutter/material.dart';

enum BottomNavItem {
  home,
  search,
  list,
  saved,
  profile,
}

class BottomNavigation extends StatelessWidget {
  final BottomNavItem currentIndex;
  final ValueChanged<BottomNavItem> onTap;

  const BottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

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
              _buildNavItem(
                context,
                icon: Icons.favorite_border,
                label: 'Saved',
                item: BottomNavItem.saved,
              ),
              _buildNavItem(
                context,
                icon: Icons.person,
                label: 'Profile',
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
    final isSelected = currentIndex == item;
    final color = isSelected
        ? Theme.of(context).colorScheme.primary
        : Colors.grey[600]!;

    return Expanded(
      child: InkWell(
        onTap: () => onTap(item),
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
}
