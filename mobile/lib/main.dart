import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/search/search_screen.dart';
import 'config/firebase_config.dart';
import 'config/api_config.dart';
import 'config/api_client.dart';
import 'utils/connectivity_service.dart';
import 'utils/dev_mode_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize API config
  await ApiConfig.initialize();
  
  // Initialize API client with interceptors
  ApiClient().initialize();
  
  // Initialize Firebase (for social login - optional, errors handled internally)
  await FirebaseConfig.initialize();
  
  // Initialize connectivity service for offline detection
  await ConnectivityService().initialize();
  
  runApp(const BhoomiSetuApp());
}

class BhoomiSetuApp extends StatefulWidget {
  const BhoomiSetuApp({super.key});

  @override
  State<BhoomiSetuApp> createState() => _BhoomiSetuAppState();
}

class _BhoomiSetuAppState extends State<BhoomiSetuApp> {
  final GlobalKey<NavigatorState> _navigatorKey = GlobalKey<NavigatorState>();
  bool _checkedDevMode = false;

  @override
  void initState() {
    super.initState();
    _checkDeveloperMode();
  }

  Future<void> _checkDeveloperMode() async {
    // Only run once per app launch to avoid repeated alerts.
    if (_checkedDevMode) return;
    _checkedDevMode = true;

    final enabled = await DevModeService.isDeveloperModeEnabled();
    if (!enabled) return;

    // Wait until a frame is available, then show a blocking alert dialog.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final context = _navigatorKey.currentState?.overlay?.context;
      if (context == null) return;
      showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (dialogContext) => AlertDialog(
          title: const Text('Security Alert'),
          content: const Text(
            'Developer Mode is enabled on your device. For better security, please disable it.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('OK'),
            ),
          ],
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: MaterialApp(
        navigatorKey: _navigatorKey,
        title: 'BhoomiSetu',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF2196F3), // Primary blue
            brightness: Brightness.light,
          ),
          useMaterial3: true,
          fontFamily: 'Inter',
        ),
        home: Consumer<AuthProvider>(
          builder: (context, authProvider, _) {
            if (authProvider.isLoading) {
              return const Scaffold(
                body: Center(child: CircularProgressIndicator()),
              );
            }

            if (authProvider.isAuthenticated) {
              return const HomeScreen();
            }

            return const LoginScreen();
          },
        ),
        routes: {
          '/login': (context) => const LoginScreen(),
          '/home': (context) => const HomeScreen(),
          '/search': (context) => const SearchScreen(),
        },
      ),
    );
  }
}
