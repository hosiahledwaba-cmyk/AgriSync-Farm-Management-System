import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Shift, User, Role, ShiftTemplate } from '../../types';

type ShiftToUpsert = Shift | { date: string, userId: number | null };

interface ShiftUpsertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (shift: Omit<Shift, 'id'>) => void;
    onBulkSave: (shifts: Omit<Shift, 'id'>[]) => void;
    onUpdate: (shiftId: string, updates: Partial<Shift>) => void;
    onDelete: (shiftId: string) => void;
    shift: ShiftToUpsert | null;
    users: User[];
    templates: ShiftTemplate[];
    onAddTemplate: (templateData: Omit<ShiftTemplate, 'id'>) => void;
}

const ShiftUpsertModal: React.FC<ShiftUpsertModalProps> = ({ isOpen, onClose, onSave, onBulkSave, onUpdate, onDelete, shift, users, templates, onAddTemplate }) => {
    const isEditing = shift ? 'id' in shift : false;
    
    const [userId, setUserId] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('17:00');
    const [notes, setNotes] = useState('');
    
    // Recurrence state
    const [isRecurring, setIsRecurring] = useState(false);
    const [endDate, setEndDate] = useState('');
    const [selectedDays, setSelectedDays] = useState<number[]>([]); // 0=Sun, 1=Mon...

    // New state for saving as template
    const [saveAsTemplate, setSaveAsTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');

    useEffect(() => {
        if (shift) {
            setIsRecurring(false);
            setSelectedDays([]);
            setSaveAsTemplate(false);
            setTemplateName('');
            if ('id' in shift) { // Editing existing shift
                setUserId(String(shift.userId));
                setDate(new Date(shift.start).toISOString().split('T')[0]);
                setStartTime(new Date(shift.start).toTimeString().slice(0, 5));
                setEndTime(new Date(shift.end).toTimeString().slice(0, 5));
                setNotes(shift.notes || '');
                setEndDate('');
            } else { // Creating new shift
                setUserId(shift.userId ? String(shift.userId) : '');
                setDate(shift.date);
                setStartTime('08:00');
                setEndTime('17:00');
                setNotes('');
                // Set default end date for recurrence
                const defaultEndDate = new Date(shift.date);
                defaultEndDate.setDate(defaultEndDate.getDate() + 28); // Default to 4 weeks
                setEndDate(defaultEndDate.toISOString().split('T')[0]);
            }
        }
    }, [shift]);
    
    const handleDayToggle = (dayIndex: number) => {
        setSelectedDays(prev => 
            prev.includes(dayIndex) 
                ? prev.filter(d => d !== dayIndex)
                : [...prev, dayIndex]
        );
    }
    
    const handleTemplateSelect = (templateId: string) => {
        if (!templateId) return;
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setStartTime(template.startTime);
            setEndTime(template.endTime);
            setNotes(template.notes || '');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (saveAsTemplate && templateName) {
            onAddTemplate({
                name: templateName,
                startTime,
                endTime,
                notes,
            });
        }
        
        if (isRecurring && !isEditing) {
            if (selectedDays.length === 0 || !endDate || !userId) {
                alert("Please select at least one day to repeat, an end date, and an employee for recurring shifts.");
                return;
            }

            const newShifts: Omit<Shift, 'id'>[] = [];
            const startDate = new Date(date + 'T00:00:00Z');
            const recurEndDate = new Date(endDate + 'T23:59:59Z');
            
            let currentDate = new Date(startDate);

            while (currentDate <= recurEndDate) {
                if (selectedDays.includes(currentDate.getUTCDay())) {
                    const shiftDateStr = currentDate.toISOString().split('T')[0];
                    newShifts.push({
                        userId: parseInt(userId),
                        start: new Date(`${shiftDateStr}T${startTime}:00`).toISOString(),
                        end: new Date(`${shiftDateStr}T${endTime}:00`).toISOString(),
                        notes,
                    });
                }
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
            
            if (newShifts.length > 0) {
                onBulkSave(newShifts);
            }

        } else {
            const start = new Date(`${date}T${startTime}:00`).toISOString();
            const end = new Date(`${date}T${endTime}:00`).toISOString();

            if (isEditing && shift && 'id' in shift) {
                onUpdate(shift.id, { userId: parseInt(userId), start, end, notes });
            } else {
                onSave({ userId: parseInt(userId), start, end, notes });
            }
        }

        onClose();
    };
    
    const handleDelete = () => {
        if (isEditing && shift && 'id' in shift && confirm('Are you sure you want to delete this shift?')) {
            onDelete(shift.id);
            onClose();
        }
    }
    
    const assignableUsers = users.filter(u => u.role !== Role.Owner);
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Shift" : "Create Shift(s)"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Employee</label>
                        <select value={userId} onChange={e => setUserId(e.target.value)} required className={`${selectClasses} disabled:bg-muted/50`}>
                            <option value="" disabled>Select employee...</option>
                            {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Apply Template</label>
                        <select onChange={(e) => handleTemplateSelect(e.target.value)} className={selectClasses} value="">
                            <option value="">Select a template...</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
                
                <Input label={isRecurring ? "Start Date" : "Date"} type="date" value={date} onChange={e => setDate(e.target.value)} required />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Start Time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                    <Input label="End Time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                </div>
                
                <Input label="Notes / Assignment" value={notes} onChange={e => setNotes(e.target.value)} isTextarea placeholder="e.g., Morning milking duty" />

                {!isEditing && (
                    <div className="pt-4 border-t border-border space-y-4">
                        <div className="flex items-center">
                            <input
                                id="is-recurring"
                                type="checkbox"
                                checked={isRecurring}
                                onChange={e => setIsRecurring(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="is-recurring" className="ml-2 block text-sm font-medium text-foreground">
                                Make this a recurring shift
                            </label>
                        </div>

                        {isRecurring && (
                            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Repeat on these days</label>
                                    <div className="flex flex-wrap gap-1">
                                        {daysOfWeek.map((day, index) => (
                                            <button
                                                type="button"
                                                key={index}
                                                onClick={() => handleDayToggle(index)}
                                                className={`h-9 w-9 font-bold rounded-full text-sm transition-colors ${selectedDays.includes(index) ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Input label="Repeat until" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required={isRecurring} />
                            </div>
                        )}
                    </div>
                )}

                <div className="pt-4 border-t border-border space-y-4">
                    <div className="flex items-center">
                        <input
                            id="save-as-template"
                            type="checkbox"
                            checked={saveAsTemplate}
                            onChange={e => setSaveAsTemplate(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="save-as-template" className="ml-2 block text-sm font-medium text-foreground">
                            Save this shift as a new template
                        </label>
                    </div>
                    {saveAsTemplate && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                             <Input 
                                label="New Template Name"
                                value={templateName}
                                onChange={e => setTemplateName(e.target.value)}
                                required={saveAsTemplate}
                                placeholder="e.g., Evening Milking"
                            />
                        </div>
                    )}
                </div>


                <div className="flex justify-between items-center pt-4">
                    <div>
                        {isEditing && (
                            <Button type="button" variant="secondary" onClick={handleDelete} className="bg-red-600/10 text-red-600 hover:bg-red-600/20 border-red-600/30">Delete</Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">{isEditing ? "Save Changes" : isRecurring ? "Create Shifts" : "Create Shift"}</Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default ShiftUpsertModal;