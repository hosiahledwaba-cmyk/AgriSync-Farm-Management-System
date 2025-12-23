import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { SafetyReport, SafetyReportType, SafetySeverity } from '../../types';
import { CameraIcon } from '../ui/Icon';

interface AddSafetyReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddReport: (reportData: Omit<SafetyReport, 'id' | 'reportedById' | 'status'>) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const AddSafetyReportModal: React.FC<AddSafetyReportModalProps> = ({ isOpen, onClose, onAddReport }) => {
    const [type, setType] = useState<SafetyReportType>(SafetyReportType.Hazard);
    const [location, setLocation] = useState('');
    const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState<SafetySeverity>(SafetySeverity.Medium);
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddReport({
            type,
            location,
            dateTime,
            description,
            severity,
            photo,
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Submit Safety Report">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Report Type</label>
                        <select value={type} onChange={e => setType(e.target.value as SafetyReportType)} className={selectClasses}>
                            {Object.values(SafetyReportType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Severity Level</label>
                        <select value={severity} onChange={e => setSeverity(e.target.value as SafetySeverity)} className={selectClasses}>
                            {Object.values(SafetySeverity).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Location of Incident/Hazard" value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g., Barn 2, North Field" />
                    <Input label="Date & Time" type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} required />
                </div>
                
                <Input label="Detailed Description" value={description} onChange={e => setDescription(e.target.value)} isTextarea required rows={4} placeholder="Describe what happened or what you observed."/>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Attach Photo (optional)</label>
                    <div className="mt-1 flex items-center gap-4">
                         <label htmlFor="safety-photo-upload" className="cursor-pointer bg-card py-2 px-3 border border-input rounded-md shadow-sm text-sm leading-4 font-medium text-foreground hover:bg-accent inline-flex items-center">
                            <CameraIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                            {isUploading ? "Processing..." : (photo ? "Change Photo" : "Upload Photo")}
                        </label>
                        <input id="safety-photo-upload" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*" />
                        {photo && (
                            <div className="flex-shrink-0">
                                <img src={photo} alt="Preview" className="h-16 w-16 rounded-md object-cover"/>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Submit Report</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddSafetyReportModal;
