import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { TimeLog } from '../../types';

interface EditTimeLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (timeLogId: string, updates: Partial<TimeLog>, notes: string) => void;
    timeLog: TimeLog;
}

const formatDateTimeForInput = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Adjust for timezone offset to display local time correctly
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
};

const EditTimeLogModal: React.FC<EditTimeLogModalProps> = ({ isOpen, onClose, onSave, timeLog }) => {
    const [clockIn, setClockIn] = useState(formatDateTimeForInput(timeLog.clockIn));
    const [clockOut, setClockOut] = useState(formatDateTimeForInput(timeLog.clockOut));
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!notes) {
            alert('A reason for the edit is required.');
            return;
        }

        const updates: Partial<TimeLog> = {
            clockIn: new Date(clockIn).toISOString(),
            clockOut: clockOut ? new Date(clockOut).toISOString() : null,
        };

        onSave(timeLog.id, updates, notes);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Clock-In/Out Times">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground">You are editing a time log for user ID: {timeLog.userId}. Please provide a reason for the change.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Clock In Time"
                        type="datetime-local"
                        value={clockIn}
                        onChange={e => setClockIn(e.target.value)}
                        required
                    />
                    <Input
                        label="Clock Out Time"
                        type="datetime-local"
                        value={clockOut}
                        onChange={e => setClockOut(e.target.value)}
                    />
                </div>
                <Input
                    label="Reason for Edit"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    isTextarea
                    required
                    placeholder="e.g., Employee forgot to clock out, adjusted to scheduled end time."
                />
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditTimeLogModal;