import {
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    type QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';

export const addDocument = async (collectionName: string, data: any) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding document: ", error);
        throw error;
    }
};

export const getDocument = async (collectionName: string, id: string) => {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error("No such document!");
        }
    } catch (error) {
        console.error("Error getting document: ", error);
        throw error;
    }
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
    try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error("Error updating document: ", error);
        throw error;
    }
};

export const deleteDocument = async (collectionName: string, id: string) => {
    try {
        await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
        console.error("Error deleting document: ", error);
        throw error;
    }
};

export const subscribeToCollection = (
    collectionName: string,
    callback: (data: any[]) => void,
    constraints: QueryConstraint[] = []
) => {
    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(q, (querySnapshot) => {
        const documents: any[] = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        callback(documents);
    });
};
