import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { FeedingSchedule, Livestock, User, Role, TaskRecurrence } from '../../types';

interface AddFeedingScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddFeedingSchedule: (schedule: Omit<FeedingSchedule, 'id'>) => Promise<unknown>;
    livestock: Livestock[];
    users: User[];
    defaultLivestockId?: string;
}

const AddFeedingScheduleModal: React.FC<AddFeedingScheduleModalProps> = ({ isOpen, onClose, onAddFeedingSchedule, livestock, users, defaultLivestockId }) => {
    const [livestockId, setLivestockId] = useState(defaultLivestockId || '');
    const [feedType, setFeedType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState<'kg' | 'bales' | 'scoops'>('kg');
    const [assigneeId, setAssigneeId] = useState('');

    useEffect(() => {
        setLivestockId(defaultLivestockId || '');
    }, [defaultLivestockId]);

    const assignableUsers = users.filter(u => u.role === Role.Manager || u.role === Role.Worker);

    const getLivestockName = (l: Livestock) => {
        return l.trackingType === 'Individual' ? `${l.species}: ${l.name || 'Tag ' + l.tagId}` : `${l.species}: ${l.groupName}`;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const selectedLivestock = livestock.find(l => l.id === livestockId);
        if (!livestockId || !feedType || !quantity || !assigneeId || !selectedLivestock) return;

        await onAddFeedingSchedule({
            livestockId,
            livestockName: getLivestockName(selectedLivestock)!,
            feedType,
            quantity: parseFloat(quantity),
            unit,
            recurrence: TaskRecurrence.Daily,
            assigneeId: parseInt(assigneeId, 10),
        });
        onClose();
    };

    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Daily Feeding Schedule">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="livestock-select" className="block text-sm font-medium text-foreground mb-1">Livestock / Group</label>
                    <select id="livestock-select" value={livestockId} onChange={e => setLivestockId(e.target.value)} required className={selectClasses} disabled={!!defaultLivestockId}>
                        <option value="" disabled>Select an animal or group</option>
                        {livestock.map(l => <option key={l.id} value={l.id}>{getLivestockName(l)}</option>)}
                    </select>
                </div>

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

                <p className="text-xs text-muted-foreground pt-2">A new, high-priority task will be automatically created for the assignee each morning.</p>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Schedule</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddFeedingScheduleModal;
