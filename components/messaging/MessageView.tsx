
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message, User, MessageReference, Task, Shift, Equipment, InventoryItem, Field, Livestock } from '../../types';
import Button from '../ui/Button';
import { PaperclipIcon, SendIcon, XIcon, ArrowLeftIcon } from '../ui/Icon';
import ReferenceItemModal from '../modals/ReferenceItemModal';
import ReferenceCard from './ReferenceCard';

interface MessageViewProps {
    conversation: Conversation;
    messages: Message[];
    users: User[];
    currentUserId: number;
    onSendMessage: (text: string, reference?: MessageReference) => void;
    onBack: () => void;
    onNavigateToReference: (reference: MessageReference) => void;
    onMentionClick: (username: string) => void;
    // Data for Reference Modal
    tasks: Task[];
    shifts: Shift[];
    equipment: Equipment[];
    inventory: InventoryItem[];
    fields: Field[];
    livestock: Livestock[];
}

const MessageView: React.FC<MessageViewProps> = ({ 
    conversation, 
    messages, 
    users, 
    currentUserId, 
    onSendMessage, 
    onBack,
    onNavigateToReference, 
    onMentionClick,
    ...dataForModal 
}) => {
    const [newMessage, setNewMessage] = useState('');
    const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
    const [reference, setReference] = useState<MessageReference | null>(null);
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([]);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const usersById = React.useMemo(() => users.reduce((acc, u) => ({...acc, [u.id]: u}), {} as Record<number, User>), [users]);

    const getConversationTitle = () => {
        const otherParticipants = conversation.participantIds
            .filter(id => id !== currentUserId)
            .map(id => usersById[id]?.name || `User #${id}`);
        
        if (otherParticipants.length === 0) return 'Me (Just my notes)';
        if (otherParticipants.length > 2) return `${otherParticipants.slice(0, 2).join(', ')} & ${otherParticipants.length - 2} others`;
        return otherParticipants.join(', ');
    };
    
    const getParticipantNames = () => {
         const otherParticipants = conversation.participantIds
            .filter(id => id !== currentUserId)
            .map(id => usersById[id]?.name || `User #${id}`);
        return otherParticipants.join(', ');
    }

    // Auto resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [newMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() || reference) {
            onSendMessage(newMessage.trim(), reference || undefined);
            setNewMessage('');
            setReference(null);
            setMentionQuery(null);
            setMentionSuggestions([]);
        }
    };

    const handleSelectReference = (selectedRef: MessageReference) => {
        setReference(selectedRef);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setNewMessage(text);
        
        const cursorPosition = e.target.selectionStart;
        const textUpToCursor = text.substring(0, cursorPosition);
        const mentionMatch = textUpToCursor.match(/@(\w*)$/);

        if (mentionMatch) {
            const query = mentionMatch[1].toLowerCase();
            setMentionQuery(query);
            const suggestions = users.filter(u => 
                u.id !== currentUserId && u.name.toLowerCase().startsWith(query)
            );
            setMentionSuggestions(suggestions);
        } else {
            setMentionQuery(null);
            setMentionSuggestions([]);
        }
    };

    const handleSelectMention = (name: string) => {
        const text = newMessage;
        const cursorPosition = textareaRef.current!.selectionStart;
        const textUpToCursor = text.substring(0, cursorPosition);
        const textAfterCursor = text.substring(cursorPosition);
        
        const newTextBeforeCursor = textUpToCursor.replace(/@(\w*)$/, `@${name} `);
        
        const newText = newTextBeforeCursor + textAfterCursor;
        
        setNewMessage(newText);
        setMentionQuery(null);
        setMentionSuggestions([]);
        
        setTimeout(() => {
            textareaRef.current?.focus();
            const newCursorPos = newTextBeforeCursor.length;
            textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const renderWithMentions = (text: string) => {
        const mentionRegex = /@(\w+)/g;
        const parts = text.split(mentionRegex);

        return parts.map((part, index) => {
            if (index % 2 !== 0) { // It's a captured mention (username)
                const username = part;
                const userExists = users.some(u => u.name === username);
                if (userExists) {
                    return (
                        <a 
                            key={index} 
                            className="font-bold text-blue-400 hover:underline cursor-pointer"
                            onClick={() => onMentionClick(username)}
                        >
                            @{username}
                        </a>
                    );
                } else {
                     return `@${part}`;
                }
            }
            return part;
        });
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background">
            <div className="p-3 border-b border-border flex items-center gap-3 flex-shrink-0">
                <Button onClick={onBack} variant="secondary" size="sm" className="md:hidden !p-2 rounded-full border-none" icon={<ArrowLeftIcon />} />
                <div>
                    <h3 className="text-lg font-bold truncate">{getConversationTitle()}</h3>
                    <p className="text-xs text-muted-foreground truncate">{getParticipantNames()}</p>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg, index) => {
                    const isSelf = msg.senderId === currentUserId;
                    const sender = usersById[msg.senderId];
                    const senderInitial = sender?.name.charAt(0).toUpperCase() || '?';
                    
                    const showAvatar = !isSelf && (index === messages.length -1 || messages[index + 1]?.senderId !== msg.senderId);

                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isSelf ? 'justify-end' : ''}`}>
                             {!isSelf && (
                                <div className="w-8 flex-shrink-0">
                                    {showAvatar && (
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground" title={sender?.name}>
                                            {senderInitial}
                                        </div>
                                    )}
                                </div>
                             )}
                            <div className={`max-w-lg ${isSelf ? 'ml-10' : 'mr-10'}`}>
                                <div className={`p-3 text-sm ${isSelf ? 'bg-primary text-primary-foreground rounded-t-2xl rounded-bl-2xl' : 'bg-muted rounded-t-2xl rounded-br-2xl'}`}>
                                    {msg.text && <p style={{ whiteSpace: 'pre-wrap' }}>{renderWithMentions(msg.text)}</p>}
                                    {msg.reference && <ReferenceCard reference={msg.reference} onNavigate={onNavigateToReference} />}
                                </div>
                                 <p className={`text-xs text-muted-foreground mt-1 px-1 ${isSelf ? 'text-right' : 'text-left'}`}>
                                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="relative p-2 border-t border-border bg-background flex-shrink-0">
                {mentionQuery !== null && mentionSuggestions.length > 0 && (
                    <div className="absolute bottom-full left-2 right-2 mb-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                        {mentionSuggestions.map(user => (
                            <div 
                                key={user.id} 
                                className="p-3 hover:bg-accent cursor-pointer flex items-center gap-2"
                                // Use onMouseDown to prevent the textarea from losing focus and closing the suggestions
                                onMouseDown={() => handleSelectMention(user.name)}
                            >
                               <div className="font-semibold">{user.name}</div>
                               <div className="text-sm text-muted-foreground">{user.role}</div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="bg-muted rounded-xl p-1">
                    {reference && (
                        <div className="px-2 pt-2">
                            <div className="p-2 mb-1 rounded-md flex justify-between items-center text-sm bg-background/50">
                                <div className="font-semibold truncate">
                                    Referencing: <span className="font-normal italic">{reference.name}</span>
                                </div>
                                <button onClick={() => setReference(null)} className="p-1 rounded-full hover:bg-background/80"><XIcon className="h-4 w-4"/></button>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleSend} className="flex items-end gap-2 p-1">
                        <textarea
                            ref={textareaRef}
                            value={newMessage}
                            onChange={handleInputChange}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none focus:ring-0 resize-none px-2 py-1.5 text-sm max-h-32"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setIsReferenceModalOpen(true)}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors"
                            aria-label="Attach item"
                        >
                            <PaperclipIcon className="h-5 w-5"/>
                        </button>
                        <button
                            type="submit"
                            disabled={!newMessage.trim() && !reference}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Send message"
                        >
                            <SendIcon className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>

            <ReferenceItemModal
                isOpen={isReferenceModalOpen}
                onClose={() => setIsReferenceModalOpen(false)}
                onSelect={handleSelectReference}
                {...dataForModal}
            />
        </div>
    );
};

export default MessageView;
