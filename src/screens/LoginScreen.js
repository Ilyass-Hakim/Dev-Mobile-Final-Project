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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { UserService } from '../services/UserService';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Developer Hacker: Force Admin Role for specific email
            if (email.toLowerCase() === 'admin@gmail.com') {
                console.log("Developer Backdoor: Setting role to admin");
                try {
                    await UserService.createUser(user.uid, {
                        email: user.email,
                        fullName: 'System Administrator',
                        role: 'admin'
                    });
                    console.log("Admin role set successfully");
                } catch (err) {
                    console.error("Failed to set admin role", err);
                }
            } else if (email.toLowerCase() === 'manager@gmail.com') {
                console.log("Developer Backdoor: Setting role to manager");
                try {
                    await UserService.createUser(user.uid, {
                        email: user.email,
                        fullName: 'System Manager',
                        role: 'manager'
                    });
                    console.log("Manager role set successfully");
                } catch (err) {
                    console.error("Failed to set manager role", err);
                }
            }

            setLoading(false);
            // alert("Login successful"); // Removed to avoid interruption
            // Navigation handled by App.js
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
                    <View style={styles.inner}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Welcome Back</Text>
                            <Text style={styles.subtitle}>Sign in to continue reporting issues</Text>
                        </View>

                        <View style={styles.formContainer}>
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
                                    placeholder="Enter your password"
                                    placeholderTextColor="#A0A0A0"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Sign In</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={styles.footerLink}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
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
    inner: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    headerContainer: {
        marginBottom: 40,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#007AFF', // Premium Blue
        fontSize: 14,
        fontWeight: '600',
    },
    button: {
        height: 56,
        backgroundColor: '#007AFF',
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

export default LoginScreen;
