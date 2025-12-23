
import { useState, useEffect, useCallback } from 'react';
import { Equipment, MaintenanceLog } from '../types';
import * as equipmentApi from '../services/equipmentApi';

export const useEquipmentData = () => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [fetchedEquipment, fetchedLogs] = await Promise.all([
                equipmentApi.getEquipment(),
                equipmentApi.getMaintenanceLogs(),
            ]);
            setEquipment(fetchedEquipment);
            setMaintenanceLogs(fetchedLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (err) {
            setError('Failed to fetch equipment data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addEquipment = async (data: Omit<Equipment, 'id'>) => {
        const newEquipment = await equipmentApi.addEquipment(data);
        setEquipment(prev => [newEquipment, ...prev]);
        return newEquipment;
    };

    const editEquipment = async (equipmentId: string, data: Partial<Omit<Equipment, 'id'>>) => {
        const updatedEquipment = await equipmentApi.editEquipment(equipmentId, data);
        setEquipment(prev => prev.map(e => e.id === equipmentId ? updatedEquipment : e));
        return updatedEquipment;
    };

    const addMaintenanceLog = async (equipmentId: string, data: Omit<MaintenanceLog, 'id' | 'equipmentId'> & { putInMaintenance?: boolean }) => {
        const newLog = await equipmentApi.addMaintenanceLog(equipmentId, data);
        setMaintenanceLogs(prev => [newLog, ...prev]);
        return newLog;
    };

    return {
        equipment,
        maintenanceLogs,
        loading,
        error,
        addEquipment,
        editEquipment,
        addMaintenanceLog,
        refetch: fetchData,
    };
};
