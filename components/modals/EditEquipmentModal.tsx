
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Equipment, EquipmentStatus } from '../../types';

interface EditEquipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEditEquipment: (equipmentId: string, data: Partial<Omit<Equipment, 'id'>>) => Promise<unknown>;
    equipment: Equipment;
}

const EditEquipmentModal: React.FC<EditEquipmentModalProps> = ({ isOpen, onClose, onEditEquipment, equipment }) => {
    const [name, setName] = useState(equipment.name);
    const [type, setType] = useState(equipment.type);
    const [status, setStatus] = useState(equipment.status);
    const [totalHours, setTotalHours] = useState(String(equipment.totalHours));
    const [nextMaintenanceHours, setNextMaintenanceHours] = useState(String(equipment.nextMaintenanceHours));
    const [fuelLevel, setFuelLevel] = useState(String(equipment.fuelLevel));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const updateData = {
            name,
            type,
            status,
            totalHours: parseInt(totalHours, 10),
            nextMaintenanceHours: parseInt(nextMaintenanceHours, 10),
            fuelLevel: parseInt(fuelLevel, 10)
        };
        await onEditEquipment(equipment.id, updateData);
        onClose();
    };
    
    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${equipment.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Equipment Name" value={name} onChange={e => setName(e.target.value)} required />
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
                        <label className="block text-sm font-medium text-foreground mb-1">Status</label>
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
                     <label className="block text-sm font-medium text-foreground mb-1">Fuel Level ({fuelLevel}%)</label>
                     <input type="range" min="0" max="100" value={fuelLevel} onChange={e => setFuelLevel(e.target.value)} className="w-full" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditEquipmentModal;
