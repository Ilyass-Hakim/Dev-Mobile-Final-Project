import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

const lightTheme = {
    // Backgrounds
    background: '#FAFAFA',
    cardBackground: '#FFFFFF',
    headerBackground: '#FFFFFF',

    // Text
    text: '#1A1A1A',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',

    // Primary colors
    primary: '#007AFF',
    primaryLight: '#5AC8FA',

    // Status colors
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#5AC8FA',

    // Borders
    border: '#F0F0F0',
    borderLight: '#E5E5EA',

    // Shadows
    shadowColor: '#000',

    // Tab bar
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#F0F0F0',
    tabBarActive: '#007AFF',
    tabBarInactive: '#8E8E93',

    // Input
    inputBackground: '#F2F2F7',
    inputBorder: '#E5E5EA',
    inputText: '#1A1A1A',
    inputPlaceholder: '#8E8E93',

    // Badge
    badgeBackground: '#F2F2F7',
    badgeText: '#666666',
};

const darkTheme = {
    // Backgrounds
    background: '#000000',
    cardBackground: '#1C1C1E',
    headerBackground: '#1C1C1E',

    // Text
    text: '#FFFFFF',
    textSecondary: '#98989D',
    textTertiary: '#48484A',

    // Primary colors
    primary: '#0A84FF',
    primaryLight: '#64D2FF',

    // Status colors
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#64D2FF',

    // Borders
    border: '#38383A',
    borderLight: '#48484A',

    // Shadows
    shadowColor: '#000',

    // Tab bar
    tabBarBackground: '#1C1C1E',
    tabBarBorder: '#38383A',
    tabBarActive: '#0A84FF',
    tabBarInactive: '#98989D',

    // Input
    inputBackground: '#2C2C2E',
    inputBorder: '#38383A',
    inputText: '#FFFFFF',
    inputPlaceholder: '#98989D',

    // Badge
    badgeBackground: '#2C2C2E',
    badgeText: '#98989D',
};

const THEME_STORAGE_KEY = '@app_theme_preference';

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = !isDarkMode;
            setIsDarkMode(newTheme);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
