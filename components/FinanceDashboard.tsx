import React, { useMemo } from 'react';
import { FinanceTransaction, Role, Field, Livestock, Equipment } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { PlusIcon, DollarSignIcon, TrendingUpIcon, TrendingDownIcon, PencilIcon } from './ui/Icon';
import { formatCurrency } from '../utils/currency';

interface FinanceDashboardProps {
    transactions: FinanceTransaction[];
    summary: {
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
    };
    onAddTransaction: () => void;
    onEditTransaction: (transaction: FinanceTransaction) => void;
    fields: Field[];
    livestock: Livestock[];
    equipment: Equipment[];
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ transactions, summary, onAddTransaction, onEditTransaction, fields, livestock, equipment }) => {
    const { user } = useAuth();
    const canManage = user.role === Role.Owner || user.role === Role.Manager || user.role === Role.Accountant;
    const canEdit = user.role === Role.Accountant;

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
    
    const fieldsById = useMemo(() => fields.reduce((acc, f) => ({ ...acc, [f.id]: f.name }), {} as Record<number, string>), [fields]);
    
    const livestockById = useMemo(() => livestock.reduce((acc, l) => {
        const name = l.trackingType === 'Individual' ? (l.name || `Tag ${l.tagId}`) : l.groupName;
        acc[l.id] = `${l.species}: ${name}`;
        return acc;
    }, {} as Record<string, string>), [livestock]);

    const equipmentById = useMemo(() => equipment.reduce((acc, e) => ({ ...acc, [e.id]: e.name }), {} as Record<string, string>), [equipment]);

    const getRelatedEntityDisplayName = (tx: FinanceTransaction): string | null => {
        if (!tx.relatedEntityType || !tx.relatedEntityId) return null;
        if (tx.relatedEntityType === 'field') {
            return fieldsById[tx.relatedEntityId as number] || tx.relatedEntityName || null; // Fallback to stored name
        }
        if (tx.relatedEntityType === 'livestock') {
            return livestockById[tx.relatedEntityId as string] || tx.relatedEntityName || null; // Fallback
        }
        if (tx.relatedEntityType === 'equipment') {
            return equipmentById[tx.relatedEntityId as string] || tx.relatedEntityName || null; // Fallback
        }
        return null;
    }


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Finance Overview</h2>
                {canManage && (
                    <Button onClick={onAddTransaction} icon={<PlusIcon />}>
                        Add Transaction
                    </Button>
                )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-500/10 rounded-full">
                            <TrendingUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(summary.totalIncome)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-500/10 rounded-full">
                            <TrendingDownIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.totalExpenses)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                    <div className="flex items-center">
                        <div className={`p-2 rounded-full ${summary.netProfit >= 0 ? 'bg-primary/10' : 'bg-red-500/10'}`}>
                            <DollarSignIcon className={`h-6 w-6 ${summary.netProfit >= 0 ? 'text-primary' : 'text-red-600 dark:text-red-400'}`} />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                            <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-primary' : 'text-red-600 dark:text-red-400'}`}>
                                {formatCurrency(summary.netProfit)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions List */}
            <div className="bg-card p-2 md:p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-xl font-semibold mb-4 text-foreground px-4 pt-4 md:px-0 md:pt-0">Recent Transactions</h3>
                 {transactions.length > 0 ? (
                    <div className="space-y-3 md:max-h-[60vh] md:overflow-y-auto responsive-table">
                        {transactions.map(tx => {
                            const linkedEntityDisplayName = getRelatedEntityDisplayName(tx);
                            return (
                                <div key={tx.id} className="flex justify-between items-center p-3 rounded-md bg-muted/50 md:bg-transparent md:rounded-none md:border-b md:border-border last:border-b-0">
                                    <div className="flex items-center">
                                        <div className={`p-2 rounded-full mr-4 ${tx.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                            {tx.type === 'income' ? <TrendingUpIcon className="h-5 w-5 text-green-600 dark:text-green-400"/> : <TrendingDownIcon className="h-5 w-5 text-red-600 dark:text-red-400"/>}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{tx.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {tx.category} &bull; {formatDate(tx.date)}
                                                {linkedEntityDisplayName && <span className="italic"> &bull; Linked: {linkedEntityDisplayName}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`font-bold text-lg ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </div>
                                        {canEdit && (
                                            <button 
                                                onClick={() => onEditTransaction(tx)} 
                                                className="p-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                                                title="Edit transaction"
                                                aria-label="Edit transaction"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No transactions found.</p>
                        {canManage && <p className="text-muted-foreground">Click "Add Transaction" to get started.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinanceDashboard;