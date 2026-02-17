import { useMemo } from 'react';
import type { Transaction } from './useTransactions';

export const useFinancialHealth = (transactions: Transaction[], currentBalance: number) => {
    const health = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return {
                averageDailySpend: 0,
                burnRate: 0,
                runwayDays: 0,
                hasData: false
            };
        }

        // Filter last 30 days expenses
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const recentExpenses = transactions.filter(t =>
            t.type === 'expense' && t.date && (
                (t.date.toDate && typeof t.date.toDate === 'function' && t.date.toDate() >= thirtyDaysAgo) ||
                (t.date instanceof Date && t.date >= thirtyDaysAgo) ||
                (t.date.seconds && new Date(t.date.seconds * 1000) >= thirtyDaysAgo)
            )
        );

        if (recentExpenses.length === 0) {
            return {
                averageDailySpend: 0,
                burnRate: 0,
                runwayDays: currentBalance > 0 ? 999 : 0, // Infinite runway if no expenses
                hasData: false
            };
        }

        const totalRecentExpenses = recentExpenses.reduce((acc, curr) => acc + curr.amount, 0);

        // Calculate days span. If less than 30 days of data, use actual span (min 1 day)
        // Actually, for "average daily spend" usually we just divide total by 30 if we want a monthly avg,
        // but if the user just started, it might be skewing.
        // Let's stick to 30 days for simplicity as a standard "burn rate" metric.
        const averageDailySpend = totalRecentExpenses / 30;

        // Burn Rate = Monthly projected spend
        const burnRate = averageDailySpend * 30;

        // Runway = Balance / Daily Spend
        const runwayDays = averageDailySpend > 0 ? Math.floor(currentBalance / averageDailySpend) : 999;

        return {
            averageDailySpend,
            burnRate,
            runwayDays,
            hasData: true
        };
    }, [transactions, currentBalance]);

    return health;
};
