import { useState, useEffect, useCallback } from 'react';
import { InventoryUsageLog } from '../types';
import * as usageApi from '../services/inventoryUsageApi';

export const useInventoryUsageData = () => {
    const [usageLogs, setUsageLogs] = useState<InventoryUsageLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedLogs = await usageApi.getUsageLogs();
            setUsageLogs(fetchedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (err) {
            setError('Failed to fetch inventory usage data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addUsageLog = async (
        logData: Omit<InventoryUsageLog, 'id' | 'userId' | 'date'>,
        userId: number
    ) => {
        const fullLogData = {
            ...logData,
            userId,
            date: new Date().toISOString(),
        };
        const newLog = await usageApi.addUsageLog(fullLogData);
        setUsageLogs(prev => [newLog, ...prev]);
        return newLog;
    };

    return {
        usageLogs,
        loading,
        error,
        addUsageLog,
        refetch: fetchData,
    };
};