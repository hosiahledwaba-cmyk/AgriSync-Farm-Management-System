import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Livestock, LivestockTrackingType, LivestockStatus } from '../../types';

interface EditLivestockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEditLivestock: (livestockId: string, data: Partial<Omit<Livestock, 'id'>>) => Promise<unknown>;
    livestock: Livestock;
}

const EditLivestockModal: React.FC<EditLivestockModalProps> = ({ isOpen, onClose, onEditLivestock, livestock }) => {
    const isIndividual = livestock.trackingType === LivestockTrackingType.Individual;

    const [species, setSpecies] = useState(livestock.species);
    const [breed, setBreed] = useState(livestock.breed || '');
    
    // Individual fields
    const [tagId, setTagId] = useState(livestock.tagId || '');
    const [name, setName] = useState(livestock.name || '');
    const [birthDate, setBirthDate] = useState(livestock.birthDate || '');
    const [status, setStatus] = useState(livestock.status || LivestockStatus.Active);

    // Group fields
    const [groupName, setGroupName] = useState(livestock.groupName || '');
    const [count, setCount] = useState(String(livestock.count || ''));
    const [acquisitionDate, setAcquisitionDate] = useState(livestock.acquisitionDate || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let updateData: Partial<Omit<Livestock, 'id'>>;

        if (isIndividual) {
            updateData = { species, breed, tagId, name, birthDate, status };
        } else {
            updateData = { species, breed, groupName, count: parseInt(count, 10), acquisitionDate };
        }

        await onEditLivestock(livestock.id, updateData);
        onClose();
    };
    
    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${livestock.name || livestock.groupName || 'Livestock'}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input label="Species" value={species} onChange={e => setSpecies(e.target.value)} required placeholder="e.g., Cow, Chicken"/>
                     <Input label="Breed" value={breed} onChange={e => setBreed(e.target.value)} required placeholder="e.g., Holstein, Leghorn"/>
                </div>

                {isIndividual ? (
                    <div className="space-y-4 pt-4 border-t border-border">
                        <Input label="Tag ID" value={tagId} onChange={e => setTagId(e.target.value)} required />
                        <Input label="Name (optional)" value={name} onChange={e => setName(e.target.value)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Birth Date" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required/>
                             <div>
                                <label htmlFor="status-select" className="block text-sm font-medium text-foreground mb-1">Status</label>
                                <select id="status-select" value={status} onChange={e => setStatus(e.target.value as LivestockStatus)} className={selectClasses}>
                                    {Object.values(LivestockStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 pt-4 border-t border-border">
                        <Input label="Group Name" value={groupName} onChange={e => setGroupName(e.target.value)} required placeholder="e.g., Coop A"/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Count" type="number" value={count} onChange={e => setCount(e.target.value)} required />
                            <Input label="Acquisition Date" type="date" value={acquisitionDate} onChange={e => setAcquisitionDate(e.target.value)} required />
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditLivestockModal;
