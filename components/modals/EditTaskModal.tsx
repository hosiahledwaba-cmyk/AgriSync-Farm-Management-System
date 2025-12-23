import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Task, TaskPriority, TaskRecurrence, User, Role, Field, Livestock } from '../../types';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEditTask: (taskId: string, task: Partial<Task>) => Promise<unknown>;
    task: Task;
    users: User[];
    fields: Field[];
    livestock: Livestock[];
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, onEditTask, task, users, fields, livestock }) => {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [assigneeId, setAssigneeId] = useState(String(task.assigneeId));
    
    const initialEntityType = useMemo(() => {
        if (task.relatedFieldId) return 'field';
        if (task.relatedLivestockId) return 'livestock';
        return 'none';
    }, [task]);

    const [relatedEntityType, setRelatedEntityType] = useState<'field' | 'livestock' | 'none'>(initialEntityType);
    const [relatedEntityId, setRelatedEntityId] = useState<string>(String(task.relatedFieldId || task.relatedLivestockId || ''));
    
    const [dueDate, setDueDate] = useState(task.dueDate);
    const [priority, setPriority] = useState<string>(task.priority);
    const [recurrence, setRecurrence] = useState<TaskRecurrence>(task.recurrence);

    const assignableUsers = users.filter(u => u.role === Role.Manager || u.role === Role.Worker);

    const getLivestockName = (l: Livestock) => {
        return l.trackingType === 'Individual' ? `${l.species}: ${l.name || 'Tag ' + l.tagId}` : `${l.species}: ${l.groupName}`;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !assigneeId || !dueDate) return;
        
        const updateData: Partial<Task> = {
            title,
            description,
            assigneeId: parseInt(assigneeId, 10),
            relatedFieldId: relatedEntityType === 'field' && relatedEntityId ? parseInt(relatedEntityId, 10) : undefined,
            relatedLivestockId: relatedEntityType === 'livestock' && relatedEntityId ? relatedEntityId : undefined,
            dueDate,
            priority,
            recurrence,
        };

        await onEditTask(task.id, updateData);
        onClose();
    };
    
    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Task Title" value={title} onChange={e => setTitle(e.target.value)} required />
                <Input label="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} isTextarea />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="assignee-select" className="block text-sm font-medium text-foreground mb-1">Assign To</label>
                        <select id="assignee-select" value={assigneeId} onChange={e => setAssigneeId(e.target.value)} required className={selectClasses}>
                            <option value="" disabled>Select a user</option>
                            {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="related-entity-type-select" className="block text-sm font-medium text-foreground mb-1">Related To (optional)</label>
                        <select id="related-entity-type-select" value={relatedEntityType} onChange={e => {setRelatedEntityType(e.target.value as any); setRelatedEntityId('');}} className={selectClasses}>
                            <option value="none">None</option>
                            <option value="field">Field</option>
                            <option value="livestock">Livestock</option>
                        </select>
                    </div>
                </div>

                {relatedEntityType === 'field' && (
                    <div>
                        <label htmlFor="field-select" className="block text-sm font-medium text-foreground mb-1">Select Field</label>
                        <select id="field-select" value={relatedEntityId} onChange={e => setRelatedEntityId(e.target.value)} className={selectClasses}>
                            <option value="">None</option>
                            {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                )}
                {relatedEntityType === 'livestock' && (
                    <div>
                        <label htmlFor="livestock-select" className="block text-sm font-medium text-foreground mb-1">Select Livestock</label>
                        <select id="livestock-select" value={relatedEntityId} onChange={e => setRelatedEntityId(e.target.value)} className={selectClasses}>
                            <option value="">None</option>
                            {livestock.map(l => <option key={l.id} value={l.id}>{getLivestockName(l)}</option>)}
                        </select>
                    </div>
                )}


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                    <div>
                        <label htmlFor="priority-input" className="block text-sm font-medium text-foreground mb-1">Priority</label>
                         <input
                            id="priority-input"
                            list="priority-list"
                            value={priority}
                            onChange={e => setPriority(e.target.value)}
                            className={selectClasses}
                            placeholder="e.g., High: Check ASAP"
                        />
                        <datalist id="priority-list">
                            {Object.values(TaskPriority).map(p => <option key={p} value={p} />)}
                        </datalist>
                    </div>
                </div>
                
                 <div>
                    <label htmlFor="recurrence-select" className="block text-sm font-medium text-foreground mb-1">Recurrence</label>
                    <select id="recurrence-select" value={recurrence} onChange={e => setRecurrence(e.target.value as TaskRecurrence)} className={selectClasses}>
                        {Object.values(TaskRecurrence).map(r => <option key={r} value={r}>{r}</option>)}
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

export default EditTaskModal;