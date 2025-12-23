import React from 'react';
import Modal from '../ui/Modal';
import { Notification, Task, User, TaskExchangeLog } from '../../types';
import Button from '../ui/Button';

interface NotificationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    notification: Notification & { task?: Task, exchangeLog?: TaskExchangeLog };
    usersById: Record<number, User>;
    onNavigate?: () => void;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({ isOpen, onClose, notification, usersById, onNavigate }) => {
    
    const { task, exchangeLog } = notification;

    const renderExchangeDetails = () => {
        if (!exchangeLog || !task) return null;
        
        const requester = usersById[exchangeLog.exchangedByUserId];
        const recipient = usersById[exchangeLog.exchangedToUserId];

        return (
            <div className="mt-4 p-3 bg-muted rounded-lg border border-border text-sm">
                <h4 className="font-bold mb-2">Exchange Details</h4>
                <p><strong>Task:</strong> {task.title}</p>
                <p><strong>Requester:</strong> {requester?.name || 'N/A'}</p>
                <p><strong>Recipient:</strong> {recipient?.name || 'N/A'}</p>
                <p><strong>Type:</strong> {exchangeLog.type}</p>
                <p><strong>Status:</strong> <span className="font-semibold">{exchangeLog.status}</span></p>
                {exchangeLog.status === 'denied' && <p><strong>Denial Reason:</strong> {exchangeLog.denialReason}</p>}
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Notification: ${notification.taskTitle}`}>
            <div className="space-y-4">
                <div>
                    <p className="text-lg font-semibold">{notification.message}</p>
                    <p className="text-sm text-muted-foreground">Received: {new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                {task && task.taskCategory !== 'Notification' && (
                    <div className="p-3 bg-muted rounded-lg border border-border text-sm">
                        <h4 className="font-bold mb-2">Task Details</h4>
                        <p><strong>Title:</strong> {task.title}</p>
                        <p><strong>Description:</strong> {task.description || 'N/A'}</p>
                        <p><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                        <p><strong>Priority:</strong> {task.priority}</p>
                    </div>
                )}
                
                {renderExchangeDetails()}
                
                <div className="flex justify-end gap-2 pt-4">
                    {task && onNavigate && (
                        <Button onClick={onNavigate} variant="secondary">
                            Go to Task
                        </Button>
                    )}
                    <Button onClick={onClose} variant="primary">
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default NotificationDetailModal;