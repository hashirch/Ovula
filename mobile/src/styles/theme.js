// Theme configuration matching the reference design
export const colors = {
  primary: '#FF5A92',
  accent: '#9D7BFF',
  secondary: '#FF91C1',
  dark: '#1A1423',
  powder: '#FFF9FA',
  white: '#FFFFFF',
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  pink: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
  },
  green: {
    400: '#4ADE80',
    500: '#22C55E',
  },
  blue: {
    50: '#EFF6FF',
    500: '#3B82F6',
  },
  orange: {
    50: '#FFF7ED',
    400: '#FB923C',
    500: '#F97316',
  },
  indigo: {
    50: '#EEF2FF',
    500: '#6366F1',
  },
  red: {
    50: '#FEF2F2',
    500: '#EF4444',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#FF5A92',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    black: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
};
