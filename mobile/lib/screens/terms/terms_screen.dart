import 'package:flutter/material.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Terms and Conditions'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: const [
            Text(
              'By using BhoomiSetu, you agree to follow all applicable laws and our platform guidelines. '
              'This page provides a high-level summary of our terms; a full legal version can be published here later.',
              style: TextStyle(fontSize: 14, color: Colors.black87),
            ),
            SizedBox(height: 16),
            Text(
              'Account and Access',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 8),
            Text('• Keep your login credentials private and secure.'),
            Text('• Provide accurate contact information for verification and alerts.'),
            Text('• Report suspicious activity immediately.'),
            SizedBox(height: 16),
            Text(
              'Listings and Communications',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 8),
            Text('• Only post properties you are authorized to list.'),
            Text('• Do not share misleading, abusive, or fraudulent content.'),
            Text('• Respect user privacy and communication guidelines.'),
            SizedBox(height: 16),
            Text(
              'Payments and Subscriptions',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 8),
            Text('• Subscription benefits are tied to the account that purchased them.'),
            Text('• Payment history is available in your profile and subscriptions area.'),
            SizedBox(height: 16),
            Text(
              'Updates',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 8),
            Text(
              'Terms may be updated periodically. Continued use of the platform indicates acceptance of the latest version.',
            ),
          ],
        ),
      ),
    );
  }
}
