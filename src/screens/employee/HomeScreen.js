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

const HomeScreen = ({ navigation }) => {
    const [userName, setUserName] = useState('');

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
            style={[styles.card, { paddingBottom: 20 }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={28} color={color} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>
            <View style={styles.arrowContainer}>
                <Ionicons name="arrow-forward" size={20} color="#C7C7CC" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.nameText}>{userName}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>

                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: '#007AFF' }]}>12</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: '#34C759' }]}>28</Text>
                        <Text style={styles.statLabel}>Resolved</Text>
                    </View>
                </View>

                {/* Main Actions */}
                <Text style={styles.sectionTitle}>What would you like to do?</Text>

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
        backgroundColor: '#FAFAFA',
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
        color: '#666666',
        marginBottom: 4,
    },
    nameText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        // Shadow
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
        backgroundColor: '#E5E5EA',
        alignSelf: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    cardsContainer: {
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        // Shadow
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
        color: '#1A1A1A',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#8E8E93',
        lineHeight: 18,
    },
    arrowContainer: {
        marginLeft: 8,
    },
});

export default HomeScreen;
