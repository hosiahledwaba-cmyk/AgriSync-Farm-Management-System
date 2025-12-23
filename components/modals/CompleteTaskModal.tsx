import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Task } from '../../types';
import { CameraIcon } from '../ui/Icon';

interface CompleteTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCompleteTask: (taskId: string, notes: string | undefined, photo: string) => Promise<unknown>;
    task: Task;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({ isOpen, onClose, onCompleteTask, task }) => {
    const [notes, setNotes] = useState('');
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const [isUploading, setIsUploading] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!photo) return;
        await onCompleteTask(task.id, notes, photo);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Complete Task: ${task.title}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Completion Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} isTextarea />

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                        Proof of Completion <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex items-center gap-4">
                         <label htmlFor="photo-upload" className="cursor-pointer bg-card py-2 px-3 border border-input rounded-md shadow-sm text-sm leading-4 font-medium text-foreground hover:bg-accent inline-flex items-center">
                            <CameraIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                            {isUploading ? "Processing..." : (photo ? "Change Photo" : "Upload Photo")}
                        </label>
                        <input id="photo-upload" name="photo-upload" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*" required />
                        {photo && (
                            <div className="flex-shrink-0">
                                <img src={photo} alt="Preview" className="h-16 w-16 rounded-md object-cover"/>
                            </div>
                        )}
                    </div>
                     <p className="text-xs text-muted-foreground mt-2">A photo is required to complete the task.</p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={!photo || isUploading}>
                        Confirm Completion
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CompleteTaskModal;