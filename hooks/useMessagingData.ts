
import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, MessageReference } from '../types';
import * as messagingApi from '../services/messagingApi';

export const useMessagingData = (currentUserId: number | null) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (userId: number) => {
        try {
            setLoading(true);
            setError(null);
            const convos = await messagingApi.getConversationsForUser(userId);
            setConversations(convos.sort((a, b) => new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime()));

            const messagePromises = convos.map(c => messagingApi.getMessagesForConversation(c.id));
            const allMessagesArrays = await Promise.all(messagePromises);
            
            const messagesMap: Record<string, Message[]> = {};
            convos.forEach((convo, index) => {
                messagesMap[convo.id] = allMessagesArrays[index].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            });
            setMessagesByConversation(messagesMap);

        } catch (err) {
            setError('Failed to fetch messaging data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentUserId) {
            fetchData(currentUserId);
        } else {
            setConversations([]);
            setMessagesByConversation({});
        }
    }, [currentUserId, fetchData]);

    const sendMessage = async (text: string, participantIds: number[], conversationId?: string, reference?: MessageReference) => {
        if (!currentUserId) throw new Error("User not authenticated");

        const { conversation: updatedConvo, message: newMessage } = await messagingApi.sendMessage(
            [currentUserId, ...participantIds].filter((v, i, a) => a.indexOf(v) === i), // Ensure unique participants
            currentUserId,
            text,
            conversationId,
            reference
        );
        
        // Update conversations list
        setConversations(prev => {
            const otherConvos = prev.filter(c => c.id !== updatedConvo.id);
            return [updatedConvo, ...otherConvos];
        });

        // Update messages for the conversation
        setMessagesByConversation(prev => ({
            ...prev,
            [updatedConvo.id]: [...(prev[updatedConvo.id] || []), newMessage]
        }));

        return { conversation: updatedConvo, message: newMessage };
    };

    const markConversationAsRead = async (conversationId: string) => {
        if (!currentUserId) return;
        
        // Optimistic update
        const originalConversations = [...conversations];
        setConversations(prev => prev.map(c => 
            c.id === conversationId ? { ...c, unreadCounts: { ...c.unreadCounts, [currentUserId]: 0 } } : c
        ));
        
        try {
            const updatedConvo = await messagingApi.markConversationAsRead(conversationId, currentUserId);
            // Replace with server response
            setConversations(prev => prev.map(c => c.id === conversationId ? updatedConvo : c));
        } catch (error) {
            console.error("Failed to mark conversation as read", error);
            setConversations(originalConversations); // Revert on error
        }
    };
    
    const totalUnreadCount = conversations.reduce((sum, convo) => {
        return sum + (convo.unreadCounts[currentUserId!] || 0);
    }, 0);


    return {
        conversations,
        messagesByConversation,
        totalUnreadCount,
        loading,
        error,
        sendMessage,
        markConversationAsRead,
        refetch: () => currentUserId && fetchData(currentUserId),
    };
};
