// import 'package:flutter/foundation.dart';
// import 'package:shared_preferences/shared_preferences.dart';

// class SavedPropertiesService {
//   static final Map<String, ValueNotifier<int>> _countNotifiers = {};
//   static final Map<String, ValueNotifier<bool>> _badgeNotifiers = {};

//   String _key(String userId) => 'savedPropertyIds_$userId';
//   String _badgeKey(String userId) => 'savedBadgeEnabled_$userId';

//   ValueNotifier<int> countNotifier(String userId) {
//     return _countNotifiers.putIfAbsent(userId, () => ValueNotifier<int>(0));
//   }

//   ValueNotifier<bool> badgeNotifier(String userId) {
//     return _badgeNotifiers.putIfAbsent(userId, () => ValueNotifier<bool>(true));
//   }

//   Future<void> refreshCount(String userId) async {
//     final ids = await getSavedIds(userId);
//     countNotifier(userId).value = ids.length;
//   }

//   Future<List<String>> getSavedIds(String userId) async {
//     final prefs = await SharedPreferences.getInstance();
//     final ids = prefs.getStringList(_key(userId)) ?? [];
//     countNotifier(userId).value = ids.length;
//     return ids;
//   }

//   Future<bool> isSaved(String userId, String propertyId) async {
//     final ids = await getSavedIds(userId);
//     return ids.contains(propertyId);
//   }

//   Future<void> save(String userId, String propertyId) async {
//     final prefs = await SharedPreferences.getInstance();
//     final ids = prefs.getStringList(_key(userId)) ?? [];
//     if (!ids.contains(propertyId)) {
//       ids.add(propertyId);
//       await prefs.setStringList(_key(userId), ids);
//     }
//     countNotifier(userId).value = ids.length;
//   }

//   Future<void> remove(String userId, String propertyId) async {
//     final prefs = await SharedPreferences.getInstance();
//     final ids = prefs.getStringList(_key(userId)) ?? [];
//     ids.remove(propertyId);
//     await prefs.setStringList(_key(userId), ids);
//     countNotifier(userId).value = ids.length;
//   }

//   Future<bool> toggle(String userId, String propertyId) async {
//     final prefs = await SharedPreferences.getInstance();
//     final ids = prefs.getStringList(_key(userId)) ?? [];
//     bool next;
//     if (ids.contains(propertyId)) {
//       ids.remove(propertyId);
//       next = false;
//     } else {
//       ids.add(propertyId);
//       next = true;
//     }
//     await prefs.setStringList(_key(userId), ids);
//     countNotifier(userId).value = ids.length;
//     return next;
//   }

//   Future<bool> getBadgeEnabled(String userId) async {
//     final prefs = await SharedPreferences.getInstance();
//     final enabled = prefs.getBool(_badgeKey(userId)) ?? true;
//     badgeNotifier(userId).value = enabled;
//     return enabled;
//   }

//   Future<void> setBadgeEnabled(String userId, bool enabled) async {
//     final prefs = await SharedPreferences.getInstance();
//     await prefs.setBool(_badgeKey(userId), enabled);
//     badgeNotifier(userId).value = enabled;
//   }
// }

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SavedPropertiesService {
  static final Map<String, ValueNotifier<int>> _countNotifiers = {};
  static final Map<String, ValueNotifier<bool>> _badgeNotifiers = {};

  String _key(String userId) => 'savedPropertyIds_$userId';
  String _badgeKey(String userId) => 'savedBadgeEnabled_$userId';

  ValueNotifier<int> countNotifier(String userId) {
    return _countNotifiers.putIfAbsent(userId, () => ValueNotifier<int>(0));
  }

  ValueNotifier<bool> badgeNotifier(String userId) {
    return _badgeNotifiers.putIfAbsent(userId, () => ValueNotifier<bool>(true));
  }

  Future<void> refreshCount(String userId) async {
    final ids = await getSavedIds(userId);
    countNotifier(userId).value = ids.length;
  }

  Future<List<String>> getSavedIds(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final ids = prefs.getStringList(_key(userId)) ?? [];
    countNotifier(userId).value = ids.length;
    return ids;
  }

  Future<bool> isSaved(String userId, String propertyId) async {
    final ids = await getSavedIds(userId);
    return ids.contains(propertyId);
  }

  Future<void> save(String userId, String propertyId) async {
    final prefs = await SharedPreferences.getInstance();
    final ids = prefs.getStringList(_key(userId)) ?? [];
    if (!ids.contains(propertyId)) {
      ids.add(propertyId);
      await prefs.setStringList(_key(userId), ids);
    }
    countNotifier(userId).value = ids.length;
  }

  Future<void> remove(String userId, String propertyId) async {
    final prefs = await SharedPreferences.getInstance();
    final ids = prefs.getStringList(_key(userId)) ?? [];
    ids.remove(propertyId);
    await prefs.setStringList(_key(userId), ids);
    countNotifier(userId).value = ids.length;
  }

  Future<bool> toggle(String userId, String propertyId) async {
    final prefs = await SharedPreferences.getInstance();
    final ids = prefs.getStringList(_key(userId)) ?? [];
    bool next;
    if (ids.contains(propertyId)) {
      ids.remove(propertyId);
      next = false;
    } else {
      ids.add(propertyId);
      next = true;
    }
    await prefs.setStringList(_key(userId), ids);
    countNotifier(userId).value = ids.length;
    return next;
  }

  Future<bool> getBadgeEnabled(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final enabled = prefs.getBool(_badgeKey(userId)) ?? true;
    badgeNotifier(userId).value = enabled;
    return enabled;
  }

  Future<void> setBadgeEnabled(String userId, bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_badgeKey(userId), enabled);
    badgeNotifier(userId).value = enabled;
  }
}
