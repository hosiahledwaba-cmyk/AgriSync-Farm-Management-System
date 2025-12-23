import React from 'react';
import { Conversation, User } from '../../types';
import { PlusIcon } from '../ui/Icon';
import Button from '../ui/Button';

interface ConversationListProps {
    conversations: Conversation[];
    users: User[];
    currentUserId: number;
    selectedConversationId?: string;
    onSelectConversation: (conversation: Conversation) => void;
    onStartNewConversation: () => void;
}

const Avatar: React.FC<{ user?: User; size?: 'sm' | 'md' }> = ({ user, size = 'md' }) => {
    if (!user) return null;

    const sizeClasses = size === 'md' ? 'h-11 w-11 text-lg' : 'h-8 w-8 text-sm';
    const initial = user.name.charAt(0).toUpperCase();

    const colorIndex = user.name.charCodeAt(0) % 7;
    const colors = [
        'bg-blue-200 text-blue-800', 'bg-green-200 text-green-800',
        'bg-yellow-200 text-yellow-800', 'bg-purple-200 text-purple-800',
        'bg-pink-200 text-pink-800', 'bg-indigo-200 text-indigo-800',
        'bg-teal-200 text-teal-800'
    ];
    const darkColors = [
        'dark:bg-blue-800 dark:text-blue-200', 'dark:bg-green-800 dark:text-green-200',
        'dark:bg-yellow-800 dark:text-yellow-200', 'dark:bg-purple-800 dark:text-purple-200',
        'dark:bg-pink-800 dark:text-pink-200', 'dark:bg-indigo-800 dark:text-indigo-200',
        'dark:bg-teal-800 dark:text-teal-200'
    ];

    return (
        <div className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${sizeClasses} ${colors[colorIndex]} ${darkColors[colorIndex]}`}>
            {initial}
        </div>
    );
};

const GroupAvatar: React.FC<{ users: User[] }> = ({ users }) => {
    if (users.length === 0) return <div className="h-11 w-11 rounded-full bg-muted"></div>;
    if (users.length === 1) return <Avatar user={users[0]} />;
    
    const user1 = users[0];
    const user2 = users[1];

    return (
        <div className="relative h-11 w-11 flex-shrink-0">
            <div className="absolute top-0 left-0">
                <Avatar user={user1} size="sm" />
            </div>
            <div className="absolute bottom-0 right-0 border-2 border-card rounded-full">
                <Avatar user={user2} size="sm" />
            </div>
        </div>
    );
};

const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    users,
    currentUserId,
    selectedConversationId,
    onSelectConversation,
    onStartNewConversation
}) => {
    const usersById = React.useMemo(() => users.reduce((acc, u) => ({...acc, [u.id]: u}), {} as Record<number, User>), [users]);

    const getOtherParticipants = (convo: Conversation) => {
        return convo.participantIds
            .filter(id => id !== currentUserId)
            .map(id => usersById[id])
            .filter(Boolean); // Filter out any potential undefined users
    };
    
    const getConversationTitle = (otherParticipants: User[]) => {
        if (otherParticipants.length === 0) return 'Me';
        if (otherParticipants.length > 2) return `${otherParticipants.slice(0, 2).map(u => u.name).join(', ')} & others`;
        return otherParticipants.map(u => u.name).join(', ');
    };

    return (
        <div className="w-full h-full flex flex-col border-r border-border">
            <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg font-bold">Conversations</h3>
                <Button size="sm" icon={<PlusIcon />} onClick={onStartNewConversation}>New</Button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map(convo => {
                    const unreadCount = convo.unreadCounts[currentUserId] || 0;
                    const lastMessageText = convo.lastMessage?.senderId === currentUserId 
                        ? `You: ${convo.lastMessage.text}` 
                        : convo.lastMessage?.text;
                    const otherParticipants = getOtherParticipants(convo);

                    return (
                        <div
                            key={convo.id}
                            onClick={() => onSelectConversation(convo)}
                            className={`p-3 flex items-center gap-3 cursor-pointer border-l-4 transition-colors ${
                                selectedConversationId === convo.id 
                                ? 'bg-accent border-primary' 
                                : 'border-transparent hover:bg-accent/50'
                            }`}
                        >
                           {otherParticipants.length > 1 ? <GroupAvatar users={otherParticipants} /> : <Avatar user={otherParticipants[0]} />}
                            
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <p className="font-bold text-foreground truncate">{getConversationTitle(otherParticipants)}</p>
                                    {convo.lastMessage && (
                                        <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                            {new Date(convo.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className={`text-sm text-muted-foreground truncate pr-4 ${unreadCount > 0 ? 'font-bold !text-foreground' : ''}`}>
                                        {lastMessageText || 'No messages yet'}
                                    </p>
                                    {unreadCount > 0 && (
                                        <span className="flex-shrink-0 h-5 w-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ConversationList;