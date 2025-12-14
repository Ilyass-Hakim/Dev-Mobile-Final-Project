import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { IssueService } from '../../services/IssueService';
import { auth } from '../../config/firebase';
import { useTheme } from '../../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

const ManagerIssueDetailsScreen = ({ route, navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const { issue: initialIssue } = route.params;
    const [issue, setIssue] = useState(initialIssue);
    const [currentStatus, setCurrentStatus] = useState(initialIssue.status);
    const [newComment, setNewComment] = useState('');
    const [updating, setUpdating] = useState(false);
    const [commenting, setCommenting] = useState(false);

    useEffect(() => {
        const issueRef = doc(db, 'issues', initialIssue.id);
        const unsubscribe = onSnapshot(issueRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setIssue({ id: docSnap.id, ...data });
                setCurrentStatus(data.status); // Sync status if changed by another admin
            }
        });
        return () => unsubscribe();
    }, [initialIssue.id]);

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            await IssueService.updateIssueStatus(issue.id, newStatus);
            setCurrentStatus(newStatus);
            Alert.alert('Success', `Status updated to ${newStatus}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setCommenting(true);
        try {
            await IssueService.addComment(issue.id, newComment, 'manager', 'Manager');
            setNewComment('');
            // Alert.alert('Success', 'Comment added'); // Optional, removed for smoother flow
        } catch (error) {
            Alert.alert('Error', 'Failed to add comment');
        } finally {
            setCommenting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return '#FF9500';
            case 'In Progress': return '#007AFF';
            case 'Resolved': return '#34C759';
            default: return '#8E8E93';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Manage Issue</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.statusSection}>
                    <View style={[styles.largeBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
                        <Text style={styles.largeBadgeText}>{currentStatus}</Text>
                    </View>
                    <Text style={[styles.dateText, { color: theme.textSecondary }]}>Reported on {new Date(issue.createdAt).toLocaleDateString()}</Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
                    <View style={styles.row}>
                        <Ionicons name="pricetag" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
                        <Text style={[styles.value, { color: theme.text }]}>{issue.category}</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Severity</Text>
                            <Text style={[styles.value, { color: theme.text }]}>{issue.severity || 'N/A'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Priority</Text>
                            <Text style={[styles.value, { color: theme.text }]}>{issue.priority || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={{ height: 16 }} />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Location</Text>
                            <Text style={[styles.value, { color: theme.text }]}>{issue.location || 'N/A'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Asset ID</Text>
                            <Text style={[styles.value, { color: theme.text }]}>{issue.assetId || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={{ height: 16 }} />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Impact</Text>
                            <Text style={[styles.value, { color: theme.text }]}>{issue.impact || 'N/A'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Reproducibility</Text>
                            <Text style={[styles.value, { color: theme.text }]}>{issue.reproducibility || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
                    <Text style={[styles.description, { color: theme.text }]}>{issue.description}</Text>

                    <Text style={[styles.label, { marginTop: 16, color: theme.textSecondary }]}>Steps to Reproduce</Text>
                    <Text style={[styles.description, { color: theme.text }]}>{issue.stepsToReproduce || 'N/A'}</Text>

                    <Text style={[styles.label, { marginTop: 16, color: theme.textSecondary }]}>Expected Result</Text>
                    <Text style={[styles.description, { color: theme.text }]}>{issue.expectedResult || 'N/A'}</Text>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <Text style={[styles.label, { color: theme.textSecondary }]}>Reported By</Text>
                    <Text style={[styles.value, { color: theme.text }]}>{issue.userEmail || 'Unknown User'}</Text>
                    <View style={{ height: 8 }} />
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Contact Info</Text>
                    <Text style={[styles.value, { color: theme.text }]}>{issue.contactPhone || 'N/A'} ({issue.bestTime || 'Anytime'})</Text>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <Text style={[styles.label, { color: theme.textSecondary }]}>Discussion</Text>
                    {issue.comments && issue.comments.length > 0 ? (
                        issue.comments.map((comment, index) => (
                            <View key={index} style={[
                                styles.commentBox,
                                { backgroundColor: comment.role === 'manager' ? `${theme.primary}20` : theme.badgeBackground },
                                comment.role === 'manager' ? { borderRightColor: theme.primary } : { borderLeftColor: theme.textTertiary }
                            ]}>
                                <Text style={[styles.commentAuthor, { color: theme.text }]}>
                                    {comment.role === 'manager' ? 'You' : (comment.authorName || 'Employee')}
                                </Text>
                                <Text style={[styles.commentText, { color: theme.text }]}>{comment.text}</Text>
                                <Text style={[styles.commentDate, { color: theme.textTertiary }]}>
                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.noCommentsText, { color: theme.textSecondary }]}>No comments yet.</Text>
                    )}
                </View>

                <View style={styles.managerSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Manage Status</Text>
                    <View style={styles.actionButtons}>
                        {['Open', 'In Progress', 'Resolved'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.actionButton,
                                    { backgroundColor: theme.cardBackground, borderColor: getStatusColor(status) },
                                    currentStatus === status && { backgroundColor: theme.badgeBackground }
                                ]}
                                onPress={() => handleStatusUpdate(status)}
                                disabled={updating || currentStatus === status}
                            >
                                {updating && currentStatus === status ? (
                                    <ActivityIndicator size="small" color={getStatusColor(status)} />
                                ) : (
                                    <Text style={[
                                        styles.actionButtonText,
                                        { color: getStatusColor(status) },
                                        currentStatus === status && { opacity: 0.5 }
                                    ]}>
                                        {status}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                style={[styles.inputWrapper, { backgroundColor: theme.background }]}
            >
                <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground }]}>
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Add internal note or reply..."
                        value={newComment}
                        onChangeText={setNewComment}
                        placeholderTextColor={theme.inputPlaceholder}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: theme.primary }]}
                        onPress={handleAddComment}
                        disabled={commenting || !newComment.trim()}
                    >
                        {commenting ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Ionicons name="send" size={20} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    statusSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    largeBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        marginBottom: 8,
    },
    largeBadgeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    dateText: {
        fontSize: 14,
    },
    card: {
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    divider: {
        height: 1,
        marginVertical: 20,
    },
    commentBox: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderRightWidth: 4,
    },
    commentAuthor: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
        lineHeight: 20,
    },
    commentDate: {
        fontSize: 10,
        textAlign: 'right',
        marginTop: 4,
    },
    noCommentsText: {
        fontStyle: 'italic',
        fontSize: 14,
    },
    managerSection: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    inputWrapper: {
        padding: 16,
        borderTopWidth: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        borderRadius: 24,
        padding: 4,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    }
});

export default ManagerIssueDetailsScreen;
