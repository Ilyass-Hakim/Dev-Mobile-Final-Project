import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserService } from '../../services/UserService';
import { auth } from '../../config/firebase';
import { useTheme } from '../../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

const UserManagementScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await UserService.getAllUsers();
            // Filter out null or incomplete data if any
            setUsers(data.filter(u => u.email));
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateRole = async (userId, currentRole, userName) => {
        // Determine toggle logic: Employee <-> Manager
        // Admin role changes should probably be more restricted or manual to prevent lockouts,
        // but we can allow "Make Admin" if needed. For now, let's toggle Manager/Employee.

        // If Admin, don't allow changing own role here to prevent accidental lockout
        if (userId === auth.currentUser.uid) {
            Alert.alert("Action not allowed", "You cannot change your own role here.");
            return;
        }

        const newRole = currentRole === 'manager' ? 'employee' : 'manager';

        Alert.alert(
            'Confirm Role Change',
            `Change ${userName}'s role from ${currentRole} to ${newRole}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            await UserService.updateUserRole(userId, newRole);
                            Alert.alert('Success', `User updated to ${newRole}`);
                            fetchUsers(); // Refresh list
                        } catch (error) {
                            Alert.alert('Error', 'Failed to update role');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.userInfo}>
                <Text style={[styles.name, { color: theme.text }]}>{item.fullName || 'Unknown Name'}</Text>
                <Text style={[styles.email, { color: theme.textSecondary }]}>{item.email}</Text>
                <View style={[
                    styles.roleBadge,
                    userDataStyle(item.role).badge
                ]}>
                    <Text style={[
                        styles.roleText,
                        userDataStyle(item.role).text
                    ]}>
                        {item.role || 'employee'}
                    </Text>
                </View>
            </View>

            <View style={[styles.actions, { borderTopColor: theme.border }]}>
                {item.role !== 'admin' && ( // Don't allow demoting other admins easily for now
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        onPress={() => handleUpdateRole(item.id, item.role, item.fullName)}
                    >
                        <Text style={styles.actionButtonText}>
                            {item.role === 'manager' ? 'Demote to Employee' : 'Promote to Manager'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const userDataStyle = (role) => {
        switch (role) {
            case 'admin': return { badge: { backgroundColor: '#EAD1DC' }, text: { color: '#990033' } };
            case 'manager': return { badge: { backgroundColor: '#D0E0E3' }, text: { color: '#0C343D' } };
            default: return { badge: { backgroundColor: '#F3F3F3' }, text: { color: '#666' } };
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>User Management</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    userInfo: {
        marginBottom: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        marginBottom: 8,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    actions: {
        borderTopWidth: 1,
        paddingTop: 12,
        alignItems: 'flex-end',
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default UserManagementScreen;
