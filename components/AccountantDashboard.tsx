import React, { useState, useMemo } from 'react';
import { FinanceTransaction, InventoryItem, User, Field, Livestock, Equipment, Role } from '../types';
import Button from './ui/Button';
import { ArchiveIcon, BarChartIcon, DollarSignIcon, FileTextIcon, PlusIcon, UsersIcon } from './ui/Icon';
import { formatDateForInput } from '../utils/dateUtils';
import CategoryBreakdown from './ui/CategoryBreakdown';
import ProfitAndLossStatement from './ui/ProfitAndLossStatement';
import TransactionLedger from './ui/TransactionLedger';
import IncomeExpenseBarChart from './ui/IncomeExpenseBarChart';
import ProfitabilityBreakdown from './ui/ProfitabilityBreakdown';
import { formatCurrency } from '../utils/currency';
import PayrollManager from './payroll/PayrollManager';

interface AccountantDashboardProps {
    allTransactions: FinanceTransaction[];
    inventoryItems: InventoryItem[];
    users: User[];
    fields: Field[];
    livestock: Livestock[];
    equipment: Equipment[];
    onAddTransaction: () => void;
    onCreateJournal: () => void;
    onRunPayroll: (totalAmount: number, description: string, date: string) => void;
}

type Tab = 'overview' | 'profitability' | 'reports' | 'valuation' | 'payroll';

const AccountantDashboard: React.FC<AccountantDashboardProps> = ({ allTransactions, inventoryItems, users, fields, livestock, equipment, onAddTransaction, onCreateJournal, onRunPayroll }) => {
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);

    const [startDate, setStartDate] = useState(formatDateForInput(yearStart));
    const [endDate, setEndDate] = useState(formatDateForInput(today));
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const filteredTransactions = useMemo(() => {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);

        return allTransactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= start && tDate <= end;
        });
    }, [allTransactions, startDate, endDate]);

    const summary = useMemo(() => {
        const totalRevenue = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const netIncome = totalRevenue - totalExpenses;
        return { netIncome, totalRevenue, totalExpenses };
    }, [filteredTransactions]);

    const inventoryValue = useMemo(() => {
        return inventoryItems.reduce((sum, item) => sum + (item.stock_qty * (item.unit_cost || 0)), 0);
    }, [inventoryItems]);

    const inputClasses = "w-full sm:w-auto mt-1 block pl-3 pr-2 py-2 text-base border-input focus:outline-none focus:ring-ring focus:border-primary rounded-md bg-background shadow-sm";

    const TabButton: React.FC<{ tabName: Tab, label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-3 py-2 font-semibold text-sm rounded-md transition-colors ${
                activeTab === tabName
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Financial Command Center</h2>
                <div className="flex flex-wrap items-center gap-4">
                     <div className="flex flex-wrap items-end gap-2">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Period Start</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClasses}/>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Period End</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClasses}/>
                        </div>
                    </div>
                    <div className="flex gap-2 self-end">
                        <Button onClick={onAddTransaction} size="sm" variant="secondary" icon={<PlusIcon />}>Add Transaction</Button>
                        <Button variant="secondary" size="sm" onClick={onCreateJournal}>Create Journal</Button>
                    </div>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KPICard title="Net Income" value={formatCurrency(summary.netIncome, 0)} icon={<BarChartIcon />} isNegative={summary.netIncome < 0}/>
                <KPICard title="Total Revenue" value={formatCurrency(summary.totalRevenue, 0)} icon={<DollarSignIcon className="text-green-500"/>} />
                <KPICard title="Total Expenses" value={formatCurrency(summary.totalExpenses, 0)} icon={<DollarSignIcon className="text-red-500"/>} />
                <KPICard title="A/P (Payable)" value="R180k" icon={<FileTextIcon />} isPlaceholder />
                <KPICard title="A/R (Receivable)" value="R120k" icon={<FileTextIcon />} isPlaceholder />
                <KPICard title="Inventory Value" value={formatCurrency(inventoryValue, 0)} icon={<ArchiveIcon />} />
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-border">
                <nav className="-mb-px flex flex-wrap gap-x-6 gap-y-2" aria-label="Tabs">
                    <TabButton tabName="overview" label="Financial Overview" />
                    <TabButton tabName="profitability" label="Profitability" />
                    <TabButton tabName="reports" label="Reports & Ledger" />
                    <TabButton tabName="valuation" label="Valuation" />
                    <TabButton tabName="payroll" label="Payroll" />
                </nav>
            </div>

            {/* Tab Content */}
            <div className="pt-4">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <IncomeExpenseBarChart data={filteredTransactions} />
                        </div>
                        <div className="space-y-6">
                            <CategoryBreakdown title="Income Sources" transactions={filteredTransactions} type="income" />
                            <CategoryBreakdown title="Expense Categories" transactions={filteredTransactions} type="expense" />
                        </div>
                    </div>
                )}
                
                {activeTab === 'profitability' && (
                    <ProfitabilityBreakdown transactions={filteredTransactions} fields={fields} livestock={livestock} equipment={equipment} />
                )}

                {activeTab === 'reports' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <ProfitAndLossStatement transactions={filteredTransactions} />
                        </div>
                        <div className="lg:col-span-2">
                            <TransactionLedger periodTransactions={filteredTransactions} allTransactions={allTransactions} startDate={startDate} users={users} />
                        </div>
                    </div>
                )}
                
                {activeTab === 'valuation' && (
                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                        <h3 className="text-xl font-semibold text-foreground mb-4">Inventory Valuation</h3>
                        <p className="text-sm text-muted-foreground mb-4">Based on current stock and recorded unit costs.</p>
                         <div className="overflow-x-auto responsive-table">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3">Item Name</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3 text-right">Stock Qty</th>
                                        <th className="px-6 py-3 text-right">Unit Cost</th>
                                        <th className="px-6 py-3 text-right">Total Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventoryItems.map(item => (
                                        <tr key={item.id} className="bg-card border-b border-border hover:bg-accent">
                                            <td data-label="Item" className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                                            <td data-label="Category" className="px-6 py-4 text-muted-foreground">{item.category}</td>
                                            <td data-label="Stock" className="px-6 py-4 text-right text-foreground">{item.stock_qty} {item.unit}</td>
                                            <td data-label="Unit Cost" className="px-6 py-4 text-right text-foreground">{formatCurrency(item.unit_cost || 0, 2)}</td>
                                            <td data-label="Total Value" className="px-6 py-4 text-right font-semibold text-foreground">{formatCurrency((item.unit_cost || 0) * item.stock_qty)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-card font-bold text-foreground">
                                        <td colSpan={4} data-label="Total" className="px-6 py-4 text-right">Total Inventory Value</td>
                                        <td data-label="Amount" className="px-6 py-4 text-right">{formatCurrency(inventoryValue)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'payroll' && (
                    <PayrollManager 
                        users={users.filter(u => u.role === Role.Worker || u.role === Role.Manager)} 
                        onRunPayroll={onRunPayroll} 
                    />
                )}
            </div>
        </div>
    );
};

const KPICard: React.FC<{ title: string; value: string; icon: React.ReactNode; isNegative?: boolean; isPlaceholder?: boolean }> = ({ title, value, icon, isNegative = false, isPlaceholder = false }) => (
    <div className={`bg-card p-4 rounded-xl shadow-sm border border-border ${isPlaceholder ? 'opacity-60' : ''}`}>
        <p className="text-sm font-medium text-muted-foreground whitespace-nowrap flex items-center gap-2">
            {icon} {title}
        </p>
        <p className={`text-2xl font-bold mt-1 ${isNegative ? 'text-red-600' : 'text-foreground'}`}>{value}</p>
        {isPlaceholder && <p className="text-xs text-muted-foreground mt-1">Mock Data</p>}
    </div>
);

export default AccountantDashboard;