
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Equipment, MaintenanceLog } from '../../types';

interface AddMaintenanceLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddLog: (equipmentId: string, data: Omit<MaintenanceLog, 'id' | 'equipmentId'> & { putInMaintenance?: boolean }) => void;
    equipment: Equipment;
}

const AddMaintenanceLogModal: React.FC<AddMaintenanceLogModalProps> = ({ isOpen, onClose, onAddLog, equipment }) => {
    const [date] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [mechanic, setMechanic] = useState('');
    const [putInMaintenance, setPutInMaintenance] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAddLog(equipment.id, {
            date,
            description,
            cost: parseFloat(cost) || 0,
            mechanic,
            putInMaintenance
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Log Maintenance for ${equipment.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Service Description" value={description} onChange={e => setDescription(e.target.value)} required isTextarea/>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Cost (R)" type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0.00"/>
                    <Input label="Mechanic / Service By" value={mechanic} onChange={e => setMechanic(e.target.value)} required />
                </div>
                
                 <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="put-in-maintenance"
                        checked={putInMaintenance}
                        onChange={(e) => setPutInMaintenance(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="put-in-maintenance" className="text-sm font-medium text-foreground">
                        Set equipment status to "In Maintenance"
                    </label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Log</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddMaintenanceLogModal;
