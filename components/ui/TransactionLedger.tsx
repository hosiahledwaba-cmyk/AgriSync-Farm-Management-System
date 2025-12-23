import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FinanceTransaction, TransactionType, User } from '../../types';
import { FileDownIcon, InfoIcon, PlusIcon, PencilIcon } from './Icon';
import Button from './Button';
import { exportToCSV } from '../../utils/csvExport';
import { formatCurrency } from '../../utils/currency';

interface TransactionLedgerProps {
    periodTransactions: FinanceTransaction[];
    allTransactions: FinanceTransaction[];
    startDate: string;
    users: User[];
}

const formatAuditDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
}

const TransactionLedger: React.FC<TransactionLedgerProps> = ({ periodTransactions, allTransactions, startDate, users }) => {
    
    const [activePopover, setActivePopover] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const usersById = useMemo(() => users.reduce((acc, u) => ({ ...acc, [u.id]: u.name }), {} as Record<number, string>), [users]);

    const startingBalance = useMemo(() => {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);

        return allTransactions.reduce((balance, t) => {
            if (new Date(t.date) < start) {
                return balance + (t.type === TransactionType.Income ? t.amount : -t.amount);
            }
            return balance;
        }, 0);
    }, [allTransactions, startDate]);
    
    const transactionsWithBalance = useMemo(() => {
        let runningBalance = startingBalance;
        return periodTransactions
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(t => {
                runningBalance += t.type === TransactionType.Income ? t.amount : -t.amount;
                return { ...t, balance: runningBalance };
            });
    }, [periodTransactions, startingBalance]);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredTransactions = useMemo(() => {
         return transactionsWithBalance.filter(t => searchTerm === '' || t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [transactionsWithBalance, searchTerm]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                // Also check if the click was on an info icon itself
                const target = event.target as HTMLElement;
                if (!target.closest('[data-popover-trigger]')) {
                    setActivePopover(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-foreground">Transaction Ledger</h3>
                    <p className="text-sm text-muted-foreground">Starting Balance for Period: <span className="font-bold text-foreground">{formatCurrency(startingBalance)}</span></p>
                </div>
                 <div className="flex gap-4">
                    <input type="text" placeholder="Search description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-auto pl-3 pr-2 py-2 text-base border-input bg-background focus:outline-none focus:ring-ring focus:border-primary rounded-md"/>
                    <Button onClick={() => exportToCSV(periodTransactions, `ledger_report`)} icon={<FileDownIcon />} size="sm">
                        Export
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto responsive-table">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3 text-right">Income</th>
                            <th scope="col" className="px-6 py-3 text-right">Expense</th>
                            <th scope="col" className="px-6 py-3 text-right">Running Balance</th>
                            <th scope="col" className="px-4 py-3 text-center">Audit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map(tx => (
                            <tr key={tx.id} className="bg-card border-b border-border hover:bg-accent">
                                <td data-label="Date" className="px-6 py-4 whitespace-nowrap text-muted-foreground">{tx.date}</td>
                                <td data-label="Description" className="px-6 py-4 font-medium text-foreground">
                                    {tx.description}
                                    {tx.journalId && <span className="ml-2 text-xs font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded" title={`Journal ID: ${tx.journalId}`}>JE</span>}
                                    <span className="text-xs text-muted-foreground block">{tx.category}</span>
                                </td>
                                <td data-label="Income" className="px-6 py-4 text-right text-green-600">
                                    {tx.type === TransactionType.Income ? formatCurrency(tx.amount) : '-'}
                                </td>
                                 <td data-label="Expense" className="px-6 py-4 text-right text-red-600">
                                    {tx.type === TransactionType.Expense ? formatCurrency(tx.amount) : '-'}
                                </td>
                                <td data-label="Balance" className="px-6 py-4 text-right font-semibold text-foreground">{formatCurrency(tx.balance)}</td>
                                <td data-label="Audit" className="px-4 py-4 text-center no-label">
                                    <div className="relative inline-block">
                                        <button data-popover-trigger onClick={() => setActivePopover(activePopover === tx.id ? null : tx.id)} className="text-muted-foreground hover:text-primary transition-colors">
                                            <InfoIcon className="h-5 w-5"/>
                                        </button>
                                        {activePopover === tx.id && (
                                            <div ref={popoverRef} className="absolute bottom-full mb-3 right-1/2 translate-x-1/2 w-64 bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-xl z-10 text-left text-xs">
                                                {/* Caret */}
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full h-2 w-2">
                                                    <div className="h-2 w-2 bg-popover border-r border-b border-border rotate-45 -translate-y-1/2"></div>
                                                </div>
                                                
                                                <div className="font-bold text-sm mb-2 text-foreground">Audit Trail</div>
                                                
                                                <div className="flex items-start gap-2">
                                                    <PlusIcon className="h-3.5 w-3.5 mt-0.5 text-green-500 flex-shrink-0"/>
                                                    <div>
                                                        <p className="text-foreground">
                                                            <span className="font-semibold">{usersById[tx.createdByUserId!] || 'System'}</span> created this.
                                                        </p>
                                                        <p className="text-muted-foreground">{formatAuditDate(tx.createdAt)}</p>
                                                    </div>
                                                </div>
                                            
                                                {tx.lastModifiedAt && (
                                                    <>
                                                        <div className="border-t border-border my-2"></div>
                                                        <div className="flex items-start gap-2">
                                                            <PencilIcon className="h-3.5 w-3.5 mt-0.5 text-yellow-500 flex-shrink-0"/>
                                                            <div>
                                                                <p className="text-foreground">
                                                                    <span className="font-semibold">{usersById[tx.lastModifiedByUserId!] || 'System'}</span> made changes.
                                                                </p>
                                                                <p className="text-muted-foreground">{formatAuditDate(tx.lastModifiedAt)}</p>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredTransactions.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">No transactions match the current filters for the selected period.</div>
                )}
            </div>
        </div>
    );
};

export default TransactionLedger;