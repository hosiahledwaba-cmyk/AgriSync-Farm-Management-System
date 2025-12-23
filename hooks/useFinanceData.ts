import { useState, useEffect, useCallback } from 'react';
import { FinanceTransaction } from '../types';
import * as financeApi from '../services/financeApi';

export const useFinanceData = () => {
    const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedTransactions = await financeApi.getTransactions();
            setTransactions(fetchedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (err) {
            setError('Failed to fetch financial data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addTransaction = async (
        transactionData: Omit<FinanceTransaction, 'id'>,
        createdByUserId: number
    ) => {
        const newTransaction = await financeApi.addTransaction(transactionData, createdByUserId);
        setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        return newTransaction;
    };

    const editTransaction = async (
        transactionId: string,
        updateData: Omit<FinanceTransaction, 'id'>,
        lastModifiedByUserId: number
    ) => {
        const updatedTransaction = await financeApi.editTransaction(transactionId, updateData, lastModifiedByUserId);
        setTransactions(prev => prev.map(t => (t.id === transactionId ? updatedTransaction : t))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        return updatedTransaction;
    };

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const netProfit = totalIncome - totalExpenses;

    return {
        transactions,
        loading,
        error,
        addTransaction,
        editTransaction,
        refetch: fetchData,
        summary: {
            totalIncome,
            totalExpenses,
            netProfit,
        },
    };
};