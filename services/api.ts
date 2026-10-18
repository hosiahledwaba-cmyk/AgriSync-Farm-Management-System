import { Field, Planting, Harvest, CropHealthSnapshot, WateringEvent, SoilAnalysis } from '../types';

const FIELDS_KEY = 'agrisync_fields';
const PLANTINGS_KEY = 'agrisync_plantings';
const HARVESTS_KEY = 'agrisync_harvests';
const SNAPSHOTS_KEY = 'agrisync_snapshots';
const WATERING_KEY = 'agrisync_watering';

const initialFields: Field[] = [
    {
        id: 1,
        farm_id: 1,
        name: 'North Field',
        area: 45.5,
        soil_type: 'Loamy Sand',
        latitude: -25.7461,
        longitude: 28.1881,
        notes: 'Main maize cultivation plot with center-pivot irrigation access.',
        soilHistory: [
            { date: '2025-01-10', ph: 6.5, nitrogen: 'Optimal', phosphorus: 'Optimal', potassium: 'Optimal' },
            { date: '2025-05-20', ph: 6.3, nitrogen: 'Slightly Low', phosphorus: 'Optimal', potassium: 'Optimal' },
        ],
    },
    {
        id: 2,
        farm_id: 1,
        name: 'South Paddock',
        area: 32.0,
        soil_type: 'Clay Loam',
        latitude: -25.7520,
        longitude: 28.1920,
        notes: 'High organic matter, suitable for soya and rotation grains.',
        soilHistory: [
            { date: '2025-02-15', ph: 6.8, nitrogen: 'Optimal', phosphorus: 'Optimal', potassium: 'Optimal' },
        ],
    },
    {
        id: 3,
        farm_id: 1,
        name: 'Hillside Patch',
        area: 18.2,
        soil_type: 'Sandy Loam',
        latitude: -25.7410,
        longitude: 28.1820,
        notes: 'Gentle gradient, terraced for erosion control.',
        soilHistory: [
            { date: '2024-11-20', ph: 6.1, nitrogen: 'Optimal', phosphorus: 'Slightly Low', potassium: 'Optimal' },
        ],
    },
    {
        id: 4,
        farm_id: 1,
        name: 'East Slope',
        area: 28.0,
        soil_type: 'Red Clay',
        latitude: -25.7480,
        longitude: 28.2010,
        notes: 'Dedicated to Canola and Sunflower crops.',
        soilHistory: [
            { date: '2025-03-01', ph: 6.4, nitrogen: 'Optimal', phosphorus: 'Optimal', potassium: 'High' },
        ],
    },
];

const initialPlantings: Planting[] = [
    {
        id: 1,
        field_id: 1,
        crop_id: 101,
        crop_name: 'Maize',
        variety: 'PAN 6R-710BR',
        date_planted: '2025-04-15',
        seeds_qty: 1200,
        operator_id: 3,
        area_planted: 45.5,
        watering_schedule: 'Weekly',
        status: 'Active',
        notes: 'Targeting 8 tons/ha yield',
    },
    {
        id: 2,
        field_id: 4,
        crop_id: 102,
        crop_name: 'Canola',
        variety: 'Hyola 559TT',
        date_planted: '2025-05-10',
        seeds_qty: 350,
        operator_id: 9,
        area_planted: 28.0,
        watering_schedule: 'Daily',
        status: 'Active',
        notes: 'Early emergence strong',
    },
    {
        id: 3,
        field_id: 3,
        crop_id: 103,
        crop_name: 'Winter Wheat',
        variety: 'SST 884',
        date_planted: '2024-12-05',
        seeds_qty: 800,
        operator_id: 6,
        area_planted: 18.2,
        watering_schedule: 'Weekly',
        status: 'Harvested',
    },
];

const initialHarvests: Harvest[] = [
    {
        id: 1,
        planting_id: 3,
        field_id: 3,
        crop_id: 103,
        crop_name: 'Winter Wheat',
        date: '2025-06-15',
        weight_kg: 81900,
        moisture_pct: 12.8,
        operator_id: 7,
        notes: 'Grade 1 premium milling quality achieved.',
    },
];

const initialSnapshots: CropHealthSnapshot[] = [
    {
        id: 'snap1',
        field_id: 1,
        planting_id: 1,
        date: '2025-08-01',
        score: 'Good',
        notes: 'Vigor is high, minor nutrient deficiency observed on western edge.',
        recorded_by_id: 3,
    },
    {
        id: 'snap2',
        field_id: 4,
        planting_id: 2,
        date: '2025-08-10',
        score: 'Excellent',
        notes: 'Canola canopy is uniform, no pest damage evident.',
        recorded_by_id: 9,
    },
];

const initialWaterings: WateringEvent[] = [
    {
        id: 'wat1',
        field_id: 1,
        planting_id: 1,
        scheduled_date: '2025-08-16',
        status: 'Scheduled',
        notes: 'Center-pivot cycle 25mm application',
    },
    {
        id: 'wat2',
        field_id: 1,
        planting_id: 1,
        scheduled_date: '2025-08-09',
        status: 'Completed',
        completed_date: '2025-08-09',
        notes: 'Completed without issues',
    },
];

export const getFields = async (): Promise<Field[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(FIELDS_KEY);
    if (!data) {
        localStorage.setItem(FIELDS_KEY, JSON.stringify(initialFields));
        return initialFields;
    }
    return JSON.parse(data);
};

export const getPlantingsForField = async (fieldId: number): Promise<Planting[]> => {
    await new Promise(r => setTimeout(r, 50));
    const data = localStorage.getItem(PLANTINGS_KEY);
    const all: Planting[] = data ? JSON.parse(data) : initialPlantings;
    if (!data) localStorage.setItem(PLANTINGS_KEY, JSON.stringify(initialPlantings));
    return all.filter(p => p.field_id === fieldId);
};

export const getHarvestsForField = async (fieldId: number): Promise<Harvest[]> => {
    await new Promise(r => setTimeout(r, 50));
    const data = localStorage.getItem(HARVESTS_KEY);
    const all: Harvest[] = data ? JSON.parse(data) : initialHarvests;
    if (!data) localStorage.setItem(HARVESTS_KEY, JSON.stringify(initialHarvests));
    return all.filter(h => h.field_id === fieldId);
};

export const getCropHealthSnapshotsForField = async (fieldId: number): Promise<CropHealthSnapshot[]> => {
    await new Promise(r => setTimeout(r, 50));
    const data = localStorage.getItem(SNAPSHOTS_KEY);
    const all: CropHealthSnapshot[] = data ? JSON.parse(data) : initialSnapshots;
    if (!data) localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(initialSnapshots));
    return all.filter(s => s.field_id === fieldId);
};

export const getWateringEventsForField = async (fieldId: number): Promise<WateringEvent[]> => {
    await new Promise(r => setTimeout(r, 50));
    const data = localStorage.getItem(WATERING_KEY);
    const all: WateringEvent[] = data ? JSON.parse(data) : initialWaterings;
    if (!data) localStorage.setItem(WATERING_KEY, JSON.stringify(initialWaterings));
    return all.filter(w => w.field_id === fieldId);
};

export const addField = async (fieldData: Omit<Field, 'id' | 'farm_id'>): Promise<Field> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getFields();
    const newField: Field = {
        ...fieldData,
        id: all.length ? Math.max(...all.map(f => f.id)) + 1 : 1,
        farm_id: 1,
        soilHistory: fieldData.soilHistory || [],
    };
    const updated = [...all, newField];
    localStorage.setItem(FIELDS_KEY, JSON.stringify(updated));
    return newField;
};

export const addPlanting = async (plantingData: any, fieldId?: number): Promise<Planting> => {
    await new Promise(r => setTimeout(r, 150));
    const data = localStorage.getItem(PLANTINGS_KEY);
    const all: Planting[] = data ? JSON.parse(data) : initialPlantings;
    const newPlanting: Planting = {
        operator_id: 1,
        status: 'Active',
        ...plantingData,
        field_id: fieldId !== undefined ? fieldId : plantingData.field_id,
        id: all.length ? Math.max(...all.map(p => p.id)) + 1 : 1,
    };
    const updated = [...all, newPlanting];
    localStorage.setItem(PLANTINGS_KEY, JSON.stringify(updated));
    return newPlanting;
};

export const addHarvest = async (harvestData: any, fieldId?: number, _unitCost?: number): Promise<Harvest> => {
    await new Promise(r => setTimeout(r, 150));
    const data = localStorage.getItem(HARVESTS_KEY);
    const all: Harvest[] = data ? JSON.parse(data) : initialHarvests;
    const newHarvest: Harvest = {
        operator_id: 1,
        ...harvestData,
        field_id: fieldId !== undefined ? fieldId : harvestData.field_id,
        id: all.length ? Math.max(...all.map(h => h.id)) + 1 : 1,
    };
    const updated = [...all, newHarvest];
    localStorage.setItem(HARVESTS_KEY, JSON.stringify(updated));
    return newHarvest;
};

export const addCropHealthSnapshot = async (snapshotData: Omit<CropHealthSnapshot, 'id'>): Promise<CropHealthSnapshot> => {
    await new Promise(r => setTimeout(r, 150));
    const data = localStorage.getItem(SNAPSHOTS_KEY);
    const all: CropHealthSnapshot[] = data ? JSON.parse(data) : initialSnapshots;
    const newSnapshot: CropHealthSnapshot = {
        ...snapshotData,
        id: `snap_${Date.now()}`,
    };
    const updated = [newSnapshot, ...all];
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
    return newSnapshot;
};

export const updateWateringEvent = async (eventId: string, updates: Partial<WateringEvent>): Promise<WateringEvent> => {
    await new Promise(r => setTimeout(r, 150));
    const data = localStorage.getItem(WATERING_KEY);
    const all: WateringEvent[] = data ? JSON.parse(data) : initialWaterings;
    const idx = all.findIndex(w => w.id === eventId);
    if (idx === -1) throw new Error('Watering event not found');
    const updated = { ...all[idx], ...updates };
    all[idx] = updated;
    localStorage.setItem(WATERING_KEY, JSON.stringify(all));
    return updated;
};

export const addSoilAnalysis = async (fieldId: number, analysisData: SoilAnalysis): Promise<Field> => {
    await new Promise(r => setTimeout(r, 150));
    const fields = await getFields();
    const idx = fields.findIndex(f => f.id === fieldId);
    if (idx === -1) throw new Error('Field not found');
    const analysis: SoilAnalysis = {
        date: analysisData.date || new Date().toISOString().split('T')[0],
        ph: analysisData.ph,
        nitrogen: analysisData.nitrogen,
        phosphorus: analysisData.phosphorus,
        potassium: analysisData.potassium,
    };
    fields[idx].soilHistory = [analysis, ...(fields[idx].soilHistory || [])];
    localStorage.setItem(FIELDS_KEY, JSON.stringify(fields));
    return fields[idx];
};
