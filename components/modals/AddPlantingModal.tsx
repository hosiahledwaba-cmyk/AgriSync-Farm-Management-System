import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Planting, Field } from '../../types';

interface AddPlantingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPlanting: (planting: Omit<Planting, 'id' | 'operator_id' | 'status'>, fieldId: number) => Promise<unknown>;
    field: Field;
    activePlantings: Planting[];
}

const AddPlantingModal: React.FC<AddPlantingModalProps> = ({ isOpen, onClose, onAddPlanting, field, activePlantings }) => {
    const [cropName, setCropName] = useState('');
    const [variety, setVariety] = useState('');
    const [datePlanted, setDatePlanted] = useState(new Date().toISOString().split('T')[0]);
    const [seedsQty, setSeedsQty] = useState('');
    const [areaPlanted, setAreaPlanted] = useState('');
    const [wateringSchedule, setWateringSchedule] = useState<'Daily' | 'Weekly' | 'Bi-Weekly' | 'None'>('Weekly');
    const [notes, setNotes] = useState('');

    const usedArea = useMemo(() => activePlantings.reduce((sum, p) => sum + p.area_planted, 0), [activePlantings]);
    const availableArea = field.area - usedArea;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const areaNum = parseFloat(areaPlanted);
        if (areaNum > availableArea) {
            alert(`Area planted (${areaNum} ha) cannot exceed available area (${availableArea.toFixed(2)} ha).`);
            return;
        }
        await onAddPlanting({
            field_id: field.id,
            crop_id: Math.floor(Math.random() * 100), // mock crop_id
            crop_name: cropName,
            variety,
            date_planted: datePlanted,
            seeds_qty: parseFloat(seedsQty),
            area_planted: areaNum,
            watering_schedule: wateringSchedule,
            notes
        }, field.id);
        onClose();
    };
    
    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Log New Planting in ${field.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Crop Name" value={cropName} onChange={e => setCropName(e.target.value)} required />
                <Input label="Variety" value={variety} onChange={e => setVariety(e.target.value)} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Date Planted" type="date" value={datePlanted} onChange={e => setDatePlanted(e.target.value)} required />
                    <Input label="Seeds Quantity (kg)" type="number" value={seedsQty} onChange={e => setSeedsQty(e.target.value)} required />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <Input 
                            label="Area Planted (hectares)" 
                            type="number" 
                            step="0.1"
                            value={areaPlanted} 
                            onChange={e => setAreaPlanted(e.target.value)} 
                            required 
                        />
                        <p className="text-xs text-muted-foreground pt-1">{availableArea.toFixed(2)} ha available</p>
                    </div>
                     <div>
                        <label htmlFor="watering-schedule" className="block text-sm font-medium text-foreground mb-1">Watering Schedule</label>
                        <select id="watering-schedule" value={wateringSchedule} onChange={e => setWateringSchedule(e.target.value as any)} className={selectClasses}>
                            <option value="None">None</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Bi-Weekly">Bi-Weekly</option>
                        </select>
                    </div>
                </div>
                <Input label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} isTextarea />
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Planting</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddPlantingModal;