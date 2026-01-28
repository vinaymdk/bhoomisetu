import 'package:flutter/material.dart';
import '../../services/buyer_requirements_service.dart';
import '../../models/buyer_requirement.dart';
import '../../widgets/bottom_navigation.dart';
import '../../providers/auth_provider.dart';
import 'package:provider/provider.dart';
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../properties/my_listings_screen.dart';
import '../properties/saved_properties_screen.dart';
import 'buyer_requirements_screen.dart';
import '../customer_service/cs_dashboard_screen.dart';
import '../subscriptions/subscriptions_screen.dart';
import '../subscriptions/payments_history_screen.dart';

class BuyerRequirementCreateScreen extends StatefulWidget {
  final BuyerRequirement? requirement;

  const BuyerRequirementCreateScreen({super.key, this.requirement});

  @override
  State<BuyerRequirementCreateScreen> createState() => _BuyerRequirementCreateScreenState();
}

class _BuyerRequirementCreateScreenState extends State<BuyerRequirementCreateScreen> {
  final BuyerRequirementsService _service = BuyerRequirementsService();
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _cityController = TextEditingController();
  final TextEditingController _stateController = TextEditingController();
  final TextEditingController _localityController = TextEditingController();
  final TextEditingController _pincodeController = TextEditingController();
  final TextEditingController _landmarkController = TextEditingController();
  final TextEditingController _minBudgetController = TextEditingController();
  final TextEditingController _maxBudgetController = TextEditingController();
  final TextEditingController _minAreaController = TextEditingController();
  final TextEditingController _maxAreaController = TextEditingController();
  final TextEditingController _bedroomsController = TextEditingController();
  final TextEditingController _bathroomsController = TextEditingController();
  final TextEditingController _featuresController = TextEditingController();
  final TextEditingController _expiryController = TextEditingController();

  String _budgetType = 'sale';
  String _propertyType = '';
  String _listingType = '';
  String _areaUnit = 'sqft';
  String _selectedState = '';
  bool _isLoading = false;
  String? _error;
  BottomNavItem _currentNavItem = BottomNavItem.profile;

  final List<String> _propertyTypes = const [
    'apartment',
    'house',
    'villa',
    'plot',
    'commercial',
    'industrial',
    'agricultural',
    'other',
  ];
  final List<String> _listingTypes = const ['sale', 'rent'];
  final List<String> _areaUnits = const ['sqft', 'sqm', 'acre', 'sqyrd'];
  final List<String> _indianStates = const [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chandigarh',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jammu and Kashmir',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
  ];
  final List<String> _titleSuggestions = const [
    '3BHK near metro',
    'Family home with parking',
    'Commercial space on main road',
  ];
  final List<String> _descriptionSuggestions = const [
    'Prefer ready-to-move property with good ventilation.',
    'Need easy access to metro/bus stops and schools.',
    'Looking for verified listings with clear paperwork.',
  ];
  final List<String> _featureSuggestions = const ['parking', 'lift', 'power-backup', 'east-facing', 'security'];

  @override
  void initState() {
    super.initState();
    if (widget.requirement != null) {
      final req = widget.requirement!;
      _titleController.text = req.title ?? '';
      _descriptionController.text = req.description ?? '';
      _cityController.text = req.location.city;
      _selectedState = req.location.state;
      _stateController.text = req.location.state;
      _localityController.text = req.location.locality ?? '';
      _pincodeController.text = req.location.pincode ?? '';
      _landmarkController.text = req.location.landmark ?? '';
      _minBudgetController.text = req.budget.minBudget?.toString() ?? '';
      _maxBudgetController.text = req.budget.maxBudget.toString();
      _budgetType = req.budget.budgetType;
      _propertyType = req.propertyDetails.propertyType ?? '';
      _listingType = req.propertyDetails.listingType ?? '';
      _minAreaController.text = req.propertyDetails.minArea?.toString() ?? '';
      _maxAreaController.text = req.propertyDetails.maxArea?.toString() ?? '';
      _areaUnit = req.propertyDetails.areaUnit;
      _bedroomsController.text = req.propertyDetails.bedrooms?.toString() ?? '';
      _bathroomsController.text = req.propertyDetails.bathrooms?.toString() ?? '';
      _featuresController.text = req.propertyDetails.requiredFeatures.join(', ');
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _localityController.dispose();
    _pincodeController.dispose();
    _landmarkController.dispose();
    _minBudgetController.dispose();
    _maxBudgetController.dispose();
    _minAreaController.dispose();
    _maxAreaController.dispose();
    _bedroomsController.dispose();
    _bathroomsController.dispose();
    _featuresController.dispose();
    _expiryController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final payload = {
        'title': _titleController.text.trim().isNotEmpty ? _titleController.text.trim() : null,
        'description': _descriptionController.text.trim().isNotEmpty ? _descriptionController.text.trim() : null,
        'location': {
          'city': _cityController.text.trim(),
          'state': _selectedState.isNotEmpty ? _selectedState : _stateController.text.trim(),
          'locality': _localityController.text.trim().isNotEmpty ? _localityController.text.trim() : null,
          'pincode': _pincodeController.text.trim().isNotEmpty ? _pincodeController.text.trim() : null,
          'landmark': _landmarkController.text.trim().isNotEmpty ? _landmarkController.text.trim() : null,
        },
        'minBudget': _minBudgetController.text.trim().isNotEmpty
            ? double.tryParse(_minBudgetController.text.trim())
            : null,
        'maxBudget': double.parse(_maxBudgetController.text.trim()),
        'budgetType': _budgetType,
        'propertyType': _propertyType.isNotEmpty ? _propertyType : null,
        'listingType': _listingType.isNotEmpty ? _listingType : null,
        'minArea': _minAreaController.text.trim().isNotEmpty
            ? double.tryParse(_minAreaController.text.trim())
            : null,
        'maxArea': _maxAreaController.text.trim().isNotEmpty
            ? double.tryParse(_maxAreaController.text.trim())
            : null,
        'areaUnit': _areaUnit,
        'bedrooms': _bedroomsController.text.trim().isNotEmpty
            ? int.tryParse(_bedroomsController.text.trim())
            : null,
        'bathrooms': _bathroomsController.text.trim().isNotEmpty
            ? int.tryParse(_bathroomsController.text.trim())
            : null,
        'requiredFeatures': _featuresController.text.trim().isNotEmpty
            ? _featuresController.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList()
            : [],
        'expiresInDays': _expiryController.text.trim().isNotEmpty
            ? int.tryParse(_expiryController.text.trim())
            : null,
      };
      if (widget.requirement != null) {
        await _service.update(widget.requirement!.id, payload);
      } else {
        await _service.create(payload);
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.requirement != null;
    return Scaffold(
      appBar: AppBar(
        title: Text(isEdit ? 'Edit Requirement' : 'Post Requirement'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: EdgeInsets.fromLTRB(
              16,
              16,
              16,
              MediaQuery.of(context).viewInsets.bottom + 16,
            ),
            children: [
              _sectionTitle('Requirement Summary'),
              _textField(_titleController, 'Title'),
              _suggestionChips(_titleSuggestions, (value) {
                if (_titleController.text.trim().isEmpty) {
                  _titleController.text = value;
                } else {
                  _titleController.text = '${_titleController.text.trim()} $value';
                }
                setState(() {});
              }),
              const SizedBox(height: 12),
              _textField(_descriptionController, 'Description'),
              _suggestionChips(_descriptionSuggestions, (value) {
                if (_descriptionController.text.trim().isEmpty) {
                  _descriptionController.text = value;
                } else {
                  _descriptionController.text = '${_descriptionController.text.trim()} $value';
                }
                setState(() {});
              }),
              const SizedBox(height: 20),
              _sectionTitle('Location *'),
              _textField(
                _cityController,
                'City *',
                validator: (value) => value == null || value.trim().isEmpty ? 'City is required' : null,
              ),
              const SizedBox(height: 12),
              _dropdownField(
                label: 'State *',
                value: _selectedState,
                options: ['', ..._indianStates],
                onChanged: (value) => setState(() => _selectedState = value),
                validator: (value) => value == null || value.trim().isEmpty ? 'State is required' : null,
              ),
              const SizedBox(height: 12),
              _textField(_localityController, 'Locality'),
              const SizedBox(height: 12),
              _textField(_pincodeController, 'Pincode'),
              const SizedBox(height: 12),
              _textField(_landmarkController, 'Landmark'),
              const SizedBox(height: 20),
              _sectionTitle('Budget *'),
              _textField(_minBudgetController, 'Min Budget', keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              _textField(
                _maxBudgetController,
                'Max Budget *',
                keyboardType: TextInputType.number,
                validator: (value) => value == null || value.trim().isEmpty ? 'Max budget is required' : null,
              ),
              const SizedBox(height: 12),
              _dropdownField(
                label: 'Budget Type',
                value: _budgetType,
                options: const ['sale', 'rent'],
                onChanged: (value) => setState(() => _budgetType = value),
              ),
              const SizedBox(height: 20),
              _sectionTitle('Property Preferences'),
              _dropdownField(
                label: 'Property Type',
                value: _propertyType,
                options: ['', ..._propertyTypes],
                onChanged: (value) => setState(() => _propertyType = value),
              ),
              const SizedBox(height: 12),
              _dropdownField(
                label: 'Listing Type',
                value: _listingType,
                options: ['', ..._listingTypes],
                onChanged: (value) => setState(() => _listingType = value),
              ),
              const SizedBox(height: 12),
              _textField(_minAreaController, 'Min Area', keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              _textField(_maxAreaController, 'Max Area', keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              _dropdownField(
                label: 'Area Unit',
                value: _areaUnit,
                options: _areaUnits,
                onChanged: (value) => setState(() => _areaUnit = value),
              ),
              const SizedBox(height: 12),
              _textField(_bedroomsController, 'Bedrooms', keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              _textField(_bathroomsController, 'Bathrooms', keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              _textField(_featuresController, 'Required Features (comma-separated)'),
              _suggestionChips(_featureSuggestions, (value) {
                final existing = _featuresController.text
                    .split(',')
                    .map((e) => e.trim())
                    .where((e) => e.isNotEmpty)
                    .toList();
                if (!existing.contains(value)) {
                  existing.add(value);
                  _featuresController.text = existing.join(', ');
                  setState(() {});
                }
              }),
              const SizedBox(height: 12),
              _textField(_expiryController, 'Expires In Days', keyboardType: TextInputType.number),
              if (_error != null) ...[
                const SizedBox(height: 12),
                _errorBanner(_error!),
              ],
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                child: Text(_isLoading ? 'Saving...' : isEdit ? 'Update Requirement' : 'Post Requirement'),
              ),
            ],
          ),
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
      case BottomNavItem.subscriptions:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const SubscriptionsScreen()));
        break;
      case BottomNavItem.payments:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentsHistoryScreen()));
        break;
      case BottomNavItem.profile:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const BuyerRequirementsScreen()));
        break;
      case BottomNavItem.cs:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const CsDashboardScreen()));
        break;
    }
  }

  Widget _sectionTitle(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
    );
  }

  Widget _textField(
    TextEditingController controller,
    String label, {
    String? Function(String?)? validator,
    TextInputType? keyboardType,
  }) {
    return TextFormField(
      controller: controller,
      validator: validator,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
    );
  }

  Widget _dropdownField({
    required String label,
    required String value,
    required List<String> options,
    required ValueChanged<String> onChanged,
    String? Function(String?)? validator,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
      items: options
          .map((option) => DropdownMenuItem(value: option, child: Text(option.isEmpty ? 'Any' : option)))
          .toList(),
      validator: validator,
      onChanged: (value) => onChanged(value ?? ''),
    );
  }

  Widget _suggestionChips(List<String> items, ValueChanged<String> onTap) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Wrap(
        spacing: 8,
        runSpacing: 6,
        children: items
            .map(
              (item) => ActionChip(
                label: Text(item, style: const TextStyle(fontSize: 12)),
                onPressed: () => onTap(item),
              ),
            )
            .toList(),
      ),
    );
  }

  Widget _errorBanner(String message) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.red.shade100),
      ),
      child: Text(message, style: TextStyle(color: Colors.red.shade700)),
    );
  }
}

