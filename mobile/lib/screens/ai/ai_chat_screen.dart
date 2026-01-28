import 'package:flutter/material.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../properties/property_details_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';
import '../subscriptions/subscriptions_screen.dart';
import '../subscriptions/payments_history_screen.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../providers/auth_provider.dart';
import '../../services/ai_chat_service.dart';
import '../../widgets/notifications_icon_button.dart';
import '../notifications/notifications_screen.dart';
import '../../widgets/app_drawer.dart';

class AIChatScreen extends StatefulWidget {
  const AIChatScreen({super.key});

  @override
  State<AIChatScreen> createState() => _AIChatScreenState();
}

class _AIChatScreenState extends State<AIChatScreen> with TickerProviderStateMixin {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final AiChatService _aiChatService = AiChatService();
  final List<Map<String, dynamic>> _messages = [
    {
      'role': 'assistant',
      'text':
          'Hi! I can help with property suggestions, FAQs, and booking.\nAsk like: Find 2BHK under 50L\nShow verified plots near metro\nBook a visit this weekend\nUpdate my requirement budget',
    },
  ];

  String _language = 'en';
  bool _showScrollDown = false;
  String? _conversationId;
  bool _isSending = false;
  BottomNavItem _currentNavItem = BottomNavItem.home;
  late final AnimationController _typingAnimationController;

  @override
  void initState() {
    super.initState();
    _typingAnimationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    _typingAnimationController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _isSending) return;
    setState(() => _isSending = true);
    setState(() {
      _messages.add({'role': 'user', 'text': trimmed});
      _inputController.clear();
      _messages.add({'role': 'assistant', 'text': 'typing', 'isTyping': true});
    });
    _scrollToBottom();
    try {
      final response = await _aiChatService.sendMessage(
        message: trimmed,
        language: _language,
        conversationId: _conversationId,
      );
      _conversationId =
          response['conversationId']?.toString() ?? _conversationId;
      final content =
          response['content']?.toString() ?? 'Thanks, I am here to help.';
      final suggestions = response['propertySuggestions'] as List<dynamic>?;
      setState(() {
        _removeTypingBubble();
        _messages.add({
          'role': 'assistant',
          'text': content,
          if (suggestions != null) 'propertySuggestions': suggestions,
        });
      });
    } catch (e) {
      final message = e is DioException
          ? (e.response?.data is Map
              ? (e.response?.data as Map)['message']?.toString()
              : null)
          : null;
      setState(() {
        _removeTypingBubble();
        _messages.add({
          'role': 'assistant',
          'text': message ??
              'Unable to reach AI service. Please try again shortly.',
        });
      });
    } finally {
      setState(() => _isSending = false);
      _scrollToBottom();
    }
  }

  void _removeTypingBubble() {
    _messages.removeWhere((msg) => msg['isTyping'] == true);
  }

  void _scrollToBottom() {
    if (!_scrollController.hasClients) return;
    _scrollController.animateTo(
      _scrollController.position.maxScrollExtent + 80,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
    );
  }

  Widget _buildTypingDot(int index) {
    final delay = index * 0.1;
    return ScaleTransition(
      scale: Tween<double>(begin: 0.6, end: 1.0).animate(
        CurvedAnimation(
          parent: _typingAnimationController,
          curve: Interval(delay, delay + 0.3, curve: Curves.easeInOut),
        ),
      ),
      child: Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(
          color: Colors.grey.shade600,
          shape: BoxShape.circle,
        ),
      ),
    );
  }

  String _topGuideText() {
    switch (_language) {
      case 'hi':
        return 'AI Chat Support का उपयोग कैसे करें: अपनी आवश्यकता, बजट और स्थान को स्पष्ट रूप से लिखें.';
      case 'te':
        return 'AI Chat Support ను ఎలా ఉపయోగించాలి: మీ అవసరం, బడ్జెట్, లొకేషన్‌ను స్పష్టంగా వ్రాయండి.';
      default:
        return 'How to use AI Chat Support: Share your requirement, budget, and location clearly.';
    }
  }

  String _bottomGuideText() {
    switch (_language) {
      case 'hi':
        return 'मानव सहायता चाहिए? बताएं और हम Customer Support से जोड़ देंगे.';
      case 'te':
        return 'మనవ సహాయం కావాలా? చెప్పండి, Customer Support కు కలుపుతాం.';
      default:
        return 'Need human help? Tell us and we will connect Customer Support.';
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
        final canAccess = roles.contains('seller') || roles.contains('agent');
        if (!canAccess) {
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
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => const BuyerRequirementsScreen()));
        break;
      case BottomNavItem.cs:
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => const CsDashboardScreen()));
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('AI Chat Support'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          NotificationsIconButton(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
              );
            },
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _language,
                    iconEnabledColor: Colors.white,
                    dropdownColor: Colors.white,
                    isExpanded: false,
                    isDense: true,
                    selectedItemBuilder: (context) {
                      return const [
                        Text('English', style: TextStyle(color: Colors.white, fontSize: 14)),
                        Text('Hindi', style: TextStyle(color: Colors.white, fontSize: 14)),
                        Text('Telugu', style: TextStyle(color: Colors.white, fontSize: 14)),
                      ];
                    },
                    items: const [
                      DropdownMenuItem(value: 'en', child: Text('English')),
                      DropdownMenuItem(value: 'hi', child: Text('Hindi')),
                      DropdownMenuItem(value: 'te', child: Text('Telugu')),
                    ],
                    onChanged: (value) {
                      if (value == null) return;
                      setState(() => _language = value);
                    },
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.blueGrey.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.blueGrey.shade100),
              ),
              child: Text(
                _topGuideText(),
                style: TextStyle(color: Colors.blueGrey.shade700, fontSize: 12),
              ),
            ),
          ),
          Expanded(
            child: NotificationListener<ScrollNotification>(
              onNotification: (notification) {
                if (!_scrollController.hasClients) return false;
                final atBottom = _scrollController.position.pixels >=
                    _scrollController.position.maxScrollExtent - 40;
                setState(() => _showScrollDown = !atBottom);
                return false;
              },
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  final msg = _messages[index];
                  final isUser = msg['role'] == 'user';
                  final isTyping = msg['isTyping'] == true;
                  final suggestions = msg['propertySuggestions'] as List<dynamic>?;
                  
                  if (isTyping) {
                    return Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            _buildTypingDot(0),
                            const SizedBox(width: 4),
                            _buildTypingDot(1),
                            const SizedBox(width: 4),
                            _buildTypingDot(2),
                          ],
                        ),
                      ),
                    );
                  }
                  
                  return Align(
                    alignment:
                        isUser ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10),
                      constraints: const BoxConstraints(maxWidth: 280),
                      decoration: BoxDecoration(
                        color: isUser ? Colors.blue : Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            msg['text'] ?? '',
                            style: TextStyle(
                                color: isUser ? Colors.white : Colors.black87),
                          ),
                          if (suggestions != null && suggestions.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            ...suggestions.map((item) {
                              final map = item as Map;
                              final id = map['propertyId']?.toString() ?? '';
                              final title = map['title']?.toString() ?? 'Property';
                              final location = map['location']?.toString() ?? 'Location';
                              final price = map['price']?.toString() ?? '';
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 6),
                                child: InkWell(
                                  onTap: id.isEmpty
                                      ? null
                                      : () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (_) => PropertyDetailsScreen(
                                                propertyId: id,
                                                initialTab: _currentNavItem,
                                              ),
                                            ),
                                          );
                                        },
                                  child: Text(
                                    '$title • $location • ₹$price',
                                    style: TextStyle(
                                      color: isUser ? Colors.white70 : Colors.blue.shade700,
                                      fontSize: 12,
                                      decoration: TextDecoration.underline,
                                    ),
                                  ),
                                ),
                              );
                            }),
                          ],
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          if (_showScrollDown)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: FloatingActionButton.small(
                onPressed: _scrollToBottom,
                child: const Icon(Icons.keyboard_arrow_down),
              ),
            ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.blueGrey.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.blueGrey.shade100),
              ),
              child: Text(
                _bottomGuideText(),
                style: TextStyle(color: Colors.blueGrey.shade700, fontSize: 12),
              ),
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  TextField(
                    controller: _inputController,
                    maxLines: 4,
                    minLines: 1,
                    decoration: InputDecoration(
                      hintText: _language == 'en'
                          ? 'Ask about properties or bookings...'
                          : _language == 'hi'
                              ? 'प्रॉपर्टी या बुकिंग के बारे में पूछें...'
                              : 'ప్రాపర్టీలు లేదా బుకింగ్ గురించి అడగండి...',
                      border: const OutlineInputBorder(),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.send),
                        onPressed: _isSending
                            ? null
                            : () => _sendMessage(_inputController.text),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentNavItem,
        onTap: _handleNavTap,
      ),
    );
  }
}
