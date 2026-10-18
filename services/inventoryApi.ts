import { InventoryItem } from '../types';

const INVENTORY_KEY = 'agrisync_inventory';

const initialInventory: InventoryItem[] = [
    {
        id: 1,
        farm_id: 1,
        name: 'PAN 6R-710BR Hybrid Maize Seed',
        category: 'Seed',
        unit: 'bags (50k seeds)',
        stock_qty: 35,
        reorder_level: 10,
        unit_cost: 3200,
    },
    {
        id: 2,
        farm_id: 1,
        name: 'LAN (28%) Nitrogen Topdressing Fertilizer',
        category: 'Fertilizer',
        unit: '50kg bags',
        stock_qty: 120,
        reorder_level: 25,
        unit_cost: 650,
    },
    {
        id: 3,
        farm_id: 1,
        name: 'Glyphosate 360 SL Herbicide',
        category: 'Chemical',
        unit: '20L drums',
        stock_qty: 18,
        reorder_level: 5,
        unit_cost: 1450,
    },
    {
        id: 4,
        farm_id: 1,
        name: 'Dairy Concentrate 19 Meal',
        category: 'Feed',
        unit: '50kg bags',
        stock_qty: 45,
        reorder_level: 15,
        unit_cost: 420,
    },
    {
        id: 5,
        farm_id: 1,
        name: 'Baled Lucerne Hay (A Grade)',
        category: 'Feed',
        unit: 'bales',
        stock_qty: 210,
        reorder_level: 50,
        unit_cost: 120,
    },
    {
        id: 6,
        farm_id: 1,
        name: 'Stored Winter Wheat (Silo 2)',
        category: 'Harvested Goods',
        unit: 'metric tons',
        stock_qty: 81.9,
        reorder_level: 0,
        unit_cost: 4500,
        isHarvestedGood: true,
        sourceHarvestId: 1,
    },
];

export const getInventory = async (): Promise<InventoryItem[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(INVENTORY_KEY);
    if (!data) {
        localStorage.setItem(INVENTORY_KEY, JSON.stringify(initialInventory));
        return initialInventory;
    }
    return JSON.parse(data);
};

export const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'farm_id'>): Promise<InventoryItem> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getInventory();
    const newItem: InventoryItem = {
        ...itemData,
        id: all.length ? Math.max(...all.map(i => i.id)) + 1 : 1,
        farm_id: 1,
    };
    const updated = [...all, newItem];
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(updated));
    return newItem;
};

export const editInventoryItem = async (
    itemId: number,
    itemData: Partial<Omit<InventoryItem, 'id' | 'farm_id'>>
): Promise<InventoryItem> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getInventory();
    const idx = all.findIndex(i => i.id === itemId);
    if (idx === -1) throw new Error('Inventory item not found');
    const updated = { ...all[idx], ...itemData };
    all[idx] = updated;
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(all));
    return updated;
};

export const deleteInventoryItem = async (itemId: number): Promise<void> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getInventory();
    const filtered = all.filter(i => i.id !== itemId);
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(filtered));
};
