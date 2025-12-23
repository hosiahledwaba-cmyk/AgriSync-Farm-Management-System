import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { TransactionCategory } from '../../types';
import { PlusIcon, XIcon } from '../ui/Icon';
import { formatCurrency } from '../../utils/currency';

interface JournalLeg {
    id: number;
    account: TransactionCategory | '';
    debit: string;
    credit: string;
}

interface CreateJournalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddJournal: (description: string, date: string, legs: { account: TransactionCategory, debit: number, credit: number }[]) => Promise<void>;
}

const CreateJournalModal: React.FC<CreateJournalModalProps> = ({ isOpen, onClose, onAddJournal }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [legs, setLegs] = useState<JournalLeg[]>([
        { id: 1, account: '', debit: '', credit: '' },
        { id: 2, account: '', debit: '', credit: '' },
    ]);

    const handleAddLeg = () => {
        setLegs([...legs, { id: Date.now(), account: '', debit: '', credit: '' }]);
    };

    const handleRemoveLeg = (id: number) => {
        if (legs.length > 2) {
            setLegs(legs.filter(leg => leg.id !== id));
        }
    };

    const handleLegChange = (id: number, field: keyof JournalLeg, value: string) => {
        setLegs(legs.map(leg => {
            if (leg.id === id) {
                const newLeg = { ...leg, [field]: value };
                if (field === 'debit' && value) newLeg.credit = '';
                if (field === 'credit' && value) newLeg.debit = '';
                return newLeg;
            }
            return leg;
        }));
    };

    const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
        const totalDebit = legs.reduce((sum, leg) => sum + (parseFloat(leg.debit) || 0), 0);
        const totalCredit = legs.reduce((sum, leg) => sum + (parseFloat(leg.credit) || 0), 0);
        const isBalanced = totalDebit > 0 && totalCredit > 0 && totalDebit === totalCredit;
        return { totalDebit, totalCredit, isBalanced };
    }, [legs]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isBalanced || !description) return;

        const journalLegs = legs
            .filter(leg => leg.account && (leg.debit || leg.credit))
            .map(leg => ({
                account: leg.account as TransactionCategory,
                debit: parseFloat(leg.debit) || 0,
                credit: parseFloat(leg.credit) || 0,
            }));

        await onAddJournal(description, date, journalLegs);
        onClose();
    };

    const selectClasses = "w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";
    
    // Only balance sheet & key expense accounts are typically used in manual journals.
    const availableAccounts = [
        TransactionCategory.Cash,
        TransactionCategory.AccountsPayable,
        TransactionCategory.OwnersEquity,
        TransactionCategory.AssetPurchase,
        TransactionCategory.Repairs,
        TransactionCategory.Other,
        TransactionCategory.OtherIncome,
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Manual Journal Entry">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} required placeholder="e.g., Record asset depreciation" />
                    <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>

                <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                        <div className="col-span-5">Account</div>
                        <div className="col-span-3 text-right">Debit</div>
                        <div className="col-span-3 text-right">Credit</div>
                        <div className="col-span-1"></div>
                    </div>
                    {/* Legs */}
                    {legs.map((leg) => (
                        <div key={leg.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5">
                                <select 
                                    value={leg.account} 
                                    onChange={(e) => handleLegChange(leg.id, 'account', e.target.value)}
                                    className={selectClasses}
                                    required
                                >
                                    <option value="" disabled>Select account...</option>
                                    {availableAccounts.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-3">
                                <Input 
                                    label="" 
                                    type="number" 
                                    step="0.01" 
                                    value={leg.debit} 
                                    onChange={(e) => handleLegChange(leg.id, 'debit', e.target.value)} 
                                    className="text-right"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="col-span-3">
                                 <Input 
                                    label="" 
                                    type="number" 
                                    step="0.01" 
                                    value={leg.credit} 
                                    onChange={(e) => handleLegChange(leg.id, 'credit', e.target.value)} 
                                    className="text-right"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="col-span-1 text-center">
                                {legs.length > 2 && (
                                    <button type="button" onClick={() => handleRemoveLeg(leg.id)} className="p-1 text-muted-foreground hover:text-destructive">
                                        <XIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                <Button type="button" variant="secondary" size="sm" icon={<PlusIcon />} onClick={handleAddLeg}>
                    Add Line
                </Button>

                <div className="border-t border-border pt-4 mt-4">
                    <div className="grid grid-cols-12 gap-2 items-center font-bold">
                        <div className="col-span-5 text-right">Totals</div>
                        <div className={`col-span-3 text-right p-2 rounded-md ${!isBalanced && totalDebit !== totalCredit ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-muted text-foreground'}`}>
                            {formatCurrency(totalDebit)}
                        </div>
                        <div className={`col-span-3 text-right p-2 rounded-md ${!isBalanced && totalDebit !== totalCredit ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-muted text-foreground'}`}>
                            {formatCurrency(totalCredit)}
                        </div>
                        <div className="col-span-1"></div>
                    </div>
                    {!isBalanced && totalDebit !== totalCredit && (
                         <p className="text-right text-sm text-red-700 dark:text-red-400 mt-2">Debits must equal credits.</p>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={!isBalanced}>Save Journal</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateJournalModal;