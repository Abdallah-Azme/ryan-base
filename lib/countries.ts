
export interface Country {
  code: string;
  name: string;
  dial_code: string;
  flag: string;
}

// Priority: Kuwait, Saudi, GCC, Arab, World
export const COUNTRIES: Country[] = [
  // 1. Kuwait
  { code: 'KW', name: 'Kuwait', dial_code: '+965', flag: '🇰🇼' },
  // 2. Saudi
  { code: 'SA', name: 'Saudi Arabia', dial_code: '+966', flag: '🇸🇦' },
  // 3. Rest of GCC
  { code: 'AE', name: 'UAE', dial_code: '+971', flag: '🇦🇪' },
  { code: 'QA', name: 'Qatar', dial_code: '+974', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain', dial_code: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', dial_code: '+968', flag: '🇴🇲' },
  // 4. Other Arab Countries (Selected)
  { code: 'EG', name: 'Egypt', dial_code: '+20', flag: '🇪🇬' },
  { code: 'JO', name: 'Jordan', dial_code: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', dial_code: '+961', flag: '🇱🇧' },
  { code: 'IQ', name: 'Iraq', dial_code: '+964', flag: '🇮🇶' },
  // 5. Common International
  { code: 'US', name: 'United States', dial_code: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial_code: '+44', flag: '🇬🇧' },
  { code: 'IN', name: 'India', dial_code: '+91', flag: '🇮🇳' },
  { code: 'PH', name: 'Philippines', dial_code: '+63', flag: '🇵🇭' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Kuwait
