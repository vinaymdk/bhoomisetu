import 'package:flutter/material.dart';
import 'country_code_picker.dart';

class UnifiedPhoneInput extends StatefulWidget {
  final String value;
  final Function(String) onChange;
  final String countryCode;
  final Function(String) onCountryCodeChange;
  final String? error;
  final bool disabled;

  const UnifiedPhoneInput({
    super.key,
    required this.value,
    required this.onChange,
    required this.countryCode,
    required this.onCountryCodeChange,
    this.error,
    this.disabled = false,
  });

  @override
  State<UnifiedPhoneInput> createState() => _UnifiedPhoneInputState();
}

class _UnifiedPhoneInputState extends State<UnifiedPhoneInput> {
  bool _showDropdown = false;

  CountryCode get selectedCountry {
    return countryCodes.firstWhere(
      (c) => c.code == widget.countryCode,
      orElse: () => countryCodes.first,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          decoration: BoxDecoration(
            border: Border.all(
              color: widget.error != null
                  ? Colors.red
                  : Colors.grey.shade300,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              // Country code selector
              GestureDetector(
                onTap: widget.disabled
                    ? null
                    : () {
                        setState(() {
                          _showDropdown = !_showDropdown;
                        });
                      },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                  decoration: BoxDecoration(
                    border: Border(
                      right: BorderSide(color: Colors.grey.shade300),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        selectedCountry.flag,
                        style: const TextStyle(fontSize: 20),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        selectedCountry.code,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        Icons.arrow_drop_down,
                        size: 20,
                        color: Colors.grey.shade600,
                      ),
                    ],
                  ),
                ),
              ),
              // Phone number input
              Expanded(
                child: TextField(
                  controller: TextEditingController(text: widget.value)
                    ..selection = TextSelection.collapsed(offset: widget.value.length),
                  onChanged: (value) {
                    // Only allow numbers
                    final numericValue = value.replaceAll(RegExp(r'\D'), '');
                    // Limit to 10 digits
                    final limitedValue = numericValue.length > 10
                        ? numericValue.substring(0, 10)
                        : numericValue;
                    widget.onChange(limitedValue);
                  },
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  enabled: !widget.disabled,
                  decoration: InputDecoration(
                    hintText: 'Enter Phone Number',
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                    counterText: '',
                  ),
                ),
              ),
            ],
          ),
        ),
        // Dropdown for country codes
        if (_showDropdown)
          Container(
            margin: const EdgeInsets.only(top: 4),
            constraints: const BoxConstraints(maxHeight: 300),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade300),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: countryCodes.length,
              itemBuilder: (context, index) {
                final country = countryCodes[index];
                return InkWell(
                  onTap: () {
                    widget.onCountryCodeChange(country.code);
                    setState(() {
                      _showDropdown = false;
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    child: Row(
                      children: [
                        Text(
                          country.flag,
                          style: const TextStyle(fontSize: 20),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          country.code,
                          style: const TextStyle(
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        if (widget.error != null) ...[
          const SizedBox(height: 8),
          Text(
            widget.error!,
            style: TextStyle(
              color: Colors.red.shade700,
              fontSize: 12,
            ),
          ),
        ],
        const SizedBox(height: 8),
        Text(
          'Enter 10-digit phone number (numbers only)',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }
}