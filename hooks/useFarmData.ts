
import { useState, useEffect, useCallback } from 'react';
import { Field, Planting, Harvest, CropHealthSnapshot, WateringEvent, SoilAnalysis } from '../types';
import * as api from '../services/api';

export const useFarmData = () => {
    const [fields, setFields] = useState<Field[]>([]);
    const [plantingsByField, setPlantingsByField] = useState<Record<number, Planting[]>>({});
    const [harvestsByField, setHarvestsByField] = useState<Record<number, Harvest[]>>({});
    const [cropHealthSnapshotsByField, setCropHealthSnapshotsByField] = useState<Record<number, CropHealthSnapshot[]>>({});
    const [wateringEventsByField, setWateringEventsByField] = useState<Record<number, WateringEvent[]>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedFields = await api.getFields();
            setFields(fetchedFields);

            const plantingsPromises = fetchedFields.map(field => api.getPlantingsForField(field.id));
            const harvestsPromises = fetchedFields.map(field => api.getHarvestsForField(field.id));
            const snapshotsPromises = fetchedFields.map(field => api.getCropHealthSnapshotsForField(field.id));
            const wateringsPromises = fetchedFields.map(field => api.getWateringEventsForField(field.id));
            
            const [allPlantingsArrays, allHarvestsArrays, allSnapshotsArrays, allWateringsArrays] = await Promise.all([
                Promise.all(plantingsPromises),
                Promise.all(harvestsPromises),
                Promise.all(snapshotsPromises),
                Promise.all(wateringsPromises),
            ]);

            const plantingsMap: Record<number, Planting[]> = {};
            fetchedFields.forEach((field, index) => {
                plantingsMap[field.id] = allPlantingsArrays[index];
            });
            setPlantingsByField(plantingsMap);
            
            const harvestsMap: Record<number, Harvest[]> = {};
            fetchedFields.forEach((field, index) => {
                harvestsMap[field.id] = allHarvestsArrays[index];
            });
            setHarvestsByField(harvestsMap);

            const snapshotsMap: Record<number, CropHealthSnapshot[]> = {};
            fetchedFields.forEach((field, index) => {
                snapshotsMap[field.id] = allSnapshotsArrays[index];
            });
            setCropHealthSnapshotsByField(snapshotsMap);

            const wateringsMap: Record<number, WateringEvent[]> = {};
            fetchedFields.forEach((field, index) => {
                wateringsMap[field.id] = allWateringsArrays[index];
            });
            setWateringEventsByField(wateringsMap);

        } catch (err) {
            setError('Failed to fetch farm data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addField = async (fieldData: Omit<Field, 'id' | 'farm_id'>) => {
        const newField = await api.addField(fieldData);
        setFields(prev => [...prev, newField]);
        return newField;
    };

    const addPlanting = async (plantingData: Omit<Planting, 'id' | 'operator_id' | 'status'>, fieldId: number) => {
        await api.addPlanting(plantingData, fieldId);
        await fetchData(); // Refetch all data to get new watering events and planting status
    };
    
    const addHarvest = async (harvestData: Omit<Harvest, 'id' | 'operator_id'>, fieldId: number, unitCost?: number) => {
        await api.addHarvest(harvestData, fieldId, unitCost);
        await fetchData(); // Refetch to update planting status
    };

    const addCropHealthSnapshot = async (snapshotData: Omit<CropHealthSnapshot, 'id'>) => {
        const newSnapshot = await api.addCropHealthSnapshot(snapshotData);
        setCropHealthSnapshotsByField(prev => ({
            ...prev,
            [snapshotData.field_id]: [...(prev[snapshotData.field_id] || []), newSnapshot]
        }));
        return newSnapshot;
    };

    const updateWateringEvent = async (eventId: string, fieldId: number, updates: Partial<WateringEvent>) => {
        const updatedEvent = await api.updateWateringEvent(eventId, updates);
        setWateringEventsByField(prev => ({
            ...prev,
            [fieldId]: (prev[fieldId] || []).map(e => e.id === eventId ? updatedEvent : e),
        }));
        return updatedEvent;
    };

    const addSoilAnalysis = async (fieldId: number, analysis: SoilAnalysis) => {
        const updatedField = await api.addSoilAnalysis(fieldId, analysis);
        setFields(prevFields => prevFields.map(f => f.id === fieldId ? updatedField : f));
        return updatedField;
    };


    return {
        fields,
        plantingsByField,
        harvestsByField,
        cropHealthSnapshotsByField,
        wateringEventsByField,
        loading,
        error,
        addField,
        addPlanting,
        addHarvest,
        addCropHealthSnapshot,
        updateWateringEvent,
        addSoilAnalysis,
        refetch: fetchData,
    };
};