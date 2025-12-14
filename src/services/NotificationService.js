import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const NotificationService = {
    // Register for push notifications and return the token
    registerForPushNotificationsAsync: async () => {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            // Get the token
            try {
                const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

                if (!projectId) {
                    console.log("No EAS Project ID found. Skipping Push Token registration (Expected in development if not using EAS).");
                    // Return early to avoid the error
                    return null;
                }

                token = (await Notifications.getExpoPushTokenAsync({
                    projectId,
                })).data;
                console.log("Expo Push Token:", token);
            } catch (e) {
                console.error("Error getting push token:", e);
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    },

    // Send a push notification to a specific token
    sendPushNotification: async (expoPushToken, title, body, data = {}) => {
        if (!expoPushToken) return;

        console.log(`Sending Notification to ${expoPushToken}: ${title} - ${body}`);

        const message = {
            to: expoPushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
        };

        try {
            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });
        } catch (error) {
            console.error("Error sending push notification:", error);
        }
    }
};
