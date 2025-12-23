import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { FeedingSchedule, User, Role } from '../../types';

interface EditFeedingScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEditFeedingSchedule: (scheduleId: string, data: Partial<Omit<FeedingSchedule, 'id'>>) => Promise<unknown>;
    schedule: FeedingSchedule;
    users: User[];
}

const EditFeedingScheduleModal: React.FC<EditFeedingScheduleModalProps> = ({ isOpen, onClose, onEditFeedingSchedule, schedule, users }) => {
    const [feedType, setFeedType] = useState(schedule.feedType);
    const [quantity, setQuantity] = useState(String(schedule.quantity));
    const [unit, setUnit] = useState<'kg' | 'bales' | 'scoops'>(schedule.unit);
    const [assigneeId, setAssigneeId] = useState(String(schedule.assigneeId));

    useEffect(() => {
        if (schedule) {
            setFeedType(schedule.feedType);
            setQuantity(String(schedule.quantity));
            setUnit(schedule.unit);
            setAssigneeId(String(schedule.assigneeId));
        }
    }, [schedule]);

    const assignableUsers = users.filter(u => u.role === Role.Manager || u.role === Role.Worker);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedType || !quantity || !assigneeId) return;

        const updateData = {
            feedType,
            quantity: parseFloat(quantity),
            unit,
            assigneeId: parseInt(assigneeId, 10),
        };

        await onEditFeedingSchedule(schedule.id, updateData);
        onClose();
    };

    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Schedule for ${schedule.livestockName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Feed Type" value={feedType} onChange={e => setFeedType(e.target.value)} required placeholder="e.g., Layer Pellets, Hay"/>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required/>
                    <div>
                        <label htmlFor="unit-select" className="block text-sm font-medium text-foreground mb-1">Unit</label>
                        <select id="unit-select" value={unit} onChange={e => setUnit(e.target.value as any)} className={selectClasses}>
                           <option value="kg">kg</option>
                           <option value="bales">bales</option>
                           <option value="scoops">scoops</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="assignee-select" className="block text-sm font-medium text-foreground mb-1">Assign Daily Task To</label>
                    <select id="assignee-select" value={assigneeId} onChange={e => setAssigneeId(e.target.value)} required className={selectClasses}>
                        <option value="" disabled>Select a user</option>
                        {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditFeedingScheduleModal;
