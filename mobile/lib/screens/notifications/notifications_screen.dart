import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../config/api_config.dart';
import '../../providers/auth_provider.dart';
import '../../services/notifications_service.dart';
import '../../services/support_chat_service.dart';
import '../../state/notifications_badge.dart';
import '../../widgets/bottom_navigation.dart';
import '../../widgets/app_drawer.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';
import 'notification_settings_screen.dart';
import '../subscriptions/subscriptions_screen.dart';
import '../subscriptions/payments_history_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen>
    with SingleTickerProviderStateMixin {
  final NotificationsService _service = NotificationsService();
  final ScrollController _scrollController = ScrollController();
  final ScrollController _chatScrollController = ScrollController();
  final TextEditingController _chatController = TextEditingController();
  final FocusNode _chatFocusNode = FocusNode();
  final SupportChatService _supportChatService = SupportChatService();
  bool _loading = true;
  bool _unreadOnly = false;
  String? _error;
  List<NotificationItem> _items = [];
  int _unreadCount = 0;
  BottomNavItem _currentNavItem = BottomNavItem.home;
  String _selectedChatUser = 'customer_service';
  bool _isSupportUser = false;
  bool _isRemoteTyping = false;
  bool _showChatScrollDown = false;
  bool _loadingEarlier = false;
  int _chatUnreadTotal = 0;
  Map<String, int> _unreadByRole = {};
  int _activeUnseenCount = 0;
  bool _isChatInputFocused = true;
  Map<String, bool> _rolesOnline = {};
  TabController? _tabController;
  SupportChatSession? _activeSession;
  final Map<String, List<SupportChatMessage>> _chatMessages = {};
  bool _chatLoading = false;
  Timer? _typingTimer;
  io.Socket? _chatSocket;
  String? _joinedSessionId;
  List<Map<String, dynamic>> _chatUsers = [];
  final Map<String, String> _roleLabels = const {
    'customer_service': 'Customer Service',
    'buyer': 'Buyer Support',
    'seller': 'Seller Support',
    'agent': 'Agent Support',
  };

  @override
  void initState() {
    super.initState();
    _loadNotifications();
    _refreshUnreadCounts();
    _loadChatUsers();
    _chatScrollController.addListener(_handleChatScroll);
    _tabController = TabController(length: 2, vsync: this);
    _tabController?.addListener(() {
      if (mounted) setState(() {});
    });
    _connectChatSocket();
    _chatFocusNode.addListener(() {
      if (!mounted) return;
      setState(() => _isChatInputFocused = _chatFocusNode.hasFocus);
      if (_chatFocusNode.hasFocus && _activeSession != null) {
        _activeUnseenCount = 0;
        _supportChatService.markSessionRead(_activeSession!.id);
        _refreshUnreadCounts();
      }
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _ensureChatSession();
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _chatScrollController.dispose();
    _chatController.dispose();
    _chatFocusNode.dispose();
    _typingTimer?.cancel();
    _tabController?.dispose();
    _chatSocket?.disconnect();
    _chatSocket?.dispose();
    super.dispose();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response = await _service.list(unreadOnly: _unreadOnly);
      final list = (response['notifications'] as List<dynamic>? ?? [])
          .map(
              (item) => NotificationItem.fromJson(item as Map<String, dynamic>))
          .toList();
      setState(() {
        _items = list;
        _unreadCount = response['unreadCount'] as int? ?? 0;
      });
      setNotificationsBadgeCount(_unreadCount);
    } catch (e) {
      setState(() => _error = 'Unable to load notifications.');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _markAllRead() async {
    try {
      await _service.markAllRead();
      await _loadNotifications();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('All notifications marked as read.')),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Failed to mark all notifications as read.')),
        );
      }
    }
  }

  Future<void> _markRead(NotificationItem item) async {
    if (item.readAt != null) return;
    try {
      await _service.markRead(item.id);
      setState(() {
        _items = _items
            .map(
              (current) => current.id == item.id
                  ? NotificationItem(
                      id: current.id,
                      title: current.title,
                      message: current.message,
                      messageEnglish: current.messageEnglish,
                      messageTelugu: current.messageTelugu,
                      type: current.type,
                      priority: current.priority,
                      status: 'read',
                      createdAt: current.createdAt,
                      readAt: DateTime.now(),
                    )
                  : current,
            )
            .toList();
        _unreadCount = _unreadCount > 0 ? _unreadCount - 1 : 0;
      });
      setNotificationsBadgeCount(_unreadCount);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to mark notification as read.')),
        );
      }
    }
  }

  void _handleNavTap(BottomNavItem item) {
    setState(() {
      _currentNavItem = item;
    });
    switch (item) {
      case BottomNavItem.home:
        Navigator.push(
            context, MaterialPageRoute(builder: (_) => const HomeScreen()));
        break;
      case BottomNavItem.search:
        Navigator.push(
            context, MaterialPageRoute(builder: (_) => const SearchScreen()));
        break;
      case BottomNavItem.list:
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final roles = authProvider.roles;
        final canList = roles.contains('seller') || roles.contains('agent');
        if (!canList) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Seller/Agent role required to list properties')),
          );
          return;
        }
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => const MyListingsScreen()));
        break;
      case BottomNavItem.saved:
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => const SavedPropertiesScreen()));
        break;
      case BottomNavItem.subscriptions:
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => const SubscriptionsScreen()));
        break;
      case BottomNavItem.payments:
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => const PaymentsHistoryScreen()));
        break;
      case BottomNavItem.profile:
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final roles = authProvider.roles;
        final canBuy = roles.contains('buyer') || roles.contains('admin');
        if (!canBuy) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Buyer role required to view requirements')),
          );
          return;
        }
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => const BuyerRequirementsScreen()));
        break;
      case BottomNavItem.cs:
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => const CsDashboardScreen()));
        break;
    }
  }

  List<SupportChatMessage> get _activeChat =>
      _activeSession == null ? [] : (_chatMessages[_activeSession!.id] ?? []);

  Future<void> _ensureChatSession() async {
    if (_selectedChatUser.isEmpty) {
      setState(() => _chatLoading = false);
      return;
    }
    setState(() => _chatLoading = true);
    try {
      SupportChatSession session;
      if (_isSupportUser) {
        final selected = _chatUsers.firstWhere(
          (user) => user['id'] == _selectedChatUser,
          orElse: () => <String, dynamic>{},
        );
        final sessionId =
            selected['sessionId']?.toString() ?? _selectedChatUser;
        session = SupportChatSession(
          id: sessionId,
          supportRole: selected['role']?.toString() ?? 'buyer',
          status: 'open',
        );
      } else {
        session =
            await _supportChatService.getOrCreateSession(_selectedChatUser);
      }
      _activeSession = session;
      final messages = await _supportChatService.listMessages(session.id);
      setState(() {
        _chatMessages[session.id] = messages;
        _chatLoading = false;
        _isRemoteTyping = false;
      });
      _joinChatRoom(session.id);
      _activeUnseenCount = 0;
      await _supportChatService.markSessionRead(session.id);
      setState(() {
        if (_isSupportUser) {
          final index =
              _chatUsers.indexWhere((item) => item['id'] == _selectedChatUser);
          if (index >= 0) {
            _chatUsers[index]['unreadCount'] = 0;
          }
        } else {
          _unreadByRole[_selectedChatUser] = 0;
        }
      });
      _refreshUnreadCounts();
      _scrollChatToBottom(animated: false);
      _chatFocusNode.requestFocus();
    } catch (_) {
      if (!mounted) return;
      setState(() => _chatLoading = false);
    }
  }

  Future<void> _loadChatUsers() async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final userRoles = authProvider.roles;
      _isSupportUser =
          userRoles.contains('customer_service') || userRoles.contains('admin');
      List<Map<String, dynamic>> nextUsers = [];
      if (_isSupportUser) {
        final sessions = await _supportChatService.listAdminSessions();
        final grouped = <String, SupportChatAdminSession>{};
        for (final session in sessions) {
          final existing = grouped[session.userId];
          if (existing == null) {
            grouped[session.userId] = session;
          } else {
            grouped[session.userId] = SupportChatAdminSession(
              id: session.id,
              userId: session.userId,
              userName: session.userName,
              userEmail: session.userEmail,
              userAvatarUrl: session.userAvatarUrl,
              supportRole: session.supportRole,
              status: session.status,
              unreadCount: existing.unreadCount + session.unreadCount,
            );
          }
        }
        nextUsers = grouped.values
            .map((session) => {
                  'id': session.id,
                  'sessionId': session.id,
                  'name': session.userName,
                  'role': session.supportRole,
                  'email': session.userEmail,
                  'avatarUrl': session.userAvatarUrl,
                  'unreadCount': session.unreadCount,
                })
            .toList();
      } else {
        final roles = await _supportChatService.getAllowedRoles();
        nextUsers = roles
            .map((role) => {
                  'id': role,
                  'name': _roleLabels[role] ?? role,
                  'role': role,
                  'email': role == 'customer_service'
                      ? 'support@bhoomisetu.com'
                      : null,
                })
            .toList();
        if (roles.isEmpty) {
          final canChatSupport = userRoles.contains('buyer') ||
              userRoles.contains('seller') ||
              userRoles.contains('agent') ||
              userRoles.contains('admin');
          if (canChatSupport) {
            nextUsers = [
              {
                'id': 'customer_service',
                'name': _roleLabels['customer_service'] ?? 'Customer Service',
                'role': 'customer_service',
                'email': 'support@bhoomisetu.com'
              },
            ];
          }
        }
      }
      setState(() {
        _chatUsers = nextUsers;
        if (nextUsers.isNotEmpty &&
            !_chatUsers.any((u) => u['id'] == _selectedChatUser)) {
          _selectedChatUser = nextUsers.first['id'] ?? '';
        }
        if (nextUsers.isEmpty) {
          _selectedChatUser = '';
        }
      });
      if (_selectedChatUser.isNotEmpty) {
        _ensureChatSession();
      }
    } catch (_) {
      if (!mounted) return;
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final userRoles = authProvider.roles;
      final isSupport =
          userRoles.contains('customer_service') || userRoles.contains('admin');
      final canChatSupport = userRoles.contains('buyer') ||
          userRoles.contains('seller') ||
          userRoles.contains('agent') ||
          userRoles.contains('admin');
      final fallbackUsers = isSupport
          ? [
              {
                'id': 'buyer',
                'name': _roleLabels['buyer'] ?? 'Buyer Support',
                'role': 'buyer'
              },
              {
                'id': 'seller',
                'name': _roleLabels['seller'] ?? 'Seller Support',
                'role': 'seller'
              },
              {
                'id': 'agent',
                'name': _roleLabels['agent'] ?? 'Agent Support',
                'role': 'agent'
              },
            ]
          : canChatSupport
              ? [
                  {
                    'id': 'customer_service',
                    'name':
                        _roleLabels['customer_service'] ?? 'Customer Service',
                    'role': 'customer_service',
                    'email': 'support@bhoomisetu.com'
                  },
                ]
              : [];
      setState(() {
        _chatUsers = fallbackUsers.cast<Map<String, dynamic>>();
        _selectedChatUser =
            fallbackUsers.isNotEmpty ? fallbackUsers.first['id'] ?? '' : '';
      });
      if (_selectedChatUser.isNotEmpty) {
        _ensureChatSession();
      }
    }
  }

  Future<void> _refreshUnreadCounts() async {
    try {
      if (_isSupportUser) {
        final sessions = await _supportChatService.listAdminSessions();
        if (!mounted) return;
        int total = 0;
        final updatedUsers = _chatUsers.map((user) {
          final session = sessions.firstWhere(
            (item) => item.id == user['sessionId'],
            orElse: () => SupportChatAdminSession(
              id: user['sessionId']?.toString() ?? '',
              userId: '',
              userName: user['name']?.toString() ?? 'User',
              supportRole: user['role']?.toString() ?? 'buyer',
              status: 'open',
              unreadCount: 0,
            ),
          );
          total += session.unreadCount;
          return {
            ...user,
            'unreadCount': session.unreadCount,
          };
        }).toList();
        setState(() {
          _chatUsers = updatedUsers;
          _chatUnreadTotal = total;
        });
      } else {
        final response = await _supportChatService.getUnreadCounts();
        if (!mounted) return;
        setState(() {
          _chatUnreadTotal = response['total'] as int? ?? 0;
          _unreadByRole = Map<String, int>.from((response['byRole'] as Map?)
                  ?.map((key, value) =>
                      MapEntry(key.toString(), (value as num).toInt())) ??
              {});
        });
      }
    } catch (_) {}
  }

  void _connectChatSocket() {
    final baseUrl = ApiConfig.baseUrl.replaceFirst(RegExp(r'/api/?$'), '');
    final socket = io.io(
      '$baseUrl/support-chat',
      io.OptionBuilder().setTransports(['websocket']).build(),
    );
    _chatSocket = socket;
    socket.onConnect((_) {
      socket.emit('presence:request');
      final sessionId = _activeSession?.id;
      if (sessionId != null) {
        _joinChatRoom(sessionId);
      }
    });
    socket.on('message', (data) {
      if (data is! Map) return;
      final message = data['message'];
      if (message is! Map) return;
      final parsed =
          SupportChatMessage.fromJson(Map<String, dynamic>.from(message));
      if (!mounted) return;
      setState(() {
        final list = _chatMessages[parsed.sessionId] ?? [];
        final index = list.indexWhere((item) => item.id == parsed.id);
        List<SupportChatMessage> next;
        if (index >= 0) {
          next =
              list.map((item) => item.id == parsed.id ? parsed : item).toList();
        } else {
          final authProvider =
              Provider.of<AuthProvider>(context, listen: false);
          final userId = authProvider.userData?['id']?.toString();
          final sendingIndex = userId == parsed.senderId
              ? list.indexWhere((item) =>
                  item.status == 'sending' && item.content == parsed.content)
              : -1;
          if (sendingIndex >= 0) {
            next = list
                .asMap()
                .entries
                .map(
                    (entry) => entry.key == sendingIndex ? parsed : entry.value)
                .toList();
          } else {
            next = [...list, parsed];
          }
        }
        _chatMessages[parsed.sessionId] =
            next.length > 200 ? next.sublist(next.length - 200) : next;
      });
      _refreshUnreadCounts();
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final userId = authProvider.userData?['id']?.toString();
      if (parsed.sessionId == _activeSession?.id && parsed.senderId != userId) {
        final shouldAutoScroll = _isAtChatBottom() || _isChatInputFocused;
        if (shouldAutoScroll) {
          _supportChatService.markSessionRead(parsed.sessionId);
          if (mounted) {
            setState(() => _activeUnseenCount = 0);
          }
          if (mounted) {
            setState(() {
              _unreadByRole[_selectedChatUser] = 0;
            });
          }
          WidgetsBinding.instance
              .addPostFrameCallback((_) => _scrollChatToBottom());
        } else {
          setState(() => _activeUnseenCount += 1);
        }
      }
    });
    socket.on('typing', (data) {
      if (data is! Map) return;
      final sessionId = data['sessionId']?.toString();
      if (sessionId == null || sessionId != _activeSession?.id) return;
      final typingAtRaw = data['typingAt']?.toString();
      final typingAt =
          typingAtRaw != null ? DateTime.tryParse(typingAtRaw) : null;
      final typingBy = data['typingByUserId']?.toString();
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final userId = authProvider.userData?['id']?.toString();
      final isTyping = typingBy != null &&
          typingBy.isNotEmpty &&
          typingBy != userId &&
          typingAt != null &&
          DateTime.now().difference(typingAt).inSeconds < 6;
      if (!mounted) return;
      setState(() => _isRemoteTyping = isTyping);
    });
    socket.on('presence', (data) {
      if (data is! Map) return;
      final rolesOnlineRaw = data['rolesOnline'];
      if (rolesOnlineRaw is Map) {
        setState(() {
          _rolesOnline = Map<String, bool>.from(rolesOnlineRaw
              .map((key, value) => MapEntry(key.toString(), value == true)));
        });
      }
    });
  }

  void _joinChatRoom(String sessionId) {
    if (_chatSocket == null) return;
    if (_joinedSessionId != null && _joinedSessionId != sessionId) {
      _chatSocket!.emit('leave', {'sessionId': _joinedSessionId});
    }
    _chatSocket!.emit('join', {'sessionId': sessionId});
    _joinedSessionId = sessionId;
  }

  void _scrollChatToBottom({bool animated = true}) {
    if (!_chatScrollController.hasClients) {
      WidgetsBinding.instance
          .addPostFrameCallback((_) => _scrollChatToBottom(animated: animated));
      return;
    }
    final target = _chatScrollController.position.maxScrollExtent;
    if (animated) {
      _chatScrollController.animateTo(
        target,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    } else {
      _chatScrollController.jumpTo(target);
    }
  }

  bool _isAtChatBottom() {
    if (!_chatScrollController.hasClients) return true;
    final position = _chatScrollController.position;
    return position.pixels >= position.maxScrollExtent - 24;
  }

  void _handleChatScroll() {
    if (!_chatScrollController.hasClients) return;
    final position = _chatScrollController.position;
    final atBottom = position.pixels >= position.maxScrollExtent - 24;
    setState(() => _showChatScrollDown = !atBottom);
    if (atBottom && _activeUnseenCount > 0 && _activeSession != null) {
      setState(() => _activeUnseenCount = 0);
      setState(() {
        _unreadByRole[_selectedChatUser] = 0;
      });
      _supportChatService.markSessionRead(_activeSession!.id);
      _refreshUnreadCounts();
    }
    if (position.pixels <= 4 && !_loadingEarlier) {
      _loadEarlierMessages();
    }
  }

  void _loadEarlierMessages() {
    setState(() => _loadingEarlier = true);
    Future.delayed(const Duration(milliseconds: 350), () {
      if (!mounted) return;
      final sessionId = _activeSession?.id;
      if (sessionId == null || _activeChat.isEmpty) {
        setState(() => _loadingEarlier = false);
        return;
      }
      _supportChatService
          .listMessages(sessionId,
              limit: 30, before: _activeChat.first.createdAt.toIso8601String())
          .then((older) {
        if (!mounted) return;
        setState(() {
          final merged = [...older, ..._activeChat];
          _chatMessages[sessionId] = merged.length > 200
              ? merged.sublist(merged.length - 200)
              : merged;
          _loadingEarlier = false;
        });
      });
    });
  }

  void _sendChatMessage() {
    final trimmed = _chatController.text.trim();
    final sessionId = _activeSession?.id;
    if (trimmed.isEmpty || sessionId == null) return;
    final now = DateTime.now();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final optimistic = SupportChatMessage(
      id: 'temp-${now.millisecondsSinceEpoch}',
      sessionId: sessionId,
      senderId: authProvider.userData?['id']?.toString() ?? 'me',
      senderRole: 'user',
      senderName: 'You',
      content: trimmed,
      isDeleted: false,
      isEdited: false,
      createdAt: now,
      status: 'sending',
    );
    setState(() {
      _chatMessages[sessionId] = [..._activeChat, optimistic];
      _chatController.clear();
      if (!_isSupportUser) {
        _activeUnseenCount = 0;
        _unreadByRole[_selectedChatUser] = 0;
        _chatUnreadTotal =
            _unreadByRole.values.fold(0, (sum, value) => sum + value);
      }
    });
    _chatFocusNode.requestFocus();
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollChatToBottom());
    Future.delayed(const Duration(milliseconds: 120), () {
      if (mounted) {
        _scrollChatToBottom();
      }
    });

    _supportChatService.sendMessage(sessionId, trimmed).then((saved) {
      if (!mounted) return;
      setState(() {
        _chatMessages[sessionId] = _activeChat
            .map((msg) => msg.id == optimistic.id ? saved : msg)
            .toList();
      });
      WidgetsBinding.instance
          .addPostFrameCallback((_) => _scrollChatToBottom());
      Future.delayed(const Duration(milliseconds: 120), () {
        if (mounted) {
          _scrollChatToBottom();
        }
      });
    }).catchError((_) {
      if (!mounted) return;
      setState(() {
        _chatMessages[sessionId] = _activeChat
            .map((msg) => msg.id == optimistic.id
                ? SupportChatMessage(
                    id: msg.id,
                    sessionId: msg.sessionId,
                    senderId: msg.senderId,
                    senderRole: msg.senderRole,
                    senderName: msg.senderName,
                    content: msg.content,
                    isDeleted: msg.isDeleted,
                    isEdited: msg.isEdited,
                    createdAt: msg.createdAt,
                    deliveredAt: msg.deliveredAt,
                    readAt: msg.readAt,
                    status: 'failed',
                  )
                : msg)
            .toList();
      });
    });
  }

  void _retryChatMessage(SupportChatMessage message) {
    if (_activeSession == null) return;
    setState(() {
      _chatMessages[_activeSession!.id] = _activeChat
          .map((msg) => msg.id == message.id
              ? SupportChatMessage(
                  id: msg.id,
                  sessionId: msg.sessionId,
                  senderId: msg.senderId,
                  senderRole: msg.senderRole,
                  senderName: msg.senderName,
                  content: msg.content,
                  isDeleted: msg.isDeleted,
                  isEdited: msg.isEdited,
                  createdAt: msg.createdAt,
                  deliveredAt: msg.deliveredAt,
                  readAt: msg.readAt,
                  status: 'sending',
                )
              : msg)
          .toList();
    });
    _supportChatService
        .sendMessage(_activeSession!.id, message.content)
        .then((saved) {
      if (!mounted) return;
      setState(() {
        _chatMessages[_activeSession!.id] = _activeChat
            .map((msg) => msg.id == message.id ? saved : msg)
            .toList();
      });
    });
  }

  List<Widget> _buildChatItems(BuildContext context) {
    final items = <Widget>[];
    DateTime? lastDate;
    DateTime? lastTimeMarker;
    for (final msg in _activeChat) {
      final dateOnly =
          DateTime(msg.createdAt.year, msg.createdAt.month, msg.createdAt.day);
      if (lastDate == null || lastDate != dateOnly) {
        items.add(_buildChatSeparator(
          '${msg.createdAt.day}/${msg.createdAt.month}/${msg.createdAt.year}',
        ));
        lastDate = dateOnly;
        lastTimeMarker = msg.createdAt;
      } else if (lastTimeMarker != null &&
          msg.createdAt.difference(lastTimeMarker).inMinutes >= 5) {
        items.add(_buildChatSeparator(
          '${msg.createdAt.hour.toString().padLeft(2, '0')}:${msg.createdAt.minute.toString().padLeft(2, '0')}',
          isTime: true,
        ));
        lastTimeMarker = msg.createdAt;
      }
      items.add(_buildChatBubble(context, msg));
    }
    if (_isRemoteTyping) {
      items.add(_buildTypingBubble());
    }
    if (_activeChat.isEmpty && !_isRemoteTyping) {
      items.add(const Padding(
        padding: EdgeInsets.all(16),
        child: Text('Start a conversation with support.',
            style: TextStyle(color: Colors.black54)),
      ));
    }
    return items;
  }

  Widget _buildChatSeparator(String text, {bool isTime = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: isTime ? Colors.blueGrey.shade100 : Colors.blueGrey.shade50,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Text(text,
              style: const TextStyle(fontSize: 11, color: Colors.black54)),
        ),
      ),
    );
  }

  Widget _buildChatBubble(BuildContext context, SupportChatMessage msg) {
    final isUser = msg.senderRole == 'user';
    final isUnread = !isUser && msg.readAt == null;
    final align = isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start;
    final isDeleted = msg.isDeleted;
    final color = isDeleted
        ? Colors.grey.shade200
        : isUser
            ? Colors.blue
            : (isUnread ? Colors.orange.shade100 : Colors.grey.shade200);
    final textColor = isDeleted
        ? Colors.grey.shade700
        : (isUser ? Colors.white : Colors.black87);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isUser)
            CircleAvatar(
              radius: 14,
              backgroundColor: Colors.blueGrey.shade100,
              backgroundImage:
                  msg.senderAvatarUrl != null && msg.senderAvatarUrl!.isNotEmpty
                      ? NetworkImage(msg.senderAvatarUrl!)
                      : null,
              child: msg.senderAvatarUrl == null || msg.senderAvatarUrl!.isEmpty
                  ? Text(msg.senderName.substring(0, 1),
                      style: const TextStyle(fontSize: 12))
                  : null,
            ),
          if (!isUser) const SizedBox(width: 8),
          Flexible(
            child: Column(
              crossAxisAlignment: align,
              children: [
                GestureDetector(
                  onLongPress: isUser && !msg.isDeleted
                      ? () => _showMessageActions(msg)
                      : null,
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.65),
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: color,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        msg.isDeleted
                            ? 'This message was deleted'
                            : msg.content,
                        style: TextStyle(
                          color: textColor,
                          fontSize: 13,
                          fontStyle: msg.isDeleted
                              ? FontStyle.italic
                              : FontStyle.normal,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${msg.createdAt.hour.toString().padLeft(2, '0')}:${msg.createdAt.minute.toString().padLeft(2, '0')}',
                      style:
                          const TextStyle(fontSize: 11, color: Colors.black45),
                    ),
                    if (isUser && !msg.isDeleted) ...[
                      const SizedBox(width: 6),
                      _buildStatusIcon(_resolveMessageStatus(msg)),
                      if (msg.status == 'failed')
                        TextButton(
                          onPressed: () => _retryChatMessage(msg),
                          child: const Text('Retry',
                              style: TextStyle(fontSize: 11)),
                        ),
                    ],
                    if (msg.isEdited)
                      const Padding(
                        padding: EdgeInsets.only(left: 6),
                        child: Text('Edited',
                            style:
                                TextStyle(fontSize: 11, color: Colors.black45)),
                      ),
                  ],
                ),
              ],
            ),
          ),
          if (isUser) const SizedBox(width: 8),
          if (isUser)
            CircleAvatar(
              radius: 14,
              backgroundColor: Colors.blue.shade50,
              backgroundImage:
                  msg.senderAvatarUrl != null && msg.senderAvatarUrl!.isNotEmpty
                      ? NetworkImage(msg.senderAvatarUrl!)
                      : null,
              child: msg.senderAvatarUrl == null || msg.senderAvatarUrl!.isEmpty
                  ? const Text('Y', style: TextStyle(fontSize: 12))
                  : null,
            ),
        ],
      ),
    );
  }

  Widget _buildTypingBubble() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          CircleAvatar(
            radius: 14,
            backgroundColor: Colors.blueGrey.shade100,
            child: const Text('S', style: TextStyle(fontSize: 12)),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.blueGrey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text('User is typing...',
                style: TextStyle(fontSize: 12, color: Colors.black54)),
          ),
        ],
      ),
    );
  }

  String _resolveMessageStatus(SupportChatMessage msg) {
    if (msg.status == 'failed' || msg.status == 'sending') {
      return msg.status;
    }
    if (msg.readAt != null) return 'read';
    if (msg.deliveredAt != null) return 'delivered';
    return 'sent';
  }

  Widget _buildStatusIcon(String status) {
    IconData icon = Icons.done;
    Color color = Colors.black45;
    if (status == 'sending') {
      icon = Icons.access_time;
      color = Colors.black38;
    } else if (status == 'delivered') {
      icon = Icons.done_all;
      color = Colors.black45;
    } else if (status == 'read') {
      icon = Icons.done_all;
      color = Colors.green;
    } else if (status == 'failed') {
      icon = Icons.error_outline;
      color = Colors.redAccent;
    }
    return Icon(icon, size: 14, color: color);
  }

  void _showMessageActions(SupportChatMessage msg) {
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.edit),
              title: const Text('Edit message'),
              onTap: () {
                Navigator.pop(context);
                _editMessage(msg);
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete_outline),
              title: const Text('Delete message'),
              onTap: () {
                Navigator.pop(context);
                _deleteMessage(msg);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _editMessage(SupportChatMessage msg) {
    final controller = TextEditingController(text: msg.content);
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Edit message'),
        content: TextField(
          controller: controller,
          maxLines: 4,
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              final sessionId = _activeSession?.id;
              if (sessionId == null) return;
              final updated = await _supportChatService.editMessage(
                  msg.id, controller.text.trim());
              if (!mounted) return;
              setState(() {
                _chatMessages[sessionId] = _activeChat
                    .map((item) => item.id == msg.id ? updated : item)
                    .toList();
              });
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _deleteMessage(SupportChatMessage msg) async {
    final sessionId = _activeSession?.id;
    if (sessionId == null) return;
    final updated = await _supportChatService.deleteMessage(msg.id);
    if (!mounted) return;
    setState(() {
      _chatMessages[sessionId] = _activeChat
          .map((item) => item.id == msg.id ? updated : item)
          .toList();
    });
  }

  void _scheduleTyping() {
    final sessionId = _activeSession?.id;
    if (sessionId == null) return;
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userId = authProvider.userData?['id']?.toString();
    if (_chatSocket != null && userId != null) {
      _chatSocket!.emit('typing', {
        'sessionId': sessionId,
        'userId': userId,
        'isTyping': true,
      });
    } else {
      _supportChatService.setTyping(sessionId, true);
    }
    _typingTimer?.cancel();
    _typingTimer = Timer(const Duration(milliseconds: 1500), () {
      if (_chatSocket != null && userId != null) {
        _chatSocket!.emit('typing', {
          'sessionId': sessionId,
          'userId': userId,
          'isTyping': false,
        });
      } else {
        _supportChatService.setTyping(sessionId, false);
      }
    });
  }

  void _openSupportMenu() {
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: _chatUsers.isEmpty
              ? [
                  const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('No approved chat users available.',
                        style: TextStyle(color: Colors.black54)),
                  )
                ]
              : _chatUsers.map((user) {
                  final isSelected = user['id'] == _selectedChatUser;
                  return ListTile(
                    leading: CircleAvatar(
                      radius: 14,
                      backgroundColor: Colors.blueGrey.shade100,
                      child: Text((user['name'] ?? 'S').substring(0, 1),
                          style: const TextStyle(fontSize: 12)),
                    ),
                    title: Text(user['name'] ?? ''),
                    subtitle: Row(
                      children: [
                        Text(user['email'] ?? user['role'] ?? ''),
                        const SizedBox(width: 6),
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _rolesOnline[user['id']] == true
                                ? Colors.green
                                : Colors.black26,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ),
                    trailing: ((user['unreadCount'] as int?) ??
                                _unreadByRole[user['role']] ??
                                0) >
                            0
                        ? Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.redAccent,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              ((user['unreadCount'] as int?) ??
                                      _unreadByRole[user['role']] ??
                                      0)
                                  .toString(),
                              style: const TextStyle(
                                  color: Colors.white, fontSize: 11),
                            ),
                          )
                        : null,
                    selected: isSelected,
                    selectedColor: Theme.of(context).colorScheme.primary,
                    onTap: () {
                      Navigator.pop(context);
                      setState(() =>
                          _selectedChatUser = user['id'] ?? 'customer_service');
                      _ensureChatSession();
                    },
                  );
                }).toList(),
        ),
      ),
    );
  }

  Widget _buildChatPanel() {
    // HARD GUARD: no users at all
    if (_chatUsers.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Card(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'Chat is available only for CS-enabled and approved users.',
              style: TextStyle(color: Colors.black54),
            ),
          ),
        ),
      );
    }

    // SAFE lookup (NO firstWhere crash)
    Map<String, dynamic>? selectedUser;
    for (final user in _chatUsers) {
      if (user['id'] == _selectedChatUser) {
        selectedUser = user;
        break;
      }
    }

    // FALLBACK if selected user vanished (async/socket case)
    selectedUser ??= _chatUsers.isNotEmpty ? _chatUsers.first : null;

    if (selectedUser == null) {
      return const SizedBox.shrink();
    }

    final selectedLabel =
        selectedUser['name']?.toString().trim().isNotEmpty == true
            ? selectedUser['name']
            : 'Support';

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 14,
                    backgroundColor: Colors.blueGrey.shade100,
                    child: Text(
                      selectedLabel.substring(0, 1),
                      style: const TextStyle(fontSize: 12),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Chat with $selectedLabel',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _rolesOnline[_selectedChatUser] == true
                          ? Colors.green
                          : Colors.black26,
                      shape: BoxShape.circle,
                    ),
                  ),
                  if (_activeUnseenCount > 0) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.orange.shade200,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'New $_activeUnseenCount',
                        style: const TextStyle(fontSize: 11),
                      ),
                    ),
                  ],
                  IconButton(
                    tooltip: 'Switch support user',
                    icon: const Icon(Icons.menu),
                    onPressed: _openSupportMenu,
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: Stack(
                children: [
                  ListView(
                    controller: _chatScrollController,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    physics: const BouncingScrollPhysics(),
                    children: _chatLoading
                        ? const [Center(child: CircularProgressIndicator())]
                        : _buildChatItems(context),
                  ),
                  if (_showChatScrollDown)
                    Positioned(
                      right: 12,
                      bottom: 12,
                      child: FloatingActionButton.small(
                        onPressed: () => _scrollChatToBottom(),
                        child: const Icon(Icons.arrow_downward),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: Stack(
                alignment: Alignment.centerRight,
                children: [
                  TextField(
                    controller: _chatController,
                    focusNode: _chatFocusNode,
                    minLines: 1,
                    maxLines: 4,
                    keyboardType: TextInputType.multiline,
                    onChanged: (_) => _scheduleTyping(),
                    decoration: InputDecoration(
                      hintText: 'Type your message here...',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.fromLTRB(12, 12, 44, 12),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send),
                    onPressed: _sendChatMessage,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final localeCode = Localizations.localeOf(context).languageCode;
    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            tooltip: 'Notification Settings',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => const NotificationSettingsScreen()),
              );
            },
            icon: const Icon(Icons.settings_outlined),
          ),
        ],
        bottom: _tabController == null
            ? null
            : TabBar(
                controller: _tabController,
                labelColor: Colors.white,
                unselectedLabelColor: Colors.white70, // optional
                tabs: [
                  const Tab(text: 'Notifications'),
                  Tab(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('Chat Support'),
                        if (_chatUnreadTotal > 0 && _tabController?.index != 1)
                          Container(
                            margin: const EdgeInsets.only(left: 6),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.redAccent,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              _chatUnreadTotal.toString(),
                              style: const TextStyle(
                                  fontSize: 11, color: Colors.white),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildNotificationsTab(localeCode),
          _buildChatPanel(),
        ],
      ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentNavItem,
        onTap: _handleNavTap,
      ),
    );
  }

  Widget _buildNotificationsTab(String localeCode) {
    return RefreshIndicator(
      onRefresh: _loadNotifications,
      child: ListView(
        controller: _scrollController,
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              FilterChip(
                label: const Text('Unread only'),
                selected: _unreadOnly,
                onSelected: (value) {
                  setState(() => _unreadOnly = value);
                  _loadNotifications();
                },
              ),
              const SizedBox(width: 12),
              Text('Unread: $_unreadCount',
                  style: const TextStyle(color: Colors.black54)),
              const Spacer(),
              TextButton(
                onPressed: _unreadCount == 0 ? null : _markAllRead,
                child: const Text('Mark all read'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_loading)
            const Center(child: CircularProgressIndicator())
          else if (_error != null)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(_error!, style: const TextStyle(color: Colors.red)),
            )
          else if (_items.isEmpty)
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'No notifications yet. Updates will appear here as they become available.',
                style: TextStyle(color: Colors.black54),
              ),
            )
          else
            ..._items.map(
              (item) => Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side:
                      BorderSide(color: _typeColor(item.type).withOpacity(0.4)),
                ),
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () => _markRead(item),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            if (item.readAt == null)
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.blue,
                                ),
                              ),
                            if (item.readAt == null) const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                item.title,
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '${item.createdAt.day}/${item.createdAt.month} ${item.createdAt.hour}:${item.createdAt.minute.toString().padLeft(2, '0')}',
                              style: const TextStyle(
                                  color: Colors.black45, fontSize: 12),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        FutureBuilder<String>(
                          future: _service.resolveMessage(item, localeCode),
                          builder: (context, snapshot) {
                            final text = snapshot.data ?? item.message;
                            return Text(text,
                                style: const TextStyle(color: Colors.black87));
                          },
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 6,
                          children: [
                            _buildTag(item.priority),
                            _buildTag(item.type.replaceAll('_', ' ')),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTag(String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.blueGrey.shade50,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(value,
          style: const TextStyle(fontSize: 11, color: Colors.black54)),
    );
  }

  Color _typeColor(String type) {
    switch (type) {
      case 'property_match':
        return Colors.blue;
      case 'price_drop':
        return Colors.orange;
      case 'mediation_update':
        return Colors.lightBlue;
      case 'ai_chat_escalation':
        return Colors.redAccent;
      case 'cs_followup':
        return Colors.teal;
      case 'interest_expression':
        return Colors.purple;
      case 'subscription_renewal':
        return Colors.green;
      case 'viewing_reminder':
        return Colors.amber;
      case 'action_alert':
        return Colors.blueGrey;
      default:
        return Colors.blueGrey;
    }
  }
}
