import '../config/api_client.dart';

class SupportChatSession {
  final String id;
  final String supportRole;
  final String status;
  final String? typingByUserId;
  final DateTime? typingAt;

  SupportChatSession({
    required this.id,
    required this.supportRole,
    required this.status,
    this.typingByUserId,
    this.typingAt,
  });

  factory SupportChatSession.fromJson(Map<String, dynamic> json) {
    return SupportChatSession(
      id: json['id'].toString(),
      supportRole: json['supportRole']?.toString() ?? 'customer_service',
      status: json['status']?.toString() ?? 'open',
      typingByUserId: json['typingByUserId']?.toString(),
      typingAt: json['typingAt'] != null ? DateTime.tryParse(json['typingAt'].toString()) : null,
    );
  }
}

class SupportChatMessage {
  final String id;
  final String sessionId;
  final String senderId;
  final String senderRole;
  final String senderName;
  final String? senderAvatarUrl;
  final String content;
  final bool isDeleted;
  final bool isEdited;
  final DateTime createdAt;
  final DateTime? deliveredAt;
  final DateTime? readAt;
  final String status;

  SupportChatMessage({
    required this.id,
    required this.sessionId,
    required this.senderId,
    required this.senderRole,
    required this.senderName,
    this.senderAvatarUrl,
    required this.content,
    required this.isDeleted,
    required this.isEdited,
    required this.createdAt,
    this.deliveredAt,
    this.readAt,
    required this.status,
  });

  factory SupportChatMessage.fromJson(Map<String, dynamic> json) {
    return SupportChatMessage(
      id: json['id'].toString(),
      sessionId: json['sessionId'].toString(),
      senderId: json['senderId'].toString(),
      senderRole: json['senderRole']?.toString() ?? 'user',
      senderName: json['senderName']?.toString() ?? 'Support',
      senderAvatarUrl: json['senderAvatarUrl']?.toString(),
      content: json['content']?.toString() ?? '',
      isDeleted: json['isDeleted'] == true,
      isEdited: json['isEdited'] == true,
      createdAt: DateTime.parse(json['createdAt']?.toString() ?? DateTime.now().toIso8601String()),
      deliveredAt: json['deliveredAt'] != null ? DateTime.tryParse(json['deliveredAt'].toString()) : null,
      readAt: json['readAt'] != null ? DateTime.tryParse(json['readAt'].toString()) : null,
      status: json['status']?.toString() ?? 'sent',
    );
  }
}

class SupportChatAdminSession {
  final String id;
  final String userId;
  final String userName;
  final String? userEmail;
  final String? userAvatarUrl;
  final String supportRole;
  final String status;
  final int unreadCount;

  SupportChatAdminSession({
    required this.id,
    required this.userId,
    required this.userName,
    this.userEmail,
    this.userAvatarUrl,
    required this.supportRole,
    required this.status,
    required this.unreadCount,
  });

  factory SupportChatAdminSession.fromJson(Map<String, dynamic> json) {
    return SupportChatAdminSession(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      userName: json['userName']?.toString() ?? 'User',
      userEmail: json['userEmail']?.toString(),
      userAvatarUrl: json['userAvatarUrl']?.toString(),
      supportRole: json['supportRole']?.toString() ?? 'buyer',
      status: json['status']?.toString() ?? 'open',
      unreadCount: json['unreadCount'] as int? ?? 0,
    );
  }
}

class SupportChatService {
  final ApiClient _apiClient = ApiClient();

  Future<SupportChatSession> getOrCreateSession(String supportRole) async {
    final response = await _apiClient.dio.post('/support-chat/sessions', data: {
      'supportRole': supportRole,
    });
    return SupportChatSession.fromJson(response.data as Map<String, dynamic>);
  }

  Future<List<String>> getAllowedRoles() async {
    final response = await _apiClient.dio.get('/support-chat/roles');
    return (response.data as List<dynamic>).map((role) => role.toString()).toList();
  }

  Future<List<SupportChatAdminSession>> listAdminSessions() async {
    final response = await _apiClient.dio.get('/support-chat/admin/sessions');
    final data = response.data as List<dynamic>;
    return data.map((item) => SupportChatAdminSession.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<int> getUnreadCount() async {
    final response = await _apiClient.dio.get('/support-chat/unread-count');
    return (response.data as Map<String, dynamic>)['total'] as int? ?? 0;
  }

  Future<Map<String, dynamic>> getUnreadCounts() async {
    final response = await _apiClient.dio.get('/support-chat/unread-counts');
    return response.data as Map<String, dynamic>;
  }

  Future<List<SupportChatMessage>> listMessages(String sessionId, {int limit = 50, String? before}) async {
    final response = await _apiClient.dio.get(
      '/support-chat/sessions/$sessionId/messages',
      queryParameters: {
        'limit': limit,
        if (before != null) 'before': before,
      },
    );
    final data = response.data as List<dynamic>;
    return data.map((item) => SupportChatMessage.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<void> markSessionRead(String sessionId) async {
    await _apiClient.dio.post('/support-chat/sessions/$sessionId/read');
  }

  Future<SupportChatMessage> sendMessage(String sessionId, String content) async {
    final response = await _apiClient.dio.post('/support-chat/sessions/$sessionId/messages', data: {
      'content': content,
      'messageType': 'text',
    });
    return SupportChatMessage.fromJson(response.data as Map<String, dynamic>);
  }

  Future<SupportChatMessage> editMessage(String messageId, String content) async {
    final response = await _apiClient.dio.post('/support-chat/messages/$messageId/edit', data: {
      'content': content,
    });
    return SupportChatMessage.fromJson(response.data as Map<String, dynamic>);
  }

  Future<SupportChatMessage> deleteMessage(String messageId) async {
    final response = await _apiClient.dio.post('/support-chat/messages/$messageId/delete');
    return SupportChatMessage.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> setTyping(String sessionId, bool isTyping) async {
    await _apiClient.dio.post('/support-chat/sessions/$sessionId/typing', data: {
      'isTyping': isTyping,
    });
  }

  Future<Map<String, dynamic>> getTyping(String sessionId) async {
    final response = await _apiClient.dio.get('/support-chat/sessions/$sessionId/typing');
    return response.data as Map<String, dynamic>;
  }
}
