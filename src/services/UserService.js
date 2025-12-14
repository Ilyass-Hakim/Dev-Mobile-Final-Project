import { db } from '../config/firebase';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

export const UserService = {
    // Create a user document in Firestore
    createUser: async (userId, userData) => {
        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, {
                ...userData,
                createdAt: new Date().toISOString(),
                role: userData.role || 'employee',
            }, { merge: true });
        } catch (error) {
            console.error('Error creating user document:', error);
            throw error;
        }
    },

    // Get user details
    getUser: async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    // Admin: Get all users
    getAllUsers: async () => {
        try {
            const usersRef = collection(db, 'users');
            const querySnapshot = await getDocs(usersRef);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    },

    // Admin: Update user role
    updateUserRole: async (userId, newRole) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                role: newRole
            });
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    },

    // Admin: Delete user (Firestore only)
    deleteUser: async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            await deleteDoc(userRef);
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }
};
