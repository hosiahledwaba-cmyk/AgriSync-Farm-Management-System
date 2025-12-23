import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Equipment } from '../../types';

interface StartSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartSession: (equipmentId: string, startHours: number) => void;
    equipment: Equipment;
}

const StartSessionModal: React.FC<StartSessionModalProps> = ({ isOpen, onClose, onStartSession, equipment }) => {
    const [startHours, setStartHours] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const hours = parseFloat(startHours);
        if (isNaN(hours)) {
            setError('Please enter a valid number for operating hours.');
            return;
        }
        if (hours < equipment.totalHours) {
            setError(`Start hours cannot be less than the current total hours (${equipment.totalHours}).`);
            return;
        }
        onStartSession(equipment.id, hours);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Start Session: ${equipment.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground">Enter the current operating hours from the machine's dashboard to begin your session.</p>
                <div className="p-3 bg-muted rounded-md border border-border">
                    <p className="text-sm font-medium text-muted-foreground">Last Recorded Total Hours</p>
                    <p className="text-lg font-bold">{equipment.totalHours}</p>
                </div>
                <Input
                    label="Current Operating Hours"
                    type="number"
                    step="0.1"
                    value={startHours}
                    onChange={(e) => {
                        setStartHours(e.target.value);
                        setError('');
                    }}
                    required
                    placeholder={String(equipment.totalHours)}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Start Session</Button>
                </div>
            </form>
        </Modal>
    );
};

export default StartSessionModal;
