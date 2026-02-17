import React from 'react';
import { useUser } from '../hooks/useUser';
import BlurAmount from './BlurAmount';
import { PiggyBank } from 'lucide-react';

const SavingsJar: React.FC = () => {
    const { profile } = useUser();

    // Check if savingsBalance exists, otherwise 0
    // We might need to extend UserProfile interface in the store if it's strictly typed
    // For now assuming userProfile has it or we access it safely.
    // Actually useAuthStore defines UserProfile. Let's check if we need to update it.
    // But runtime it will work if data is there.
    const balance = profile?.savingsBalance || 0;

    // Calculate "fullness" of the jar (Arbitrary goal of $100 for visual effect)
    const goal = 100;
    const percentage = Math.min((balance / goal) * 100, 100);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start z-10 relative">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <PiggyBank size={16} className="text-pink-500" /> Savings Jar
                    </p>
                    <div className="mt-1">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            <BlurAmount amount={balance} />
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Auto-saved from round-ups
                    </p>
                </div>

                <div className="w-12 h-16 bg-gray-100 dark:bg-gray-700 rounded-b-xl rounded-t-md relative border border-gray-200 dark:border-gray-600 overflow-hidden">
                    {/* Liquid/Coins */}
                    <div
                        className="absolute bottom-0 left-0 w-full bg-yellow-400 transition-all duration-1000 ease-out"
                        style={{ height: `${percentage}%` }}
                    >
                        <div className="w-full h-full opacity-50 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                    </div>
                    {/* Shine */}
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-white/20 to-transparent pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};

export default SavingsJar;
