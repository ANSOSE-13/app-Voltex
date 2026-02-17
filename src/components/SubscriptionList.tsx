import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useSubscriptionDetector } from '../hooks/useSubscriptionDetector';
import BlurAmount from './BlurAmount';

const SubscriptionList: React.FC = () => {
    const { transactions, loading } = useTransactions();
    // @ts-ignore - Temporary until hook is fully typed or integrated
    const { subscriptions } = useSubscriptionDetector(transactions);

    if (loading) return <div className="p-4 text-center text-gray-500">Loading subscriptions...</div>;

    // Manual type assertion for now if TS complains about the inferred type from the hook
    const subs = subscriptions as any[];

    if (!subs || subs.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="flex justify-center mb-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                        <Calendar size={24} className="text-blue-500" />
                    </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No subscriptions detected</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    We couldn't find any recurring payments in your transaction history yet.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recurring Subscriptions</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Detected from your history</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Est. Monthly</p>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                        <BlurAmount amount={subs.reduce((acc: number, sub: any) => acc + sub.amount, 0)} />
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {subs.map((sub: any, index: number) => {
                    const daysUntil = Math.ceil((sub.nextPaymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const isDueSoon = daysUntil <= 3 && daysUntil >= 0;

                    return (
                        <div key={index} className="p-4 group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-gray-900 dark:text-white truncate">{sub.name}</h4>
                                        {isDueSoon && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                <AlertCircle size={10} /> DUE SOON
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-2">
                                        <span className="capitalize">{sub.frequency}</span>
                                        <span>•</span>
                                        <span>Next: {sub.nextPaymentDate.toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        <BlurAmount amount={sub.amount} />
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {daysUntil > 0 ? `in ${daysUntil} days` : 'Due today'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/20 text-center text-xs text-gray-400 dark:text-gray-500">
                These are estimated based on your transaction patterns.
            </div>
        </div>
    );
};

export default SubscriptionList;
