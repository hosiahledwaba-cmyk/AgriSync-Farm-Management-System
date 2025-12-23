
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Planting, CropHealthSnapshot, HealthScore } from '../../types';
import { CameraIcon } from '../ui/Icon';

interface AddCropHealthSnapshotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddSnapshot: (snapshot: Omit<CropHealthSnapshot, 'id'>) => Promise<unknown>;
    planting: Planting;
    recordedById: number;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const AddCropHealthSnapshotModal: React.FC<AddCropHealthSnapshotModalProps> = ({ isOpen, onClose, onAddSnapshot, planting, recordedById }) => {
    const [score, setScore] = useState<HealthScore>('Good');
    const [notes, setNotes] = useState('');
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAddSnapshot({
            field_id: planting.field_id,
            planting_id: planting.id,
            date: new Date().toISOString().split('T')[0],
            score,
            notes,
            photo,
            recorded_by_id: recordedById,
        });
        onClose();
    };
    
    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                setPhoto(base64);
            } catch (error) {
                console.error("Error converting file to base64", error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";
    const healthScores: HealthScore[] = ['Excellent', 'Good', 'Fair', 'Poor'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Health Snapshot for ${planting.crop_name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="health-score" className="block text-sm font-medium text-foreground mb-1">Health Score</label>
                    <select id="health-score" value={score} onChange={e => setScore(e.target.value as HealthScore)} className={selectClasses}>
                        {healthScores.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                
                <Input label="Notes" value={notes} onChange={e => setNotes(e.target.value)} required isTextarea />

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Attach Photo (optional)</label>
                    <div className="mt-1 flex items-center gap-4">
                         <label htmlFor="photo-upload" className="cursor-pointer bg-card py-2 px-3 border border-input rounded-md shadow-sm text-sm leading-4 font-medium text-foreground hover:bg-accent inline-flex items-center">
                            <CameraIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                            {isUploading ? "Processing..." : (photo ? "Change Photo" : "Upload Photo")}
                        </label>
                        <input id="photo-upload" name="photo-upload" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*" />
                        {photo && (
                            <div className="flex-shrink-0">
                                <img src={photo} alt="Preview" className="h-16 w-16 rounded-md object-cover"/>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Snapshot</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddCropHealthSnapshotModal;
