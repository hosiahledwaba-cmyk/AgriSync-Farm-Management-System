import React, { useMemo } from 'react';
import { FinanceTransaction, Field, Livestock, Equipment } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface ProfitabilityBreakdownProps {
    transactions: FinanceTransaction[];
    fields: Field[];
    livestock: Livestock[];
    equipment: Equipment[];
}

const ProfitabilityBreakdown: React.FC<ProfitabilityBreakdownProps> = ({ transactions, fields, livestock, equipment }) => {

    const getLivestockName = (l: Livestock) => {
        return l.trackingType === 'Individual' ? `${l.species}: ${l.name || 'Tag ' + l.tagId}` : `${l.species}: ${l.groupName}`;
    }

    const profitabilityData = useMemo(() => {
        const costCenters: { id: string | number; name: string; type: 'Field' | 'Livestock' | 'Equipment' }[] = [
            ...fields.map(f => ({ id: f.id, name: f.name, type: 'Field' as const })),
            ...livestock.map(l => ({ id: l.id, name: getLivestockName(l), type: 'Livestock' as const })),
            ...equipment.map(e => ({ id: e.id, name: e.name, type: 'Equipment' as const })),
        ];

        return costCenters.map(center => {
            const centerTx = transactions.filter(t => 
                (t.relatedEntityType?.toLowerCase() === center.type.toLowerCase()) && 
                (String(t.relatedEntityId) === String(center.id))
            );
            
            const income = centerTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const expense = centerTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            const net = income - expense;

            return { ...center, income, expense, net };
        }).filter(item => item.income > 0 || item.expense > 0) // Only show items with financial activity
          .sort((a,b) => b.net - a.net);

    }, [transactions, fields, livestock, equipment]);

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-2">Profitability by Cost Center</h3>
            <p className="text-sm text-muted-foreground mb-4">Analysis of income and direct expenses linked to specific fields, livestock, or equipment.</p>
            <div className="overflow-x-auto responsive-table">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                            <th className="px-6 py-3">Cost Center</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3 text-right">Income</th>
                            <th className="px-6 py-3 text-right">Expenses</th>
                            <th className="px-6 py-3 text-right">Net Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profitabilityData.map(item => (
                            <tr key={`${item.type}-${item.id}`} className="bg-card border-b border-border hover:bg-accent">
                                <td data-label="Cost Center" className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                                <td data-label="Type" className="px-6 py-4 text-muted-foreground">{item.type}</td>
                                <td data-label="Income" className="px-6 py-4 text-right text-green-600">{formatCurrency(item.income)}</td>
                                <td data-label="Expenses" className="px-6 py-4 text-right text-red-600">{formatCurrency(item.expense)}</td>
                                <td data-label="Net Profit" className={`px-6 py-4 text-right font-bold ${item.net >= 0 ? 'text-foreground' : 'text-red-500'}`}>{formatCurrency(item.net)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {profitabilityData.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">No transactions linked to cost centers in this period.</div>
                )}
            </div>
        </div>
    );
};

export default ProfitabilityBreakdown;