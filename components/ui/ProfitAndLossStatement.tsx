

import React, { useMemo } from 'react';
import { FinanceTransaction, TransactionCategory } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface ProfitAndLossStatementProps {
    transactions: FinanceTransaction[];
}

const PnLRow: React.FC<{ label: string; amount: number; isTotal?: boolean; isNegative?: boolean; isFinal?: boolean }> = ({ label, amount, isTotal, isNegative, isFinal }) => (
    <div className={`flex justify-between py-2 ${isTotal ? 'border-t border-border font-bold' : ''} ${isFinal ? 'text-lg' : 'text-sm'}`}>
        <span className={isTotal ? '' : 'pl-4'}>{label}</span>
        <span className={isNegative ? 'text-red-600' : ''}>{formatCurrency(amount)}</span>
    </div>
);

const ProfitAndLossStatement: React.FC<ProfitAndLossStatementProps> = ({ transactions }) => {
    const pnlData = useMemo(() => {
        const revenue = {
            sales: transactions.filter(t => t.type === 'income' && t.category === TransactionCategory.CropLivestockSales).reduce((s, t) => s + t.amount, 0),
            fieldRental: transactions.filter(t => t.type === 'income' && t.category === TransactionCategory.FieldRental).reduce((s, t) => s + t.amount, 0),
            equipmentRental: transactions.filter(t => t.type === 'income' && t.category === TransactionCategory.EquipmentRental).reduce((s, t) => s + t.amount, 0),
            eggSales: transactions.filter(t => t.type === 'income' && t.category === TransactionCategory.EggSales).reduce((s, t) => s + t.amount, 0),
            milkSales: transactions.filter(t => t.type === 'income' && t.category === TransactionCategory.MilkSales).reduce((s, t) => s + t.amount, 0),
            compostSales: transactions.filter(t => t.type === 'income' && t.category === TransactionCategory.CompostSales).reduce((s, t) => s + t.amount, 0),
            manureSales: transactions.filter(t => t.type === 'income' && t.category === TransactionCategory.ManureSales).reduce((s, t) => s + t.amount, 0),
            otherIncome: transactions.filter(t => t.type === 'income' && t.category === TransactionCategory.OtherIncome).reduce((s, t) => s + t.amount, 0),
        };
        const totalRevenue = Object.values(revenue).reduce((s, v) => s + v, 0);

        const expenses = {
            supplies: transactions.filter(t => t.category === TransactionCategory.Supplies).reduce((s, t) => s + t.amount, 0),
            labor: transactions.filter(t => t.category === TransactionCategory.Labor).reduce((s, t) => s + t.amount, 0),
            repairs: transactions.filter(t => t.category === TransactionCategory.Repairs).reduce((s, t) => s + t.amount, 0),
            utilities: transactions.filter(t => t.category === TransactionCategory.Utilities).reduce((s, t) => s + t.amount, 0),
            other: transactions.filter(t => t.category === TransactionCategory.Other).reduce((s, t) => s + t.amount, 0),
        };
        const totalExpenses = Object.values(expenses).reduce((s, v) => s + v, 0);

        const netIncome = totalRevenue - totalExpenses;

        return { revenue, totalRevenue, expenses, totalExpenses, netIncome };
    }, [transactions]);
    
    if (transactions.length === 0) {
        return (
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border text-center">
                <p className="text-muted-foreground">No transaction data available for the selected period to generate a statement.</p>
            </div>
        );
    }

    return (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h3 className="text-xl font-bold text-foreground mb-1">Profit & Loss Statement</h3>
            <p className="text-sm text-muted-foreground mb-6">For the selected period</p>
            
            <div className="space-y-4">
                <div>
                    <h4 className="text-md font-semibold text-foreground mb-2">Revenue</h4>
                    <PnLRow label="Crop/Livestock Sales" amount={pnlData.revenue.sales} />
                    {pnlData.revenue.fieldRental > 0 && <PnLRow label="Field Rental" amount={pnlData.revenue.fieldRental} />}
                    {pnlData.revenue.equipmentRental > 0 && <PnLRow label="Equipment Rental" amount={pnlData.revenue.equipmentRental} />}
                    {pnlData.revenue.eggSales > 0 && <PnLRow label="Egg Sales" amount={pnlData.revenue.eggSales} />}
                    {pnlData.revenue.milkSales > 0 && <PnLRow label="Milk Sales" amount={pnlData.revenue.milkSales} />}
                    {pnlData.revenue.compostSales > 0 && <PnLRow label="Compost Sales" amount={pnlData.revenue.compostSales} />}
                    {pnlData.revenue.manureSales > 0 && <PnLRow label="Manure Sales" amount={pnlData.revenue.manureSales} />}
                    {pnlData.revenue.otherIncome > 0 && <PnLRow label="Other Income" amount={pnlData.revenue.otherIncome} />}
                    <PnLRow label="Total Revenue" amount={pnlData.totalRevenue} isTotal />
                </div>
                
                <div>
                    <h4 className="text-md font-semibold text-foreground mt-6 mb-2">Operating Expenses</h4>
                    <PnLRow label="Seeds & Supplies" amount={pnlData.expenses.supplies} />
                    <PnLRow label="Labor Costs" amount={pnlData.expenses.labor} />
                    <PnLRow label="Equipment Repairs" amount={pnlData.expenses.repairs} />
                    <PnLRow label="Utilities" amount={pnlData.expenses.utilities} />
                    <PnLRow label="Other" amount={pnlData.expenses.other} />
                    <PnLRow label="Total Operating Expenses" amount={pnlData.totalExpenses} isTotal />
                </div>
                
                <div className="pt-4">
                    <PnLRow label="Net Income" amount={pnlData.netIncome} isTotal isFinal isNegative={pnlData.netIncome < 0} />
                </div>
            </div>
        </div>
    );
};

export default ProfitAndLossStatement;