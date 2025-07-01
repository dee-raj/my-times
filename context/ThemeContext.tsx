import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

// Define color palettes
const lightColors = {
  primary: '#007AFF',
  primaryLight: '#E1F0FF',
  secondary: '#5E5CE6',
  accent: '#FF9500',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C7C7CC',
};

const darkColors = {
  primary: '#0A84FF',
  primaryLight: '#1C3E66',
  secondary: '#5E5CE6',
  accent: '#FF9F0A',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
};

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(systemColorScheme as ThemeType || 'light');

  // Update theme when system preference changes
  useEffect(() => {
    if (systemColorScheme) {
      setTheme(systemColorScheme as ThemeType);
    }
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};