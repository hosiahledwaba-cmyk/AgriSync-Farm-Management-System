
import { useState, useEffect, useCallback } from 'react';
import { InventoryItem } from '../types';
import * as inventoryApi from '../services/inventoryApi';

export const useInventoryData = () => {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedItems = await inventoryApi.getInventory();
            setInventoryItems(fetchedItems);
        } catch (err) {
            setError('Failed to fetch inventory data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addInventoryItem = async (
        itemData: Omit<InventoryItem, 'id' | 'farm_id'>
    ) => {
        const newItem = await inventoryApi.addInventoryItem(itemData);
        setInventoryItems(prev => [...prev, newItem]);
        return newItem;
    };

    const editInventoryItem = async (
        itemId: number,
        itemData: Partial<Omit<InventoryItem, 'id' | 'farm_id'>>
    ) => {
        const updatedItem = await inventoryApi.editInventoryItem(itemId, itemData);
        setInventoryItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
        return updatedItem;
    };

    const deleteInventoryItem = async (itemId: number) => {
        await inventoryApi.deleteInventoryItem(itemId);
        setInventoryItems(prev => prev.filter(item => item.id !== itemId));
    };

    return {
        inventoryItems,
        loading,
        error,
        addInventoryItem,
        editInventoryItem,
        deleteInventoryItem,
        refetch: fetchData,
    };
};