import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { EmployeeAvailability, AvailabilityStatus } from '../../types';

interface SetAvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: string;
    currentAvailability?: EmployeeAvailability;
    onSave: (status: AvailabilityStatus) => void;
    onDelete: (id: string) => void;
}

const SetAvailabilityModal: React.FC<SetAvailabilityModalProps> = ({ isOpen, onClose, date, currentAvailability, onSave, onDelete }) => {
    const formattedDate = new Date(date + 'T00:00:00Z').toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const handleSave = (status: AvailabilityStatus) => {
        onSave(status);
        onClose();
    };
    
    const handleClear = () => {
        if (currentAvailability) {
            onDelete(currentAvailability.id);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Set Availability for ${formattedDate}`}>
            <div className="space-y-4">
                <p className="text-muted-foreground">How would you like to mark this day?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                        onClick={() => handleSave(AvailabilityStatus.Available)}
                        variant={currentAvailability?.status === AvailabilityStatus.Available ? 'primary' : 'secondary'}
                        className="w-full"
                    >
                        Available
                    </Button>
                    <Button
                        onClick={() => handleSave(AvailabilityStatus.Preferred)}
                        variant={currentAvailability?.status === AvailabilityStatus.Preferred ? 'primary' : 'secondary'}
                        className="w-full"
                    >
                        Preferred
                    </Button>
                    <Button
                        onClick={() => handleSave(AvailabilityStatus.Unavailable)}
                        variant={currentAvailability?.status === AvailabilityStatus.Unavailable ? 'primary' : 'secondary'}
                        className="w-full"
                    >
                        Unavailable
                    </Button>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border">
                    {currentAvailability && (
                        <Button variant="secondary" onClick={handleClear} className="text-destructive hover:bg-destructive/10">
                            Clear Availability
                        </Button>
                    )}
                    <div className="flex-grow"></div>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SetAvailabilityModal;
