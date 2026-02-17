import { db } from '../services/firebase';
import { collection, Timestamp, doc, writeBatch } from 'firebase/firestore';

export const seedUserData = async (userId: string) => {
    const batch = writeBatch(db);

    // 1. Transactions
    const transactions = [
        {
            type: 'expense',
            amount: 5.50,
            category: 'Food',
            description: 'Morning Coffee ☕',
            date: Timestamp.now(),
            userId,
            mood: 'happy',
            isTaxDeductible: false
        },
        {
            type: 'expense',
            amount: 45.00,
            category: 'Transport',
            description: 'Uber to meeting',
            date: Timestamp.fromDate(new Date(Date.now() - 86400000 * 2)), // 2 days ago
            userId,
            mood: 'stressed',
            isTaxDeductible: true
        },
        {
            type: 'income',
            amount: 1500.00,
            category: 'Salary',
            description: 'Monthly Salary',
            date: Timestamp.fromDate(new Date(Date.now() - 86400000 * 5)), // 5 days ago
            userId,
            mood: 'excited',
            isTaxDeductible: false
        },
        {
            type: 'expense',
            amount: 89.99,
            category: 'Entertainment',
            description: 'Video Game',
            date: Timestamp.fromDate(new Date(Date.now() - 86400000 * 1)),
            userId,
            mood: 'bored',
            isTaxDeductible: false
        }
    ];

    // We can't batch addDoc easily because it auto-generates IDs, 
    // but for a few items using Promise.all is fine or we can generate IDs.
    // Let's use Promise.all for transactions/wishlist to preserve simple addDoc logic if possible,
    // or just use batch.set() with new doc refs.

    transactions.forEach(tx => {
        const ref = doc(collection(db, 'transactions'));
        batch.set(ref, tx);
    });

    // 2. Wishlist Items
    const wishlistItems = [
        {
            name: 'Gaming Monitor',
            amount: 350.00,
            category: 'Tech',
            createdAt: Timestamp.now(), // Locked (0 hours old)
            userId
        },
        {
            name: 'Vintage Jacket',
            amount: 120.00,
            category: 'Clothing',
            createdAt: Timestamp.fromDate(new Date(Date.now() - 86400000 * 2)), // Unlocked (48 hours old)
            userId
        }
    ];

    wishlistItems.forEach(item => {
        const ref = doc(collection(db, 'wishlist'));
        batch.set(ref, item);
    });

    // 3. User Savings Balance & Profile
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
        savingsBalance: 42.50 // Arbitrary demo amount
    });

    await batch.commit();
};
