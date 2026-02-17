import {
    collection,
    addDoc,
    where,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    Timestamp,
    type DocumentData
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from '../stores/useAuthStore';
import { useFirestoreCollection } from './useFirestore';

export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: any; // Firestore Timestamp
    userId: string;
    attachmentUrl?: string;
    attachmentName?: string;
    mood?: 'happy' | 'sad' | 'neutral' | 'stressed' | 'excited' | 'bored';
    isTaxDeductible?: boolean;
}

export const useTransactions = () => {
    const { user } = useAuthStore();

    // Base query constraints used for fetching
    const constraints = user ? [
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
    ] : [];

    const { data: transactions, loading, error } = useFirestoreCollection<Transaction>('transactions', constraints);

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId' | 'date'>) => {
        if (!user) throw new Error('User not authenticated');

        try {
            await addDoc(collection(db, 'transactions'), {
                ...transaction,
                userId: user.uid,
                date: Timestamp.now(),
                amount: Number(transaction.amount) // Ensure number
            });


        } catch (err) {
            console.error("Error adding transaction:", err);
            throw err;
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'transactions', id));
        } catch (err) {
            console.error("Error deleting transaction:", err);
            throw err;
        }
    };

    const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
        try {
            const docRef = doc(db, 'transactions', id);
            await updateDoc(docRef, updates as DocumentData);
        } catch (err) {
            console.error("Error updating transaction:", err);
            throw err;
        }
    };

    // Calculate totals
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIncome - totalExpenses;

    return {
        transactions,
        loading,
        error,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        stats: {
            totalIncome,
            totalExpenses,
            balance
        }
    };
};
