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
import { IssueService } from '../../services/IssueService';
import { auth } from '../../config/firebase';
import { useFocusEffect } from '@react-navigation/native';

const ManagerIssueListScreen = ({ navigation }) => {
    const [issues, setIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Maintenance', 'IT', 'Safety', 'Other'];

    useFocusEffect(
        useCallback(() => {
            const unsubscribe = IssueService.subscribeToIssues(null, (fetchedIssues) => {
                setIssues(fetchedIssues);
                setFilteredIssues(fetchedIssues); // Initial set
                setLoading(false);
            });

            return () => unsubscribe && unsubscribe();
        }, [])
    );

    // Filter Logic
    useEffect(() => {
        let result = issues;

        // 1. Filter by Category
        if (selectedCategory !== 'All') {
            result = result.filter(issue => issue.category === selectedCategory);
        }

        // 2. Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(issue =>
                issue.title?.toLowerCase().includes(query) ||
                issue.description?.toLowerCase().includes(query) ||
                issue.userEmail?.toLowerCase().includes(query)
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

    const renderIssueItem = ({ item }) => (
        <TouchableOpacity
            style={styles.issueCard}
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
                        color="#666"
                        style={{ marginRight: 6 }}
                    />
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>
                {item.description}
            </Text>

            <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{item.userEmail || 'Unknown User'}</Text>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>All Issues</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#8E8E93"
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
                                selectedCategory === cat && styles.filterChipActive
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedCategory === cat && styles.filterTextActive
                            ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={filteredIssues}
                    keyExtractor={(item) => item.id}
                    renderItem={renderIssueItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="clipboard-outline" size={64} color="#C7C7CC" />
                            <Text style={styles.emptyText}>No issues found matching your filters</Text>
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
        backgroundColor: '#F2F2F7',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3E3E8',
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
        color: '#000',
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
        backgroundColor: '#E5E5EA',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#007AFF',
    },
    filterText: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    issueCard: {
        backgroundColor: '#fff',
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
        color: '#8E8E93',
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
        color: '#000',
        marginBottom: 4,
    },
    description: {
        fontSize: 15,
        color: '#3C3C43',
        marginBottom: 12,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        paddingTop: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userText: {
        fontSize: 13,
        color: '#8E8E93',
        marginLeft: 6,
    },
    dateText: {
        fontSize: 13,
        color: '#C7C7CC',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
    },
});

export default ManagerIssueListScreen;
