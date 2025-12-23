import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Task, User, Role } from '../../types';
import { useTaskExchangeData } from '../../hooks/useTaskExchangeData';
import { InfoIcon } from '../ui/Icon';

interface TaskExchangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRequestExchange: (task: Task, newAssigneeId: number, type: 'handover' | 'assist_request') => void;
    task: Task;
    users: User[];
    currentUser: User;
    taskExchangeData: ReturnType<typeof useTaskExchangeData>;
}

const TaskExchangeModal: React.FC<TaskExchangeModalProps> = ({ isOpen, onClose, onRequestExchange, task, users, currentUser, taskExchangeData }) => {
    const [exchangeType, setExchangeType] = useState<'handover' | 'assist_request'>('handover');
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    
    const { getTodaysExchangesCount, getThisWeeksExchangesCount } = taskExchangeData;

    const dailyExchanges = getTodaysExchangesCount(currentUser.id);
    const weeklyExchanges = getThisWeeksExchangesCount(currentUser.id);

    const canExchangeDaily = dailyExchanges < 1;
    const canExchangeWeekly = weeklyExchanges < 2;
    const canExchange = canExchangeDaily && canExchangeWeekly;

    const otherWorkers = useMemo(() => {
        const existingAssigneeIds = new Set([task.assigneeId, ...(task.secondaryAssigneeIds || [])]);
        return users.filter(u => u.role === Role.Worker && !existingAssigneeIds.has(u.id));
    }, [users, task]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (canExchange && selectedUserId) {
            onRequestExchange(task, parseInt(selectedUserId, 10), exchangeType);
        }
    };
    
    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Exchange Task: ${task.title}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className={`p-3 rounded-md border flex items-start gap-3 ${!canExchange ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                    <InfoIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${!canExchange ? 'text-red-600' : 'text-blue-600'}`} />
                    <div>
                        <h4 className="font-semibold">Exchange Limits</h4>
                        <p className={`text-sm ${canExchangeDaily ? 'text-muted-foreground' : 'text-red-700 dark:text-red-300 font-bold'}`}>Today: {dailyExchanges} / 1 used</p>
                        <p className={`text-sm ${canExchangeWeekly ? 'text-muted-foreground' : 'text-red-700 dark:text-red-300 font-bold'}`}>This Week: {weeklyExchanges} / 2 used</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Exchange Type</label>
                    <div className="flex gap-2">
                        <Button type="button" variant={exchangeType === 'handover' ? 'primary' : 'secondary'} onClick={() => setExchangeType('handover')}>Handover</Button>
                        <Button type="button" variant={exchangeType === 'assist_request' ? 'primary' : 'secondary'} onClick={() => setExchangeType('assist_request')}>Request Assistance</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {exchangeType === 'handover' 
                            ? "Completely reassign this task to another worker."
                            : "Add another worker to help with this task. You remain the primary assignee."
                        }
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                        {exchangeType === 'handover' ? 'Send Handover Request to' : 'Send Assistance Request to'}
                    </label>
                    <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required className={selectClasses}>
                        <option value="" disabled>Select a worker...</option>
                        {otherWorkers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={!canExchange || !selectedUserId}>
                        Send Request
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskExchangeModal;