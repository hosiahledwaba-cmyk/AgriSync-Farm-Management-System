import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { EquipmentUsageLog } from '../../types';

interface EndSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEndSession: (logId: string, endHours: number, notes?: string) => void;
    usageLog: EquipmentUsageLog;
}

const EndSessionModal: React.FC<EndSessionModalProps> = ({ isOpen, onClose, onEndSession, usageLog }) => {
    const [endHours, setEndHours] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const hours = parseFloat(endHours);
        if (isNaN(hours)) {
            setError('Please enter a valid number for operating hours.');
            return;
        }
        if (hours < usageLog.startHours) {
            setError(`End hours cannot be less than the start hours (${usageLog.startHours}).`);
            return;
        }
        onEndSession(usageLog.id, hours, notes);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="End Equipment Session">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground">Enter the final operating hours from the dashboard to complete your session.</p>
                <div className="p-3 bg-muted rounded-md border border-border">
                    <p className="text-sm font-medium text-muted-foreground">Session Start Hours</p>
                    <p className="text-lg font-bold">{usageLog.startHours}</p>
                </div>
                <Input
                    label="Final Operating Hours"
                    type="number"
                    step="0.1"
                    value={endHours}
                    onChange={(e) => {
                        setEndHours(e.target.value);
                        setError('');
                    }}
                    required
                    placeholder={String(usageLog.startHours)}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Input
                    label="Session Notes (optional)"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    isTextarea
                    placeholder="e.g., Noticed a strange noise from the engine."
                />
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">End Session</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EndSessionModal;
