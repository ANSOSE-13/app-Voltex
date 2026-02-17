import React, { useState } from 'react';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { useAuthStore } from '../stores/useAuthStore';
import { addDoc, collection, deleteDoc, doc, Timestamp, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useTransactions } from '../hooks/useTransactions';
import { Lock, ShoppingBag, Plus, Trash2 } from 'lucide-react';
import BlurAmount from './BlurAmount';

interface WishlistItem {
    id: string;
    name: string;
    amount: number;
    createdAt: any; // Timestamp
    category: string;
    userId: string;
}

const WishlistWidget: React.FC = () => {
    const { user } = useAuthStore();
    const { addTransaction } = useTransactions();
    const [newItemName, setNewItemName] = useState('');
    const [newItemAmount, setNewItemAmount] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Fetch wishlist items
    const constraints = user ? [
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
    ] : [];

    const { data: items, loading } = useFirestoreCollection<WishlistItem>('wishlist', constraints);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newItemName || !newItemAmount) return;

        try {
            await addDoc(collection(db, 'wishlist'), {
                name: newItemName,
                amount: parseFloat(newItemAmount),
                createdAt: Timestamp.now(),
                userId: user.uid,
                category: 'Impulse Buy' // Default category
            });
            setNewItemName('');
            setNewItemAmount('');
            setIsAdding(false);
        } catch (error) {
            console.error("Error adding to wishlist:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this item? You saved money! 💰')) {
            await deleteDoc(doc(db, 'wishlist', id));
        }
    };

    const handleBuy = async (item: WishlistItem) => {
        if (window.confirm(`Did you finally buy "${item.name}" for $${item.amount}?`)) {
            // Add to transactions
            await addTransaction({
                type: 'expense',
                amount: item.amount,
                category: 'Shopping', // Or ask user?
                description: `Wishlist: ${item.name}`,
                mood: 'excited', // Usually excited when finally buying
                isTaxDeductible: false
            });
            // Remove from wishlist
            await deleteDoc(doc(db, 'wishlist', item.id));
        }
    };

    // Calculate time remaining
    const getCooldownStatus = (createdAt: any) => {
        if (!createdAt) return { locked: false, timeLeft: '' };

        let createdDate: Date;
        try {
            if (createdAt.toDate && typeof createdAt.toDate === 'function') {
                createdDate = createdAt.toDate();
            } else if (createdAt instanceof Date) {
                createdDate = createdAt;
            } else if (createdAt.seconds) {
                createdDate = new Date(createdAt.seconds * 1000);
            } else {
                return { locked: false, timeLeft: '' }; // Unknown format
            }
        } catch (e) {
            console.error("Date parsing error in Wishlist:", e);
            return { locked: false, timeLeft: '' };
        }

        const now = new Date();
        const diffMs = now.getTime() - createdDate.getTime();
        const hoursPassed = diffMs / (1000 * 60 * 60);
        const COOLDOWN_HOURS = 24;

        if (hoursPassed < COOLDOWN_HOURS) {
            const remainingHours = Math.ceil(COOLDOWN_HOURS - hoursPassed);
            return { locked: true, timeLeft: `${remainingHours}h` };
        }
        return { locked: false, timeLeft: 'Ready' };
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Lock size={18} className="text-blue-600" />
                    Impulse Control <span className="text-xs font-normal text-gray-500 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600">24h Timer</span>
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <Plus size={20} className="text-blue-600 dark:text-blue-400" />
                </button>
            </div>

            <div className="p-4 space-y-4">
                {isAdding && (
                    <form onSubmit={handleAddItem} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-in slide-in-from-top-2">
                        <input
                            type="text"
                            placeholder="I want to buy..."
                            className="w-full px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-sm dark:bg-gray-700 dark:text-white"
                            value={newItemName}
                            onChange={e => setNewItemName(e.target.value)}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Price"
                                className="w-24 px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-sm dark:bg-gray-700 dark:text-white"
                                value={newItemAmount}
                                onChange={e => setNewItemAmount(e.target.value)}
                            />
                            <button type="submit" className="flex-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                                Start Timer ⏳
                            </button>
                        </div>
                    </form>
                )}

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {loading ? (
                        <p className="text-center text-gray-400 text-sm py-2">Loading wishlist...</p>
                    ) : items.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-4 italic">
                            Your wishlist is empty.<br />Good job saving money! 👏
                        </p>
                    ) : (
                        items.map(item => {
                            const { locked, timeLeft } = getCooldownStatus(item.createdAt);
                            return (
                                <div key={item.id} className="flex justify-between items-center group">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-500 font-mono">
                                            <BlurAmount amount={item.amount} />
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {locked ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full cursor-help" title={`You can buy this in ${timeLeft}`}>
                                                <Lock size={12} /> {timeLeft}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleBuy(item)}
                                                className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                                            >
                                                <ShoppingBag size={12} /> Buy Now
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remove and save money"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default WishlistWidget;
