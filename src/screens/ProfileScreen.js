import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

const ProfileScreen = ({ navigation }) => {
    const user = auth.currentUser;

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const MenuItem = ({ icon, label, onPress, color = '#1A1A1A' }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIconContainer}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={[styles.menuLabel, { color }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.displayName || 'User'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                {user?.role && <View style={styles.roleBadge}><Text style={styles.roleText}>{user.role}</Text></View>}
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
                    onPress={() => { }}
                />

                <View style={styles.spacer} />

                <MenuItem
                    icon="log-out-outline"
                    label="Log Out"
                    onPress={handleLogout}
                    color="#FF3B30"
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        // Shadow
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
        color: '#1A1A1A',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textTransform: 'capitalize',
    },
    menuContainer: {
        padding: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        // Shadow
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
