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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";
import { UserService } from '../services/UserService';

const RegisterScreen = ({ navigation }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            setLoading(true);

            // Create user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: fullName
            });

            // Developer Backdoor during Registration
            let role = 'employee';
            if (email.toLowerCase() === 'admin@gmail.com') role = 'admin';
            if (email.toLowerCase() === 'manager@gmail.com') role = 'manager';

            // Create user document in Firestore with role
            await UserService.createUser(user.uid, {
                email: email,
                fullName: fullName,
                role: role
            });

            setLoading(false);
            alert('Account created successfully!');
            // Navigation will be handled automatically or manually here
        } catch (error) {
            setLoading(false);
            alert(error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.inner}>
                            <View style={styles.headerContainer}>
                                <Text style={styles.title}>Create Account</Text>
                                <Text style={styles.subtitle}>Join us to start reporting issues</Text>
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Full Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your full name"
                                        placeholderTextColor="#A0A0A0"
                                        value={fullName}
                                        onChangeText={setFullName}
                                        autoCapitalize="words"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Email</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#A0A0A0"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Create a password"
                                        placeholderTextColor="#A0A0A0"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Confirm Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm your password"
                                        placeholderTextColor="#A0A0A0"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleRegister}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>Sign Up</Text>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.footer}>
                                    <Text style={styles.footerText}>Already have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                        <Text style={styles.footerLink}>Sign In</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    inner: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    headerContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        lineHeight: 24,
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    input: {
        height: 50,
        backgroundColor: '#F7F7F7',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    button: {
        height: 56,
        backgroundColor: '#007AFF', // Using same primary color
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 12,
        marginBottom: 24,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#666666',
    },
    footerLink: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '700',
    },
});

export default RegisterScreen;
