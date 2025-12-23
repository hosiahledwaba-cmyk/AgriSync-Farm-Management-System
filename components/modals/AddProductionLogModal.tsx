import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Livestock, ProductionLog } from '../../types';

interface AddProductionLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddLog: (livestockId: string, log: ProductionLog) => void;
    livestock: Livestock;
}

const AddProductionLogModal: React.FC<AddProductionLogModalProps> = ({ isOpen, onClose, onAddLog, livestock }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'Milk' | 'Eggs' | 'Wool'>('Milk');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState<'liters' | 'units' | 'kg'>('liters');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddLog(livestock.id, {
            date,
            type,
            quantity: parseFloat(quantity),
            unit,
        });
        onClose();
    };
    
    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Log Production for ${livestock.name || livestock.groupName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className={selectClasses}>
                            <option value="Milk">Milk</option>
                            <option value="Eggs">Eggs</option>
                            <option value="Wool">Wool</option>
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <Input label="Quantity" type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                    </div>
                    <div className="md:col-span-1">
                         <label className="block text-sm font-medium text-foreground mb-1">Unit</label>
                        <select value={unit} onChange={e => setUnit(e.target.value as any)} className={selectClasses}>
                            <option value="liters">liters</option>
                            <option value="units">units</option>
                            <option value="kg">kg</option>
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

export default AddProductionLogModal;
