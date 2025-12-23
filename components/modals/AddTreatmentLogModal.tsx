import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Livestock, TreatmentLog, User } from '../../types';

interface AddTreatmentLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddLog: (livestockId: string, log: Omit<TreatmentLog, 'id' | 'administeredById'>) => void;
    livestock: Livestock;
    users: User[];
}

const AddTreatmentLogModal: React.FC<AddTreatmentLogModalProps> = ({ isOpen, onClose, onAddLog, livestock }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [treatmentType, setTreatmentType] = useState<'Vaccination' | 'Deworming' | 'Antibiotic' | 'Injury Care' | 'Check-up'>('Check-up');
    const [description, setDescription] = useState('');
    const [medication, setMedication] = useState('');
    const [withdrawalPeriod, setWithdrawalPeriod] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddLog(livestock.id, {
            date,
            treatmentType,
            description,
            medication,
            withdrawalPeriod,
        });
        onClose();
    };
    
    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Log Treatment for ${livestock.name || livestock.groupName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Treatment Type</label>
                        <select value={treatmentType} onChange={e => setTreatmentType(e.target.value as any)} className={selectClasses}>
                            <option>Check-up</option>
                            <option>Vaccination</option>
                            <option>Deworming</option>
                            <option>Antibiotic</option>
                            <option>Injury Care</option>
                        </select>
                    </div>
                </div>
                <Input label="Description / Notes" value={description} onChange={e => setDescription(e.target.value)} required isTextarea />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Medication (if any)" value={medication} onChange={e => setMedication(e.target.value)} placeholder="e.g., Penicillin, 10ml" />
                    <Input label="Withdrawal Period" value={withdrawalPeriod} onChange={e => setWithdrawalPeriod(e.target.value)} placeholder="e.g., 7 days for milk" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Log</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddTreatmentLogModal;
