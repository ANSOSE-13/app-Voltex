import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    MoreVertical,
    Plus,
    Paperclip
} from 'lucide-react';
import clsx from 'clsx';
import { useTransactions } from '../hooks/useTransactions';
import TransactionForm from '../components/TransactionForm';
import BlurAmount from '../components/BlurAmount';
import SubscriptionList from '../components/SubscriptionList';
import { useFinancialHealth } from '../hooks/useFinancialHealth';
import RunwayWidget from '../components/RunwayWidget';
import FinancialSankey from '../components/FinancialSankey';
import SpendingHeatmap from '../components/SpendingHeatmap';
import MoodSpendingChart from '../components/MoodSpendingChart';
import WishlistWidget from '../components/WishlistWidget';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const { transactions, loading, stats, deleteTransaction } = useTransactions();
    const financialHealth = useFinancialHealth(transactions, stats.balance);
    const [showForm, setShowForm] = useState(false);
    const [view, setView] = useState<'transactions' | 'subscriptions' | 'analytics'>('transactions');

    const handleDelete = async (id: string) => {
        if (window.confirm(t('confirm_delete', 'Are you sure you want to delete this transaction?'))) {
            await deleteTransaction(id);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        let date;
        try {
            if (timestamp.toDate && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            } else if (timestamp instanceof Date) {
                date = timestamp;
            } else if (timestamp.seconds) { // Duck typing for Timestamp
                date = new Date(timestamp.seconds * 1000);
            } else {
                return '';
            }
            return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
        } catch (e) {
            console.error("Date formatting error:", e);
            return '';
        }
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} /> {t('new_transaction')}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('total_balance')}</p>
                            <h3 className={clsx("text-2xl font-bold mt-2", stats.balance >= 0 ? "text-gray-900 dark:text-white" : "text-red-500")}>
                                <BlurAmount amount={stats.balance} />
                            </h3>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Activity size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('total_income')}</p>
                            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                                <BlurAmount amount={stats.totalIncome} prefix="+" />
                            </h3>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('total_expenses')}</p>
                            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                                <BlurAmount amount={stats.totalExpenses} prefix="-" />
                            </h3>
                        </div>
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <TrendingDown size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Widgets Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <RunwayWidget {...financialHealth} />
                </div>
                <div className="space-y-6">
                    <WishlistWidget />
                </div>
            </div>

            {/* Recent Transactions / Subscriptions Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {view === 'transactions' ? t('recent_transactions') : view === 'subscriptions' ? t('recurring_subscriptions') : t('spending_analytics')}
                    </h3>
                    <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                        <button
                            onClick={() => setView('transactions')}
                            className={clsx(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                view === 'transactions'
                                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            {t('transactions')}
                        </button>
                        <button
                            onClick={() => setView('subscriptions')}
                            className={clsx(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                view === 'subscriptions'
                                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            {t('subscriptions')}
                        </button>
                        <button
                            onClick={() => setView('analytics')}
                            className={clsx(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                view === 'analytics'
                                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            {t('analytics')}
                        </button>
                    </div>
                </div>

                {view === 'analytics' ? (
                    <div className="p-4 space-y-6">
                        <FinancialSankey />
                        <SpendingHeatmap />
                        <MoodSpendingChart />
                    </div>
                ) : view === 'subscriptions' ? (
                    <div className="p-4">
                        <SubscriptionList />
                    </div>
                ) : loading ? (
                    <div className="p-8 text-center text-gray-500">{t('loading')}</div>
                ) : transactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">{t('no_transactions')}</div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">{t('category')}</th>
                                        <th className="px-6 py-4 font-medium">{t('description')}</th>
                                        <th className="px-6 py-4 font-medium">{t('date')}</th>
                                        <th className="px-6 py-4 font-medium">{t('attachment')}</th>
                                        <th className="px-6 py-4 font-medium text-right">{t('amount')}</th>
                                        <th className="px-6 py-4 font-medium text-center">{t('action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{t(`categories.${tx.category}`, tx.category)}</div>
                                                <div className={clsx("text-xs uppercase font-bold", tx.type === 'income' ? "text-green-600" : "text-red-600")}>
                                                    {t(tx.type)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{tx.description || '-'}</td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDate(tx.date)}</td>
                                            <td className="px-6 py-4">
                                                {tx.attachmentUrl && (
                                                    <a
                                                        href={tx.attachmentUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full"
                                                    >
                                                        <Paperclip size={12} />
                                                        {tx.attachmentName ? (tx.attachmentName.length > 15 ? tx.attachmentName.substring(0, 12) + '...' : tx.attachmentName) : t('view')}
                                                    </a>
                                                )}
                                            </td>
                                            <td className={clsx("px-6 py-4 text-right font-medium", tx.type === 'income' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                                                <BlurAmount amount={tx.amount} prefix={tx.type === 'income' ? '+' : '-'} />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(tx.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List/Cards */}
                        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="p-4 flex items-center justify-between active:bg-gray-50 dark:active:bg-gray-700/50">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t(`categories.${tx.category}`, tx.category)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{tx.description}</p>
                                        <div className="flex items-center mt-1 gap-2 flex-wrap">
                                            <div className="flex items-center">
                                                <span className={clsx(
                                                    "inline-block w-2 h-2 rounded-full mr-2",
                                                    tx.type === 'income' ? "bg-green-500" : "bg-red-500"
                                                )} />
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(tx.date)}</p>
                                            </div>
                                            {tx.attachmentUrl && (
                                                <a
                                                    href={tx.attachmentUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center text-blue-500 text-xs"
                                                >
                                                    <Paperclip size={10} className="mr-1" /> {t('attachment')}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={clsx("text-sm font-bold", tx.type === 'income' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                                            <BlurAmount amount={tx.amount} prefix={tx.type === 'income' ? '+' : '-'} />
                                        </span>
                                        <button
                                            onClick={() => handleDelete(tx.id)}
                                            className="text-gray-400 hover:text-red-500 p-2 -mr-2"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {showForm && <TransactionForm onClose={() => setShowForm(false)} />}
        </div>
    );
};

export default Dashboard;
