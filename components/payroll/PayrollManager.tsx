import React, { useState, useMemo } from 'react';
import { User, Role } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/currency';
import { UsersIcon } from '../ui/Icon';

interface PayrollManagerProps {
    users: User[];
    onRunPayroll: (totalAmount: number, description: string, date: string) => void;
}

interface PayRunEntry {
    userId: number;
    name: string;
    role: Role;
    payRate: string;
    hours: string;
    grossPay: number;
}

const PayrollManager: React.FC<PayrollManagerProps> = ({ users, onRunPayroll }) => {
    
    const [payPeriodEnd, setPayPeriodEnd] = useState(new Date().toISOString().split('T')[0]);
    
    const initialPayRun: PayRunEntry[] = users.map(u => ({
        userId: u.id,
        name: u.name,
        role: u.role,
        payRate: u.role === Role.Manager ? '450' : '250', // Mock pay rates
        hours: '40',
        grossPay: (u.role === Role.Manager ? 450 : 250) * 40
    }));

    const [payRun, setPayRun] = useState<PayRunEntry[]>(initialPayRun);

    const handleEntryChange = (userId: number, field: 'payRate' | 'hours', value: string) => {
        setPayRun(currentRun => currentRun.map(entry => {
            if (entry.userId === userId) {
                const newEntry = { ...entry, [field]: value };
                const rate = parseFloat(newEntry.payRate) || 0;
                const hours = parseFloat(newEntry.hours) || 0;
                return { ...newEntry, grossPay: rate * hours };
            }
            return entry;
        }));
    };
    
    const totalPayroll = useMemo(() => {
        return payRun.reduce((sum, entry) => sum + entry.grossPay, 0);
    }, [payRun]);

    const handleFinalize = () => {
        if (totalPayroll > 0) {
            const periodEnd = new Date(payPeriodEnd);
            const description = `Payroll for period ending ${periodEnd.toLocaleDateString()}`;
            onRunPayroll(totalPayroll, description, payPeriodEnd);
            alert('Payroll transaction has been created!');
        }
    };

    return (
        <div className="bg-card p-4 md:p-6 rounded-xl shadow-sm border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-1 flex items-center">
                <UsersIcon className="h-6 w-6 mr-3 text-primary"/>
                Manage Payroll
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Calculate gross pay and log labor costs for a pay period.</p>
            
            <div className="mb-6">
                <Input
                    label="Pay Period End Date"
                    type="date"
                    value={payPeriodEnd}
                    onChange={e => setPayPeriodEnd(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            <div className="overflow-x-auto responsive-table">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                            <th className="px-6 py-3">Employee</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Pay Rate (R/hr)</th>
                            <th className="px-6 py-3">Hours Worked</th>
                            <th className="px-6 py-3 text-right">Gross Pay</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payRun.map(entry => (
                            <tr key={entry.userId} className="bg-card border-b border-border hover:bg-accent transition-colors">
                                <td data-label="Employee" className="px-6 py-4 font-medium text-foreground">{entry.name}</td>
                                <td data-label="Role" className="px-6 py-4 text-muted-foreground">{entry.role}</td>
                                <td data-label="Pay Rate" className="px-6 py-4">
                                    <Input label="" type="number" step="0.01" value={entry.payRate} onChange={e => handleEntryChange(entry.userId, 'payRate', e.target.value)} className="w-24 ml-auto md:ml-0"/>
                                </td>
                                <td data-label="Hours" className="px-6 py-4">
                                    <Input label="" type="number" step="0.1" value={entry.hours} onChange={e => handleEntryChange(entry.userId, 'hours', e.target.value)} className="w-24 ml-auto md:ml-0"/>
                                </td>
                                <td data-label="Gross Pay" className="px-6 py-4 text-right font-semibold text-foreground">{formatCurrency(entry.grossPay)}</td>
                            </tr>
                        ))}
                         <tr className="bg-card font-bold text-foreground">
                            <td colSpan={4} data-label="Total" className="px-6 py-4 text-right">Total Payroll</td>
                            <td data-label="Amount" className="px-6 py-4 text-right text-lg">{formatCurrency(totalPayroll)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-end">
                <Button onClick={handleFinalize} disabled={totalPayroll === 0}>
                    Create Labor Expense Transaction
                </Button>
            </div>
        </div>
    );
};

export default PayrollManager;