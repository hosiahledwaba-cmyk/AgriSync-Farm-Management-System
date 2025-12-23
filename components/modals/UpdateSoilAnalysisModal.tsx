import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { SoilAnalysis, Field } from '../../types';

interface UpdateSoilAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (fieldId: number, analysis: SoilAnalysis) => void;
    field: Field;
}

const nutrientLevels = ['Optimal', 'Slightly Low', 'Low', 'High'];

const UpdateSoilAnalysisModal: React.FC<UpdateSoilAnalysisModalProps> = ({ isOpen, onClose, onSave, field }) => {
    const latestAnalysis = useMemo(() => {
        if (field.soilHistory && field.soilHistory.length > 0) {
            // The history is sorted newest first in the API
            return field.soilHistory[0];
        }
        return null;
    }, [field.soilHistory]);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [ph, setPh] = useState('7.0');
    const [nitrogen, setNitrogen] = useState<'Optimal' | 'Slightly Low' | 'Low' | 'High'>('Optimal');
    const [phosphorus, setPhosphorus] = useState<'Optimal' | 'Slightly Low' | 'Low' | 'High'>('Optimal');
    const [potassium, setPotassium] = useState<'Optimal' | 'Slightly Low' | 'Low' | 'High'>('Optimal');
    
    useEffect(() => {
        if (isOpen) {
            // Always reset to today's date for a new entry
            setDate(new Date().toISOString().split('T')[0]);
            
            // Pre-fill with the latest known values for convenience
            if (latestAnalysis) {
                setPh(String(latestAnalysis.ph));
                setNitrogen(latestAnalysis.nitrogen);
                setPhosphorus(latestAnalysis.phosphorus);
                setPotassium(latestAnalysis.potassium);
            } else {
                // Or reset to defaults if no history exists
                setPh('7.0');
                setNitrogen('Optimal');
                setPhosphorus('Optimal');
                setPotassium('Optimal');
            }
        }
    }, [isOpen, latestAnalysis]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(field.id, {
            date,
            ph: parseFloat(ph),
            nitrogen,
            phosphorus,
            potassium,
        });
        onClose();
    };

    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Update Soil Analysis for ${field.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Analysis Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    <Input label="pH Level" type="number" step="0.1" value={ph} onChange={e => setPh(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Nitrogen (N)</label>
                        <select value={nitrogen} onChange={e => setNitrogen(e.target.value as any)} className={selectClasses}>
                            {nutrientLevels.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Phosphorus (P)</label>
                        <select value={phosphorus} onChange={e => setPhosphorus(e.target.value as any)} className={selectClasses}>
                            {nutrientLevels.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Potassium (K)</label>
                        <select value={potassium} onChange={e => setPotassium(e.target.value as any)} className={selectClasses}>
                            {nutrientLevels.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Analysis</Button>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateSoilAnalysisModal;