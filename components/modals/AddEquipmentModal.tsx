
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Equipment, EquipmentStatus } from '../../types';

interface AddEquipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddEquipment: ({ equipmentData, purchasePrice }: { equipmentData: Omit<Equipment, 'id'>, purchasePrice: number }) => Promise<unknown>;
}

const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({ isOpen, onClose, onAddEquipment }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'Tractor' | 'Combine' | 'Planter' | 'Sprayer' | 'Truck'>('Tractor');
    const [status, setStatus] = useState<EquipmentStatus>(EquipmentStatus.Operational);
    const [totalHours, setTotalHours] = useState('');
    const [nextMaintenanceHours, setNextMaintenanceHours] = useState('');
    const [fuelLevel, setFuelLevel] = useState('100');
    const [purchasePrice, setPurchasePrice] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const equipmentData = {
            name,
            type,
            status,
            totalHours: parseInt(totalHours, 10),
            nextMaintenanceHours: parseInt(nextMaintenanceHours, 10),
            fuelLevel: parseInt(fuelLevel, 10)
        };
        await onAddEquipment({
            equipmentData,
            purchasePrice: parseFloat(purchasePrice) || 0
        });
        onClose();
    };
    
    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Equipment">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Equipment Name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., John Deere 8R"/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className={selectClasses}>
                            <option value="Tractor">Tractor</option>
                            <option value="Combine">Combine</option>
                            <option value="Planter">Planter</option>
                            <option value="Sprayer">Sprayer</option>
                            <option value="Truck">Truck</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Initial Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as any)} className={selectClasses}>
                           {Object.values(EquipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Total Hours" type="number" value={totalHours} onChange={e => setTotalHours(e.target.value)} required />
                    <Input label="Next Service (at hours)" type="number" value={nextMaintenanceHours} onChange={e => setNextMaintenanceHours(e.target.value)} required />
                </div>
                <div>
                    <Input 
                        label="Purchase Price (R)" 
                        type="number" 
                        step="0.01" 
                        value={purchasePrice} 
                        onChange={e => setPurchasePrice(e.target.value)} 
                        placeholder="Optional, for financial tracking" 
                    />
                    <p className="text-xs text-muted-foreground pt-1">Creates an 'Asset Purchase' expense automatically if a price is entered.</p>
                </div>
                <div>
                     <label className="block text-sm font-medium text-foreground mb-1">Fuel Level ({fuelLevel}%)</label>
                     <input type="range" min="0" max="100" value={fuelLevel} onChange={e => setFuelLevel(e.target.value)} className="w-full" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Equipment</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddEquipmentModal;
