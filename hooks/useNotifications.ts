import { useState, useEffect, useCallback } from 'react';
import { Notification, Task, User, TaskStatus, TaskExchangeLog } from '../types';

const NOTIFICATION_READ_KEY = 'agrisync_read_notifications';

const getReadNotificationIds = (): string[] => {
    const data = localStorage.getItem(NOTIFICATION_READ_KEY);
    return data ? JSON.parse(data) : [];
};

const setReadNotificationIds = (ids: string[]) => {
    localStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify(ids));
};

export const useNotifications = (tasks: Task[], currentUser: User | null, exchangeLogs: TaskExchangeLog[]) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [readIds, setReadIds] = useState<string[]>(getReadNotificationIds());

    const generateNotifications = useCallback(() => {
        if (!currentUser) {
            setNotifications([]);
            return;
        }
        
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        const finalNotifications: Notification[] = [];

        // Filter for tasks assigned to the current user that aren't just completed notifications
        const userTasks = tasks.filter(task => 
            (task.assigneeId === currentUser.id || (task.secondaryAssigneeIds || []).includes(currentUser.id)) &&
            task.status !== TaskStatus.Completed &&
            task.taskCategory !== 'Notification'
        );

        // Filter for notification-category tasks assigned to the user
        const notificationTasks = tasks.filter(task => 
            task.assigneeId === currentUser.id &&
            task.status !== TaskStatus.Completed &&
            task.taskCategory === 'Notification'
        );

        // --- Standard Task Notifications (Due, Overdue, New) ---
        for (const task of userTasks) {
            const dueDate = new Date(task.dueDate);
            const createdAt = new Date(task.createdAt);
            let notification: Omit<Notification, 'isRead'> | null = null;

            if (dueDate < now) {
                notification = {
                    id: `overdue-${task.id}`, type: 'overdue', message: `Task is overdue.`,
                    taskId: task.id, taskTitle: task.title, createdAt: now, task: task
                };
            } else if (dueDate <= twentyFourHoursFromNow) {
                notification = {
                    id: `due_soon-${task.id}`, type: 'due_soon', message: `Task is due within 24 hours.`,
                    taskId: task.id, taskTitle: task.title, createdAt: now, task: task
                };
            } else if (createdAt >= twentyFourHoursAgo) {
                notification = {
                    id: `new_assignment-${task.id}`, type: 'new_assignment', message: `You have been assigned a new task.`,
                    taskId: task.id, taskTitle: task.title, createdAt: createdAt, task: task
                };
            }
            
            if (notification) {
                finalNotifications.push({ ...notification, isRead: readIds.includes(notification.id) });
            }
        }

        // --- Task Exchange Notifications ---
        for (const task of notificationTasks) {
             if (task.relatedExchangeId) {
                const exchangeLog = exchangeLogs.find(log => log.id === task.relatedExchangeId);
                if (exchangeLog) {
                     const notification: Omit<Notification, 'isRead'> = {
                        id: `task_notification-${task.id}`,
                        type: 'task_notification',
                        message: task.description || 'You have a task notification.',
                        taskId: task.id,
                        taskTitle: task.title,
                        createdAt: new Date(task.createdAt),
                        task: task,
                        exchangeLog: exchangeLog,
                    };
                    finalNotifications.push({ ...notification, isRead: readIds.includes(notification.id) });
                }
            }
        }

        setNotifications(finalNotifications.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }, [tasks, currentUser, readIds, exchangeLogs]);

    useEffect(() => {
        generateNotifications();
    }, [tasks, currentUser, readIds, generateNotifications]);

    const markAsRead = (notificationId: string) => {
        if (!readIds.includes(notificationId)) {
            const newReadIds = [...readIds, notificationId];
            setReadIds(newReadIds);
            setReadNotificationIds(newReadIds);
        }
    };

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        const newReadIds = [...new Set([...readIds, ...allIds])];
        setReadIds(newReadIds);
        setReadNotificationIds(newReadIds);
    };
    
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return { notifications, unreadCount, markAsRead, markAllAsRead };
};