import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { IssueService } from '../../services/IssueService';
import { auth } from '../../config/firebase';

const CATEGORIES = [
    { id: 'maintenance', label: 'Maintenance', icon: 'construct' },
    { id: 'safety', label: 'Safety', icon: 'shield-checkmark' },
    { id: 'it', label: 'IT', icon: 'desktop' },
    { id: 'supply', label: 'Supply', icon: 'cart' },
];

const CreateIssueScreen = ({ navigation }) => {
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!description.trim() || !selectedCategory) {
            Alert.alert('Error', 'Please describe the issue and select a category.');
            return;
        }

        setLoading(true);
        try {
            await IssueService.addIssue({
                description: description,
                category: selectedCategory.label,
                userId: auth.currentUser?.uid,
                userEmail: auth.currentUser?.email,
            });

            Alert.alert('Success', 'Issue reported successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit issue. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Report Issue</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.sectionTitle}>Category</Text>
                    <View style={styles.categoriesGrid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryCard,
                                    selectedCategory?.id === cat.id && styles.selectedCategory,
                                ]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Ionicons
                                    name={cat.icon}
                                    size={32}
                                    color={selectedCategory?.id === cat.id ? '#FFFFFF' : '#007AFF'}
                                />
                                <Text
                                    style={[
                                        styles.categoryLabel,
                                        selectedCategory?.id === cat.id && styles.selectedCategoryText,
                                    ]}
                                >
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Describe the issue in detail..."
                            placeholderTextColor="#A0A0A0"
                            multiline
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!selectedCategory || !description.trim()) && styles.disabledButton
                        ]}
                        onPress={handleSubmit}
                        disabled={loading || !selectedCategory || !description.trim()}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Report</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
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
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFF',
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
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 16,
        marginTop: 8,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    categoryCard: {
        width: '48%', // roughly half
        aspectRatio: 1.3,
        backgroundColor: '#FFF',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        gap: 8,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    selectedCategory: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    selectedCategoryText: {
        color: '#FFFFFF',
    },
    inputContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        height: 150,
        marginBottom: 32,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
    },
    submitButton: {
        height: 56,
        backgroundColor: '#007AFF',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#A0A0A0',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default CreateIssueScreen;
