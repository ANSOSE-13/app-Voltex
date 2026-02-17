import React, { useMemo } from 'react';
import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from 'recharts';
import { useTransactions } from '../hooks/useTransactions';

// Custom node for Sankey to look better
const DemoSankeyNode = ({ x, y, width, height, index, payload, containerWidth }: any) => {
    const isOut = x + width + 6 > containerWidth;
    return (
        <Layer key={`CustomNode${index}`}>
            <Rectangle
                x={x}
                y={y}
                width={width}
                height={height}
                fill={payload.color || "#8884d8"}
                fillOpacity="1"
            />
            <text
                textAnchor={isOut ? 'end' : 'start'}
                x={isOut ? x - 6 : x + width + 6}
                y={y + height / 2}
                fontSize="12"
                stroke="none"
                fill="#888" // simplified color
                dy={4} // vertical align
            >
                {payload.name}
            </text>
            <text
                textAnchor={isOut ? 'end' : 'start'}
                x={isOut ? x - 6 : x + width + 6}
                y={y + height / 2 + 14}
                fontSize="10"
                stroke="none"
                fill="#999"
            >
                {typeof payload.value === 'number' && `$${payload.value.toFixed(0)}`}
            </text>
        </Layer>
    );
};

const FinancialSankey: React.FC = () => {
    const { transactions } = useTransactions();

    const data = useMemo(() => {
        if (!transactions || transactions.length === 0) return { nodes: [], links: [] };

        // 1. Calculate Incomes
        const incomes = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');

        const incomeSources: Record<string, number> = {};
        let totalIncome = 0;
        incomes.forEach(t => {
            const cat = t.category || 'Other Income';
            incomeSources[cat] = (incomeSources[cat] || 0) + t.amount;
            totalIncome += t.amount;
        });

        // 2. Calculate Expenses
        const expenseCategories: Record<string, number> = {};
        let totalExpense = 0;
        expenses.forEach(t => {
            const cat = t.category || 'Other Expense';
            expenseCategories[cat] = (expenseCategories[cat] || 0) + t.amount;
            totalExpense += t.amount;
        });

        const savings = Math.max(0, totalIncome - totalExpense);

        // 3. Build Nodes
        // Indices: 
        // 0 to N-1: Income Sources
        // N: Wallet/Budget
        // N+1 to M: Expense Categories + Savings

        const nodes: { name: string, color?: string }[] = [];
        const links: { source: number, target: number, value: number }[] = [];

        const incomeKeys = Object.keys(incomeSources);
        const expenseKeys = Object.keys(expenseCategories);

        // Add Income Nodes
        incomeKeys.forEach(key => nodes.push({ name: key, color: '#10B981' })); // Green

        // Add Wallet Node
        const walletIndex = nodes.length;
        nodes.push({ name: 'Budget', color: '#3B82F6' }); // Blue

        // Add Expense Nodes
        const expenseStartIndex = nodes.length;
        expenseKeys.forEach(key => nodes.push({ name: key, color: '#EF4444' })); // Red

        // Add Savings Node (if any)
        const savingsIndex = nodes.length;
        if (savings > 0) {
            nodes.push({ name: 'Savings', color: '#10B981' });
        }

        // Build Links: Income -> Wallet
        incomeKeys.forEach((key, index) => {
            links.push({
                source: index,
                target: walletIndex,
                value: incomeSources[key]
            });
        });

        // Build Links: Wallet -> Expenses
        expenseKeys.forEach((key, index) => {
            links.push({
                source: walletIndex,
                target: expenseStartIndex + index,
                value: expenseCategories[key]
            });
        });

        // Build Links: Wallet -> Savings
        if (savings > 0) {
            links.push({
                source: walletIndex,
                target: savingsIndex,
                value: savings
            });
        }

        // If no income but expenses exist, we need a source to avoid errors or weird graphs
        // Or if totalIncome < totalExpense (deficit), we might need a "Debt/Previous Balance" node?
        // For simplicity, if totalIncome < totalExpense, we just show what we have. 
        // Sankey requires flow conversation usually? Recharts might be lenient. 
        // Ideally source value sum should equal target value sum for the middle node.

        // Adjustment: "Budget" node input = totalIncome. Output = totalExpense + Savings.
        // If totalIncome < totalExpense, we have a problem drawing a balanced Sankey.
        // Let's add a "Reserves" income node if deficit.
        if (totalExpense > totalIncome) {
            const deficit = totalExpense - totalIncome;
            nodes.unshift({ name: 'Reserves', color: '#F59E0B' }); // Amber
            // Shift all indices by 1
            links.forEach(l => {
                l.source++;
                l.target++;
            });
            // Add link Reserves -> Budget (now index walletIndex + 1)
            links.push({
                source: 0,
                target: walletIndex + 1,
                value: deficit
            });
        }

        return { nodes, links };

    }, [transactions]);

    if (data.nodes.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400 border rounded-xl">
                No data for Flow Diagram
            </div>
        );
    }

    return (
        <div className="h-[400px] w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Cash Flow</h3>
            <ResponsiveContainer width="100%" height="100%">
                <Sankey
                    data={data}
                    node={<DemoSankeyNode />}
                    nodePadding={50}
                    margin={{
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10,
                    }}
                    link={{ stroke: '#77c878' }}
                >
                    <Tooltip />
                </Sankey>
            </ResponsiveContainer>
        </div>
    );
};

export default FinancialSankey;
