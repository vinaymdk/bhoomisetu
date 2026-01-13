import 'package:flutter/material.dart';

class CountryCode {
  final String code;
  final String country;
  final String flag;

  const CountryCode({
    required this.code,
    required this.country,
    required this.flag,
  });
}

const List<CountryCode> countryCodes = [
  CountryCode(code: '+91', country: 'India', flag: '🇮🇳'),
  CountryCode(code: '+1', country: 'USA', flag: '🇺🇸'),
  CountryCode(code: '+44', country: 'UK', flag: '🇬🇧'),
  CountryCode(code: '+971', country: 'UAE', flag: '🇦🇪'),
  CountryCode(code: '+86', country: 'China', flag: '🇨🇳'),
  CountryCode(code: '+81', country: 'Japan', flag: '🇯🇵'),
  CountryCode(code: '+82', country: 'South Korea', flag: '🇰🇷'),
  CountryCode(code: '+65', country: 'Singapore', flag: '🇸🇬'),
  CountryCode(code: '+60', country: 'Malaysia', flag: '🇲🇾'),
  CountryCode(code: '+66', country: 'Thailand', flag: '🇹🇭'),
];

class CountryCodePicker extends StatefulWidget {
  final String selectedCode;
  final Function(String) onChanged;

  const CountryCodePicker({
    super.key,
    required this.selectedCode,
    required this.onChanged,
  });

  @override
  State<CountryCodePicker> createState() => _CountryCodePickerState();
}

class _CountryCodePickerState extends State<CountryCodePicker> {
  bool _showDropdown = false;

  CountryCode get selectedCountry {
    return countryCodes.firstWhere(
      (c) => c.code == widget.selectedCode,
      orElse: () => countryCodes.first,
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _showDropdown = !_showDropdown;
        });
      },
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
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
                  const Icon(Icons.arrow_drop_down, size: 20),
                ],
              ),
            ),
            if (_showDropdown)
              Positioned(
                top: 56,
                left: 0,
                right: 0,
                child: Container(
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
                          widget.onChanged(country.code);
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
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  country.country,
                                  style: TextStyle(
                                    color: Colors.grey.shade600,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
