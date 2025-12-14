import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboardScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const ActionCard = ({ title, subtitle, icon, color, onPress }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.cardBackground }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={28} color={color} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
                <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
                <View>
                    <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome,</Text>
                    <Text style={[styles.nameText, { color: theme.text }]}>Administrator</Text>
                </View>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Administration</Text>
                <View style={styles.cardsContainer}>
                    <ActionCard
                        title="User Management"
                        subtitle="Manage roles (Employees / Managers)"
                        icon="people"
                        color="#5856D6" // Purple
                        onPress={() => navigation.navigate('UserManagement')}
                    />
                    <ActionCard
                        title="Analytics Dashboard"
                        subtitle="View issue statistics and trends"
                        icon="bar-chart"
                        color="#FF2D55" // Red/Pink
                        onPress={() => navigation.navigate('Analytics')}
                    />
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 32, color: theme.text }]}>Operations</Text>
                <View style={styles.cardsContainer}>
                    <ActionCard
                        title="Global Issue Dashboard"
                        subtitle="View and manage all reported issues"
                        icon="file-tray-full"
                        color="#FF9500" // Orange
                        onPress={() => navigation.navigate('GlobalIssues', { screen: 'IssueList' })}
                    />

                    <ActionCard
                        title="Notifications"
                        subtitle="View system alerts"
                        icon="notifications"
                        color="#FF2D55"
                        onPress={() => navigation.navigate('Notifications')}
                    />

                    <ActionCard
                        title="System Health"
                        subtitle="View system status and logs (Placeholder)"
                        icon="pulse"
                        color="#34C759" // Green
                        onPress={() => console.log('System Health')}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
    },
    greeting: {
        fontSize: 14,
        marginBottom: 4,
    },
    nameText: {
        fontSize: 24,
        fontWeight: '700',
    },
    logoutButton: {
        padding: 8,
    },
    content: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    cardsContainer: {
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
    },
});

export default AdminDashboardScreen;
