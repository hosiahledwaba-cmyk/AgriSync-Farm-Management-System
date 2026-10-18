import { InventoryUsageLog } from '../types';

const INVENTORY_USAGE_KEY = 'agrisync_inventory_usage';

const initialUsage: InventoryUsageLog[] = [
    {
        id: 'iu1',
        inventoryItemId: 2,
        inventoryItemName: 'LAN (28%) Nitrogen Topdressing Fertilizer',
        userId: 3,
        date: '2025-08-02T08:30:00Z',
        quantity: 15,
        purpose: 'Topdressing trial on North Field Section B',
    },
    {
        id: 'iu2',
        inventoryItemId: 4,
        inventoryItemName: 'Dairy Concentrate 19 Meal',
        userId: 9,
        date: '2025-08-14T06:00:00Z',
        quantity: 2,
        purpose: 'Morning feeding cycle for Bessie and milk heifers',
    },
];

export const getUsageLogs = async (): Promise<InventoryUsageLog[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(INVENTORY_USAGE_KEY);
    if (!data) {
        localStorage.setItem(INVENTORY_USAGE_KEY, JSON.stringify(initialUsage));
        return initialUsage;
    }
    return JSON.parse(data);
};

export const addUsageLog = async (logData: Omit<InventoryUsageLog, 'id'>): Promise<InventoryUsageLog> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getUsageLogs();
    const newLog: InventoryUsageLog = {
        ...logData,
        id: `iu_${Date.now()}`,
    };
    const updated = [newLog, ...all];
    localStorage.setItem(INVENTORY_USAGE_KEY, JSON.stringify(updated));
    return newLog;
};
