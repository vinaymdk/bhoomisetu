import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../providers/auth_provider.dart';
import '../../services/user_profile_service.dart';
import '../profile/settings_screen.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/saved_properties_screen.dart';
import '../buyer_requirements/buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final UserProfileService _profileService = UserProfileService();

  final TextEditingController _fullName = TextEditingController();
  final TextEditingController _email = TextEditingController();
  final TextEditingController _phone = TextEditingController();
  final TextEditingController _address = TextEditingController();

  bool _saving = false;
  String? _status;
  String? _avatarUrl;
  BottomNavItem _currentNavItem = BottomNavItem.profile;


  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    _fullName.text = auth.userData?['fullName']?.toString() ?? '';
    _email.text = auth.userData?['primaryEmail']?.toString() ?? '';
    _phone.text = auth.userData?['primaryPhone']?.toString() ?? '';
    _address.text = auth.userData?['address']?.toString() ?? '';
    _avatarUrl = auth.userData?['avatarUrl']?.toString();
  }

  Future<void> _pickAvatar(ImageSource source) async {
    final picker = ImagePicker();
    final file = await picker.pickImage(source: source, imageQuality: 80);
    if (file == null) return;
    final url = await _profileService.uploadAvatar(file.path);
    if (mounted) {
      setState(() {
        _avatarUrl = url;
        _status = 'Avatar updated.';
      });
    }
  }

  Future<void> _saveProfile() async {
    setState(() {
      _saving = true;
      _status = null;
    });
    try {
      await _profileService.updateProfile({
        'fullName': _fullName.text.trim(),
        'primaryEmail': _email.text.trim(),
        'primaryPhone': _phone.text.trim(),
        'address': _address.text.trim(),
      });
      await Provider.of<AuthProvider>(context, listen: false).refreshUser();
      setState(() {
        _status = 'Profile updated.';
      });
    } catch (e) {
      setState(() {
        _status = 'Failed to update profile: $e';
      });
    } finally {
      setState(() {
        _saving = false;
      });
    }
  }

  @override
  void dispose() {
    _fullName.dispose();
    _email.dispose();
    _phone.dispose();
    _address.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          TextButton(
            onPressed: () async {
              await auth.logout();
              if (mounted) Navigator.pop(context);
            },
            child: const Text('Logout', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(
          16,
          16,
          16,
          MediaQuery.of(context).viewInsets.bottom + 16,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _sectionCard(
              title: 'Profile Image',
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundImage: _avatarUrl != null ? NetworkImage(_avatarUrl!) : null,
                    child: _avatarUrl == null ? const Icon(Icons.person, size: 40) : null,
                  ),
                  const SizedBox(width: 16),
                  Column(
                    children: [
                      ElevatedButton(
                        onPressed: () => _pickAvatar(ImageSource.camera),
                        child: const Text('Camera'),
                      ),
                      const SizedBox(height: 8),
                      OutlinedButton(
                        onPressed: () => _pickAvatar(ImageSource.gallery),
                        child: const Text('Gallery'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            _sectionCard(
              title: 'Personal Information',
              child: Column(
                children: [
                  _textField('Full Name', _fullName),
                  _textField('Email', _email, readOnly: true),
                  _textField('Phone', _phone, readOnly: true),
                  _textField('Address', _address, maxLines: 3),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: _saving ? null : _saveProfile,
                    child: Text(_saving ? 'Saving...' : 'Save Changes'),
                  ),
                  if (_status != null) ...[
                    const SizedBox(height: 8),
                    Text(_status!, style: TextStyle(color: Colors.blue.shade700)),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 12),
            _sectionCard(
              title: 'Settings',
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Badge Preferences'),
                subtitle: const Text('Manage saved, listings, and requirements badges'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SettingsScreen()),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
            _sectionCard(
              title: 'Share BhoomiSetu',
              child: SizedBox(
                width: double.infinity,
                child: Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  children: [
                    _shareIcon(FontAwesomeIcons.whatsapp, const Color(0xFF25D366)),
                    _shareIcon(FontAwesomeIcons.facebookF, const Color(0xFF1877F2)),
                    _shareIcon(FontAwesomeIcons.xTwitter, const Color(0xFF111827)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentNavItem,
        onTap: _handleNavTap,
      ),
    );
  }

  void _handleNavTap(BottomNavItem item) {
    setState(() {
      _currentNavItem = item;
    });
    switch (item) {
      case BottomNavItem.home:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const HomeScreen()));
        break;
      case BottomNavItem.search:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen()));
        break;
      case BottomNavItem.list:
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final roles = authProvider.roles;
        final canAccess = roles.contains('seller') || roles.contains('agent');
        if (!canAccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Seller/Agent role required to list properties')),
          );
          return;
        }
        Navigator.push(context, MaterialPageRoute(builder: (_) => const MyListingsScreen()));
        break;
      case BottomNavItem.saved:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const SavedPropertiesScreen()));
        break;
      case BottomNavItem.profile:
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final roles = authProvider.roles;
        final canBuy = roles.contains('buyer') || roles.contains('admin');
        if (canBuy) {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const BuyerRequirementsScreen()));
          return;
        }
        break;
      case BottomNavItem.cs:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const CsDashboardScreen()));
        break;
    }
  }

  Widget _sectionCard({required String title, required Widget child}) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }

  Widget _textField(String label, TextEditingController controller,
      {int maxLines = 1, bool readOnly = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        readOnly: readOnly,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          filled: readOnly,
          fillColor: readOnly ? Colors.grey.shade100 : null,
        ),
      ),
    );
  }

  Widget _shareIcon(IconData icon, Color color) {
    return InkWell(
      onTap: () => Share.share('BhoomiSetu - https://bhoomisetu.com'),
      child: CircleAvatar(
        radius: 22,
        backgroundColor: color,
        child: FaIcon(icon, color: Colors.white, size: 18),
      ),
    );
  }
}

