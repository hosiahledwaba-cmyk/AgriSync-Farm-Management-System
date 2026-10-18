import { EquipmentUsageLog, EquipmentStatus } from '../types';
import { editEquipment } from './equipmentApi';

const EQUIPMENT_USAGE_KEY = 'agrisync_equipment_usage';

const initialLogs: EquipmentUsageLog[] = [
    {
        id: 'eul1',
        equipmentId: 'eq1',
        userId: 3,
        startTime: '2025-08-14T07:00:00Z',
        endTime: '2025-08-14T12:00:00Z',
        startHours: 1480,
        endHours: 1485,
        notes: 'Disking and seedbed preparation in North Field',
    },
    {
        id: 'eul2',
        equipmentId: 'eq5',
        userId: 2,
        startTime: '2025-08-15T08:00:00Z',
        endTime: null,
        startHours: 2310,
        endHours: null,
        notes: 'Fencing inspection and supply run to town',
    },
];

export const getUsageLogs = async (): Promise<EquipmentUsageLog[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(EQUIPMENT_USAGE_KEY);
    if (!data) {
        localStorage.setItem(EQUIPMENT_USAGE_KEY, JSON.stringify(initialLogs));
        return initialLogs;
    }
    return JSON.parse(data);
};

export const startUsageLog = async (
    equipmentId: string,
    userId: number,
    startHours: number
): Promise<EquipmentUsageLog> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getUsageLogs();
    const newLog: EquipmentUsageLog = {
        id: `eul_${Date.now()}`,
        equipmentId,
        userId,
        startTime: new Date().toISOString(),
        endTime: null,
        startHours,
        endHours: null,
    };
    const updated = [newLog, ...all];
    localStorage.setItem(EQUIPMENT_USAGE_KEY, JSON.stringify(updated));

    // Update equipment status
    await editEquipment(equipmentId, {
        status: EquipmentStatus.InUse,
        currentOperatorId: userId,
        currentUsageLogId: newLog.id,
    });

    return newLog;
};

export const endUsageLog = async (
    logId: string,
    endHours: number,
    notes?: string
): Promise<EquipmentUsageLog> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getUsageLogs();
    const idx = all.findIndex(l => l.id === logId);
    if (idx === -1) throw new Error('Usage log not found');
    const target = all[idx];
    const updatedLog: EquipmentUsageLog = {
        ...target,
        endTime: new Date().toISOString(),
        endHours,
        notes: notes || target.notes,
    };
    all[idx] = updatedLog;
    localStorage.setItem(EQUIPMENT_USAGE_KEY, JSON.stringify(all));

    // Update equipment status
    await editEquipment(target.equipmentId, {
        status: EquipmentStatus.Operational,
        currentOperatorId: undefined,
        currentUsageLogId: undefined,
        totalHours: endHours,
    });

    return updatedLog;
};
