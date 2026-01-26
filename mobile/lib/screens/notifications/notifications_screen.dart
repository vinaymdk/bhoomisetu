import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/notifications_service.dart';
import '../../services/support_chat_service.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';
import 'notification_settings_screen.dart';

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
  bool _isRemoteTyping = false;
  bool _showChatScrollDown = false;
  bool _loadingEarlier = false;
  TabController? _tabController;
  SupportChatSession? _activeSession;
  final Map<String, List<SupportChatMessage>> _chatMessages = {};
  bool _chatLoading = false;
  Timer? _typingTimer;
  final List<Map<String, String>> _chatUsers = const [
    {
      'id': 'customer_service',
      'name': 'Customer Service',
      'role': 'customer_service'
    },
    {'id': 'buyer', 'name': 'Buyer Support', 'role': 'buyer'},
    {'id': 'seller', 'name': 'Seller Support', 'role': 'seller'},
    {'id': 'agent', 'name': 'Agent Support', 'role': 'agent'},
  ];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
    _chatScrollController.addListener(_handleChatScroll);
    _tabController = TabController(length: 2, vsync: this);
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
    _chatPollTimer?.cancel();
    _typingTimer?.cancel();
    _tabController?.dispose();
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
    } catch (e) {
      setState(() => _error = 'Unable to load notifications.');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _markAllRead() async {
    await _service.markAllRead();
    await _loadNotifications();
  }

  Future<void> _markRead(NotificationItem item) async {
    if (item.readAt != null) return;
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
    setState(() => _chatLoading = true);
    try {
      final session =
          await _supportChatService.getOrCreateSession(_selectedChatUser);
      _activeSession = session;
      final messages = await _supportChatService.listMessages(session.id);
      setState(() {
        _chatMessages[session.id] = messages;
        _chatLoading = false;
        _isRemoteTyping = false;
      });
      _startChatPolling();
      _scrollChatToBottom(animated: false);
      _chatFocusNode.requestFocus();
    } catch (_) {
      if (!mounted) return;
      setState(() => _chatLoading = false);
    }
  }

  Timer? _chatPollTimer;

  void _startChatPolling() {
    _chatPollTimer?.cancel();
    if (_activeSession == null) return;
    _chatPollTimer = Timer.periodic(const Duration(seconds: 4), (_) async {
      final sessionId = _activeSession?.id;
      if (sessionId == null) return;
      final messages = await _supportChatService.listMessages(sessionId);
      final typing = await _supportChatService.getTyping(sessionId);
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final userId = authProvider.userData?['id']?.toString();
      final typingAtRaw = typing['typingAt']?.toString();
      final typingAt =
          typingAtRaw != null ? DateTime.tryParse(typingAtRaw) : null;
      final typingBy = typing['typingByUserId']?.toString();
      final isTyping = typingBy != null &&
          typingBy.isNotEmpty &&
          typingBy != userId &&
          typingAt != null &&
          DateTime.now().difference(typingAt).inSeconds < 6;
      if (!mounted) return;
      setState(() {
        _chatMessages[sessionId] = messages;
        _isRemoteTyping = isTyping;
      });
    });
  }

  void _scrollChatToBottom({bool animated = true}) {
    if (!_chatScrollController.hasClients) return;
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

  void _handleChatScroll() {
    if (!_chatScrollController.hasClients) return;
    final position = _chatScrollController.position;
    final atBottom = position.pixels >= position.maxScrollExtent - 24;
    setState(() => _showChatScrollDown = !atBottom);
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
      status: 'sent',
    );
    setState(() {
      _chatMessages[sessionId] = [..._activeChat, optimistic];
      _chatController.clear();
    });
    _chatFocusNode.requestFocus();
    _scrollChatToBottom();

    _supportChatService.sendMessage(sessionId, trimmed).then((saved) {
      if (!mounted) return;
      setState(() {
        _chatMessages[sessionId] = _activeChat
            .map((msg) => msg.id == optimistic.id ? saved : msg)
            .toList();
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
                    status: 'failed',
                  )
                : msg)
            .toList();
      });
    });
  }

  void _retryChatMessage(SupportChatMessage message) {
    if (_activeSession == null) return;
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
    final align = isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start;
    final color = isUser ? Colors.blue : Colors.grey.shade200;
    final textColor = isUser ? Colors.white : Colors.black87;
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
              child: Text(msg.senderName.substring(0, 1),
                  style: const TextStyle(fontSize: 12)),
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
                        msg.isDeleted ? 'Message deleted' : msg.content,
                        style: TextStyle(color: textColor, fontSize: 13),
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
                    if (isUser) ...[
                      const SizedBox(width: 6),
                      _buildStatusIcon(msg.status),
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
              child: const Text('Y', style: TextStyle(fontSize: 12)),
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

  Widget _buildStatusIcon(String status) {
    IconData icon = Icons.done;
    Color color = Colors.black45;
    if (status == 'delivered') {
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
    _supportChatService.setTyping(sessionId, true);
    _typingTimer?.cancel();
    _typingTimer = Timer(const Duration(milliseconds: 1500), () {
      _supportChatService.setTyping(sessionId, false);
    });
  }

  void _openSupportMenu() {
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: _chatUsers.map((user) {
            final isSelected = user['id'] == _selectedChatUser;
            return ListTile(
              leading:
                  Icon(isSelected ? Icons.check_circle : Icons.person_outline),
              title: Text(user['name'] ?? ''),
              subtitle: Text(user['role'] ?? ''),
              onTap: () {
                Navigator.pop(context);
                setState(
                    () => _selectedChatUser = user['id'] ?? 'customer_service');
                _ensureChatSession();
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildChatPanel() {
    final selectedLabel = _chatUsers
            .firstWhere((user) => user['id'] == _selectedChatUser)['name'] ??
        'Support';
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
                  Expanded(
                    child: Text(
                      'Chat with $selectedLabel',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                  IconButton(
                    tooltip: 'Switch support user',
                    icon: const Icon(Icons.menu),
                    onPressed: _openSupportMenu,
                  ),
                ],
              ),
            ),
            Expanded(
              child: Stack(
                children: [
                  ListView(
                    controller: _chatScrollController,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    physics: const BouncingScrollPhysics(),
                    children: _chatLoading
                        ? [const Center(child: CircularProgressIndicator())]
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
                  RawKeyboardListener(
                    focusNode: FocusNode(),
                    onKey: (event) {
                      if (event is RawKeyDownEvent &&
                          event.logicalKey == LogicalKeyboardKey.enter &&
                          !event.isShiftPressed) {
                        _sendChatMessage();
                      }
                    },
                    child: TextField(
                      controller: _chatController,
                      focusNode: _chatFocusNode,
                      minLines: 1,
                      maxLines: 4,
                      keyboardType: TextInputType.multiline,
                      textInputAction: TextInputAction.newline,
                      onChanged: (_) => _scheduleTyping(),
                      decoration: InputDecoration(
                        hintText: 'Type your message here...',
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10)),
                        contentPadding:
                            const EdgeInsets.fromLTRB(12, 12, 44, 12),
                      ),
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
                tabs: const [
                  Tab(text: 'Notifications'),
                  Tab(text: 'Chat Support'),
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
