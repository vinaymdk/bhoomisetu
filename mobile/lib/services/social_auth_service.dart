import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:google_sign_in/google_sign_in.dart';
import '../config/firebase_config.dart';

class SocialAuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;
  bool _isInitialized = false;

  Future<void> _ensureInitialized() async {
    if (_isInitialized) return;
    await _googleSignIn.initialize();
    _isInitialized = true;
  }

  /// Sign in with Google
  /// Returns Firebase ID token for backend authentication
  Future<String> signInWithGoogle() async {
    try {
      // Check if Firebase is initialized
      if (!FirebaseConfig.isInitialized) {
        throw Exception('Firebase is not initialized. Please ensure Firebase.initializeApp() is called first.');
      }

      await _ensureInitialized();

      // Trigger Google Sign-In flow
      final GoogleSignInAccount googleUser = await _googleSignIn.authenticate(
        scopeHint: const ['email', 'profile'],
      );
      
      // Obtain auth details from the request
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // Create a new credential
      final credential = firebase_auth.GoogleAuthProvider.credential(
        idToken: googleAuth.idToken,
      );

      // Sign in to Firebase with the Google credential
      final firebaseAuth = firebase_auth.FirebaseAuth.instance;
      final userCredential = await firebaseAuth.signInWithCredential(credential);

      // Get the ID token for backend authentication
      final idToken = await userCredential.user?.getIdToken();
      
      if (idToken == null) {
        throw Exception('Failed to get ID token from Firebase');
      }

      return idToken;
    } catch (e) {
      // Re-throw with more context
      if (e is GoogleSignInException) {
        if (e.code == GoogleSignInExceptionCode.canceled) {
          throw Exception('Sign-in cancelled');
        }
      }
      throw Exception('Google sign-in failed: ${e.toString()}');
    }
  }

  /// Sign out from Google
  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
      await firebase_auth.FirebaseAuth.instance.signOut();
    } catch (e) {
      // Ignore sign-out errors
    }
  }
}
