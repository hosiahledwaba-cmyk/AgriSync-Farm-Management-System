import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { SafetyReport, SafetyStatus } from '../../types';

interface UpdateSafetyReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (reportId: string, status: SafetyStatus, actionsTaken?: string) => void;
    report: SafetyReport;
}

const UpdateSafetyReportModal: React.FC<UpdateSafetyReportModalProps> = ({ isOpen, onClose, onUpdate, report }) => {
    const [status, setStatus] = useState<SafetyStatus>(report.status);
    const [actionsTaken, setActionsTaken] = useState(report.actionsTaken || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (status === SafetyStatus.Resolved && !actionsTaken) {
            alert('Please describe the actions taken to resolve this issue.');
            return;
        }
        onUpdate(report.id, status, actionsTaken);
        onClose();
    };

    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Update Report: ${report.type}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-muted rounded-md border border-border">
                    <p><strong>Location:</strong> {report.location}</p>
                    <p><strong>Description:</strong> {report.description}</p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Set New Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as SafetyStatus)} className={selectClasses}>
                        {Object.values(SafetyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {status === SafetyStatus.Resolved && (
                    <Input 
                        label="Actions Taken"
                        value={actionsTaken}
                        onChange={e => setActionsTaken(e.target.value)}
                        isTextarea
                        required
                        placeholder="Describe what was done to resolve this issue..."
                    />
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Update Status</Button>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateSafetyReportModal;
