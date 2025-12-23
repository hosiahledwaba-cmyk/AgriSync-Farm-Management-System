
import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, User, MessageReference, Task, Shift, Equipment, InventoryItem, Field, Livestock } from '../../types';
import ConversationList from './messaging/ConversationList';
import MessageView from './messaging/MessageView';
import { MessageSquareIcon } from './ui/Icon';

interface MessagingDashboardProps {
    conversations: Conversation[];
    messagesByConversation: Record<string, Message[]>;
    totalUnreadCount: number;
    currentUserId: number;
    users: User[];
    sendMessage: (text: string, participantIds: number[], conversationId?: string, reference?: MessageReference) => Promise<{ conversation: Conversation, message: Message }>;
    markConversationAsRead: (conversationId: string) => void;
    onStartNewConversation: () => void;
    onNavigateToReference: (reference: MessageReference) => void;
    onMentionClick: (username: string) => void;
    conversationToSelectId: string | null;
    onClearConversationToSelect: () => void;
    // Data for modal
    tasks: Task[];
    shifts: Shift[];
    equipment: Equipment[];
    inventory: InventoryItem[];
    fields: Field[];
    livestock: Livestock[];
}

const MessagingDashboard: React.FC<MessagingDashboardProps> = ({
    conversations,
    messagesByConversation,
    currentUserId,
    users,
    sendMessage,
    markConversationAsRead,
    onStartNewConversation,
    onNavigateToReference,
    onMentionClick,
    conversationToSelectId,
    onClearConversationToSelect,
    tasks,
    shifts,
    equipment,
    inventory,
    fields,
    livestock
}) => {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const isInitialLoad = useRef(true);

    // Effect to manage conversation selection state
    useEffect(() => {
        // Handle programmatic selection (e.g., from a mention click)
        if (conversationToSelectId) {
            const convoToSelect = conversations.find(c => c.id === conversationToSelectId);
            if (convoToSelect) {
                setSelectedConversation(convoToSelect);
            }
            onClearConversationToSelect();
            return; // Exit early to avoid other logic
        }

        const isDesktop = window.matchMedia('(min-width: 768px)').matches;

        // Auto-select first conversation on desktop for initial load to avoid an empty view.
        if (isInitialLoad.current && isDesktop && !selectedConversation && conversations.length > 0) {
            setSelectedConversation(conversations[0]);
        }
        // After the first run, this ref is set to false to prevent re-selecting
        // when a user explicitly navigates back to the list on mobile.
        isInitialLoad.current = false;

        // If the selected conversation is deleted from the main list, deselect it.
        if (selectedConversation && !conversations.find(c => c.id === selectedConversation.id)) {
            setSelectedConversation(null);
        }
    }, [conversations, selectedConversation, conversationToSelectId, onClearConversationToSelect]);

    // When conversation is selected, mark it as read
    useEffect(() => {
        if (selectedConversation && (selectedConversation.unreadCounts[currentUserId] || 0) > 0) {
            markConversationAsRead(selectedConversation.id);
        }
    }, [selectedConversation, currentUserId, markConversationAsRead]);

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
    };

    const handleSendMessage = (text: string, reference?: MessageReference) => {
        if (selectedConversation) {
            const otherParticipantIds = selectedConversation.participantIds.filter(id => id !== currentUserId);
            sendMessage(text, otherParticipantIds, selectedConversation.id, reference);
        }
    };
    
    const handleBack = () => {
        setSelectedConversation(null);
    }
    
    return (
        <div className="h-full flex bg-card md:rounded-xl md:shadow-sm md:border md:border-border overflow-hidden">
            <div className={`
                ${selectedConversation ? 'hidden' : 'flex'} w-full flex-col 
                md:flex md:w-[320px] lg:w-[380px] flex-shrink-0
            `}>
                <ConversationList
                    conversations={conversations}
                    users={users}
                    currentUserId={currentUserId}
                    selectedConversationId={selectedConversation?.id}
                    onSelectConversation={handleSelectConversation}
                    onStartNewConversation={onStartNewConversation}
                />
            </div>
            
            <div className={`
                ${!selectedConversation ? 'hidden' : 'flex'}
                w-full flex-col
                md:flex flex-1
            `}>
                {selectedConversation ? (
                    <MessageView
                        key={selectedConversation.id} // Re-mount when conversation changes
                        conversation={selectedConversation}
                        messages={messagesByConversation[selectedConversation.id] || []}
                        users={users}
                        currentUserId={currentUserId}
                        onSendMessage={handleSendMessage}
                        onBack={handleBack}
                        onNavigateToReference={onNavigateToReference}
                        onMentionClick={onMentionClick}
                        tasks={tasks}
                        shifts={shifts}
                        equipment={equipment}
                        inventory={inventory}
                        fields={fields}
                        livestock={livestock}
                    />
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8">
                        <MessageSquareIcon className="h-20 w-20 text-muted-foreground/30 mb-4" />
                        <h2 className="text-xl font-bold">Select a conversation</h2>
                        <p className="text-muted-foreground">Or start a new one to begin messaging.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagingDashboard;
