

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { FinanceTransaction, TransactionType, TransactionCategory, Field, Livestock, Equipment } from '../../types';

interface EditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEditTransaction: (transactionId: string, transaction: Omit<FinanceTransaction, 'id'>) => Promise<unknown>;
    transaction: FinanceTransaction;
    fields: Field[];
    livestock: Livestock[];
    equipment: Equipment[];
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, onEditTransaction, transaction, fields, livestock, equipment }) => {
    const [type, setType] = useState<TransactionType>(transaction.type);
    const [description, setDescription] = useState(transaction.description);
    const [amount, setAmount] = useState(String(transaction.amount));
    const [category, setCategory] = useState<TransactionCategory>(transaction.category);
    const [date, setDate] = useState(transaction.date.split('T')[0]);
    const [relatedEntityType, setRelatedEntityType] = useState<'field' | 'livestock' | 'sale' | 'equipment' | 'none'>(transaction.relatedEntityType || 'none');
    const [relatedEntityId, setRelatedEntityId] = useState<string>(String(transaction.relatedEntityId || ''));
    
    useEffect(() => {
        if (transaction) {
            setType(transaction.type);
            setDescription(transaction.description);
            setAmount(String(transaction.amount));
            setCategory(transaction.category);
            setDate(transaction.date.split('T')[0]);
            setRelatedEntityType(transaction.relatedEntityType || 'none');
            setRelatedEntityId(String(transaction.relatedEntityId || ''));
        }
    }, [transaction]);

    const getLivestockName = (l: Livestock) => {
        return l.trackingType === 'Individual' ? `${l.species}: ${l.name || 'Tag ' + l.tagId}` : `${l.species}: ${l.groupName}`;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !date) return;
        
        let selectedEntityName: string | undefined;
        if (relatedEntityType === 'field') {
            const selectedField = fields.find(f => f.id === parseInt(relatedEntityId, 10));
            selectedEntityName = selectedField?.name;
        } else if (relatedEntityType === 'livestock') {
            const selectedLivestock = livestock.find(l => l.id === relatedEntityId);
            selectedEntityName = selectedLivestock ? getLivestockName(selectedLivestock) : undefined;
        } else if (relatedEntityType === 'equipment') {
            const selectedEquipment = equipment.find(e => e.id === relatedEntityId);
            selectedEntityName = selectedEquipment?.name;
        }


        await onEditTransaction(transaction.id, {
            type,
            description,
            amount: parseFloat(amount),
            category,
            date,
            relatedEntityType: relatedEntityType === 'none' ? undefined : relatedEntityType,
            relatedEntityId: relatedEntityType !== 'none' && relatedEntityId ? (relatedEntityType === 'field' ? parseInt(relatedEntityId, 10) : relatedEntityId) : undefined,
            relatedEntityName: selectedEntityName,
        });
        onClose();
    };

    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Transaction">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                    <div className="flex gap-2">
                        <Button type="button" variant={type === TransactionType.Income ? 'primary' : 'secondary'} onClick={() => setType(TransactionType.Income)}>Income</Button>
                        <Button type="button" variant={type === TransactionType.Expense ? 'primary' : 'secondary'} onClick={() => setType(TransactionType.Expense)}>Expense</Button>
                    </div>
                </div>

                <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} required />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Amount (R)" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
                    <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="category-select" className="block text-sm font-medium text-foreground mb-1">Category</label>
                        <select
                            id="category-select"
                            value={category}
                            onChange={e => setCategory(e.target.value as TransactionCategory)}
                            className={selectClasses}
                        >
                            {Object.values(TransactionCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="related-entity-type-select" className="block text-sm font-medium text-foreground mb-1">Link to (optional)</label>
                        <select id="related-entity-type-select" value={relatedEntityType} onChange={e => {setRelatedEntityType(e.target.value as any); setRelatedEntityId('');}} className={selectClasses} disabled={relatedEntityType === 'sale'}>
                            <option value="none">None</option>
                            <option value="field">Field</option>
                            <option value="livestock">Livestock</option>
                            <option value="equipment">Equipment</option>
                            {transaction.relatedEntityType === 'sale' && <option value="sale">Sale</option>}
                        </select>
                    </div>
                </div>
                {relatedEntityType === 'field' && (
                     <div>
                        <label htmlFor="field-select" className="block text-sm font-medium text-foreground mb-1">Select Field</label>
                        <select id="field-select" value={relatedEntityId} onChange={e => setRelatedEntityId(e.target.value)} className={selectClasses}>
                            <option value="">None</option>
                            {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                )}
                {relatedEntityType === 'livestock' && (
                     <div>
                        <label htmlFor="livestock-select" className="block text-sm font-medium text-foreground mb-1">Select Livestock</label>
                        <select id="livestock-select" value={relatedEntityId} onChange={e => setRelatedEntityId(e.target.value)} className={selectClasses}>
                            <option value="">None</option>
                            {livestock.map(l => <option key={l.id} value={l.id}>{getLivestockName(l)}</option>)}
                        </select>
                    </div>
                )}
                {relatedEntityType === 'equipment' && (
                     <div>
                        <label htmlFor="equipment-select" className="block text-sm font-medium text-foreground mb-1">Select Equipment</label>
                        <select id="equipment-select" value={relatedEntityId} onChange={e => setRelatedEntityId(e.target.value)} className={selectClasses}>
                            <option value="">None</option>
                            {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                )}
                 {relatedEntityType === 'sale' && (
                    <Input label="Linked Sale ID" id="sale-id" value={relatedEntityId} disabled />
                )}
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditTransactionModal;