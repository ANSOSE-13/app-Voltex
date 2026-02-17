import { useState, useEffect } from 'react';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from '../stores/useAuthStore';
import { uploadFile } from '../services/storage';

interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;

    createdAt: any;
    savingsBalance?: number; // Phase 3: Round-Ups
}

export const useUser = () => {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setProfile(null);
            setInitialLoading(false);
            return;
        }

        console.log("Setting up real-time profile listener for:", user.uid);
        const docRef = doc(db, 'users', user.uid);

        // Listen for real-time updates
        const unsubscribe = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
                console.log("Profile update received:", docSnap.data());
                setProfile(docSnap.data() as UserProfile);
                setInitialLoading(false);
            } else {
                console.log("Profile not found, creating new one...");
                // Create profile if doesn't exist
                const newProfile = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    createdAt: new Date(),
                    savingsBalance: 0
                };

                try {
                    await setDoc(docRef, newProfile);
                    // No need to setProfile here, the snapshot listener will fire again with the new data
                } catch (err) {
                    console.error("Error creating profile:", err);
                    setError("Failed to create profile");
                    setInitialLoading(false);
                }
            }
        }, (err) => {
            console.error("Profile snapshot error:", err);
            setError(err.message);
            setInitialLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!user) return;
        try {
            const docRef = doc(db, 'users', user.uid);
            await updateDoc(docRef, data);
            setProfile(prev => prev ? ({ ...prev, ...data }) : null);
        } catch (err) {
            console.error("Error updating profile:", err);
            throw err;
        }
    };

    const updateAvatar = async (file: File) => {
        if (!user) return;
        setLoading(true);
        try {
            const photoURL = await uploadFile(
                file,
                `users/${user.uid}/avatar`,
                { name: 'avatar', size: file.size, type: file.type, ownerId: user.uid },
                () => { }
            );
            await updateProfile({ photoURL });
            return photoURL;
        } catch (err) {
            console.error("Error updating avatar:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { profile, loading, initialLoading, error, updateProfile, updateAvatar };
};
