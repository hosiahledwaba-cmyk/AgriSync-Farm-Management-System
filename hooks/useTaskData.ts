import { useState, useEffect, useCallback } from 'react';
import { Task, TaskRecurrence, TaskPriority, User, Role, TaskStatus, TaskExchangeLog } from '../types';
import * as taskApi from '../services/taskApi';
import * as taskExchangeApi from '../services/taskExchangeApi';


export const useTaskData = (users: User[]) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedTasks = await taskApi.getTasks();
            setTasks(fetchedTasks);
        } catch (err) {
            setError('Failed to fetch task data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addTask = async (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
        const newTask = await taskApi.addTask(taskData);
        setTasks(prev => [newTask, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        return newTask;
    };

    const startTask = async (taskId: string) => {
        const updatedTask = await taskApi.startTask(taskId);
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
        return updatedTask;
    };

    const editTask = async (
        taskId: string,
        updateData: Partial<Task>
    ) => {
        const updatedTask = await taskApi.editTask(taskId, updateData);
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
        return updatedTask;
    };

    const completeTask = async (
        taskId: string,
        notes: string | undefined,
        completionPhoto: string,
        completedByUserId?: number
    ) => {
        const originalTask = tasks.find(t => t.id === taskId);
        if (!originalTask) return;

        const updatedTask = await taskApi.updateTask(taskId, {
            completionNotes: notes,
            completionPhoto,
            completedByUserId,
        });

        const newTasks: Task[] = [];
        
        // Handle recurrence
        if (originalTask.recurrence !== TaskRecurrence.None) {
            const nextDueDate = new Date(originalTask.dueDate);
            nextDueDate.setUTCHours(0, 0, 0, 0);

            switch (originalTask.recurrence) {
                case TaskRecurrence.Daily: nextDueDate.setDate(nextDueDate.getDate() + 1); break;
                case TaskRecurrence.Weekly: nextDueDate.setDate(nextDueDate.getDate() + 7); break;
                case TaskRecurrence.Monthly: nextDueDate.setMonth(nextDueDate.getMonth() + 1); break;
            }

            const newTaskData: Omit<Task, 'id' | 'status' | 'createdAt'> = {
                title: originalTask.title,
                description: originalTask.description,
                dueDate: nextDueDate.toISOString().split('T')[0],
                assigneeId: originalTask.originalAssigneeId || originalTask.assigneeId, // Revert to original assignee
                recurrence: originalTask.recurrence,
                priority: originalTask.priority,
                relatedFieldId: originalTask.relatedFieldId,
                relatedLivestockId: originalTask.relatedLivestockId,
                taskCategory: originalTask.taskCategory,
                isAutomated: originalTask.isAutomated,
            };
            const nextRecurringTask = await taskApi.addTask(newTaskData);
            newTasks.push(nextRecurringTask);
        }
        
        setTasks(prev => [ ...newTasks, ...prev.map(t => t.id === taskId ? updatedTask : t) ].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

        return updatedTask;
    };
    
    const requestExchange = async (
        task: Task,
        newAssigneeId: number,
        type: 'handover' | 'assist_request',
        exchangedByUser: User
    ) => {
        const newAssignee = users.find(u => u.id === newAssigneeId);
        if (!newAssignee) return;

        // 1. Create a pending exchange log
        const exchangeLog = await taskExchangeApi.addTaskExchangeLog({
            taskId: task.id,
            exchangedByUserId: exchangedByUser.id,
            exchangedToUserId: newAssigneeId,
            date: new Date().toISOString().split('T')[0],
            type,
        });

        // 2. Mark the original task as having a pending exchange
        await editTask(task.id, { pendingExchangeId: exchangeLog.id });

        // 3. Create notification task for the recipient
        const recipientTaskDescription = `${exchangedByUser.name} has requested to ${type === 'handover' ? 'hand over' : 'get assistance with'} the task: "${task.title}".`;
        await addTask({
            title: `Task Exchange Request`,
            description: recipientTaskDescription,
            assigneeId: newAssigneeId,
            dueDate: new Date().toISOString().split('T')[0],
            priority: TaskPriority.High,
            recurrence: TaskRecurrence.None,
            taskCategory: 'Notification',
            relatedExchangeId: exchangeLog.id,
        });

        // 4. Create notification for managers/owners
        const managersAndOwners = users.filter(u => u.role === Role.Owner || u.role === Role.Manager);
        for (const manager of managersAndOwners) {
             await addTask({
                title: `Exchange Requested: ${task.title}`,
                description: `From ${exchangedByUser.name} to ${newAssignee.name} (${type}).`,
                assigneeId: manager.id,
                dueDate: new Date().toISOString().split('T')[0],
                priority: TaskPriority.Low,
                recurrence: TaskRecurrence.None,
                taskCategory: 'Notification',
                relatedExchangeId: exchangeLog.id,
            });
        }
    };
    
    const processExchangeResponse = async (exchangeLog: TaskExchangeLog, response: 'approved' | 'denied', reason?: string) => {
        const allTasks = await taskApi.getTasks(); // Get the freshest data
        const originalTask = allTasks.find(t => t.id === exchangeLog.taskId);
        const requester = users.find(u => u.id === exchangeLog.exchangedByUserId);
        const recipient = users.find(u => u.id === exchangeLog.exchangedToUserId);
        if (!originalTask || !requester || !recipient) return;

        // 1. Finalize the original task and clear pending status
        let taskUpdates: Partial<Task> = { pendingExchangeId: undefined };
        let requesterNotificationDescription = '';
        let managerNotificationTitle = '';
        let managerNotificationDescription = '';

        if (response === 'approved') {
            if (exchangeLog.type === 'handover') {
                taskUpdates.assigneeId = exchangeLog.exchangedToUserId;
                taskUpdates.originalAssigneeId = originalTask.originalAssigneeId || originalTask.assigneeId;
                taskUpdates.secondaryAssigneeIds = [];
            } else { // assist_request
                taskUpdates.secondaryAssigneeIds = [...(originalTask.secondaryAssigneeIds || []), exchangeLog.exchangedToUserId];
            }
            
            requesterNotificationDescription = `${recipient.name} approved your request for the task: "${originalTask.title}".`;
            managerNotificationTitle = `Exchange Approved: ${originalTask.title}`;
            managerNotificationDescription = `${recipient.name} approved the request from ${requester.name}. Task has been updated.`;

        } else { // denied
            requesterNotificationDescription = `${recipient.name} denied your request for "${originalTask.title}". Reason: "${reason}"`;
            managerNotificationTitle = `Exchange Denied: ${originalTask.title}`;
            managerNotificationDescription = `${recipient.name} denied the request from ${requester.name}.`;
        }
        
        await editTask(originalTask.id, taskUpdates);
        
        // 2. Create notification for the original requester
        await addTask({
            title: `Exchange Request ${response === 'approved' ? 'Approved' : 'Denied'}`,
            description: requesterNotificationDescription,
            assigneeId: requester.id,
            dueDate: new Date().toISOString().split('T')[0],
            priority: TaskPriority.Medium,
            recurrence: TaskRecurrence.None,
            taskCategory: 'Notification',
            relatedExchangeId: exchangeLog.id
        });
        
        // 3. Create notification for managers
        const managersAndOwners = users.filter(u => u.role === Role.Owner || u.role === Role.Manager);
         for (const manager of managersAndOwners) {
             await addTask({
                title: managerNotificationTitle,
                description: managerNotificationDescription,
                assigneeId: manager.id,
                dueDate: new Date().toISOString().split('T')[0],
                priority: TaskPriority.Low,
                recurrence: TaskRecurrence.None,
                taskCategory: 'Notification',
                relatedExchangeId: exchangeLog.id,
            });
        }
        
        // 4. Mark the recipient's notification task as completed
        const recipientNotificationTask = allTasks.find(t => t.relatedExchangeId === exchangeLog.id && t.assigneeId === recipient.id);
        if (recipientNotificationTask) {
            await editTask(recipientNotificationTask.id, { status: TaskStatus.Completed });
        }
    };


    return {
        tasks,
        loading,
        error,
        addTask,
        startTask,
        editTask,
        completeTask,
        requestExchange,
        processExchangeResponse,
        refetch: fetchData,
    };
};