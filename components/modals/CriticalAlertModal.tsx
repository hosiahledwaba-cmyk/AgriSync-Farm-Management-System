import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { SafetyReport } from '../../types';
import { ShieldAlertIcon } from '../ui/Icon';

interface CriticalAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: SafetyReport;
}

const CriticalAlertModal: React.FC<CriticalAlertModalProps> = ({ isOpen, onClose, report }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div 
                className="bg-card rounded-lg shadow-xl w-full max-w-lg border-4 border-red-500 animate-pulse"
            >
                <div className="flex flex-col items-center text-center p-6">
                    <ShieldAlertIcon className="h-16 w-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">CRITICAL SAFETY ALERT</h2>
                    <p className="text-lg font-semibold text-foreground mt-4">{report.type} at {report.location}</p>
                    <p className="text-muted-foreground mt-2">{report.description}</p>
                    <p className="text-sm text-muted-foreground mt-4">Reported at: {new Date(report.dateTime).toLocaleString()}</p>
                    <Button onClick={onClose} className="mt-6 w-full max-w-xs">
                        Acknowledge & Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CriticalAlertModal;
