import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import { MessageReference, Task, Shift, Equipment, InventoryItem, Field, Livestock } from '../../types';
import Input from '../ui/Input';

type Tab = 'tasks' | 'shifts' | 'equipment' | 'inventory' | 'fields' | 'livestock';

interface ReferenceItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (reference: MessageReference) => void;
    tasks: Task[];
    shifts: Shift[];
    equipment: Equipment[];
    inventory: InventoryItem[];
    fields: Field[];
    livestock: Livestock[];
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-3 py-2 font-semibold text-sm rounded-t-md transition-colors whitespace-nowrap ${active ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-accent-foreground'}`}
    >
        {children}
    </button>
);

const ReferenceItemModal: React.FC<ReferenceItemModalProps> = ({ isOpen, onClose, onSelect, tasks, shifts, equipment, inventory, fields, livestock }) => {
    const [activeTab, setActiveTab] = useState<Tab>('tasks');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        if (!lowerSearch) return { tasks, shifts, equipment, inventory, fields, livestock };
        
        return {
            tasks: tasks.filter(t => t.title.toLowerCase().includes(lowerSearch)),
            shifts: shifts.filter(s => new Date(s.start).toLocaleString().toLowerCase().includes(lowerSearch) || s.notes?.toLowerCase().includes(lowerSearch)),
            equipment: equipment.filter(e => e.name.toLowerCase().includes(lowerSearch)),
            inventory: inventory.filter(i => i.name.toLowerCase().includes(lowerSearch)),
            fields: fields.filter(f => f.name.toLowerCase().includes(lowerSearch)),
            livestock: livestock.filter(l => (l.name || l.groupName || '').toLowerCase().includes(lowerSearch)),
        };
    }, [searchTerm, tasks, shifts, equipment, inventory, fields, livestock]);

    const handleSelect = (ref: MessageReference) => {
        onSelect(ref);
        onClose();
    };
    
    const getLivestockName = (l: Livestock) => l.name || l.groupName || `Tag: ${l.tagId}`;

    const renderList = () => {
        switch(activeTab) {
            case 'tasks':
                return filteredData.tasks.map(t => <ListItem key={t.id} onClick={() => handleSelect({ type: 'task', id: t.id, name: t.title, details: `Due: ${t.dueDate}` })} title={t.title} subtitle={`Priority: ${t.priority}`} />);
            case 'shifts':
                return filteredData.shifts.slice(0, 50).map(s => <ListItem key={s.id} onClick={() => handleSelect({ type: 'shift', id: s.id, name: `Shift on ${new Date(s.start).toLocaleDateString()}` })} title={`Shift on ${new Date(s.start).toLocaleDateString()}`} subtitle={`${new Date(s.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(s.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} />);
            case 'equipment':
                return filteredData.equipment.map(e => <ListItem key={e.id} onClick={() => handleSelect({ type: 'equipment', id: e.id, name: e.name, details: e.status })} title={e.name} subtitle={e.type} />);
            case 'inventory':
                 return filteredData.inventory.map(i => <ListItem key={i.id} onClick={() => handleSelect({ type: 'inventory', id: i.id, name: i.name, details: `${i.stock_qty} ${i.unit}` })} title={i.name} subtitle={i.category} />);
            case 'fields':
                return filteredData.fields.map(f => <ListItem key={f.id} onClick={() => handleSelect({ type: 'field', id: f.id, name: f.name, details: `${f.area} ha` })} title={f.name} subtitle={f.soil_type} />);
            case 'livestock':
                return filteredData.livestock.map(l => <ListItem key={l.id} onClick={() => handleSelect({ type: 'livestock', id: l.id, name: getLivestockName(l), details: l.species })} title={getLivestockName(l)} subtitle={l.breed || l.species} />);
            default: return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reference an Item">
            <div className="space-y-4">
                <div className="border-b border-border -mx-6 px-6">
                    <nav className="-mb-px flex gap-x-4 overflow-x-auto" aria-label="Tabs">
                        <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')}>Tasks</TabButton>
                        <TabButton active={activeTab === 'shifts'} onClick={() => setActiveTab('shifts')}>Shifts</TabButton>
                        <TabButton active={activeTab === 'equipment'} onClick={() => setActiveTab('equipment')}>Equipment</TabButton>
                        <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>Inventory</TabButton>
                        <TabButton active={activeTab === 'fields'} onClick={() => setActiveTab('fields')}>Fields</TabButton>
                        <TabButton active={activeTab === 'livestock'} onClick={() => setActiveTab('livestock')}>Livestock</TabButton>
                    </nav>
                </div>
                <Input label="" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                    {renderList()}
                </div>
            </div>
        </Modal>
    );
};

const ListItem: React.FC<{ title: string; subtitle: string; onClick: () => void; }> = ({ title, subtitle, onClick }) => (
    <div onClick={onClick} className="p-3 rounded-md hover:bg-accent cursor-pointer border border-transparent hover:border-border">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
);

export default ReferenceItemModal;
