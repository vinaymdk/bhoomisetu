import '../config/api_client.dart';

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String? messageEnglish;
  final String? messageTelugu;
  final String type;
  final String priority;
  final String status;
  final DateTime createdAt;
  final DateTime? readAt;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.priority,
    required this.status,
    required this.createdAt,
    this.messageEnglish,
    this.messageTelugu,
    this.readAt,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'].toString(),
      title: json['title']?.toString() ?? '',
      message: json['message']?.toString() ?? '',
      messageEnglish: json['messageEnglish']?.toString(),
      messageTelugu: json['messageTelugu']?.toString(),
      type: json['type']?.toString() ?? 'general',
      priority: json['priority']?.toString() ?? 'normal',
      status: json['status']?.toString() ?? 'pending',
      createdAt: DateTime.parse(json['createdAt']?.toString() ?? DateTime.now().toIso8601String()),
      readAt: json['readAt'] != null ? DateTime.tryParse(json['readAt'].toString()) : null,
    );
  }
}

class NotificationPreferences {
  final bool pushEnabled;
  final bool smsEnabled;
  final bool emailEnabled;
  final bool propertyMatchEnabled;
  final bool priceDropEnabled;
  final bool viewingReminderEnabled;
  final bool subscriptionRenewalEnabled;
  final bool csFollowupEnabled;
  final bool interestExpressionEnabled;
  final bool mediationUpdateEnabled;
  final bool aiChatEscalationEnabled;

  NotificationPreferences({
    required this.pushEnabled,
    required this.smsEnabled,
    required this.emailEnabled,
    required this.propertyMatchEnabled,
    required this.priceDropEnabled,
    required this.viewingReminderEnabled,
    required this.subscriptionRenewalEnabled,
    required this.csFollowupEnabled,
    required this.interestExpressionEnabled,
    required this.mediationUpdateEnabled,
    required this.aiChatEscalationEnabled,
  });

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) {
    return NotificationPreferences(
      pushEnabled: json['pushEnabled'] == true,
      smsEnabled: json['smsEnabled'] == true,
      emailEnabled: json['emailEnabled'] == true,
      propertyMatchEnabled: json['propertyMatchEnabled'] == true,
      priceDropEnabled: json['priceDropEnabled'] == true,
      viewingReminderEnabled: json['viewingReminderEnabled'] == true,
      subscriptionRenewalEnabled: json['subscriptionRenewalEnabled'] == true,
      csFollowupEnabled: json['csFollowupEnabled'] == true,
      interestExpressionEnabled: json['interestExpressionEnabled'] == true,
      mediationUpdateEnabled: json['mediationUpdateEnabled'] == true,
      aiChatEscalationEnabled: json['aiChatEscalationEnabled'] == true,
    );
  }
}

class NotificationsService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> list({int page = 1, int limit = 20, bool unreadOnly = false}) async {
    final response = await _apiClient.dio.get(
      '/notifications',
      queryParameters: {'page': page, 'limit': limit, 'unreadOnly': unreadOnly},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<void> markRead(String id) async {
    await _apiClient.dio.put('/notifications/$id/read');
  }

  Future<void> markAllRead() async {
    await _apiClient.dio.put('/notifications/read-all');
  }

  Future<void> deleteOne(String id) async {
    await _apiClient.dio.delete('/notifications/$id');
  }

  Future<void> deleteMany(List<String> ids) async {
    await _apiClient.dio.post('/notifications/bulk-delete', data: {'ids': ids});
  }

  Future<void> deleteAll() async {
    await _apiClient.dio.delete('/notifications');
  }

  Future<NotificationPreferences> getPreferences() async {
    final response = await _apiClient.dio.get('/notifications/preferences');
    return NotificationPreferences.fromJson(response.data as Map<String, dynamic>);
  }

  Future<NotificationPreferences> updatePreferences(Map<String, dynamic> updates) async {
    final response = await _apiClient.dio.put('/notifications/preferences', data: updates);
    return NotificationPreferences.fromJson(response.data as Map<String, dynamic>);
  }

  Future<String> resolveMessage(NotificationItem item, String localeCode) async {
    if (localeCode == 'te' && item.messageTelugu != null) {
      return item.messageTelugu!;
    }
    if (localeCode == 'en' && item.messageEnglish != null) {
      return item.messageEnglish!;
    }
    return item.message;
  }
}
