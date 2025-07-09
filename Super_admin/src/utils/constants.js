/**
 * Application Constants for Rental Prima
 * Focused on Indian market defaults
 */

// Regional Settings
export const REGIONAL_SETTINGS = {
  COUNTRY: 'India',
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',
  DEFAULT_LANGUAGE: 'en-IN',
  PHONE_COUNTRY_CODE: '+91',
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'hh:mm A',
  TIMEZONE: 'Asia/Kolkata',
};

// Measurement Units
export const MEASUREMENT_UNITS = {
  DISTANCE: 'km',
  AREA: 'sq.ft',  // Square feet is common in Indian real estate
  TEMPERATURE: 'celsius',
};

// Localization
export const LOCALIZED_STRINGS = {
  PIN_CODE: 'PIN Code',  // Indian postal code
  STATE: 'State',
  GST: 'GST',  // Goods and Services Tax in India
  PAN: 'PAN',  // Permanent Account Number in India
};

// Payment Options
export const PAYMENT_METHODS = [
  'UPI',  // Very popular in India
  'Net Banking',
  'Credit Card',
  'Debit Card',
  'NEFT/RTGS', 
  'Wallet',
  'Cash'
];

// Popular Cities in India for real estate
export const POPULAR_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad', 
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Surat'
];

// Indian States and Union Territories
export const STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
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
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
  'Delhi',
  'Puducherry',
  'Jammu and Kashmir',
  'Ladakh'
];

// Security Settings
export const SECURITY_DEFAULTS = {
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,  
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  PASSWORD_EXPIRY_DAYS: 60,
  MAX_LOGIN_ATTEMPTS: 3,
  LOCKOUT_MINUTES: 15,
  SESSION_TIMEOUT_MINUTES: 30,
  TWO_FACTOR_AUTH_ENABLED: true
};

export default {
  REGIONAL_SETTINGS,
  MEASUREMENT_UNITS,
  LOCALIZED_STRINGS,
  PAYMENT_METHODS,
  POPULAR_CITIES,
  STATES,
  SECURITY_DEFAULTS
};
