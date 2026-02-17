import React from 'react';
import { Hourglass, AlertTriangle, CheckCircle } from 'lucide-react';
import BlurAmount from './BlurAmount';
import clsx from 'clsx';

interface RunwayWidgetProps {
    averageDailySpend: number;
    burnRate: number;
    runwayDays: number;
    hasData: boolean;
}

const RunwayWidget: React.FC<RunwayWidgetProps> = ({ averageDailySpend, burnRate, runwayDays, hasData }) => {
    if (!hasData) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Hourglass size={20} className="text-gray-500" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Runway</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add more expenses to see your financial health predictions.
                </p>
            </div>
        );
    }

    // Determine health status
    let healthStatus = 'good';
    let healthColor = 'text-green-600 dark:text-green-400';
    let HealthIcon = CheckCircle;

    if (runwayDays < 30) {
        healthStatus = 'critical';
        healthColor = 'text-red-600 dark:text-red-400';
        HealthIcon = AlertTriangle;
    } else if (runwayDays < 90) {
        healthStatus = 'warning';
        healthColor = 'text-amber-600 dark:text-amber-400';
        HealthIcon = AlertTriangle;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={clsx("p-2 rounded-lg",
                        healthStatus === 'good' ? "bg-green-100 dark:bg-green-900/30 text-green-600" :
                            healthStatus === 'warning' ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" :
                                "bg-red-100 dark:bg-red-900/30 text-red-600"
                    )}>
                        <HealthIcon size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Financial Health</h3>
                        <p className={clsx("text-xs font-bold uppercase", healthColor)}>
                            {healthStatus === 'good' ? 'Healthy' : healthStatus === 'warning' ? 'Warning' : 'Critical'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Runway Bar */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500 dark:text-gray-400">Projected Runway</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                            {runwayDays > 365 ? '> 1 Year' : `${runwayDays} Days`}
                        </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={clsx("h-full rounded-full transition-all duration-500",
                                healthStatus === 'good' ? "bg-green-500" :
                                    healthStatus === 'warning' ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${Math.min(100, (runwayDays / 180) * 100)}%` }} // Cap at 6 months for visual
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Daily Burn</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                            <BlurAmount amount={averageDailySpend} />
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Burn</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                            <BlurAmount amount={burnRate} />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunwayWidget;
