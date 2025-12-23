import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { User } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface LogWageChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newRate: number) => void;
    employee: User;
}

const LogWageChangeModal: React.FC<LogWageChangeModalProps> = ({ isOpen, onClose, onSave, employee }) => {
    const [newRate, setNewRate] = useState(String(employee.wageRate || ''));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const rate = parseFloat(newRate);
        if (!isNaN(rate)) {
            onSave(rate);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Log Wage Change for ${employee.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-muted rounded-md border border-border">
                    <p className="text-sm font-medium text-muted-foreground">Current Hourly Rate</p>
                    <p className="text-lg font-bold">{formatCurrency(employee.wageRate || 0)}</p>
                </div>
                
                <Input 
                    label="New Hourly Wage Rate (R)" 
                    type="number" 
                    step="0.01" 
                    value={newRate} 
                    onChange={e => setNewRate(e.target.value)} 
                    required 
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Change</Button>
                </div>
            </form>
        </Modal>
    );
};

export default LogWageChangeModal;
