// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:bhoomisetu_mobile/main.dart';

void main() {
  testWidgets('Bhoomisetu app loads correctly', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const BhoomisetuApp());

    // Wait for Firebase initialization and auth check
    await tester.pumpAndSettle();

    // Verify that login screen is shown (when not authenticated)
    // Look for "Welcome to Bhoomisetu" or login-related text
    expect(find.text('Welcome to Bhoomisetu'), findsOneWidget);
  });
}
