import { useState, useRef, useEffect } from 'react';
import './Auth.css';

interface UnifiedPhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  error?: string;
  disabled?: boolean;
}

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+971', flag: '🇦🇪' },
  { code: '+86', flag: '🇨🇳' },
  { code: '+81', flag: '🇯🇵' },
  { code: '+82', flag: '🇰🇷' },
  { code: '+65', flag: '🇸🇬' },
  { code: '+60', flag: '🇲🇾' },
  { code: '+66', flag: '🇹🇭' },
];

export const UnifiedPhoneInput = ({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  error,
  disabled,
}: UnifiedPhoneInputProps) => {
  const [showCountryList, setShowCountryList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCountryList(false);
      }
    };

    if (showCountryList) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCountryList]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const numericValue = e.target.value.replace(/\D/g, '');
    // Limit to 10 digits
    const limitedValue = numericValue.slice(0, 10);
    onChange(limitedValue);
  };

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <div className="unified-phone-container" ref={containerRef}>
      <div className="unified-phone-input-wrapper">
        <div className="unified-phone-country-code">
          <button
            type="button"
            className="unified-phone-code-button"
            onClick={() => setShowCountryList(!showCountryList)}
            disabled={disabled}
          >
            {selectedCountry.flag}
            <span>{countryCode}</span>
            <span className="unified-phone-arrow">▼</span>
          </button>
          {showCountryList && (
            <div className="unified-phone-dropdown">
              {COUNTRY_CODES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  className="unified-phone-dropdown-item"
                  onClick={() => {
                    onCountryCodeChange(country.code);
                    setShowCountryList(false);
                  }}
                >
                  {country.flag} {country.code}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          placeholder="Enter Phone Number"
          className="unified-phone-number-input"
          maxLength={10}
          disabled={disabled}
        />
      </div>
      {error && <div className="auth-error">{error}</div>}
      <span className="auth-hint">Enter 10-digit phone number (numbers only)</span>
    </div>
  );
};
