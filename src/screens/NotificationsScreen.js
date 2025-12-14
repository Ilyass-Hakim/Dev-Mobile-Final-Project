import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.currentUser) return;

        const userId = auth.currentUser.uid;
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNotifications(notifs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.iconContainer}>
                <Ionicons
                    name={item.type === 'status_update' ? 'alert-circle' : 'chatbubble'}
                    size={24}
                    color={item.type === 'status_update' ? '#FF9500' : '#007AFF'}
                />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleString()}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : notifications.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="notifications-off-outline" size={64} color="#CCC" />
                    <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        marginRight: 16,
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    body: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    }
});

export default NotificationsScreen;
