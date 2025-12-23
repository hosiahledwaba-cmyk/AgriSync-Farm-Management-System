import React, { useRef, useEffect } from 'react';
import { Notification } from '../../types';
import { BellIcon, CheckCheckIcon } from './Icon';

interface NotificationDropdownProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onMarkAllAsRead: () => void;
    onClose: () => void;
}

const NotificationItem: React.FC<{ notification: Notification; onNotificationClick: (notification: Notification) => void; }> = ({ notification, onNotificationClick }) => {
    const getIcon = () => {
        switch(notification.type) {
            case 'overdue': return <span className="text-red-500 text-lg">❗️</span>;
            case 'due_soon': return <span className="text-yellow-500 text-lg">⏳</span>;
            case 'new_assignment': return <span className="text-blue-500 text-lg">✨</span>;
            case 'task_notification': return <span className="text-purple-500 text-lg">💬</span>;
            default: return null;
        }
    };
    
    return (
        <div 
            className={`p-3 flex gap-3 items-start cursor-pointer hover:bg-accent transition-colors ${!notification.isRead ? 'bg-primary/5' : ''}`}
            onClick={() => onNotificationClick(notification)}
        >
            <div className="flex-shrink-0 pt-0.5">{getIcon()}</div>
            <div className="flex-grow">
                <p className="text-sm font-semibold text-foreground">{notification.taskTitle}</p>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
            </div>
             {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" title="Unread"></div>}
        </div>
    );
};

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onNotificationClick, onMarkAllAsRead, onClose }) => {
    const node = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (node.current?.contains(e.target as Node)) return;
            // Also check if the click was on the bell icon itself
            const target = e.target as HTMLElement;
            if (!target.closest('[aria-label="Toggle notifications"]')) {
                 onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);
    
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div
            ref={node}
            className="origin-top-right absolute right-0 mt-2 w-80 max-w-sm rounded-xl shadow-lg bg-card ring-1 ring-black ring-opacity-5 focus:outline-none z-20 border border-border"
        >
            <div className="p-3 border-b border-border flex justify-between items-center">
                <h3 className="font-bold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                    <button onClick={onMarkAllAsRead} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                        <CheckCheckIcon className="h-4 w-4" /> Mark all as read
                    </button>
                )}
            </div>
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <NotificationItem key={n.id} notification={n} onNotificationClick={onNotificationClick} />
                    ))
                ) : (
                    <div className="text-center p-8 text-muted-foreground">
                        <BellIcon className="h-10 w-10 mx-auto mb-2" />
                        <p className="font-semibold">All caught up!</p>
                        <p className="text-sm">You have no new notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;