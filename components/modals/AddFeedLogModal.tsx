import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Livestock, FeedLog } from '../../types';

interface AddFeedLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddLog: (livestockId: string, log: FeedLog) => void;
    livestock: Livestock;
}

const AddFeedLogModal: React.FC<AddFeedLogModalProps> = ({ isOpen, onClose, onAddLog, livestock }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [feedType, setFeedType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState<'kg' | 'bales' | 'scoops'>('kg');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddLog(livestock.id, {
            date,
            feedType,
            quantity: parseFloat(quantity),
            unit,
        });
        onClose();
    };
    
    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Log Feed for ${livestock.name || livestock.groupName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <Input label="Feed Type" value={feedType} onChange={e => setFeedType(e.target.value)} required placeholder="e.g., Hay & Grain Mix" />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Quantity" type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                    <div>
                         <label className="block text-sm font-medium text-foreground mb-1">Unit</label>
                        <select value={unit} onChange={e => setUnit(e.target.value as any)} className={selectClasses}>
                            <option value="kg">kg</option>
                            <option value="bales">bales</option>
                            <option value="scoops">scoops</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Log</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddFeedLogModal;
