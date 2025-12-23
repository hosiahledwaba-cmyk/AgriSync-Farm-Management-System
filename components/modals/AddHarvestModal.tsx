
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Harvest, Planting } from '../../types';

interface AddHarvestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddHarvest: (harvest: Omit<Harvest, 'id' | 'operator_id'>, fieldId: number, unitCost?: number) => Promise<unknown>;
    fieldId: number;
    activePlantings: Planting[];
}

const AddHarvestModal: React.FC<AddHarvestModalProps> = ({ isOpen, onClose, onAddHarvest, fieldId, activePlantings }) => {
    const [plantingId, setPlantingId] = useState<string>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [weightKg, setWeightKg] = useState('');
    const [moisturePct, setMoisturePct] = useState('');
    const [unitCost, setUnitCost] = useState('');
    const [notes, setNotes] = useState('');

    const selectedPlanting = activePlantings.find(p => p.id === parseInt(plantingId));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlanting) {
            alert('Please select the planting you are harvesting.');
            return;
        }
        await onAddHarvest({
            planting_id: selectedPlanting.id,
            field_id: fieldId,
            crop_id: selectedPlanting.crop_id,
            crop_name: selectedPlanting.crop_name,
            date,
            weight_kg: parseFloat(weightKg),
            moisture_pct: parseFloat(moisturePct),
            notes
        }, fieldId, parseFloat(unitCost) || undefined);
        onClose();
    };

    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record New Harvest">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="planting-select" className="block text-sm font-medium text-foreground mb-1">Harvesting from Planting</label>
                    <select
                        id="planting-select"
                        value={plantingId}
                        onChange={e => setPlantingId(e.target.value)}
                        required
                        className={selectClasses}
                    >
                        <option value="" disabled>Select an active planting...</option>
                        {activePlantings.map(p => (
                            <option key={p.id} value={p.id}>{p.crop_name} ({p.variety}) - Planted {p.date_planted}</option>
                        ))}
                    </select>
                </div>

                <Input label="Harvest Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Weight (kg)" type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} required />
                    <Input label="Moisture (%)" type="number" step="0.1" value={moisturePct} onChange={e => setMoisturePct(e.target.value)} required />
                </div>
                <div>
                    <Input label="Estimated Unit Cost (R per kg)" type="number" step="0.01" value={unitCost} onChange={e => setUnitCost(e.target.value)} placeholder="Optional, for valuation"/>
                    <p className="text-xs text-muted-foreground pt-1">This will value the new inventory lot.</p>
                </div>
                <Input label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} isTextarea />
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={activePlantings.length === 0}>
                        {activePlantings.length === 0 ? 'No Active Plantings' : 'Save Harvest'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddHarvestModal;
