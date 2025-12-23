import { useState, useEffect, useCallback } from 'react';
import { Sale } from '../types';
import * as salesApi from '../services/salesApi';

export const useSalesData = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedSales = await salesApi.getSales();
            setSales(fetchedSales);
        } catch (err) {
            setError('Failed to fetch sales data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addSale = async (saleData: Omit<Sale, 'id'>) => {
        const newSale = await salesApi.addSale(saleData);
        setSales(prev => [newSale, ...prev].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()));
        return newSale;
    };

    const updateSale = async (saleId: string, updates: Partial<Omit<Sale, 'id'>>) => {
        const updatedSale = await salesApi.updateSale(saleId, updates);
        setSales(prev => prev.map(s => s.id === saleId ? updatedSale : s)
            .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()));
        return updatedSale;
    };

    return {
        sales,
        loading,
        error,
        addSale,
        updateSale,
        refetch: fetchData,
    };
};