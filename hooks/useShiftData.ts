import { useState, useEffect, useCallback } from 'react';
import { Shift, TimeLog, ShiftTemplate, EmployeeAvailability } from '../types';
import * as shiftApi from '../services/shiftApi';

export const useShiftData = () => {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
    const [availability, setAvailability] = useState<EmployeeAvailability[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [fetchedShifts, fetchedTimeLogs, fetchedTemplates, fetchedAvailability] = await Promise.all([
                shiftApi.getScheduledShifts(),
                shiftApi.getTimeLogs(),
                shiftApi.getShiftTemplates(),
                shiftApi.getAvailability(),
            ]);
            setShifts(fetchedShifts);
            setTimeLogs(fetchedTimeLogs);
            setTemplates(fetchedTemplates);
            setAvailability(fetchedAvailability);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch shift data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Time Log (Clock In/Out) Management ---

    const clockIn = async (userId: number) => {
        try {
            const newTimeLog = await shiftApi.startTimeLog(userId);
            setTimeLogs(prev => [newTimeLog, ...prev]);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const clockOut = async (userId: number) => {
        try {
            const updatedTimeLog = await shiftApi.endTimeLog(userId);
            setTimeLogs(prev => prev.map(log => log.id === updatedTimeLog.id ? updatedTimeLog : log));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const updateTimeLog = async (timeLogId: string, updates: Partial<TimeLog>, notes: string, editorId: number) => {
        const updatedLog = await shiftApi.updateTimeLog(timeLogId, { ...updates, notes }, editorId);
        setTimeLogs(prev => prev.map(log => log.id === timeLogId ? updatedLog : log));
    };

    const approveTimeLogs = async (timeLogIds: string[], approverId: number) => {
        const updatedLogs = await shiftApi.approveTimeLogs(timeLogIds, approverId);
        const updatedLogMap = new Map(updatedLogs.map(log => [log.id, log]));
        setTimeLogs(prev => prev.map(log => updatedLogMap.get(log.id) || log));
    };

    // --- Scheduled Shift Management ---

    const addShift = async (shiftData: Omit<Shift, 'id'>) => {
        const newShift = await shiftApi.addScheduledShift(shiftData);
        setShifts(prev => [...prev, newShift]);
    };

    const addShifts = async (shiftsData: Omit<Shift, 'id'>[]) => {
        const newShifts = await shiftApi.addScheduledShifts(shiftsData);
        setShifts(prev => [...prev, ...newShifts]);
    };
    
    const updateShift = async (shiftId: string, updates: Partial<Shift>) => {
        const updatedShift = await shiftApi.updateScheduledShift(shiftId, updates);
        setShifts(prev => prev.map(s => s.id === shiftId ? updatedShift : s));
    };
    
    const deleteShift = async (shiftId: string) => {
        await shiftApi.deleteScheduledShift(shiftId);
        setShifts(prev => prev.filter(s => s.id !== shiftId));
    };

    // --- Shift Template Management ---
    
    const addTemplate = async (templateData: Omit<ShiftTemplate, 'id'>) => {
        const newTemplate = await shiftApi.addShiftTemplate(templateData);
        setTemplates(prev => [...prev, newTemplate].sort((a, b) => a.name.localeCompare(b.name)));
    };
    
    const updateTemplate = async (templateId: string, updates: Partial<ShiftTemplate>) => {
        const updatedTemplate = await shiftApi.updateShiftTemplate(templateId, updates);
        setTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t));
    };

    const deleteTemplate = async (templateId: string) => {
        await shiftApi.deleteShiftTemplate(templateId);
        setTemplates(prev => prev.filter(t => t.id !== templateId));
    };

    // --- Employee Availability Management ---

    const upsertAvailability = async (data: Omit<EmployeeAvailability, 'id'>) => {
        const result = await shiftApi.upsertAvailability(data);
        setAvailability(prev => {
            const existingIndex = prev.findIndex(a => a.id === result.id);
            if (existingIndex > -1) {
                const newAvail = [...prev];
                newAvail[existingIndex] = result;
                return newAvail;
            }
            return [...prev, result];
        });
    };

    const deleteAvailability = async (id: string) => {
        await shiftApi.deleteAvailability(id);
        setAvailability(prev => prev.filter(a => a.id !== id));
    };


    return {
        shifts,
        timeLogs,
        templates,
        availability,
        loading,
        error,
        refetch: fetchData,
        clockIn,
        clockOut,
        updateTimeLog,
        approveTimeLogs,
        addShift,
        addShifts,
        updateShift,
        deleteShift,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        upsertAvailability,
        deleteAvailability,
    };
};
