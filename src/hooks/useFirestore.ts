import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, type QueryConstraint, type DocumentData } from 'firebase/firestore';
import { db } from '../services/firebase';
import { get, set } from 'idb-keyval';

export const useFirestoreCollection = <T extends DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = []
) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let unsubscribe: () => void;

        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Try to load from local cache first
                const cachedData = await get<T[]>(`cache_${collectionName}`);
                if (cachedData) {
                    setData(cachedData);
                    setLoading(false); // Show cached data immediately
                }

                // 2. Subscribe to live updates
                const q = query(collection(db, collectionName), ...constraints);
                unsubscribe = onSnapshot(q,
                    (querySnapshot) => {
                        const documents = querySnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as unknown as T[];

                        setData(documents);
                        setLoading(false);

                        // 3. Update local cache
                        set(`cache_${collectionName}`, documents).catch(console.error);
                    },
                    (err) => {
                        console.error("Firestore Error:", err);
                        setError(err);
                        setLoading(false);
                    }
                );
            } catch (err: any) {
                setError(err);
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [collectionName, JSON.stringify(constraints)]);

    return { data, loading, error };
};
