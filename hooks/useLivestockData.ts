

import { useState, useEffect, useCallback } from 'react';
import { Livestock, FeedingSchedule, LivestockHealthEvent, WeightLog, ProductionLog, FeedLog, TreatmentLog } from '../types';
import * as livestockApi from '../services/livestockApi';

export const useLivestockData = () => {
    const [livestock, setLivestock] = useState<Livestock[]>([]);
    const [feedingSchedules, setFeedingSchedules] = useState<FeedingSchedule[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [fetchedLivestock, fetchedSchedules] = await Promise.all([
                livestockApi.getLivestock(),
                livestockApi.getFeedingSchedules(),
            ]);
            setLivestock(fetchedLivestock);
            setFeedingSchedules(fetchedSchedules);
        } catch (err) {
            setError('Failed to fetch livestock data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addLivestock = async (
        livestockData: Omit<Livestock, 'id'|'farm_id'|'healthHistory'>
    ) => {
        const newLivestock = await livestockApi.addLivestock(livestockData);
        setLivestock(prev => [newLivestock, ...prev]);
        return newLivestock;
    };
    
    const addFeedingSchedule = async (
        scheduleData: Omit<FeedingSchedule, 'id'>
    ) => {
        const newSchedule = await livestockApi.addFeedingSchedule(scheduleData);
        setFeedingSchedules(prev => [newSchedule, ...prev]);
        return newSchedule;
    };

    const updateLivestock = async (
        livestockId: string,
        updateData: Partial<Omit<Livestock, 'id'>>
    ) => {
        const updatedLivestock = await livestockApi.updateLivestock(livestockId, updateData);
        setLivestock(prev => prev.map(l => l.id === livestockId ? updatedLivestock : l));
        return updatedLivestock;
    };

    const addHealthEvent = async (
        livestockId: string,
        eventData: LivestockHealthEvent
    ) => {
        const updatedLivestock = await livestockApi.addHealthEvent(livestockId, eventData);
        setLivestock(prev => prev.map(l => l.id === livestockId ? updatedLivestock : l));
        return updatedLivestock;
    };
    
    const updateFeedingSchedule = async (
        scheduleId: string,
        updateData: Partial<Omit<FeedingSchedule, 'id'>>
    ) => {
        const updatedSchedule = await livestockApi.updateFeedingSchedule(scheduleId, updateData);
        setFeedingSchedules(prev => prev.map(s => s.id === scheduleId ? updatedSchedule : s));
        return updatedSchedule;
    };

    // New handlers for advanced tracking
    const addWeightLog = async (livestockId: string, log: WeightLog) => {
        const updated = await livestockApi.addWeightLog(livestockId, log);
        setLivestock(prev => prev.map(l => l.id === livestockId ? updated : l));
        return updated;
    };
    
    const addProductionLog = async (livestockId: string, log: ProductionLog) => {
        const updated = await livestockApi.addProductionLog(livestockId, log);
        setLivestock(prev => prev.map(l => l.id === livestockId ? updated : l));
        return updated;
    };

    const addFeedLog = async (livestockId: string, log: FeedLog) => {
        const updated = await livestockApi.addFeedLog(livestockId, log);
        setLivestock(prev => prev.map(l => l.id === livestockId ? updated : l));
        return updated;
    };

    const addTreatmentLog = async (livestockId: string, log: Omit<TreatmentLog, 'id'>) => {
        const updated = await livestockApi.addTreatmentLog(livestockId, log);
        setLivestock(prev => prev.map(l => l.id === livestockId ? updated : l));
        return updated;
    };

    return {
        livestock,
        feedingSchedules,
        loading,
        error,
        addLivestock,
        addFeedingSchedule,
        updateLivestock,
        addHealthEvent,
        updateFeedingSchedule,
        addWeightLog,
        addProductionLog,
        addFeedLog,
        addTreatmentLog,
        refetch: fetchData,
    };
};
