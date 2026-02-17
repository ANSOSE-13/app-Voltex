import React, { useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import clsx from 'clsx';

const SpendingHeatmap: React.FC = () => {
    const { transactions } = useTransactions();

    // Generate last 365 days
    const days = useMemo(() => {
        const today = new Date();
        const dates = [];
        for (let i = 0; i < 364; i++) {
            const d = new Date();
            d.setDate(today.getDate() - (363 - i)); // 364 days ago to today
            dates.push(d);
        }
        dates.push(today);
        return dates;
    }, []);

    // Map spending to dates
    const spendingMap = useMemo(() => {
        const map: Record<string, number> = {};
        transactions.forEach(t => {
            if (t.type === 'expense' && t.date) {
                let date: Date | null = null;
                try {
                    if (t.date.toDate && typeof t.date.toDate === 'function') {
                        date = t.date.toDate();
                    } else if (t.date instanceof Date) {
                        date = t.date;
                    } else if (t.date.seconds) {
                        date = new Date(t.date.seconds * 1000);
                    }
                } catch (e) {
                    console.warn("Invalid date in transaction:", t);
                }

                if (date) {
                    const dateStr = date.toDateString();
                    map[dateStr] = (map[dateStr] || 0) + t.amount;
                }
            }
        });
        return map;
    }, [transactions]);

    // Calculate intensity levels
    // Levels: 0 (0), 1 (1-20), 2 (20-50), 3 (50-100), 4 (>100) - simplified
    const getLevel = (amount: number) => {
        if (!amount) return 0;
        if (amount < 20) return 1;
        if (amount < 50) return 2;
        if (amount < 100) return 3;
        return 4;
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Spending Frequency</h3>

            <div className="flex gap-1 min-w-max">
                {/* Organize by weeks for GitHub style? 
                    Actually, a simple row of squares wrapping might be easier for a quick custom implementation, 
                    OR a true week-column grid.
                    Let's do a Flex grid with week columns.
                */}
                {Array.from({ length: 53 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                            // Logic to map week/day to the linear `days` array is tricky without date math.
                            // Simplified: Just iterate the days array and chunk it?
                            // Let's rely on mapping: index = weekIndex * 7 + dayIndex
                            const dataIndex = weekIndex * 7 + dayIndex;
                            const date = days[dataIndex];

                            if (!date) return <div key={dayIndex} className="w-3 h-3" />; // spacer

                            const dateStr = date.toDateString();
                            const amount = spendingMap[dateStr] || 0;
                            const level = getLevel(amount);

                            return (
                                <div
                                    key={dayIndex}
                                    className={clsx(
                                        "w-3 h-3 rounded-[2px] transition-colors",
                                        level === 0 ? "bg-gray-100 dark:bg-gray-700" :
                                            level === 1 ? "bg-green-200 dark:bg-green-900/40" :
                                                level === 2 ? "bg-green-300 dark:bg-green-800" :
                                                    level === 3 ? "bg-green-500 dark:bg-green-600" :
                                                        "bg-green-700 dark:bg-green-500"
                                    )}
                                    title={`${date.toLocaleDateString()}: $${amount.toFixed(2)}`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 justify-end">
                <span>Less</span>
                <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-[2px]" />
                <div className="w-3 h-3 bg-green-200 dark:bg-green-900/40 rounded-[2px]" />
                <div className="w-3 h-3 bg-green-300 dark:bg-green-800 rounded-[2px]" />
                <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-[2px]" />
                <div className="w-3 h-3 bg-green-700 dark:bg-green-500 rounded-[2px]" />
                <span>More</span>
            </div>
        </div>
    );
};

export default SpendingHeatmap;
