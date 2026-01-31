import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/search/search_screen.dart';
import 'screens/terms/terms_screen.dart';
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

class _BhoomiSetuAppState extends State<BhoomiSetuApp> with WidgetsBindingObserver {
  final GlobalKey<NavigatorState> _navigatorKey = GlobalKey<NavigatorState>();
  bool _checkedDevMode = false;
  bool _securityDialogOpen = false;
  bool _checkingSecurity = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkSecurityState();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkSecurityState(force: true);
    }
  }

  Future<void> _checkSecurityState({bool force = false}) async {
    if (_checkingSecurity) return;
    if (_securityDialogOpen && !force) return;
    _checkingSecurity = true;

    // Only run once per app launch unless force is true.
    if (_checkedDevMode && !force) {
      _checkingSecurity = false;
      return;
    }
    _checkedDevMode = true;

    final devModeEnabled = await DevModeService.isDeveloperModeEnabled();
    if (!devModeEnabled) {
      _checkingSecurity = false;
      return;
    }
    final usbActive = await DevModeService.isUsbConnectionActive();

    _checkingSecurity = false;

    // Block usage only when BOTH Developer Mode and USB/File Transfer are active.
    if (!usbActive) {
      return;
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final context = _navigatorKey.currentState?.overlay?.context;
      if (context == null) return;
      if (_securityDialogOpen) return;
      _securityDialogOpen = true;

      final message = StringBuffer()
        ..writeln(
          'Developer Mode is enabled on this device and a USB / File Transfer connection is currently active.',
        )
        ..writeln(
          'For your data safety, this application cannot be used while Developer Mode is enabled and USB/File Transfer is active.',
        )
        ..writeln('')
        ..writeln('Please choose one of the following options:');

      // showDialog<void>(
      //   context: context,
      //   barrierDismissible: false,
      //   builder: (dialogContext) => AlertDialog(
      //     title: const Text('Security Alert'),
      //     content: Text(message.toString()),
      //     actions: [
      //       TextButton(
      //         onPressed: () {
      //           _securityDialogOpen = false;
      //           SystemNavigator.pop();
      //         },
      //         child: const Text('Close App'),
      //       ),
      //       TextButton(
      //         onPressed: () async {
      //           _securityDialogOpen = false;
      //           Navigator.of(dialogContext).pop();
      //           await DevModeService.openDeveloperOptions();
      //           _checkSecurityState(force: true);
      //         },
      //         child: const Text('Disable Developer Mode'),
      //       ),
      //     ],
      //   ),
      // );
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
          '/terms': (context) => const TermsScreen(),
        },
      ),
    );
  }
}
