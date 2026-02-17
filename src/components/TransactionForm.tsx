import React, { useState } from 'react';
import { X, Save, PlusCircle, MinusCircle, Paperclip, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useTransactions } from '../hooks/useTransactions';
import { useAuthStore } from '../stores/useAuthStore';
import { uploadFile } from '../services/storage';
import { suggestCategory } from '../utils/categoryUtils';
import ReceiptScanner from './ReceiptScanner';

interface TransactionFormProps {
    onClose: () => void;
}

const CATEGORIES = {
    income: ['Salary', 'Freelance', 'Investments', 'Other'],
    expense: ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Education', 'Other']
};

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose }) => {
    const { user } = useAuthStore();
    const { addTransaction } = useTransactions();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        type: 'expense' as 'income' | 'expense',
        amount: '',
        category: 'Food',
        description: '',
        mood: 'neutral',
        isTaxDeductible: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Phase 3: Tax Detective Validation
        if (formData.isTaxDeductible && !file) {
            alert(t('tax_detective_alert', "🕵️‍♀️ Tax Detective:\nYou marked this as Tax Deductible, so you MUST attach a receipt for the IRS/Hacienda!"));
            return;
        }

        setLoading(true);

        try {
            let attachmentUrl = '';
            let attachmentName = '';

            if (file) {
                attachmentName = file.name;
                attachmentUrl = await uploadFile(
                    file,
                    `users/${user.uid}/transactions/${Date.now()}_${file.name}`,
                    {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        ownerId: user.uid
                    },
                    (progress) => setUploadProgress(progress)
                );
            }

            await addTransaction({
                type: formData.type,
                amount: parseFloat(formData.amount),
                category: formData.category,
                description: formData.description,
                attachmentUrl,
                attachmentName,
                mood: formData.mood as any,
                isTaxDeductible: formData.isTaxDeductible
            });
            onClose();
        } catch (error) {
            console.error(error);
            alert(t('error_saving_transaction', 'Error saving transaction'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {formData.type === 'income' ? t('new_income') : t('new_expense')}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Type Selector */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: CATEGORIES.income[0] }))}
                            className={clsx(
                                "flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                                formData.type === 'income'
                                    ? "bg-white dark:bg-gray-600 text-green-600 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                            )}
                        >
                            <PlusCircle size={16} /> {t('income')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: CATEGORIES.expense[0] }))}
                            className={clsx(
                                "flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                                formData.type === 'expense'
                                    ? "bg-white dark:bg-gray-600 text-red-600 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                            )}
                        >
                            <MinusCircle size={16} /> {t('expense')}
                        </button>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category')}</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            {CATEGORIES[formData.type].map(cat => (
                                <option key={cat} value={cat}>{t(`categories.${cat}`, cat)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Mood & Tax Section (Phase 3) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('mood')}</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={formData.mood || 'neutral'}
                                onChange={e => setFormData({ ...formData, mood: e.target.value as any })}
                            >
                                <option value="happy">😊 {t('moods.happy')}</option>
                                <option value="excited">🤩 {t('moods.excited')}</option>
                                <option value="neutral">😐 {t('moods.neutral')}</option>
                                <option value="bored">🥱 {t('moods.bored')}</option>
                                <option value="sad">😢 {t('moods.sad')}</option>
                                <option value="stressed">😫 {t('moods.stressed')}</option>
                            </select>
                        </div>
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                                    checked={formData.isTaxDeductible || false}
                                    onChange={e => setFormData({ ...formData, isTaxDeductible: e.target.checked })}
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('tax_deductible')} 🕵️‍♀️
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')} (Optional)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('description_placeholder', "e.g. Weekly Grocery")}
                            value={formData.description}
                            onChange={e => {
                                const desc = e.target.value;
                                setFormData(prev => {
                                    const suggested = suggestCategory(desc);
                                    return {
                                        ...prev,
                                        description: desc,
                                        category: suggested && CATEGORIES[prev.type].includes(suggested) ? suggested : prev.category
                                    };
                                });
                            }}
                        />
                    </div>

                    {/* File Attachment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('attachment_label')}
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                className="hidden"
                                id="tx-attachment"
                                onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                            />
                            <label
                                htmlFor="tx-attachment"
                                className="flex items-center justify-between w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 transition-colors"
                            >
                                <span className={clsx("text-sm truncate", file ? "text-blue-600 dark:text-blue-400" : "text-gray-500")}>
                                    {file ? file.name : t('click_to_attach')}
                                </span>
                                <Paperclip size={18} className="text-gray-400" />
                            </label>
                        </div>
                        {loading && file && (
                            <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                <div className="bg-blue-600 h-1 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                        )}
                    </div>

                    {/* Receipt Scanner & Actions */}
                    <div className="flex justify-between items-center pt-2">
                        <ReceiptScanner onScanComplete={(data) => {
                            setFormData(prev => ({
                                ...prev,
                                amount: data.amount ? data.amount.toString() : prev.amount,
                                description: data.merchant ? data.merchant : prev.description,
                            }));

                            if (data.merchant) {
                                const suggested = suggestCategory(data.merchant);
                                if (suggested) {
                                    setFormData(prev => ({
                                        ...prev,
                                        category: suggested && CATEGORIES[prev.type].includes(suggested) ? suggested : prev.category
                                    }));
                                }
                            }

                            alert(t('scanned_alert', `Scanned!\nMerchant: ${data.merchant || '?'}\nAmount: ${data.amount || '?'}`));
                        }} />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? <><Loader2 size={18} className="animate-spin" /> {file ? 'Uploading & Saving...' : t('saving')}</> : <><Save size={18} /> {t('save_transaction')}</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TransactionForm;
