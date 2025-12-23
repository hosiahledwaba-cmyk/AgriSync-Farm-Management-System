

import React, { useMemo } from 'react';
import { FinanceTransaction } from '../../types';
import { BarChartIcon } from './Icon';
import { formatCurrency } from '../../utils/currency';

interface CategoryBreakdownProps {
    title: string;
    transactions: FinanceTransaction[];
    type: 'income' | 'expense';
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ title, transactions, type }) => {
    
    const categoryData = useMemo(() => {
        const relevantTransactions = transactions.filter(t => t.type === type);
        const total = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);

        const byCategory = relevantTransactions.reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = 0;
            }
            acc[t.category] += t.amount;
            return acc;
        }, {} as Record<string, number>);

        // FIX: Removed explicit type annotation from map as it's now inferred from the typed reduce accumulator.
        const sortedCategories = Object.entries(byCategory)
            .map(([label, value]: [string, number]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);

        const topCategories = sortedCategories.slice(0, 4); // Take top 4
        const otherValue = sortedCategories.slice(4).reduce((sum, cat) => sum + cat.value, 0);

        if (otherValue > 0) {
            topCategories.push({ label: 'Other', value: otherValue });
        }

        return {
            total,
            categories: topCategories
        };
    }, [transactions, type]);

    const barColor = type === 'income' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
            {categoryData.categories.length > 0 && categoryData.total > 0 ? (
                <div className="space-y-4">
                    {categoryData.categories.map(({ label, value }) => (
                        <div key={label}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-foreground">{label}</span>
                                <span className="text-muted-foreground">{formatCurrency(value, 0)}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                    className={`${barColor} h-2 rounded-full`} 
                                    style={{ width: `${(value / categoryData.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <BarChartIcon className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
                    <p className="text-sm font-semibold text-muted-foreground">No {type} data</p>
                    <p className="text-xs text-muted-foreground">No transactions found for this period.</p>
                </div>
            )}
        </div>
    );
};

export default CategoryBreakdown;