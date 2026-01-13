import { useState } from 'react';
import './Auth.css';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  error?: string;
  disabled?: boolean;
}

// Common country codes (can be expanded)
const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
];

export const PhoneInput = ({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  error,
  disabled,
}: PhoneInputProps) => {
  const [showCountryList, setShowCountryList] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const numericValue = e.target.value.replace(/\D/g, '');
    // Limit to 10 digits
    const limitedValue = numericValue.slice(0, 10);
    onChange(limitedValue);
  };

  return (
    <div className="phone-input-container">
      <div className="phone-input-wrapper">
        <div className="country-code-selector">
          <button
            type="button"
            className="country-code-button"
            onClick={() => setShowCountryList(!showCountryList)}
            disabled={disabled}
          >
            {COUNTRY_CODES.find(c => c.code === countryCode)?.flag || '🇮🇳'}
            <span className="country-code-text">{countryCode}</span>
            <span className="country-code-arrow">▼</span>
          </button>
          {showCountryList && (
            <div className="country-code-dropdown">
              {COUNTRY_CODES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  className="country-code-option"
                  onClick={() => {
                    onCountryCodeChange(country.code);
                    setShowCountryList(false);
                  }}
                >
                  <span className="country-flag">{country.flag}</span>
                  <span className="country-code">{country.code}</span>
                  <span className="country-name">{country.country}</span>
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
          className="phone-number-input"
          maxLength={10}
          disabled={disabled}
        />
      </div>
      {error && <div className="auth-error">{error}</div>}
      <span className="auth-hint">
        Enter 10-digit phone number (numbers only)
      </span>
    </div>
  );
};
