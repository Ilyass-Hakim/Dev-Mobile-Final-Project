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

const ManagerDashboardScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (auth.currentUser) {
            setUserName(auth.currentUser.displayName || 'Manager');
        }
    }, []);

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
                    <Text style={[styles.nameText, { color: theme.text }]}>{userName} (Manager)</Text>
                </View>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.statsContainer, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: theme.primary }]}>--</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Open</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: theme.warning }]}>--</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>In Progress</Text>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Management Console</Text>
                <View style={styles.cardsContainer}>
                    <ActionCard
                        title="Manage All Issues"
                        subtitle="View, update status, and comment on all reports"
                        icon="file-tray-full"
                        color="#007AFF"
                        onPress={() => navigation.navigate('AllIssues', { screen: 'IssueList' })}
                    />

                    <ActionCard
                        title="Analytics Dashboard"
                        subtitle="View issue statistics and trends"
                        icon="bar-chart"
                        color="#FF2D55" // Red/Pink
                        onPress={() => navigation.navigate('Analytics')}
                    />

                    <ActionCard
                        title="Notifications"
                        subtitle="View your alerts history"
                        icon="notifications"
                        color="#FF2D55"
                        onPress={() => navigation.navigate('Notifications')}
                    />

                    <ActionCard
                        title="My Profile"
                        subtitle="View personal details"
                        icon="person"
                        color="#FF9500"
                        onPress={() => navigation.navigate('Profile')}
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
        fontSize: 20,
        fontWeight: '700',
    },
    profileButton: {
        padding: 8,
    },
    content: {
        padding: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: '80%',
        alignSelf: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
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

export default ManagerDashboardScreen;
