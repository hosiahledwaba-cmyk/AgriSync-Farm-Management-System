import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { LivestockHealthEvent, LivestockHealthEventType } from '../../types';

interface AddHealthEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddHealthEvent: (livestockId: string, event: LivestockHealthEvent) => Promise<unknown>;
    livestockId: string;
}

const AddHealthEventModal: React.FC<AddHealthEventModalProps> = ({ isOpen, onClose, onAddHealthEvent, livestockId }) => {
    const [eventType, setEventType] = useState<LivestockHealthEventType>(LivestockHealthEventType.Checkup);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventType || !date) return;
        
        await onAddHealthEvent(livestockId, { eventType, date, notes });
        onClose();
    };

    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Health Event">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="event-type-select" className="block text-sm font-medium text-foreground mb-1">Event Type</label>
                        <select
                            id="event-type-select"
                            value={eventType}
                            onChange={e => setEventType(e.target.value as LivestockHealthEventType)}
                            className={selectClasses}
                        >
                            {Object.values(LivestockHealthEventType).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                
                <Input label="Notes" value={notes} onChange={e => setNotes(e.target.value)} isTextarea required />
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Event</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddHealthEventModal;
