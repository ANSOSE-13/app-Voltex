import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTransactions } from '../hooks/useTransactions';



const COLORS = {
    happy: '#22c55e',    // Green
    excited: '#eab308',  // Yellow
    neutral: '#94a3b8',  // Gray
    bored: '#64748b',    // Slate
    sad: '#3b82f6',      // Blue
    stressed: '#ef4444'  // Red
};

const EMOJIS = {
    happy: '😊',
    excited: '🤩',
    neutral: '😐',
    bored: '🥱',
    sad: '😢',
    stressed: '😫'
};

const MoodSpendingChart: React.FC = () => {
    const { transactions } = useTransactions();

    const moodData = React.useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense' && t.mood);
        const moodMap = new Map<string, number>();

        expenses.forEach(t => {
            const mood = t.mood || 'neutral';
            const current = moodMap.get(mood) || 0;
            moodMap.set(mood, current + t.amount);
        });

        // Convert to array and filter out zero values
        return Array.from(moodMap.entries())
            .map(([key, value]) => ({
                name: key.charAt(0).toUpperCase() + key.slice(1),
                key: key, // for color lookup
                value: value,
                emoji: EMOJIS[key as keyof typeof EMOJIS] || '❓'
            }))
            .sort((a, b) => b.value - a.value); // Sort highest spend first
    }, [transactions]);

    if (moodData.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center h-80 text-center">
                <div className="text-4xl mb-4">🎭</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Emotional Spending</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                    Start tagging your transactions with moods to see how your emotions affect your wallet!
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-96">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🎭</span> Emotional Spending
            </h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={moodData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {moodData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[entry.key as keyof typeof COLORS] || '#8884d8'}
                                    stroke="none"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Spent']}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Legend
                            verticalAlign="middle"
                            align="right"
                            layout="vertical"
                            wrapperStyle={{ paddingLeft: '20px' }}
                            formatter={(value, entry: any) => {
                                const payload = entry.payload; // Access the data object
                                return (
                                    <span className="text-gray-600 dark:text-gray-300 font-medium ml-2">
                                        {payload.emoji} {value}
                                    </span>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MoodSpendingChart;
