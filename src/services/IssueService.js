import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    arrayUnion,
    getDoc
} from 'firebase/firestore';
import { NotificationService } from './NotificationService';

export const IssueService = {
    // Add a new issue
    addIssue: async (issueData) => {
        try {
            const issuesRef = collection(db, 'issues');
            await addDoc(issuesRef, {
                ...issueData,
                createdAt: new Date().toISOString(),
                status: 'Open',
            });
        } catch (error) {
            console.error('Error adding issue:', error);
            throw error;
        }
    },

    // Get issues once (kept for legacy/reference, but UI will prefer subscribe)
    getIssues: async (userId = null) => {
        try {
            const issuesRef = collection(db, 'issues');
            let q;
            if (userId) {
                q = query(issuesRef, where('userId', '==', userId));
            } else {
                q = query(issuesRef, orderBy('createdAt', 'desc'));
            }
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching issues:', error);
            throw error;
        }
    },

    // Real-time subscription to issues
    subscribeToIssues: (userId, callback) => {
        const issuesRef = collection(db, 'issues');
        let q;

        if (userId) {
            // Employee: Only own issues
            // Note: Ordering might require an index if combined with 'where'
            q = query(issuesRef, where('userId', '==', userId));
        } else {
            // Manager: All issues, ordered by date
            q = query(issuesRef, orderBy('createdAt', 'desc'));
        }

        // Set up the listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const issues = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(issues);
        }, (error) => {
            console.error("Error in issue subscription:", error);
            callback([]); // Return empty on error to avoid crash
        });

        // Return the unsubscribe function so the UI can clean up
        return unsubscribe;
    },

    // Update issue status
    updateIssueStatus: async (issueId, newStatus) => {
        try {
            const issueRef = doc(db, 'issues', issueId);

            // 1. Update the issue
            await updateDoc(issueRef, {
                status: newStatus
            });

            // 2. Send Notification to Employee
            const issueSnap = await getDoc(issueRef);
            if (issueSnap.exists()) {
                const issueData = issueSnap.data();
                const userId = issueData.userId;

                if (userId) {
                    const userRef = doc(db, 'users', userId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const pushToken = userSnap.data().pushToken;
                        if (pushToken) {
                            await NotificationService.sendPushNotification(
                                pushToken,
                                "Status Updated",
                                `Your issue "${issueData.title}" is now ${newStatus}`
                            );

                            // Persist to Firestore
                            const notificationsRef = collection(db, 'notifications');
                            await addDoc(notificationsRef, {
                                userId: userId,
                                title: "Status Updated",
                                body: `Your issue "${issueData.title}" is now ${newStatus}`,
                                createdAt: new Date().toISOString(),
                                read: false,
                                type: 'status_update',
                                issueId: issueId
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error updating issue:', error);
            throw error;
        }
    },

    // Add a comment (Manager or Employee)
    addComment: async (issueId, commentText, role, authorName) => {
        try {
            const issueRef = doc(db, 'issues', issueId);
            const commentData = {
                text: commentText,
                role: role, // 'manager' or 'employee'
                authorName: authorName,
                createdAt: new Date().toISOString()
            };

            await updateDoc(issueRef, {
                comments: arrayUnion(commentData),
                updatedAt: new Date().toISOString()
            });

            // Send Notification (Only Manager -> Employee for now)
            if (role === 'manager') {
                const issueSnap = await getDoc(issueRef);
                if (issueSnap.exists()) {
                    const issueData = issueSnap.data();
                    const userId = issueData.userId;

                    if (userId) {
                        const userRef = doc(db, 'users', userId);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            const pushToken = userSnap.data().pushToken;
                            if (pushToken) {
                                await NotificationService.sendPushNotification(
                                    pushToken,
                                    "New Comment",
                                    `Manager replied: ${commentText}`
                                );

                                // Persist to Firestore
                                const notificationsRef = collection(db, 'notifications');
                                await addDoc(notificationsRef, {
                                    userId: userId,
                                    title: "New Comment",
                                    body: `Manager replied: ${commentText}`,
                                    createdAt: new Date().toISOString(),
                                    read: false,
                                    type: 'comment',
                                    issueId: issueId
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error adding comment:", error);
            throw error;
        }
    }
};
