import { useState, useEffect, useCallback } from 'react';
import { SafetyReport } from '../types';
import * as safetyApi from '../services/safetyApi';

export const useSafetyData = () => {
    const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedReports = await safetyApi.getSafetyReports();
            setSafetyReports(fetchedReports.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
        } catch (err) {
            setError('Failed to fetch safety reports.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addSafetyReport = async (reportData: Omit<SafetyReport, 'id'>) => {
        const newReport = await safetyApi.addSafetyReport(reportData);
        setSafetyReports(prev => [newReport, ...prev].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
        return newReport;
    };
    
    const updateSafetyReport = async (reportId: string, updates: Partial<Omit<SafetyReport, 'id'>>) => {
        const updatedReport = await safetyApi.updateSafetyReport(reportId, updates);
        setSafetyReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
        return updatedReport;
    }

    return {
        safetyReports,
        loading,
        error,
        addSafetyReport,
        updateSafetyReport,
        refetch: fetchData,
    };
};
