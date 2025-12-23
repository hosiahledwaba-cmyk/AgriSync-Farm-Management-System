import { useState, useEffect, useCallback } from 'react';
import { TaskExchangeLog } from '../types';
import * as taskExchangeApi from '../services/taskExchangeApi';
import { getStartOfWeek } from '../utils/dateUtils';

export const useTaskExchangeData = () => {
    const [exchangeLogs, setExchangeLogs] = useState<TaskExchangeLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedLogs = await taskExchangeApi.getTaskExchangeLogs();
            setExchangeLogs(fetchedLogs);
        } catch (err) {
            setError('Failed to fetch task exchange data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addExchangeLog = async (logData: Omit<TaskExchangeLog, 'id' | 'status'>) => {
        const newLog = await taskExchangeApi.addTaskExchangeLog(logData);
        setExchangeLogs(prev => [newLog, ...prev]);
        return newLog;
    };

    const approveRequest = async (logId: string) => {
        const updatedLog = await taskExchangeApi.updateTaskExchangeLog(logId, { status: 'approved' });
        setExchangeLogs(prev => prev.map(log => log.id === logId ? updatedLog : log));
        return updatedLog;
    };

    const denyRequest = async (logId: string, reason: string) => {
        const updatedLog = await taskExchangeApi.updateTaskExchangeLog(logId, { status: 'denied', denialReason: reason });
        setExchangeLogs(prev => prev.map(log => log.id === logId ? updatedLog : log));
        return updatedLog;
    };

    const getTodaysExchangesCount = (userId: number): number => {
        const todayStr = new Date().toISOString().split('T')[0];
        return exchangeLogs.filter(log =>
            log.exchangedByUserId === userId && log.date === todayStr && log.status === 'approved'
        ).length;
    };

    const getThisWeeksExchangesCount = (userId: number): number => {
        const startOfWeek = getStartOfWeek(new Date());
        startOfWeek.setHours(0, 0, 0, 0);
        
        return exchangeLogs.filter(log => {
            const logDate = new Date(log.date);
            return log.exchangedByUserId === userId && logDate >= startOfWeek && log.status === 'approved';
        }).length;
    };

    return {
        exchangeLogs,
        loading,
        error,
        addExchangeLog,
        approveRequest,
        denyRequest,
        getTodaysExchangesCount,
        getThisWeeksExchangesCount,
        refetch: fetchData,
    };
};