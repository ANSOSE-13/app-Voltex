import { useMemo } from 'react';
import type { Transaction } from './useTransactions';

export interface SubscriptionCandidate {
    id: string; // generated id
    name: string;
    amount: number;
    frequency: 'monthly' | 'weekly' | 'yearly' | 'unknown';
    nextPaymentDate: Date;
    confidence: 'high' | 'medium' | 'low';
    lastTransactionDate: Date;
}

export const useSubscriptionDetector = (transactions: Transaction[]) => {
    const subscriptions = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        const expenses = transactions.filter(t => t.type === 'expense');
        const groups: { [key: string]: Transaction[] } = {};

        // Group by description/merchant and amount (fuzzy matching could be better, but exact for now)
        expenses.forEach(tx => {
            // Create a key based on description and amount (rounded to integer to handle slight tax diffs if needed, but exact is safer for now)
            // Normalize description
            const key = `${tx.description.trim().toLowerCase()}-${tx.amount}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(tx);
        });

        const candidates: SubscriptionCandidate[] = [];

        Object.entries(groups).forEach(([key, group]) => {
            // Need at least 2 occurrences to establish a pattern
            if (group.length < 2) return;

            // Sort by date descending (newest first)
            const sorted = group.sort((a, b) => b.date.toMillis() - a.date.toMillis());

            // Helper to parse date
            const parseDate = (d: any) => {
                if (!d) return null;
                if (d.toDate && typeof d.toDate === 'function') return d.toDate();
                if (d instanceof Date) return d;
                if (d.seconds) return new Date(d.seconds * 1000); // Firestore Timestamp duck typing
                return null;
            };

            const intervals: number[] = [];
            for (let i = 0; i < sorted.length - 1; i++) {
                const date1 = parseDate(sorted[i].date);
                const date2 = parseDate(sorted[i + 1].date);

                if (!date1 || !date2) continue; // Skip invalid dates

                const diffTime = Math.abs(date1.getTime() - date2.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                intervals.push(diffDays);
            }

            // Check for monthly pattern (28-31 days)
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            let frequency: 'monthly' | 'weekly' | 'yearly' | 'unknown' = 'unknown';
            let confidence: 'high' | 'medium' | 'low' = 'low';

            if (Math.abs(avgInterval - 30) <= 5) {
                frequency = 'monthly';
                confidence = intervals.every(i => Math.abs(i - 30) <= 5) ? 'high' : 'medium';
            } else if (Math.abs(avgInterval - 7) <= 2) {
                frequency = 'weekly';
                confidence = 'medium';
            } else if (Math.abs(avgInterval - 365) <= 10) {
                frequency = 'yearly';
                confidence = 'high';
            }

            if (frequency !== 'unknown') {
                const lastDateObj = sorted[0].date;
                let lastDate: Date;
                if (lastDateObj && lastDateObj.toDate && typeof lastDateObj.toDate === 'function') {
                    lastDate = lastDateObj.toDate();
                } else if (lastDateObj instanceof Date) {
                    lastDate = lastDateObj;
                } else if (lastDateObj && lastDateObj.seconds) {
                    lastDate = new Date(lastDateObj.seconds * 1000);
                } else {
                    lastDate = new Date(); // Fallback
                }

                const nextDate = new Date(lastDate);
                if (frequency === 'monthly') nextDate.setDate(lastDate.getDate() + 30);
                if (frequency === 'weekly') nextDate.setDate(lastDate.getDate() + 7);
                if (frequency === 'yearly') nextDate.setFullYear(lastDate.getFullYear() + 1);

                candidates.push({
                    id: key, // simple unique id
                    name: sorted[0].description, // use most recent description
                    amount: sorted[0].amount,
                    frequency,
                    nextPaymentDate: nextDate,
                    confidence,
                    lastTransactionDate: lastDate
                });
            }
        });

        return candidates.sort((a, b) => a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime());
    }, [transactions]);

    return { subscriptions };
};
