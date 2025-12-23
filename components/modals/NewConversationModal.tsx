import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { User } from '../../types';

interface NewConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartConversation: (participantIds: number[]) => void;
    users: User[];
    currentUserId: number;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ isOpen, onClose, onStartConversation, users, currentUserId }) => {
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const otherUsers = users.filter(u => u.id !== currentUserId);

    const filteredUsers = searchTerm
        ? otherUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : otherUsers;

    const handleToggleUser = (userId: number) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = () => {
        if (selectedUserIds.length > 0) {
            onStartConversation(selectedUserIds);
            onClose();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Start New Conversation">
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Search for team members..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="max-h-60 overflow-y-auto border border-border rounded-md">
                    {filteredUsers.map(user => (
                        <div
                            key={user.id}
                            onClick={() => handleToggleUser(user.id)}
                            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent"
                        >
                            <input
                                type="checkbox"
                                checked={selectedUserIds.includes(user.id)}
                                readOnly
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={selectedUserIds.length === 0}>
                        Start Chat ({selectedUserIds.length})
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default NewConversationModal;
