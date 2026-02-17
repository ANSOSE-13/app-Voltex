import React from 'react';
import { useUIStore } from '../stores/useUIStore';
import { useAppStore } from '../stores/useAppStore';
import clsx from 'clsx';

interface BlurAmountProps {
    amount: number;
    currency?: string;
    className?: string;
    decimals?: number;
    prefix?: string; // e.g., '+' or '-'
}

const BlurAmount: React.FC<BlurAmountProps> = ({
    amount,
    currency: propCurrency,
    className,
    decimals = 2,
    prefix = ''
}) => {
    const { isPrivacyMode } = useUIStore();
    const { currency: appCurrency, exchangeRate } = useAppStore(); // Get global currency preference and rate

    // Determine effective currency (prop overrides global if specified, but usually we want global)
    // Actually, for a multi-currency app, we usually want to convert EVERYTHING to the global preference.
    // If propCurrency is passed (e.g. from a transaction that was saved in USD), we might need to convert it?
    // Current app assumes all 'amount' numbers are in the BASE currency (USD).
    // So we just need to convert from Base (USD) to Display (USD/EUR).

    const isEur = appCurrency === 'EUR';
    // Use the fetched exchange rate. If appCurrency is USD, exchangeRate should be 1.
    const convertedAmount = amount * exchangeRate;
    const currencySymbol = isEur ? '€' : '$';

    if (isPrivacyMode) {
        return (
            <span className={clsx("font-mono filter blur-sm select-none transition-all duration-300", className)}>
                {prefix}{currencySymbol}****
            </span>
        );
    }

    return (
        <span className={clsx("transition-all duration-300", className)}>
            {prefix}{propCurrency || currencySymbol}{convertedAmount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        </span>
    );
};

export default BlurAmount;
