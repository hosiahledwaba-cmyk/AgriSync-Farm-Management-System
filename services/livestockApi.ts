import { Livestock, FeedingSchedule, LivestockHealthEvent, WeightLog, ProductionLog, FeedLog, TreatmentLog, LivestockTrackingType, LivestockStatus, LivestockHealthEventType, TaskRecurrence } from '../types';

const LIVESTOCK_KEY = 'agrisync_livestock';
const FEEDING_SCHEDULES_KEY = 'agrisync_feeding_schedules';

const initialLivestock: Livestock[] = [
    {
        id: 'cow1',
        farm_id: 1,
        species: 'Cattle',
        trackingType: LivestockTrackingType.Individual,
        tagId: 'SA-B-101',
        name: 'Bessie',
        breed: 'Boran / Brahman Cross',
        birthDate: '2023-03-12',
        status: LivestockStatus.Active,
        healthHistory: [
            { date: '2025-01-15T09:00:00Z', eventType: LivestockHealthEventType.Vaccination, notes: 'Anthrax and Blackquarter annual booster' },
            { date: '2025-06-10T14:30:00Z', eventType: LivestockHealthEventType.Checkup, notes: 'Routine pregnancy check - confirmed in-calf' },
        ],
        weightHistory: [
            { date: '2025-01-10', weight: 480 },
            { date: '2025-05-15', weight: 510 },
            { date: '2025-08-01', weight: 535 },
        ],
        productionHistory: [
            { date: '2025-08-10', type: 'Milk', quantity: 24, unit: 'liters' },
            { date: '2025-08-11', type: 'Milk', quantity: 25, unit: 'liters' },
            { date: '2025-08-12', type: 'Milk', quantity: 23, unit: 'liters' },
        ],
        feedHistory: [
            { date: '2025-08-14', feedType: 'Lucerne hay & dairy meal', quantity: 15, unit: 'kg' },
        ],
        treatmentHistory: [
            { id: 'treat1', date: '2025-04-10', treatmentType: 'Deworming', description: 'Broad-spectrum drench', administeredById: 3, medication: 'Ivermectin' },
        ],
        iotData: {
            temperature: 38.6,
            activityLevel: 'Normal',
            location: { lat: -25.7461, lon: 28.1881 },
            lastUpdate: new Date().toISOString(),
        },
    },
    {
        id: 'sheep1',
        farm_id: 1,
        species: 'Sheep',
        trackingType: LivestockTrackingType.Group,
        groupName: 'Dorper Flock Alpha',
        count: 85,
        acquisitionDate: '2024-02-01',
        healthHistory: [
            { date: '2025-07-05T08:00:00Z', eventType: LivestockHealthEventType.Treatment, notes: 'Foot rot preventive bath' },
        ],
        feedHistory: [
            { date: '2025-08-14', feedType: 'Pasture grazing & mineral lick', quantity: 50, unit: 'kg' },
        ],
        productionHistory: [
            { date: '2025-06-20', type: 'Wool', quantity: 240, unit: 'kg' },
        ],
    },
    {
        id: 'chicken1',
        farm_id: 1,
        species: 'Poultry',
        trackingType: LivestockTrackingType.Group,
        groupName: 'Layer Flock 1',
        count: 250,
        acquisitionDate: '2024-09-15',
        healthHistory: [],
        productionHistory: [
            { date: '2025-08-14', type: 'Eggs', quantity: 235, unit: 'units' },
            { date: '2025-08-13', type: 'Eggs', quantity: 228, unit: 'units' },
        ],
        feedHistory: [
            { date: '2025-08-14', feedType: 'Layers Mash', quantity: 30, unit: 'kg' },
        ],
    },
];

const initialSchedules: FeedingSchedule[] = [
    {
        id: 'sched1',
        livestockId: 'cow1',
        livestockName: 'Bessie',
        feedType: 'Dairy Meal & Lucerne',
        quantity: 12,
        unit: 'kg',
        recurrence: TaskRecurrence.Daily,
        assigneeId: 3,
    },
    {
        id: 'sched2',
        livestockId: 'chicken1',
        livestockName: 'Layer Flock 1',
        feedType: 'Layers Mash',
        quantity: 30,
        unit: 'kg',
        recurrence: TaskRecurrence.Daily,
        assigneeId: 9,
    },
];

export const getLivestock = async (): Promise<Livestock[]> => {
    await new Promise(res => setTimeout(res, 100));
    const data = localStorage.getItem(LIVESTOCK_KEY);
    if (!data) {
        localStorage.setItem(LIVESTOCK_KEY, JSON.stringify(initialLivestock));
        return initialLivestock;
    }
    return JSON.parse(data);
};

export const getFeedingSchedules = async (): Promise<FeedingSchedule[]> => {
    await new Promise(res => setTimeout(res, 100));
    const data = localStorage.getItem(FEEDING_SCHEDULES_KEY);
    if (!data) {
        localStorage.setItem(FEEDING_SCHEDULES_KEY, JSON.stringify(initialSchedules));
        return initialSchedules;
    }
    return JSON.parse(data);
};

export const addLivestock = async (livestockData: Omit<Livestock, 'id' | 'farm_id' | 'healthHistory'>): Promise<Livestock> => {
    await new Promise(res => setTimeout(res, 150));
    const all = await getLivestock();
    const newAnimal: Livestock = {
        ...livestockData,
        id: `animal_${Date.now()}`,
        farm_id: 1,
        healthHistory: [],
        weightHistory: [],
        productionHistory: [],
        feedHistory: [],
        treatmentHistory: [],
    };
    const updated = [newAnimal, ...all];
    localStorage.setItem(LIVESTOCK_KEY, JSON.stringify(updated));
    return newAnimal;
};

export const addFeedingSchedule = async (scheduleData: Omit<FeedingSchedule, 'id'>): Promise<FeedingSchedule> => {
    await new Promise(res => setTimeout(res, 150));
    const all = await getFeedingSchedules();
    const newSched: FeedingSchedule = {
        ...scheduleData,
        id: `sched_${Date.now()}`,
    };
    const updated = [newSched, ...all];
    localStorage.setItem(FEEDING_SCHEDULES_KEY, JSON.stringify(updated));
    return newSched;
};

export const updateLivestock = async (livestockId: string, updateData: Partial<Omit<Livestock, 'id'>>): Promise<Livestock> => {
    await new Promise(res => setTimeout(res, 150));
    const all = await getLivestock();
    const idx = all.findIndex(a => a.id === livestockId);
    if (idx === -1) throw new Error('Livestock not found');
    const updated = { ...all[idx], ...updateData };
    all[idx] = updated;
    localStorage.setItem(LIVESTOCK_KEY, JSON.stringify(all));
    return updated;
};

export const addHealthEvent = async (livestockId: string, eventData: LivestockHealthEvent): Promise<Livestock> => {
    await new Promise(res => setTimeout(res, 150));
    const all = await getLivestock();
    const idx = all.findIndex(a => a.id === livestockId);
    if (idx === -1) throw new Error('Livestock not found');
    const target = all[idx];
    const updated: Livestock = {
        ...target,
        healthHistory: [eventData, ...(target.healthHistory || [])],
    };
    all[idx] = updated;
    localStorage.setItem(LIVESTOCK_KEY, JSON.stringify(all));
    return updated;
};

export const updateFeedingSchedule = async (scheduleId: string, updateData: Partial<Omit<FeedingSchedule, 'id'>>): Promise<FeedingSchedule> => {
    await new Promise(res => setTimeout(res, 150));
    const all = await getFeedingSchedules();
    const idx = all.findIndex(s => s.id === scheduleId);
    if (idx === -1) throw new Error('Feeding schedule not found');
    const updated = { ...all[idx], ...updateData };
    all[idx] = updated;
    localStorage.setItem(FEEDING_SCHEDULES_KEY, JSON.stringify(all));
    return updated;
};

export const addWeightLog = async (livestockId: string, log: WeightLog): Promise<Livestock> => {
    await new Promise(res => setTimeout(res, 100));
    const all = await getLivestock();
    const idx = all.findIndex(a => a.id === livestockId);
    if (idx === -1) throw new Error('Livestock not found');
    const target = all[idx];
    const updated: Livestock = {
        ...target,
        weightHistory: [...(target.weightHistory || []), log].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
    all[idx] = updated;
    localStorage.setItem(LIVESTOCK_KEY, JSON.stringify(all));
    return updated;
};

export const addProductionLog = async (livestockId: string, log: ProductionLog): Promise<Livestock> => {
    await new Promise(res => setTimeout(res, 100));
    const all = await getLivestock();
    const idx = all.findIndex(a => a.id === livestockId);
    if (idx === -1) throw new Error('Livestock not found');
    const target = all[idx];
    const updated: Livestock = {
        ...target,
        productionHistory: [...(target.productionHistory || []), log].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
    all[idx] = updated;
    localStorage.setItem(LIVESTOCK_KEY, JSON.stringify(all));
    return updated;
};

export const addFeedLog = async (livestockId: string, log: FeedLog): Promise<Livestock> => {
    await new Promise(res => setTimeout(res, 100));
    const all = await getLivestock();
    const idx = all.findIndex(a => a.id === livestockId);
    if (idx === -1) throw new Error('Livestock not found');
    const target = all[idx];
    const updated: Livestock = {
        ...target,
        feedHistory: [...(target.feedHistory || []), log].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
    all[idx] = updated;
    localStorage.setItem(LIVESTOCK_KEY, JSON.stringify(all));
    return updated;
};

export const addTreatmentLog = async (livestockId: string, log: Omit<TreatmentLog, 'id'>): Promise<Livestock> => {
    await new Promise(res => setTimeout(res, 100));
    const all = await getLivestock();
    const idx = all.findIndex(a => a.id === livestockId);
    if (idx === -1) throw new Error('Livestock not found');
    const target = all[idx];
    const fullLog: TreatmentLog = { ...log, id: `treat_${Date.now()}` };
    const updated: Livestock = {
        ...target,
        treatmentHistory: [...(target.treatmentHistory || []), fullLog].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
    all[idx] = updated;
    localStorage.setItem(LIVESTOCK_KEY, JSON.stringify(all));
    return updated;
};
