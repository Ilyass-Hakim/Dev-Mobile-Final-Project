import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = ({ navigation }) => {
    const { theme, isDarkMode, toggleTheme } = useTheme();

    const SettingItem = ({ icon, label, value, onToggle, type = 'toggle' }) => (
        <View style={[styles.settingItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                    <Ionicons name={icon} size={22} color={theme.primary} />
                </View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
            </View>
            {type === 'toggle' && (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: theme.border, true: theme.primary + '80' }}
                    thumbColor={value ? theme.primary : theme.textTertiary}
                    ios_backgroundColor={theme.border}
                />
            )}
        </View>
    );

    const SettingSection = ({ title, children }) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
            {children}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Appearance Section */}
                <SettingSection title="APPEARANCE">
                    <SettingItem
                        icon="moon"
                        label="Dark Mode"
                        value={isDarkMode}
                        onToggle={toggleTheme}
                        type="toggle"
                    />
                </SettingSection>

                {/* Notifications Section */}
                <SettingSection title="NOTIFICATIONS">
                    <View style={[styles.settingItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.success + '15' }]}>
                                <Ionicons name="notifications" size={22} color={theme.success} />
                            </View>
                            <Text style={[styles.settingLabel, { color: theme.text }]}>Push Notifications</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
                    </View>
                </SettingSection>

                {/* Account Section */}
                <SettingSection title="ACCOUNT">
                    <View style={[styles.settingItem, { backgroundColor: theme.cardBackground, borderColor: theme.border, marginBottom: 12 }]}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.info + '15' }]}>
                                <Ionicons name="person" size={22} color={theme.info} />
                            </View>
                            <Text style={[styles.settingLabel, { color: theme.text }]}>Edit Profile</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
                    </View>
                    <View style={[styles.settingItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.warning + '15' }]}>
                                <Ionicons name="lock-closed" size={22} color={theme.warning} />
                            </View>
                            <Text style={[styles.settingLabel, { color: theme.text }]}>Privacy & Security</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
                    </View>
                </SettingSection>

                {/* About Section */}
                <SettingSection title="ABOUT">
                    <View style={[styles.settingItem, { backgroundColor: theme.cardBackground, borderColor: theme.border, marginBottom: 12 }]}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.textSecondary + '15' }]}>
                                <Ionicons name="information-circle" size={22} color={theme.textSecondary} />
                            </View>
                            <Text style={[styles.settingLabel, { color: theme.text }]}>App Version</Text>
                        </View>
                        <Text style={[styles.versionText, { color: theme.textSecondary }]}>1.0.0</Text>
                    </View>
                    <View style={[styles.settingItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.textSecondary + '15' }]}>
                                <Ionicons name="document-text" size={22} color={theme.textSecondary} />
                            </View>
                            <Text style={[styles.settingLabel, { color: theme.text }]}>Terms & Conditions</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
                    </View>
                </SettingSection>

                <View style={styles.bottomSpacer} />
            </ScrollView>
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    versionText: {
        fontSize: 15,
        fontWeight: '500',
    },
    bottomSpacer: {
        height: 40,
    },
});

export default SettingsScreen;
