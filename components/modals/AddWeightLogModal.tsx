import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Livestock, WeightLog } from '../../types';

interface AddWeightLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddLog: (livestockId: string, log: WeightLog) => void;
    livestock: Livestock;
}

const AddWeightLogModal: React.FC<AddWeightLogModalProps> = ({ isOpen, onClose, onAddLog, livestock }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [weight, setWeight] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddLog(livestock.id, {
            date,
            weight: parseFloat(weight),
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Log Weight for ${livestock.name || livestock.groupName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    <Input label="Weight (kg)" type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} required placeholder="e.g., 650.5" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Log</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddWeightLogModal;
