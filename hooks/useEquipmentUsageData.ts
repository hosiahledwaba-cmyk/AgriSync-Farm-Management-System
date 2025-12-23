import { useState, useEffect, useCallback } from 'react';
import { EquipmentUsageLog } from '../types';
import * as usageApi from '../services/equipmentUsageApi';

export const useEquipmentUsageData = () => {
    const [usageLogs, setUsageLogs] = useState<EquipmentUsageLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedLogs = await usageApi.getUsageLogs();
            setUsageLogs(fetchedLogs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
        } catch (err) {
            setError('Failed to fetch equipment usage data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const startSession = async (equipmentId: string, userId: number, startHours: number) => {
        const newLog = await usageApi.startUsageLog(equipmentId, userId, startHours);
        setUsageLogs(prev => [newLog, ...prev]);
        return newLog;
    };
    
    const endSession = async (logId: string, endHours: number, notes?: string) => {
        const updatedLog = await usageApi.endUsageLog(logId, endHours, notes);
        setUsageLogs(prev => prev.map(log => (log.id === logId ? updatedLog : log)));
        return updatedLog;
    };

    return {
        usageLogs,
        loading,
        error,
        startSession,
        endSession,
        refetch: fetchData,
    };
};
