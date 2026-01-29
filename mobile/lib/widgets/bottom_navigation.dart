// import 'package:flutter/material.dart';
// import 'package:flutter/foundation.dart';
// import 'package:provider/provider.dart';
// import '../providers/auth_provider.dart';
// import '../services/saved_properties_service.dart';
// import '../services/badge_service.dart';

// enum BottomNavItem {
//   home,
//   search,
//   list,
//   saved,
//   subscriptions,
//   payments,
//   profile,
//   cs,
// }

// class BottomNavigation extends StatefulWidget {
//   final BottomNavItem currentIndex;
//   final ValueChanged<BottomNavItem> onTap;

//   const BottomNavigation({
//     super.key,
//     required this.currentIndex,
//     required this.onTap,
//   });

//   @override
//   State<BottomNavigation> createState() => _BottomNavigationState();
// }

// class _BottomNavigationState extends State<BottomNavigation> {
//   final SavedPropertiesService _savedService = SavedPropertiesService();
//   final BadgeService _badgeService = BadgeService();
//   String _userId = 'guest';
//   late ValueNotifier<int> _countNotifier;
//   late ValueNotifier<bool> _badgeNotifier;
//   late ValueNotifier<int> _listCountNotifier;
//   late ValueNotifier<int> _reqsCountNotifier;
//   late ValueNotifier<bool> _listBadgeNotifier;
//   late ValueNotifier<bool> _reqsBadgeNotifier;

//   @override
//   void didChangeDependencies() {
//     super.didChangeDependencies();
//     final authProvider = Provider.of<AuthProvider>(context, listen: false);
//     final nextUserId = authProvider.userData?['id']?.toString() ?? 'guest';
//     if (nextUserId != _userId) {
//       _userId = nextUserId;
//       _countNotifier = _savedService.countNotifier(_userId);
//       _badgeNotifier = _savedService.badgeNotifier(_userId);
//       _listCountNotifier = _badgeService.listCountNotifier(_userId);
//       _reqsCountNotifier = _badgeService.reqsCountNotifier(_userId);
//       _listBadgeNotifier = _badgeService.listBadgeNotifier(_userId);
//       _reqsBadgeNotifier = _badgeService.reqsBadgeNotifier(_userId);
//       _savedService.getBadgeEnabled(_userId);
//       _savedService.refreshCount(_userId);
//       _badgeService.getListBadgeEnabled(_userId);
//       _badgeService.getReqsBadgeEnabled(_userId);
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     final authProvider = Provider.of<AuthProvider>(context);
//     final roles = authProvider.roles;
//     final isAuthenticated = authProvider.isAuthenticated;
//     final canList = roles.contains('seller') || roles.contains('agent');
//     final canBuy = roles.contains('buyer') || roles.contains('admin');
//     final canVerify = roles.contains('customer_service') || roles.contains('admin');

//     final navItems = <Widget>[
//       _buildNavItem(
//         context,
//         icon: Icons.home,
//         label: 'Home',
//         item: BottomNavItem.home,
//       ),
//       _buildNavItem(
//         context,
//         icon: Icons.search,
//         label: 'Search',
//         item: BottomNavItem.search,
//       ),
//       if (canList)
//         _buildCountNavItem(
//           context,
//           icon: Icons.add_business,
//           label: 'List',
//           item: BottomNavItem.list,
//           countListenable: _listCountNotifier,
//           showBadgeListenable: _listBadgeNotifier,
//         ),
//       if (isAuthenticated)
//         _buildSavedNavItem(
//           context,
//           icon: Icons.favorite_border,
//           label: 'Saved',
//           item: BottomNavItem.saved,
//         ),
//       if (canBuy)
//         _buildCountNavItem(
//           context,
//           icon: Icons.assignment_outlined,
//           label: 'Reqs',
//           item: BottomNavItem.profile,
//           countListenable: _reqsCountNotifier,
//           showBadgeListenable: _reqsBadgeNotifier,
//         ),
//       if (canVerify)
//         _buildNavItem(
//           context,
//           icon: Icons.support_agent,
//           label: 'CS',
//           item: BottomNavItem.cs,
//         ),
//     ];

//     return Container(
//       decoration: BoxDecoration(
//         color: Colors.white,
//         boxShadow: [
//           BoxShadow(
//             color: Colors.black.withOpacity(0.1),
//             blurRadius: 8,
//             offset: const Offset(0, -2),
//           ),
//         ],
//       ),
//       child: SafeArea(
//         child: Container(
//           height: 64,
//           padding: const EdgeInsets.symmetric(horizontal: 8),
//           child: Row(
//             mainAxisAlignment: MainAxisAlignment.spaceAround,
//             children: navItems,
//           ),
//         ),
//       ),
//     );
//   }

//   Widget _buildNavItem(
//     BuildContext context, {
//     required IconData icon,
//     required String label,
//     required BottomNavItem item,
//   }) {
//     final isSelected = widget.currentIndex == item;
//     final color =
//         isSelected ? Theme.of(context).colorScheme.primary : Colors.grey[600]!;

//     return Expanded(
//       child: InkWell(
//         onTap: () => widget.onTap(item),
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             Icon(
//               icon,
//               color: color,
//               size: 24,
//             ),
//             const SizedBox(height: 4),
//             Text(
//               label,
//               style: TextStyle(
//                 fontSize: 12,
//                 color: color,
//                 fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   Widget _buildSavedNavItem(
//     BuildContext context, {
//     required IconData icon,
//     required String label,
//     required BottomNavItem item,
//   }) {
//     return Expanded(
//       child: InkWell(
//         onTap: () => widget.onTap(item),
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             ValueListenableBuilder<bool>(
//               valueListenable: _badgeNotifier,
//               builder: (context, showBadge, _) {
//                 return ValueListenableBuilder<int>(
//                   valueListenable: _countNotifier,
//                   builder: (context, count, __) {
//                     final isSelected = widget.currentIndex == item;
//                     final color = isSelected
//                         ? Theme.of(context).colorScheme.primary
//                         : Colors.grey[600]!;
//                     return Stack(
//                       clipBehavior: Clip.none,
//                       children: [
//                         Icon(
//                           icon,
//                           color: color,
//                           size: 24,
//                         ),
//                         if (showBadge && count > 0)
//                           Positioned(
//                             right: -6,
//                             top: -4,
//                             child: Container(
//                               padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
//                               decoration: BoxDecoration(
//                                 color: Colors.redAccent,
//                                 borderRadius: BorderRadius.circular(10),
//                               ),
//                               child: Text(
//                                 count > 99 ? '99+' : count.toString(),
//                                 style: const TextStyle(color: Colors.white, fontSize: 9),
//                               ),
//                             ),
//                           ),
//                       ],
//                     );
//                   },
//                 );
//               },
//             ),
//             const SizedBox(height: 4),
//             Text(
//               label,
//               style: TextStyle(
//                 fontSize: 12,
//                 color: widget.currentIndex == item
//                     ? Theme.of(context).colorScheme.primary
//                     : Colors.grey[600]!,
//                 fontWeight: widget.currentIndex == item ? FontWeight.bold : FontWeight.normal,
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   Widget _buildCountNavItem(
//     BuildContext context, {
//     required IconData icon,
//     required String label,
//     required BottomNavItem item,
//     required ValueListenable<int> countListenable,
//     required ValueListenable<bool> showBadgeListenable,
//   }) {
//     return Expanded(
//       child: InkWell(
//         onTap: () => widget.onTap(item),
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             ValueListenableBuilder<bool>(
//               valueListenable: showBadgeListenable,
//               builder: (context, showBadge, _) {
//                 return ValueListenableBuilder<int>(
//                   valueListenable: countListenable,
//                   builder: (context, count, __) {
//                     final isSelected = widget.currentIndex == item;
//                     final color = isSelected
//                         ? Theme.of(context).colorScheme.primary
//                         : Colors.grey[600]!;
//                     return Stack(
//                       clipBehavior: Clip.none,
//                       children: [
//                         Icon(
//                           icon,
//                           color: color,
//                           size: 24,
//                         ),
//                         if (showBadge && count > 0)
//                           Positioned(
//                             right: -6,
//                             top: -4,
//                             child: Container(
//                               padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
//                               decoration: BoxDecoration(
//                                 color: Colors.redAccent,
//                                 borderRadius: BorderRadius.circular(10),
//                               ),
//                               child: Text(
//                                 count > 99 ? '99+' : count.toString(),
//                                 style: const TextStyle(color: Colors.white, fontSize: 9),
//                               ),
//                             ),
//                           ),
//                       ],
//                     );
//                   },
//                 );
//               },
//             ),
//             const SizedBox(height: 4),
//             Text(
//               label,
//               style: TextStyle(
//                 fontSize: 12,
//                 color: widget.currentIndex == item
//                     ? Theme.of(context).colorScheme.primary
//                     : Colors.grey[600]!,
//                 fontWeight: widget.currentIndex == item ? FontWeight.bold : FontWeight.normal,
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }

// import 'package:flutter/material.dart';
// import 'package:provider/provider.dart';
// import '../providers/auth_provider.dart';
// import '../services/saved_properties_service.dart';
// import '../services/badge_service.dart';

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart'; // ✅ REQUIRED for ValueListenable
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../services/saved_properties_service.dart';
import '../services/badge_service.dart';

enum BottomNavItem {
  home,
  search,
  list,
  saved,
  subscriptions,
  payments,
  profile,
  cs,
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
  final BadgeService _badgeService = BadgeService();

  String _userId = 'guest';

  // ✅ Initialized safely
  late ValueNotifier<int> _countNotifier;
  late ValueNotifier<bool> _badgeNotifier;
  late ValueNotifier<int> _listCountNotifier;
  late ValueNotifier<int> _reqsCountNotifier;
  late ValueNotifier<bool> _listBadgeNotifier;
  late ValueNotifier<bool> _reqsBadgeNotifier;

  @override
  void initState() {
    super.initState();

    // ✅ DEFAULT INITIALIZATION (prevents LateInitializationError)
    _countNotifier = ValueNotifier<int>(0);
    _badgeNotifier = ValueNotifier<bool>(false);
    _listCountNotifier = ValueNotifier<int>(0);
    _reqsCountNotifier = ValueNotifier<int>(0);
    _listBadgeNotifier = ValueNotifier<bool>(false);
    _reqsBadgeNotifier = ValueNotifier<bool>(false);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final nextUserId = authProvider.userData?['id']?.toString() ?? 'guest';

    if (nextUserId != _userId) {
      _userId = nextUserId;

      // ✅ Replace notifiers safely
      _countNotifier = _savedService.countNotifier(_userId);
      _badgeNotifier = _savedService.badgeNotifier(_userId);
      _listCountNotifier = _badgeService.listCountNotifier(_userId);
      _reqsCountNotifier = _badgeService.reqsCountNotifier(_userId);
      _listBadgeNotifier = _badgeService.listBadgeNotifier(_userId);
      _reqsBadgeNotifier = _badgeService.reqsBadgeNotifier(_userId);

      // refresh data
      _savedService.getBadgeEnabled(_userId);
      _savedService.refreshCount(_userId);
      _badgeService.getListBadgeEnabled(_userId);
      _badgeService.getReqsBadgeEnabled(_userId);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final roles = authProvider.roles;
    final isAuthenticated = authProvider.isAuthenticated;

    final canList = roles.contains('seller') || roles.contains('agent');
    final canBuy = roles.contains('buyer') || roles.contains('admin');
    final canVerify =
        roles.contains('customer_service') || roles.contains('admin');

    final navItems = <Widget>[
      _buildNavItem(context,
          icon: Icons.home, label: 'Home', item: BottomNavItem.home),
      _buildNavItem(context,
          icon: Icons.search, label: 'Search', item: BottomNavItem.search),
      if (canList)
        _buildCountNavItem(
          context,
          icon: Icons.add_business,
          label: 'List',
          item: BottomNavItem.list,
          countListenable: _listCountNotifier,
          showBadgeListenable: _listBadgeNotifier,
        ),
      if (isAuthenticated)
        _buildSavedNavItem(
          context,
          icon: Icons.favorite_border,
          label: 'Saved',
          item: BottomNavItem.saved,
        ),
      if (canBuy)
        _buildCountNavItem(
          context,
          icon: Icons.assignment_outlined,
          label: 'Reqs',
          item: BottomNavItem.profile,
          countListenable: _reqsCountNotifier,
          showBadgeListenable: _reqsBadgeNotifier,
        ),
      if (canVerify)
        _buildNavItem(context,
            icon: Icons.support_agent, label: 'CS', item: BottomNavItem.cs),
    ];

    return SafeArea(
      child: Container(
        height: 64,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: navItems,
        ),
      ),
    );
  }

  // ---------- UI HELPERS ----------

  Widget _buildNavItem(BuildContext context,
      {required IconData icon,
      required String label,
      required BottomNavItem item}) {
    final isSelected = widget.currentIndex == item;
    final color =
        isSelected ? Theme.of(context).colorScheme.primary : Colors.grey[600]!;

    return Expanded(
      child: InkWell(
        onTap: () => widget.onTap(item),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 4),
            Text(label,
                style: TextStyle(
                    fontSize: 12,
                    color: color,
                    fontWeight:
                        isSelected ? FontWeight.bold : FontWeight.normal)),
          ],
        ),
      ),
    );
  }

  Widget _buildSavedNavItem(BuildContext context,
      {required IconData icon,
      required String label,
      required BottomNavItem item}) {
    return Expanded(
      child: InkWell(
        onTap: () => widget.onTap(item),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ValueListenableBuilder<bool>(
              valueListenable: _badgeNotifier,
              builder: (_, showBadge, __) {
                return ValueListenableBuilder<int>(
                  valueListenable: _countNotifier,
                  builder: (_, count, ___) {
                    return _badgeIcon(context, icon, item, showBadge, count);
                  },
                );
              },
            ),
            const SizedBox(height: 4),
            _label(context, label, item),
          ],
        ),
      ),
    );
  }

  Widget _buildCountNavItem(BuildContext context,
      {required IconData icon,
      required String label,
      required BottomNavItem item,
      required ValueListenable<int> countListenable,
      required ValueListenable<bool> showBadgeListenable}) {
    return Expanded(
      child: InkWell(
        onTap: () => widget.onTap(item),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ValueListenableBuilder<bool>(
              valueListenable: showBadgeListenable,
              builder: (_, showBadge, __) {
                return ValueListenableBuilder<int>(
                  valueListenable: countListenable,
                  builder: (_, count, ___) {
                    return _badgeIcon(context, icon, item, showBadge, count);
                  },
                );
              },
            ),
            const SizedBox(height: 4),
            _label(context, label, item),
          ],
        ),
      ),
    );
  }

  Widget _badgeIcon(BuildContext context, IconData icon, BottomNavItem item,
      bool showBadge, int count) {
    final isSelected = widget.currentIndex == item;
    final color =
        isSelected ? Theme.of(context).colorScheme.primary : Colors.grey[600]!;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Icon(icon, color: color, size: 24),
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
  }

  Widget _label(BuildContext context, String label, BottomNavItem item) {
    final isSelected = widget.currentIndex == item;
    return Text(
      label,
      style: TextStyle(
        fontSize: 12,
        color: isSelected
            ? Theme.of(context).colorScheme.primary
            : Colors.grey[600]!,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
    );
  }
}
