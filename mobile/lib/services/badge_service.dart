import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class BadgeService {
  static final Map<String, ValueNotifier<int>> _listCountNotifiers = {};
  static final Map<String, ValueNotifier<int>> _reqsCountNotifiers = {};
  static final Map<String, ValueNotifier<bool>> _listBadgeNotifiers = {};
  static final Map<String, ValueNotifier<bool>> _reqsBadgeNotifiers = {};

  String _listBadgeKey(String userId) => 'listBadgeEnabled_$userId';
  String _reqsBadgeKey(String userId) => 'reqsBadgeEnabled_$userId';

  ValueNotifier<int> listCountNotifier(String userId) {
    return _listCountNotifiers.putIfAbsent(userId, () => ValueNotifier<int>(0));
  }

  ValueNotifier<int> reqsCountNotifier(String userId) {
    return _reqsCountNotifiers.putIfAbsent(userId, () => ValueNotifier<int>(0));
  }

  ValueNotifier<bool> listBadgeNotifier(String userId) {
    return _listBadgeNotifiers.putIfAbsent(userId, () => ValueNotifier<bool>(true));
  }

  ValueNotifier<bool> reqsBadgeNotifier(String userId) {
    return _reqsBadgeNotifiers.putIfAbsent(userId, () => ValueNotifier<bool>(true));
  }

  Future<void> setListCount(String userId, int count) async {
    listCountNotifier(userId).value = count;
  }

  Future<void> setReqsCount(String userId, int count) async {
    reqsCountNotifier(userId).value = count;
  }

  Future<bool> getListBadgeEnabled(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final enabled = prefs.getBool(_listBadgeKey(userId)) ?? true;
    listBadgeNotifier(userId).value = enabled;
    return enabled;
  }

  Future<bool> getReqsBadgeEnabled(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final enabled = prefs.getBool(_reqsBadgeKey(userId)) ?? true;
    reqsBadgeNotifier(userId).value = enabled;
    return enabled;
  }

  Future<void> setListBadgeEnabled(String userId, bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_listBadgeKey(userId), enabled);
    listBadgeNotifier(userId).value = enabled;
  }

  Future<void> setReqsBadgeEnabled(String userId, bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_reqsBadgeKey(userId), enabled);
    reqsBadgeNotifier(userId).value = enabled;
  }
}

