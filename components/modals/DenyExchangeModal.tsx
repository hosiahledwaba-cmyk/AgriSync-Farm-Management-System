import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { TaskExchangeLog } from '../../types';

interface DenyExchangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    exchangeLog: TaskExchangeLog;
}

const DenyExchangeModal: React.FC<DenyExchangeModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reason.trim()) {
            onSubmit(reason);
            // No need to call onClose, the parent will handle it
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Deny Exchange Request">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-muted-foreground">Please provide a reason for denying this request. The requester will be notified.</p>
                <Input
                    label="Reason for Denial"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    isTextarea
                    required
                    rows={4}
                    placeholder="e.g., I'm too busy with my current tasks."
                />
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={!reason.trim()}>Submit Denial</Button>
                </div>
            </form>
        </Modal>
    );
};

export default DenyExchangeModal;