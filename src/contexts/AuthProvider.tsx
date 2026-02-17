import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuthStore } from '../stores/useAuthStore';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setUser, setLoading } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setUser, setLoading]);

    return <>{children}</>;
};
