import { Conversation, Message, MessageReference } from '../types';

const CONVERSATIONS_KEY = 'agrisync_conversations';
const MESSAGES_KEY = 'agrisync_messages';

const initialConversations: Conversation[] = [
    {
        id: 'conv1',
        participantIds: [1, 2],
        lastMessage: {
            text: 'Winter wheat storage inspection complete. Quality tests passed.',
            timestamp: '2025-08-14T15:20:00Z',
            senderId: 2,
        },
        unreadCounts: { 1: 1, 2: 0 },
    },
    {
        id: 'conv2',
        participantIds: [2, 3],
        lastMessage: {
            text: 'North Field topdressing scheduled for tomorrow morning.',
            timestamp: '2025-08-15T07:45:00Z',
            senderId: 3,
        },
        unreadCounts: { 2: 0, 3: 0 },
    },
];

const initialMessages: Message[] = [
    {
        id: 'msg1',
        conversationId: 'conv1',
        senderId: 1,
        text: 'Bob, how did the wheat sample testing go with the buyers?',
        timestamp: '2025-08-14T14:00:00Z',
        readBy: [1, 2],
    },
    {
        id: 'msg2',
        conversationId: 'conv1',
        senderId: 2,
        text: 'Winter wheat storage inspection complete. Quality tests passed.',
        timestamp: '2025-08-14T15:20:00Z',
        readBy: [2],
    },
    {
        id: 'msg3',
        conversationId: 'conv2',
        senderId: 2,
        text: 'Charlie, please verify the tractor is refueled for the morning run.',
        timestamp: '2025-08-15T07:15:00Z',
        readBy: [2, 3],
    },
    {
        id: 'msg4',
        conversationId: 'conv2',
        senderId: 3,
        text: 'North Field topdressing scheduled for tomorrow morning.',
        timestamp: '2025-08-15T07:45:00Z',
        readBy: [2, 3],
    },
];

export const getConversationsForUser = async (userId: number): Promise<Conversation[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(CONVERSATIONS_KEY);
    const convos: Conversation[] = data ? JSON.parse(data) : initialConversations;
    if (!data) localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(initialConversations));
    return convos.filter(c => c.participantIds.includes(userId));
};

export const getMessagesForConversation = async (conversationId: string): Promise<Message[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(MESSAGES_KEY);
    const all: Message[] = data ? JSON.parse(data) : initialMessages;
    if (!data) localStorage.setItem(MESSAGES_KEY, JSON.stringify(initialMessages));
    return all.filter(m => m.conversationId === conversationId);
};

export const sendMessage = async (
    participantIds: number[],
    senderId: number,
    text: string,
    conversationId?: string,
    reference?: MessageReference
): Promise<{ conversation: Conversation; message: Message }> => {
    await new Promise(r => setTimeout(r, 150));
    const convData = localStorage.getItem(CONVERSATIONS_KEY);
    const convos: Conversation[] = convData ? JSON.parse(convData) : initialConversations;

    let convo = conversationId ? convos.find(c => c.id === conversationId) : null;
    if (!convo) {
        convo = {
            id: `conv_${Date.now()}`,
            participantIds,
            unreadCounts: {},
        };
        convos.unshift(convo);
    }

    const newMessage: Message = {
        id: `msg_${Date.now()}`,
        conversationId: convo.id,
        senderId,
        text,
        timestamp: new Date().toISOString(),
        readBy: [senderId],
        reference,
    };

    convo.lastMessage = {
        text,
        timestamp: newMessage.timestamp,
        senderId,
    };

    participantIds.forEach(id => {
        if (id !== senderId) {
            convo!.unreadCounts[id] = (convo!.unreadCounts[id] || 0) + 1;
        }
    });

    const msgData = localStorage.getItem(MESSAGES_KEY);
    const allMessages: Message[] = msgData ? JSON.parse(msgData) : initialMessages;
    allMessages.push(newMessage);

    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convos));
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));

    return { conversation: convo, message: newMessage };
};

export const markConversationAsRead = async (conversationId: string, userId: number): Promise<Conversation> => {
    await new Promise(r => setTimeout(r, 100));
    const convData = localStorage.getItem(CONVERSATIONS_KEY);
    const convos: Conversation[] = convData ? JSON.parse(convData) : initialConversations;
    const convo = convos.find(c => c.id === conversationId);
    if (convo) {
        if (!convo.unreadCounts) convo.unreadCounts = {};
        convo.unreadCounts[userId] = 0;
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convos));
        return convo;
    }
    throw new Error('Conversation not found');
};
