import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from '../../context/ThemeContext';

const HomeScreen = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const { theme, isDarkMode } = useTheme();

    useFocusEffect(
        useCallback(() => {
            if (auth.currentUser) {
                setUserName(auth.currentUser.displayName || 'Employee');
            }
        }, [])
    );

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
            <View style={styles.arrowContainer}>
                <Ionicons name="arrow-forward" size={20} color={theme.textTertiary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: theme.textSecondary }]}>Hello,</Text>
                        <Text style={[styles.nameText, { color: theme.text }]}>{userName}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.profileButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                {/* Stats Section */}
                <View style={[styles.statsContainer, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: theme.primary }]}>12</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: theme.success }]}>28</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Resolved</Text>
                    </View>
                </View>

                {/* Main Actions */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>What would you like to do?</Text>

                <View style={styles.cardsContainer}>
                    <ActionCard
                        title="Report New Issue"
                        subtitle="Submit a maintenance request or report a hazard"
                        icon="add-circle"
                        color="#007AFF"
                        onPress={() => navigation.navigate('CreateIssue')}
                    />

                    <ActionCard
                        title="My Reports"
                        subtitle="View status of issues you have submitted"
                        icon="list"
                        color="#FF9500"
                        onPress={() => navigation.navigate('MyIssues', { screen: 'IssueList' })}
                    />

                    <ActionCard
                        title="Notifications"
                        subtitle="Check updates on your reported issues"
                        icon="notifications"
                        color="#FF2D55"
                        onPress={() => navigation.navigate('Notifications')}
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
    scrollContent: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    greeting: {
        fontSize: 16,
        marginBottom: 4,
    },
    nameText: {
        fontSize: 28,
        fontWeight: '700',
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
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
        padding: 16,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
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
        lineHeight: 18,
    },
    arrowContainer: {
        marginLeft: 8,
    },
});

export default HomeScreen;
