import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Livestock, LivestockTrackingType, LivestockStatus } from '../../types';

interface AddLivestockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddLivestock: (livestock: Omit<Livestock, 'id'|'farm_id'|'healthHistory'>) => Promise<unknown>;
}

const AddLivestockModal: React.FC<AddLivestockModalProps> = ({ isOpen, onClose, onAddLivestock }) => {
    const [trackingType, setTrackingType] = useState<LivestockTrackingType>(LivestockTrackingType.Individual);
    const [species, setSpecies] = useState('');
    const [breed, setBreed] = useState('');
    
    // Individual fields
    const [tagId, setTagId] = useState('');
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');

    // Group fields
    const [groupName, setGroupName] = useState('');
    const [count, setCount] = useState('');
    const [acquisitionDate, setAcquisitionDate] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let livestockData: Omit<Livestock, 'id'|'farm_id'|'healthHistory'>;

        if (trackingType === LivestockTrackingType.Individual) {
            livestockData = {
                trackingType,
                species,
                breed,
                tagId,
                name,
                birthDate,
                status: LivestockStatus.Active
            };
        } else {
            livestockData = {
                trackingType,
                species,
                breed,
                groupName,
                count: parseInt(count, 10),
                acquisitionDate
            };
        }

        await onAddLivestock(livestockData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Livestock">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Tracking Type</label>
                    <div className="flex gap-2">
                        <Button type="button" variant={trackingType === 'Individual' ? 'primary' : 'secondary'} onClick={() => setTrackingType(LivestockTrackingType.Individual)}>Individual</Button>
                        <Button type="button" variant={trackingType === 'Group' ? 'primary' : 'secondary'} onClick={() => setTrackingType(LivestockTrackingType.Group)}>Group</Button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input label="Species" value={species} onChange={e => setSpecies(e.target.value)} required placeholder="e.g., Cow, Chicken"/>
                     <Input label="Breed" value={breed} onChange={e => setBreed(e.target.value)} required placeholder="e.g., Holstein, Leghorn"/>
                </div>

                {trackingType === 'Individual' ? (
                    <div className="space-y-4 pt-4 border-t border-border">
                        <Input label="Tag ID" value={tagId} onChange={e => setTagId(e.target.value)} required />
                        <Input label="Name (optional)" value={name} onChange={e => setName(e.target.value)} />
                        <Input label="Birth Date" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required/>
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
                    <Button type="submit">Save Livestock</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddLivestockModal;