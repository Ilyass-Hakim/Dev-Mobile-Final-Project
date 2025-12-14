import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from '../config/firebase';
import { UserService } from '../services/UserService';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { NotificationService } from '../services/NotificationService';

// Screens
// Screens
// Screens
// Screens
import HomeScreen from '../screens/employee/HomeScreen';
import CreateIssueScreen from '../screens/employee/CreateIssueScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Admin Room
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';

// Manager Room
import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';

// Role-Specific Issue Screens
import EmployeeIssueListScreen from '../screens/employee/EmployeeIssueListScreen';
import ManagerIssueListScreen from '../screens/manager/ManagerIssueListScreen';
import EmployeeIssueDetailsScreen from '../screens/employee/EmployeeIssueDetailsScreen';
import ManagerIssueDetailsScreen from '../screens/manager/ManagerIssueDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- EMPLOYEE STACK ---
const EmployeeStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Dashboard" component={HomeScreen} />
        <Stack.Screen name="CreateIssue" component={CreateIssueScreen} />
        <Stack.Screen name="IssueList" component={EmployeeIssueListScreen} />
        <Stack.Screen name="IssueDetails" component={EmployeeIssueDetailsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
);

// --- MANAGER STACK ---
const ManagerStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
        <Stack.Screen name="IssueList" component={ManagerIssueListScreen} />
        <Stack.Screen name="IssueDetails" component={ManagerIssueDetailsScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
);

// --- ADMIN STACK ---
const AdminStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />

        {/* Admin reuses Manager Issue Views for global access */}
        <Stack.Screen name="IssueList" component={ManagerIssueListScreen} />
        <Stack.Screen name="IssueDetails" component={ManagerIssueDetailsScreen} />
    </Stack.Navigator>
);

// --- PROFILE STACK ---
const ProfileStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileMain" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
);

const AppStack = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        let unsubscribe;
        // Since AppStack is only mounted when authenticated (by App.js), 
        // we can trust auth.currentUser is initially present, but onAuthStateChanged is safer.

        const unsubscribeAuth = onAuthStateChanged(auth, async (authenticatedUser) => {
            try {
                if (authenticatedUser) {
                    console.log("AppStack: Auth state changed - User:", authenticatedUser.uid);
                    const userRef = doc(db, "users", authenticatedUser.uid);

                    // Register for Push Notifications
                    try {
                        const token = await NotificationService.registerForPushNotificationsAsync();
                        if (token) {
                            await updateDoc(userRef, { pushToken: token });
                        }
                    } catch (e) {
                        console.warn("Push token registration failed:", e);
                    }

                    // Real-time listener for role changes
                    unsubscribe = onSnapshot(userRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const userData = docSnap.data();
                            const role = (userData?.role || 'employee').toLowerCase();
                            setUserRole(role);
                        } else {
                            setUserRole('employee');
                        }
                        setIsLoading(false);
                    }, (error) => {
                        console.error("AppStack: Snapshot error:", error);
                        setIsLoading(false);
                    });
                } else {
                    setUserRole(null);
                    setIsLoading(false);
                }
            } catch (e) {
                console.error("Failed to fetch role", e);
                setIsLoading(false);
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
            unsubscribeAuth();
        };
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    // --- ROLE-BASED TABS ---
    // Each role gets a DIFFERENT Tab Navigator structure to keep things clean.

    if (userRole === 'admin') {
        return (
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                    tabBarActiveTintColor: '#007AFF',
                    tabBarInactiveTintColor: '#8E8E93',
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        if (route.name === 'Admin') iconName = focused ? 'grid' : 'grid-outline';
                        else if (route.name === 'GlobalIssues') iconName = focused ? 'file-tray-full' : 'file-tray-outline';
                        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                })}
            >
                <Tab.Screen name="Admin" component={AdminStack} />
                {/* Direct Tab Access to Issues for Admins too */}
                <Tab.Screen name="GlobalIssues" component={ManagerIssueListScreen} />
                <Tab.Screen name="Profile" component={ProfileStack} />
            </Tab.Navigator>
        );
    }

    if (userRole === 'manager') {
        return (
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                    tabBarActiveTintColor: '#007AFF',
                    tabBarInactiveTintColor: '#8E8E93',
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        if (route.name === 'Manager') iconName = focused ? 'briefcase' : 'briefcase-outline';
                        else if (route.name === 'AllIssues') iconName = focused ? 'file-tray-full' : 'file-tray-outline';
                        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                })}
            >
                <Tab.Screen name="Manager" component={ManagerStack} />
                <Tab.Screen name="AllIssues">
                    {() => (
                        <Stack.Navigator screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="IssueList" component={ManagerIssueListScreen} />
                            <Stack.Screen name="IssueDetails" component={ManagerIssueDetailsScreen} />
                        </Stack.Navigator>
                    )}
                </Tab.Screen>
                <Tab.Screen name="Profile" component={ProfileStack} />
            </Tab.Navigator>
        );
    }

    // Default: Employee
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'MyIssues') iconName = focused ? 'file-tray-full' : 'file-tray-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={EmployeeStack} />
            <Tab.Screen name="MyIssues">
                {() => (
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="IssueList" component={EmployeeIssueListScreen} />
                        <Stack.Screen name="IssueDetails" component={EmployeeIssueDetailsScreen} />
                    </Stack.Navigator>
                )}
            </Tab.Screen>
            <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
    );
};

const styles = {
    tabBar: {
        backgroundColor: '#FFF',
        borderTopColor: '#F0F0F0',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
    }
};

export default AppStack;
