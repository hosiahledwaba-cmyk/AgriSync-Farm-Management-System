import { Equipment, MaintenanceLog, EquipmentStatus } from '../types';

const EQUIPMENT_KEY = 'agrisync_equipment';
const MAINTENANCE_KEY = 'agrisync_maintenance_logs';

const initialEquipment: Equipment[] = [
    {
        id: 'eq1',
        name: 'John Deere 6140M Tractor',
        type: 'Tractor',
        status: EquipmentStatus.Operational,
        totalHours: 1485,
        nextMaintenanceHours: 1500,
        fuelLevel: 82,
        currentOperatorId: undefined,
    },
    {
        id: 'eq2',
        name: 'Case IH 7250 Axial-Flow Combine',
        type: 'Combine',
        status: EquipmentStatus.Operational,
        totalHours: 890,
        nextMaintenanceHours: 1000,
        fuelLevel: 95,
        currentOperatorId: undefined,
    },
    {
        id: 'eq3',
        name: 'Monosem NG Plus 8-Row Precision Planter',
        type: 'Planter',
        status: EquipmentStatus.Operational,
        totalHours: 420,
        nextMaintenanceHours: 500,
        fuelLevel: 100,
        currentOperatorId: undefined,
    },
    {
        id: 'eq4',
        name: 'Hardi Commander 4500L Boom Sprayer',
        type: 'Sprayer',
        status: EquipmentStatus.InMaintenance,
        totalHours: 650,
        nextMaintenanceHours: 600,
        fuelLevel: 45,
        currentOperatorId: undefined,
    },
    {
        id: 'eq5',
        name: 'Toyota Hilux 2.8 GD-6 Farm Utility Truck',
        type: 'Truck',
        status: EquipmentStatus.InUse,
        totalHours: 2310,
        nextMaintenanceHours: 2500,
        fuelLevel: 68,
        currentOperatorId: 2,
    },
];

const initialMaintenanceLogs: MaintenanceLog[] = [
    {
        id: 'm1',
        equipmentId: 'eq1',
        date: '2025-05-10T10:00:00Z',
        description: '1200-Hour Scheduled Service, engine oil and hydraulic filter replacement',
        cost: 6500,
        mechanic: 'Jaco van der Merwe (Senwes)',
    },
    {
        id: 'm2',
        equipmentId: 'eq4',
        date: '2025-08-11T13:30:00Z',
        description: 'Diaphragm pump seal kit replacement and nozzle calibration',
        cost: 3200,
        mechanic: 'AgriTech Field Services',
    },
];

export const getEquipment = async (): Promise<Equipment[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(EQUIPMENT_KEY);
    if (!data) {
        localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(initialEquipment));
        return initialEquipment;
    }
    return JSON.parse(data);
};

export const getMaintenanceLogs = async (): Promise<MaintenanceLog[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(MAINTENANCE_KEY);
    if (!data) {
        localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(initialMaintenanceLogs));
        return initialMaintenanceLogs;
    }
    return JSON.parse(data);
};

export const addEquipment = async (data: Omit<Equipment, 'id'>): Promise<Equipment> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getEquipment();
    const newEq: Equipment = {
        ...data,
        id: `eq_${Date.now()}`,
    };
    const updated = [newEq, ...all];
    localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(updated));
    return newEq;
};

export const editEquipment = async (
    equipmentId: string,
    data: Partial<Omit<Equipment, 'id'>>
): Promise<Equipment> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getEquipment();
    const idx = all.findIndex(e => e.id === equipmentId);
    if (idx === -1) throw new Error('Equipment not found');
    const updated = { ...all[idx], ...data };
    all[idx] = updated;
    localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(all));
    return updated;
};

export const addMaintenanceLog = async (
    equipmentId: string,
    data: Omit<MaintenanceLog, 'id' | 'equipmentId'> & { putInMaintenance?: boolean }
): Promise<MaintenanceLog> => {
    await new Promise(r => setTimeout(r, 150));
    const allLogs = await getMaintenanceLogs();
    const newLog: MaintenanceLog = {
        id: `m_${Date.now()}`,
        equipmentId,
        date: data.date,
        description: data.description,
        cost: data.cost,
        mechanic: data.mechanic,
    };
    const updatedLogs = [newLog, ...allLogs];
    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(updatedLogs));

    if (data.putInMaintenance) {
        await editEquipment(equipmentId, { status: EquipmentStatus.InMaintenance });
    }

    return newLog;
};
