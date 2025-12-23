import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { ShiftTemplate } from '../../types';
import { PencilIcon, XIcon, PlusIcon } from '../ui/Icon';

interface ManageShiftTemplatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: ShiftTemplate[];
    onSave: (template: Omit<ShiftTemplate, 'id'>) => void;
    onUpdate: (id: string, updates: Partial<ShiftTemplate>) => void;
    onDelete: (id: string) => void;
}

const TemplateForm: React.FC<{
    template: Omit<ShiftTemplate, 'id'> | ShiftTemplate | null;
    onSave: (template: Omit<ShiftTemplate, 'id'> | Partial<ShiftTemplate>) => void;
    onCancel: () => void;
}> = ({ template, onSave, onCancel }) => {
    const [name, setName] = useState(template?.name || '');
    const [startTime, setStartTime] = useState(template?.startTime || '08:00');
    const [endTime, setEndTime] = useState(template?.endTime || '17:00');
    const [notes, setNotes] = useState(template?.notes || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, startTime, endTime, notes });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted rounded-lg border border-border">
            <Input label="Template Name" value={name} onChange={e => setName(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
                <Input label="Start Time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                <Input label="End Time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            </div>
            <Input label="Default Notes" value={notes} onChange={e => setNotes(e.target.value)} isTextarea />
            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Template</Button>
            </div>
        </form>
    );
};

const ManageShiftTemplatesModal: React.FC<ManageShiftTemplatesModalProps> = ({ isOpen, onClose, templates, onSave, onUpdate, onDelete }) => {
    const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleSaveNew = (templateData: Omit<ShiftTemplate, 'id'>) => {
        onSave(templateData);
        setIsCreating(false);
    };

    const handleUpdate = (templateData: Partial<ShiftTemplate>) => {
        if (editingTemplate) {
            onUpdate(editingTemplate.id, templateData);
            setEditingTemplate(null);
        }
    };
    
    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this template?')) {
            onDelete(id);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Shift Templates">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Existing Templates</h3>
                    {!isCreating && !editingTemplate && (
                        <Button size="sm" icon={<PlusIcon />} onClick={() => setIsCreating(true)}>New Template</Button>
                    )}
                </div>

                {isCreating && <TemplateForm template={null} onSave={handleSaveNew} onCancel={() => setIsCreating(false)} />}
                {editingTemplate && <TemplateForm template={editingTemplate} onSave={handleUpdate} onCancel={() => setEditingTemplate(null)} />}

                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {templates.map(template => (
                        <div key={template.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-md">
                            <div>
                                <p className="font-semibold">{template.name}</p>
                                <p className="text-sm text-muted-foreground">{template.startTime} - {template.endTime}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => { setEditingTemplate(template); setIsCreating(false); }} icon={<PencilIcon />} />
                                <Button variant="secondary" size="sm" onClick={() => handleDelete(template.id)} icon={<XIcon />} className="text-destructive hover:bg-destructive/10" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default ManageShiftTemplatesModal;