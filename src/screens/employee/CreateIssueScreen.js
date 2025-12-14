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
    Alert,
    Modal,
    FlatList
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

const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
const PRIORITY_LEVELS = ['Low', 'Medium', 'High'];
const IMPACT_SCOPE = ['Individual', 'Team', 'Department', 'Whole Company'];
const REPRODUCIBILITY = ['Always', 'Intermittent', 'Once'];
const BEST_TIME_OPTIONS = ['Morning (8am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-8pm)', 'Anytime'];
const STEPS_TO_REPRODUCE_OPTIONS = [
    'Issue occurs on login',
    'Issue occurs when accessing specific feature',
    'Issue occurs after update',
    'Issue occurs randomly',
    'Issue occurs with specific equipment',
    'Other (describe below)'
];
const EXPECTED_RESULT_OPTIONS = [
    'System should work normally',
    'Feature should be accessible',
    'Equipment should function properly',
    'No error messages',
    'Data should be saved correctly',
    'Other (describe below)'
];

// Simple Modal Picker Component
const CustomPicker = ({ visible, options, onClose, onSelect, title }) => (
    <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={options}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                                onSelect(item);
                                onClose();
                            }}
                        >
                            <Text style={styles.modalItemText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    </Modal>
);

const CreateIssueScreen = ({ navigation }) => {
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    // New State Fields
    const [severity, setSeverity] = useState('Medium');
    const [priority, setPriority] = useState('Medium');
    const [location, setLocation] = useState('');
    const [assetId, setAssetId] = useState('');
    const [impact, setImpact] = useState('Individual');
    const [reproducibility, setReproducibility] = useState('Always');
    const [contactPhone, setContactPhone] = useState('');
    const [bestTime, setBestTime] = useState('Anytime');
    const [stepsToReproduce, setStepsToReproduce] = useState('Other (describe below)');
    const [expectedResult, setExpectedResult] = useState('System should work normally');

    // Conditional description fields for 'Other' options
    const [stepsDescription, setStepsDescription] = useState('');
    const [expectedResultDescription, setExpectedResultDescription] = useState('');

    // Modal Visibility States
    const [showSeverityPicker, setShowSeverityPicker] = useState(false);
    const [showPriorityPicker, setShowPriorityPicker] = useState(false);
    const [showImpactPicker, setShowImpactPicker] = useState(false);
    const [showReproducibilityPicker, setShowReproducibilityPicker] = useState(false);
    const [showBestTimePicker, setShowBestTimePicker] = useState(false);
    const [showStepsPicker, setShowStepsPicker] = useState(false);
    const [showExpectedResultPicker, setShowExpectedResultPicker] = useState(false);

    const [loading, setLoading] = useState(false);
    const [showValidation, setShowValidation] = useState(false);

    const handleSubmit = async () => {
        if (!description.trim() || !selectedCategory) {
            setShowValidation(true);
            Alert.alert('Error', 'Please fill in all required fields (marked with *)');
            return;
        }

        setLoading(true);
        try {
            await IssueService.addIssue({
                description: description,
                category: selectedCategory.label,
                severity,
                priority,
                location,
                assetId,
                impact,
                reproducibility,
                contactPhone,
                bestTime,
                stepsToReproduce: stepsToReproduce === 'Other (describe below)'
                    ? stepsDescription
                    : stepsToReproduce,
                expectedResult: expectedResult === 'Other (describe below)'
                    ? expectedResultDescription
                    : expectedResult,
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
                    <Text style={styles.sectionTitle}>
                        Select Category <Text style={styles.requiredAsterisk}>*</Text>
                    </Text>
                    {showValidation && !selectedCategory && (
                        <Text style={styles.errorText}>Please select a category</Text>
                    )}
                    <View style={styles.categoriesGrid}>
                        {CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory?.id === cat.id;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryCard,
                                        isSelected && styles.selectedCategory,
                                    ]}
                                    onPress={() => setSelectedCategory(cat)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.iconContainer,
                                        isSelected ? styles.selectedIconContainer : styles.unselectedIconContainer
                                    ]}>
                                        <Ionicons
                                            name={cat.icon}
                                            size={24}
                                            color={isSelected ? '#007AFF' : '#666'}
                                        />
                                    </View>

                                    <Text style={[
                                        styles.categoryLabel,
                                        isSelected && styles.selectedCategoryText,
                                    ]}>
                                        {cat.label}
                                    </Text>

                                    {isSelected && (
                                        <View style={styles.checkmarkBadge}>
                                            <Ionicons name="checkmark" size={12} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.inputLabel}>Severity</Text>
                            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowSeverityPicker(true)}>
                                <Text style={styles.pickerButtonText}>{severity}</Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.inputLabel}>Priority</Text>
                            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowPriorityPicker(true)}>
                                <Text style={styles.pickerButtonText}>{priority}</Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>Asset ID / Device Name</Text>
                    <TextInput
                        style={styles.simpleInput}
                        placeholder="e.g. LP-2023-001"
                        value={assetId}
                        onChangeText={setAssetId}
                    />

                    <Text style={styles.sectionTitle}>
                        Description <Text style={styles.requiredAsterisk}>*</Text>
                    </Text>
                    {showValidation && !description.trim() && (
                        <Text style={styles.errorText}>Please provide a description</Text>
                    )}
                    <View style={[
                        styles.inputContainer,
                        showValidation && !description.trim() && styles.errorBorder
                    ]}>
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

                    <Text style={styles.inputLabel}>Location / Room Number</Text>
                    <TextInput
                        style={styles.simpleInput}
                        placeholder="e.g. Server Room B, Desk 42"
                        value={location}
                        onChangeText={setLocation}
                    />

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.inputLabel}>Impact</Text>
                            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowImpactPicker(true)}>
                                <Text style={styles.pickerButtonText}>{impact}</Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.inputLabel}>Reproducibility</Text>
                            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowReproducibilityPicker(true)}>
                                <Text style={styles.pickerButtonText}>{reproducibility}</Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>Contact Phone</Text>
                    <TextInput
                        style={styles.simpleInput}
                        placeholder="+1 (555) 000-0000"
                        keyboardType="phone-pad"
                        value={contactPhone}
                        onChangeText={setContactPhone}
                    />

                    <Text style={styles.inputLabel}>Best Time to Contact</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setShowBestTimePicker(true)}>
                        <Text style={styles.pickerButtonText}>{bestTime}</Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>

                    <Text style={styles.inputLabel}>Steps to Reproduce</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStepsPicker(true)}>
                        <Text style={styles.pickerButtonText}>{stepsToReproduce}</Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>

                    {stepsToReproduce === 'Other (describe below)' && (
                        <View style={{ marginTop: 8 }}>
                            <Text style={[styles.inputLabel, { color: '#007AFF', marginTop: 0 }]}>Describe Steps to Reproduce:</Text>
                            <View style={[styles.inputContainer, { height: 80, marginBottom: 8 }]}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="1. Go to..."
                                    multiline
                                    textAlignVertical="top"
                                    value={stepsDescription}
                                    onChangeText={setStepsDescription}
                                />
                            </View>
                        </View>
                    )}

                    <Text style={styles.inputLabel}>Expected Result</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setShowExpectedResultPicker(true)}>
                        <Text style={styles.pickerButtonText}>{expectedResult}</Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>

                    {expectedResult === 'Other (describe below)' && (
                        <View style={{ marginTop: 8 }}>
                            <Text style={[styles.inputLabel, { color: '#007AFF', marginTop: 0 }]}>Describe Expected Result:</Text>
                            <View style={[styles.inputContainer, { height: 80, marginBottom: 8 }]}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="It should..."
                                    multiline
                                    textAlignVertical="top"
                                    value={expectedResultDescription}
                                    onChangeText={setExpectedResultDescription}
                                />
                            </View>
                        </View>
                    )}

                    {/* Pickers */}
                    <CustomPicker
                        visible={showSeverityPicker}
                        options={SEVERITY_LEVELS}
                        onClose={() => setShowSeverityPicker(false)}
                        onSelect={setSeverity}
                        title="Select Severity"
                    />
                    <CustomPicker
                        visible={showPriorityPicker}
                        options={PRIORITY_LEVELS}
                        onClose={() => setShowPriorityPicker(false)}
                        onSelect={setPriority}
                        title="Select Priority"
                    />
                    <CustomPicker
                        visible={showImpactPicker}
                        options={IMPACT_SCOPE}
                        onClose={() => setShowImpactPicker(false)}
                        onSelect={setImpact}
                        title="Select Impact Scope"
                    />
                    <CustomPicker
                        visible={showReproducibilityPicker}
                        options={REPRODUCIBILITY}
                        onClose={() => setShowReproducibilityPicker(false)}
                        onSelect={setReproducibility}
                        title="Freq. of Occurrence"
                    />
                    <CustomPicker
                        visible={showBestTimePicker}
                        options={BEST_TIME_OPTIONS}
                        onClose={() => setShowBestTimePicker(false)}
                        onSelect={setBestTime}
                        title="Best Time to Contact"
                    />
                    <CustomPicker
                        visible={showStepsPicker}
                        options={STEPS_TO_REPRODUCE_OPTIONS}
                        onClose={() => setShowStepsPicker(false)}
                        onSelect={setStepsToReproduce}
                        title="Steps to Reproduce"
                    />
                    <CustomPicker
                        visible={showExpectedResultPicker}
                        options={EXPECTED_RESULT_OPTIONS}
                        onClose={() => setShowExpectedResultPicker(false)}
                        onSelect={setExpectedResult}
                        title="Expected Result"
                    />

                    <View style={{ height: 20 }} />

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
    requiredAsterisk: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '700',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 13,
        marginBottom: 8,
        marginTop: -8,
    },
    errorBorder: {
        borderColor: '#FF3B30',
        borderWidth: 1.5,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
    },
    categoryCard: {
        width: '47%',
        aspectRatio: 1.6,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 12,
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: '#F2F2F7',
        // Smooth shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    selectedCategory: {
        backgroundColor: '#FFF',
        borderColor: '#007AFF',
        shadowColor: '#007AFF',
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unselectedIconContainer: {
        backgroundColor: '#F2F2F7',
    },
    selectedIconContainer: {
        backgroundColor: '#E3F2FD', // Light blue
    },
    categoryLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
        marginTop: 4,
    },
    selectedCategoryText: {
        color: '#1A1A1A',
        fontWeight: '700',
    },
    checkmarkBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
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
        height: 48,
        backgroundColor: '#007AFF',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    disabledButton: {
        backgroundColor: '#A0A0A0',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    // New Styles for Pickers and Inputs
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 8,
        marginTop: 16,
    },
    simpleInput: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        fontSize: 16,
        color: '#1A1A1A',
    },
    pickerButton: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#1A1A1A',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '50%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalItemText: {
        fontSize: 16,
        color: '#1A1A1A',
    },
});

export default CreateIssueScreen;
