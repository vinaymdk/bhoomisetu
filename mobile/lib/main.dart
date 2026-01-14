import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';
import 'config/firebase_config.dart';
import 'config/api_config.dart';
import 'config/api_client.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize API config
  await ApiConfig.initialize();
  
  // Initialize API client with interceptors
  ApiClient().initialize();
  
  // Initialize Firebase (for social login - optional, errors handled internally)
  await FirebaseConfig.initialize();
  
  runApp(const BhoomisetuApp());
}

class BhoomisetuApp extends StatelessWidget {
  const BhoomisetuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: MaterialApp(
        title: 'Bhoomisetu',
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
        },
      ),
    );
  }
}
