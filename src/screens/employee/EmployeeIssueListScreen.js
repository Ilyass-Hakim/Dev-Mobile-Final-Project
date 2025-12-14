import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../config/firebase';
import { IssueService } from '../../services/IssueService';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

const EmployeeIssueListScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [issues, setIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Maintenance', 'IT', 'Safety', 'Other'];

    useFocusEffect(
        useCallback(() => {
            if (auth.currentUser) {
                const unsubscribe = IssueService.subscribeToIssues(auth.currentUser.uid, (fetchedIssues) => {
                    setIssues(fetchedIssues);
                    setFilteredIssues(fetchedIssues);
                    setLoading(false);
                });
                return () => unsubscribe && unsubscribe();
            }
        }, [])
    );

    // Filter Logic
    useEffect(() => {
        let result = issues;

        if (selectedCategory !== 'All') {
            result = result.filter(issue => issue.category === selectedCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(issue =>
                issue.title?.toLowerCase().includes(query) ||
                issue.description?.toLowerCase().includes(query)
            );
        }

        setFilteredIssues(result);
    }, [issues, searchQuery, selectedCategory]);

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return '#FF9500'; // Orange
            case 'In Progress': return '#007AFF'; // Blue
            case 'Resolved': return '#34C759'; // Green
            default: return '#8E8E93'; // Gray
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('IssueDetails', { issue: item })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.categoryContainer}>
                    <Ionicons
                        name={
                            item.category === 'Maintenance' ? 'construct' :
                                item.category === 'Safety' ? 'shield-checkmark' :
                                    item.category === 'IT' ? 'desktop' : 'cart'
                        }
                        size={16}
                        color={theme.textSecondary}
                        style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.categoryText, { color: theme.textSecondary }]}>{item.category}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <Text style={[styles.description, { color: theme.text }]} numberOfLines={2}>
                {item.description}
            </Text>

            <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                <Text style={[styles.dateText, { color: theme.textTertiary }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>My Reports</Text>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground }]}>
                <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search my reports..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={theme.inputPlaceholder}
                    clearButtonMode="while-editing"
                />
            </View>

            {/* Category Filter */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.filterChip,
                                { backgroundColor: selectedCategory === cat ? theme.primary : theme.badgeBackground }
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: selectedCategory === cat ? '#FFFFFF' : theme.text },
                                selectedCategory === cat && styles.filterTextActive
                            ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredIssues}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="clipboard-outline" size={64} color={theme.textTertiary} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No reports found</Text>
                        </View>
                    }
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 8,
        height: 40,
    },
    searchIcon: {
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterContainer: {
        marginBottom: 8,
    },
    filterContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
    },
    filterTextActive: {
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 15,
        marginBottom: 12,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingTop: 12,
    },
    dateText: {
        fontSize: 13,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    },
});

export default EmployeeIssueListScreen;
