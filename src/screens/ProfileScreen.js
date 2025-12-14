import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';

const ProfileScreen = ({ navigation }) => {
    const user = auth.currentUser;
    const { theme } = useTheme();

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const MenuItem = ({ icon, label, onPress, color }) => (
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.cardBackground }]} onPress={onPress}>
            <View style={styles.menuIconContainer}>
                <Ionicons name={icon} size={24} color={color || theme.text} />
            </View>
            <Text style={[styles.menuLabel, { color: color || theme.text }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
                <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
                    <Text style={styles.avatarText}>
                        {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                    </Text>
                </View>
                <Text style={[styles.name, { color: theme.text }]}>{user?.displayName || 'User'}</Text>
                <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
                {user?.role && <View style={[styles.roleBadge, { backgroundColor: theme.badgeBackground }]}><Text style={[styles.roleText, { color: theme.badgeText }]}>{user.role}</Text></View>}
            </View>

            <View style={styles.menuContainer}>
                <MenuItem
                    icon="person-outline"
                    label="Edit Profile"
                    onPress={() => { }}
                />
                <MenuItem
                    icon="notifications-outline"
                    label="Notifications"
                    onPress={() => { }}
                />
                <MenuItem
                    icon="settings-outline"
                    label="Settings"
                    onPress={() => navigation.navigate('Settings')}
                />

                <View style={styles.spacer} />

                <MenuItem
                    icon="log-out-outline"
                    label="Log Out"
                    onPress={handleLogout}
                    color={theme.error}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
        borderBottomWidth: 1,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFF',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        marginBottom: 12,
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    menuContainer: {
        padding: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    menuIconContainer: {
        width: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    spacer: {
        height: 24,
    },
});

export default ProfileScreen;
