import 'package:flutter/foundation.dart';

final ValueNotifier<int> notificationsBadgeCount = ValueNotifier<int>(0);

void setNotificationsBadgeCount(int count) {
  notificationsBadgeCount.value = count;
}
