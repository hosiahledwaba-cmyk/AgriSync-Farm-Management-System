import { TaskExchangeLog } from '../types';

const TASK_EXCHANGE_KEY = 'agrisync_task_exchanges';

const initialExchanges: TaskExchangeLog[] = [
    {
        id: 'tex1',
        taskId: 'task1',
        exchangedByUserId: 3,
        exchangedToUserId: 5,
        date: '2025-08-14',
        type: 'handover',
        status: 'approved',
    },
];

export const getTaskExchangeLogs = async (): Promise<TaskExchangeLog[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(TASK_EXCHANGE_KEY);
    if (!data) {
        localStorage.setItem(TASK_EXCHANGE_KEY, JSON.stringify(initialExchanges));
        return initialExchanges;
    }
    return JSON.parse(data);
};

export const addTaskExchangeLog = async (logData: Omit<TaskExchangeLog, 'id' | 'status'>): Promise<TaskExchangeLog> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getTaskExchangeLogs();
    const newLog: TaskExchangeLog = {
        ...logData,
        id: `tex_${Date.now()}`,
        status: 'pending',
    };
    const updated = [newLog, ...all];
    localStorage.setItem(TASK_EXCHANGE_KEY, JSON.stringify(updated));
    return newLog;
};

export const updateTaskExchangeLog = async (logId: string, updates: Partial<TaskExchangeLog>): Promise<TaskExchangeLog> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getTaskExchangeLogs();
    const idx = all.findIndex(l => l.id === logId);
    if (idx === -1) throw new Error('Task exchange log not found');
    const updated = { ...all[idx], ...updates };
    all[idx] = updated;
    localStorage.setItem(TASK_EXCHANGE_KEY, JSON.stringify(all));
    return updated;
};
