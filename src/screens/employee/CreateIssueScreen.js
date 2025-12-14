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
import { useTheme } from '../../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

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
const CustomPicker = ({ visible, options, onClose, onSelect, title, theme }) => (
    <Modal visible={visible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={options}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.modalItem, { borderBottomColor: theme.border }]}
                            onPress={() => {
                                onSelect(item);
                                onClose();
                            }}
                        >
                            <Text style={[styles.modalItemText, { color: theme.text }]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    </Modal>
);

const CreateIssueScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Report Issue</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Select Category <Text style={[styles.requiredAsterisk, { color: theme.error }]}>*</Text>
                    </Text>
                    {showValidation && !selectedCategory && (
                        <Text style={[styles.errorText, { color: theme.error }]}>Please select a category</Text>
                    )}
                    <View style={styles.categoriesGrid}>
                        {CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory?.id === cat.id;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryCard,
                                        { backgroundColor: theme.cardBackground, borderColor: theme.border },
                                        isSelected && { borderColor: theme.primary },
                                    ]}
                                    onPress={() => setSelectedCategory(cat)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.iconContainer,
                                        { backgroundColor: isSelected ? `${theme.primary}20` : theme.badgeBackground }
                                    ]}>
                                        <Ionicons
                                            name={cat.icon}
                                            size={24}
                                            color={isSelected ? theme.primary : theme.textSecondary}
                                        />
                                    </View>

                                    <Text style={[
                                        styles.categoryLabel,
                                        { color: isSelected ? theme.text : theme.textSecondary },
                                        isSelected && { fontWeight: '700' },
                                    ]}>
                                        {cat.label}
                                    </Text>

                                    {isSelected && (
                                        <View style={[styles.checkmarkBadge, { backgroundColor: theme.primary }]}>
                                            <Ionicons name="checkmark" size={12} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Severity</Text>
                            <TouchableOpacity style={[styles.pickerButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={() => setShowSeverityPicker(true)}>
                                <Text style={[styles.pickerButtonText, { color: theme.text }]}>{severity}</Text>
                                <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Priority</Text>
                            <TouchableOpacity style={[styles.pickerButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={() => setShowPriorityPicker(true)}>
                                <Text style={[styles.pickerButtonText, { color: theme.text }]}>{priority}</Text>
                                <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Asset ID / Device Name</Text>
                    <TextInput
                        style={[styles.simpleInput, { backgroundColor: theme.cardBackground, borderColor: theme.border, color: theme.text }]}
                        placeholder="e.g. LP-2023-001"
                        placeholderTextColor={theme.inputPlaceholder}
                        value={assetId}
                        onChangeText={setAssetId}
                    />

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Description <Text style={[styles.requiredAsterisk, { color: theme.error }]}>*</Text>
                    </Text>
                    {showValidation && !description.trim() && (
                        <Text style={[styles.errorText, { color: theme.error }]}>Please provide a description</Text>
                    )}
                    <View style={[
                        styles.inputContainer,
                        { backgroundColor: theme.cardBackground, borderColor: theme.border },
                        showValidation && !description.trim() && { borderColor: theme.error }
                    ]}>
                        <TextInput
                            style={[styles.textInput, { color: theme.text }]}
                            placeholder="Describe the issue in detail..."
                            placeholderTextColor={theme.inputPlaceholder}
                            multiline
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Location / Room Number</Text>
                    <TextInput
                        style={[styles.simpleInput, { backgroundColor: theme.cardBackground, borderColor: theme.border, color: theme.text }]}
                        placeholder="e.g. Server Room B, Desk 42"
                        placeholderTextColor={theme.inputPlaceholder}
                        value={location}
                        onChangeText={setLocation}
                    />

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Impact</Text>
                            <TouchableOpacity style={[styles.pickerButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={() => setShowImpactPicker(true)}>
                                <Text style={[styles.pickerButtonText, { color: theme.text }]}>{impact}</Text>
                                <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Reproducibility</Text>
                            <TouchableOpacity style={[styles.pickerButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={() => setShowReproducibilityPicker(true)}>
                                <Text style={[styles.pickerButtonText, { color: theme.text }]}>{reproducibility}</Text>
                                <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Contact Phone</Text>
                    <TextInput
                        style={[styles.simpleInput, { backgroundColor: theme.cardBackground, borderColor: theme.border, color: theme.text }]}
                        placeholder="+1 (555) 000-0000"
                        placeholderTextColor={theme.inputPlaceholder}
                        keyboardType="phone-pad"
                        value={contactPhone}
                        onChangeText={setContactPhone}
                    />

                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Best Time to Contact</Text>
                    <TouchableOpacity style={[styles.pickerButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={() => setShowBestTimePicker(true)}>
                        <Text style={[styles.pickerButtonText, { color: theme.text }]}>{bestTime}</Text>
                        <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Steps to Reproduce</Text>
                    <TouchableOpacity style={[styles.pickerButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={() => setShowStepsPicker(true)}>
                        <Text style={[styles.pickerButtonText, { color: theme.text }]}>{stepsToReproduce}</Text>
                        <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>

                    {stepsToReproduce === 'Other (describe below)' && (
                        <View style={{ marginTop: 8 }}>
                            <Text style={[styles.inputLabel, { color: theme.primary, marginTop: 0 }]}>Describe Steps to Reproduce:</Text>
                            <View style={[styles.inputContainer, { height: 80, marginBottom: 8, backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                <TextInput
                                    style={[styles.textInput, { color: theme.text }]}
                                    placeholder="1. Go to..."
                                    placeholderTextColor={theme.inputPlaceholder}
                                    multiline
                                    textAlignVertical="top"
                                    value={stepsDescription}
                                    onChangeText={setStepsDescription}
                                />
                            </View>
                        </View>
                    )}

                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Expected Result</Text>
                    <TouchableOpacity style={[styles.pickerButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={() => setShowExpectedResultPicker(true)}>
                        <Text style={[styles.pickerButtonText, { color: theme.text }]}>{expectedResult}</Text>
                        <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>

                    {expectedResult === 'Other (describe below)' && (
                        <View style={{ marginTop: 8 }}>
                            <Text style={[styles.inputLabel, { color: theme.primary, marginTop: 0 }]}>Describe Expected Result:</Text>
                            <View style={[styles.inputContainer, { height: 80, marginBottom: 8, backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                <TextInput
                                    style={[styles.textInput, { color: theme.text }]}
                                    placeholder="It should..."
                                    placeholderTextColor={theme.inputPlaceholder}
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
                        theme={theme}
                    />
                    <CustomPicker
                        visible={showPriorityPicker}
                        options={PRIORITY_LEVELS}
                        onClose={() => setShowPriorityPicker(false)}
                        onSelect={setPriority}
                        title="Select Priority"
                        theme={theme}
                    />
                    <CustomPicker
                        visible={showImpactPicker}
                        options={IMPACT_SCOPE}
                        onClose={() => setShowImpactPicker(false)}
                        onSelect={setImpact}
                        title="Select Impact Scope"
                        theme={theme}
                    />
                    <CustomPicker
                        visible={showReproducibilityPicker}
                        options={REPRODUCIBILITY}
                        onClose={() => setShowReproducibilityPicker(false)}
                        onSelect={setReproducibility}
                        title="Freq. of Occurrence"
                        theme={theme}
                    />
                    <CustomPicker
                        visible={showBestTimePicker}
                        options={BEST_TIME_OPTIONS}
                        onClose={() => setShowBestTimePicker(false)}
                        onSelect={setBestTime}
                        title="Best Time to Contact"
                        theme={theme}
                    />
                    <CustomPicker
                        visible={showStepsPicker}
                        options={STEPS_TO_REPRODUCE_OPTIONS}
                        onClose={() => setShowStepsPicker(false)}
                        onSelect={setStepsToReproduce}
                        title="Steps to Reproduce"
                        theme={theme}
                    />
                    <CustomPicker
                        visible={showExpectedResultPicker}
                        options={EXPECTED_RESULT_OPTIONS}
                        onClose={() => setShowExpectedResultPicker(false)}
                        onSelect={setExpectedResult}
                        title="Expected Result"
                        theme={theme}
                    />

                    <View style={{ height: 20 }} />

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: theme.primary },
                            (!selectedCategory || !description.trim()) && { backgroundColor: theme.textTertiary }
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
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        marginTop: 8,
    },
    requiredAsterisk: {
        fontSize: 16,
        fontWeight: '700',
    },
    errorText: {
        fontSize: 13,
        marginBottom: 8,
        marginTop: -8,
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
        borderRadius: 16,
        padding: 12,
        justifyContent: 'space-between',
        borderWidth: 1.5,
        // Smooth shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    checkmarkBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        height: 150,
        marginBottom: 32,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
    },
    submitButton: {
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
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
        marginBottom: 8,
        marginTop: 16,
    },
    simpleInput: {
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    pickerButton: {
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerButtonText: {
        fontSize: 16,
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
        justifyContent: 'flex-end',
    },
    modalContent: {
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
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modalItemText: {
        fontSize: 16,
    },
});

export default CreateIssueScreen;
