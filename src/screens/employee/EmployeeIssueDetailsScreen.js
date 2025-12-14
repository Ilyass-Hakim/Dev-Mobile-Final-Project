import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { IssueService } from '../../services/IssueService';

const EmployeeIssueDetailsScreen = ({ route, navigation }) => {
    const { issue: initialIssue } = route.params;
    const [issue, setIssue] = useState(initialIssue);
    const [newComment, setNewComment] = useState('');
    const [commenting, setCommenting] = useState(false);

    useEffect(() => {
        const issueRef = doc(db, 'issues', initialIssue.id);
        const unsubscribe = onSnapshot(issueRef, (docSnap) => {
            if (docSnap.exists()) {
                setIssue({ id: docSnap.id, ...docSnap.data() });
            }
        });
        return () => unsubscribe();
    }, [initialIssue.id]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setCommenting(true);
        try {
            const userName = auth.currentUser.displayName || 'Employee';
            await IssueService.addComment(issue.id, newComment, 'employee', userName);
            setNewComment('');
        } catch (error) {
            Alert.alert('Error', 'Failed to send comment');
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
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Issue Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.statusSection}>
                    <View style={[styles.largeBadge, { backgroundColor: getStatusColor(issue.status) }]}>
                        <Text style={styles.largeBadgeText}>{issue.status}</Text>
                    </View>
                    <Text style={styles.dateText}>Reported on {new Date(issue.createdAt).toLocaleDateString()}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.row}>
                        <Ionicons name="pricetag" size={20} color="#666" style={{ marginRight: 8 }} />
                        <Text style={styles.value}>{issue.category}</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Severity</Text>
                            <Text style={styles.value}>{issue.severity || 'N/A'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Priority</Text>
                            <Text style={styles.value}>{issue.priority || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={{ height: 16 }} />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Location</Text>
                            <Text style={styles.value}>{issue.location || 'N/A'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Asset ID</Text>
                            <Text style={styles.value}>{issue.assetId || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={{ height: 16 }} />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Impact</Text>
                            <Text style={styles.value}>{issue.impact || 'N/A'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Reproducibility</Text>
                            <Text style={styles.value}>{issue.reproducibility || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Description</Text>
                    <Text style={styles.description}>{issue.description}</Text>

                    <Text style={[styles.label, { marginTop: 16 }]}>Steps to Reproduce</Text>
                    <Text style={styles.description}>{issue.stepsToReproduce || 'N/A'}</Text>

                    <Text style={[styles.label, { marginTop: 16 }]}>Expected Result</Text>
                    <Text style={styles.description}>{issue.expectedResult || 'N/A'}</Text>

                    <Text style={[styles.label, { marginTop: 16 }]}>Contact Info</Text>
                    <Text style={styles.value}>{issue.contactPhone || 'N/A'} ({issue.bestTime || 'Anytime'})</Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Discussion</Text>
                    {issue.comments && issue.comments.length > 0 ? (
                        issue.comments.map((comment, index) => (
                            <View key={index} style={[
                                styles.commentBox,
                                comment.role === 'manager' ? styles.managerComment : styles.employeeComment
                            ]}>
                                <Text style={styles.commentAuthor}>
                                    {comment.role === 'manager' ? 'Manager' : 'You'}
                                </Text>
                                <Text style={styles.commentText}>{comment.text}</Text>
                                <Text style={styles.commentDate}>
                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noCommentsText}>No comments yet.</Text>
                    )}
                </View>
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                style={styles.inputWrapper}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a reply..."
                        value={newComment}
                        onChangeText={setNewComment}
                        placeholderTextColor="#999"
                        multiline
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
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
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
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
        color: '#8E8E93',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#FFF',
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
        color: '#8E8E93',
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
        color: '#1A1A1A',
        fontWeight: '500',
    },
    description: {
        fontSize: 16,
        color: '#1A1A1A',
        lineHeight: 24,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 20,
    },
    commentBox: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    managerComment: {
        backgroundColor: '#FFF9E6',
        borderLeftWidth: 4,
        borderLeftColor: '#FFCC00',
        alignSelf: 'flex-start',
        width: '90%',
    },
    employeeComment: {
        backgroundColor: '#E3F2FD',
        borderRightWidth: 4,
        borderRightColor: '#2196F3',
        alignSelf: 'flex-end',
        width: '90%',
    },
    commentAuthor: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
        color: '#555',
    },
    commentText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    commentDate: {
        fontSize: 10,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    noCommentsText: {
        fontStyle: 'italic',
        color: '#999',
        fontSize: 14,
    },
    inputWrapper: {
        padding: 16,
        backgroundColor: '#FAFAFA',
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 4,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        color: '#1A1A1A',
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        backgroundColor: '#007AFF',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    }
});

export default EmployeeIssueDetailsScreen;
