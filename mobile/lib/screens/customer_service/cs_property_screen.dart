import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/customer_service.dart';
import '../../models/customer_service.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/bottom_navigation.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';

class CsPropertyScreen extends StatefulWidget {
  final String propertyId;
  const CsPropertyScreen({super.key, required this.propertyId});

  @override
  State<CsPropertyScreen> createState() => _CsPropertyScreenState();
}

class _CsPropertyScreenState extends State<CsPropertyScreen> {
  final CustomerServiceApi _service = CustomerServiceApi();
  PendingVerificationProperty? _data;
  bool _loading = true;
  String? _error;
  String _urgency = 'normal';
  String _action = 'approve';
  final TextEditingController _negotiation = TextEditingController();
  final TextEditingController _remarks = TextEditingController();
  final TextEditingController _rejection = TextEditingController();
  bool _submitting = false;
  int _activeImage = 0;
  final PageController _pageController = PageController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _negotiation.dispose();
    _remarks.dispose();
    _rejection.dispose();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await _service.getProperty(widget.propertyId);
      setState(() => _data = result);
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '').replaceAll('DioException [bad response]: ', '');
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _submit() async {
    if (_action == 'reject' && _rejection.text.trim().length < 5) {
      setState(() => _error = 'Rejection reason is required.');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await _service.verifyProperty(
        propertyId: widget.propertyId,
        urgencyLevel: _urgency,
        action: _action,
        negotiationNotes: _negotiation.text.trim().isEmpty ? null : _negotiation.text.trim(),
        remarks: _remarks.text.trim().isEmpty ? null : _remarks.text.trim(),
        rejectionReason: _action == 'reject' ? _rejection.text.trim() : null,
      );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '').replaceAll('DioException [bad response]: ', '');
      });
    } finally {
      setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Property Verification')),
        body: Center(child: Text(_error!, style: const TextStyle(color: Colors.red))),
      );
    }

    final data = _data!;
    final property = data.property;

    return Scaffold(
      appBar: AppBar(title: const Text('Property Verification')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              property.title,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text('${property.location.address}', style: const TextStyle(color: Colors.black54)),
            const SizedBox(height: 12),
            if (property.images != null && property.images!.isNotEmpty) ...[
              SizedBox(
                height: 200,
                child: PageView.builder(
                  controller: _pageController,
                  itemCount: property.images!.length,
                  onPageChanged: (index) => setState(() => _activeImage = index),
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(property.images![index].imageUrl, fit: BoxFit.cover),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Wrap(
                  spacing: 6,
                  children: List.generate(
                    property.images!.length,
                    (index) => Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: index == _activeImage ? Colors.blueAccent : Colors.grey.shade300,
                      ),
                    ),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  _infoRow('Price', '₹${property.price.toStringAsFixed(0)}'),
                  _infoRow('Area', '${property.area} ${property.areaUnit}'),
                  _infoRow('Type', property.propertyType),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const Text('Seller', style: TextStyle(fontWeight: FontWeight.bold)),
            Text(data.seller.fullName ?? 'Unknown'),
            Text(data.seller.primaryPhone ?? 'No phone'),
            Text(data.seller.primaryEmail ?? 'No email'),
            const SizedBox(height: 16),
            const Text('Verification', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _action,
              decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Action'),
              items: const [
                DropdownMenuItem(value: 'approve', child: Text('Approve')),
                DropdownMenuItem(value: 'reject', child: Text('Reject')),
              ],
              onChanged: (v) => setState(() => _action = v ?? 'approve'),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _urgency,
              decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Urgency'),
              items: const [
                DropdownMenuItem(value: 'low', child: Text('Low')),
                DropdownMenuItem(value: 'normal', child: Text('Normal')),
                DropdownMenuItem(value: 'high', child: Text('High')),
                DropdownMenuItem(value: 'urgent', child: Text('Urgent')),
              ],
              onChanged: (v) => setState(() => _urgency = v ?? 'normal'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _negotiation,
              decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Negotiation Notes'),
              maxLines: 2,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _remarks,
              decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Remarks'),
              maxLines: 2,
            ),
            if (_action == 'reject') ...[
              const SizedBox(height: 8),
              TextField(
                controller: _rejection,
                decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Rejection Reason'),
                maxLines: 2,
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(_error!, style: const TextStyle(color: Colors.red)),
            ],
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submitting ? null : _submit,
                child: _submitting ? const CircularProgressIndicator() : const Text('Submit Verification'),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigation(
        currentIndex: BottomNavItem.home,
        onTap: _handleNavTap,
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.black54)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  void _handleNavTap(BottomNavItem item) {
    switch (item) {
      case BottomNavItem.home:
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
          (route) => false,
        );
        break;
      case BottomNavItem.search:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SearchScreen()),
        );
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
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const MyListingsScreen()),
        );
        break;
      case BottomNavItem.saved:
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Saved properties screen coming soon')),
        );
        break;
      case BottomNavItem.profile:
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile screen coming soon')),
        );
        break;
    }
  }
}
