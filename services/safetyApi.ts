import { SafetyReport, SafetyReportType, SafetySeverity, SafetyStatus } from '../types';

const SAFETY_KEY = 'agrisync_safety_reports';

const initialReports: SafetyReport[] = [
    {
        id: 'sr1',
        type: SafetyReportType.Hazard,
        location: 'Workshop electrical distribution panel',
        dateTime: '2025-08-10T11:00:00Z',
        description: 'Exposed grounding wire near washing station. Tripping / electric shock hazard.',
        severity: SafetySeverity.Medium,
        reportedById: 3,
        status: SafetyStatus.Open,
        actionsTaken: 'Panel isolated and warning signage posted.',
    },
    {
        id: 'sr2',
        type: SafetyReportType.NearMiss,
        location: 'Chemical Storage Shed',
        dateTime: '2025-08-03T14:20:00Z',
        description: 'Spill tray was dry when transferring pesticide concentrate. No leak occurred but tray required cleaning.',
        severity: SafetySeverity.Low,
        reportedById: 8,
        status: SafetyStatus.Resolved,
        actionsTaken: 'Secondary containment tray repositioned and inspected.',
        resolvedById: 2,
        resolvedAt: '2025-08-04T09:00:00Z',
    },
];

export const getSafetyReports = async (): Promise<SafetyReport[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(SAFETY_KEY);
    if (!data) {
        localStorage.setItem(SAFETY_KEY, JSON.stringify(initialReports));
        return initialReports;
    }
    return JSON.parse(data);
};

export const addSafetyReport = async (reportData: Omit<SafetyReport, 'id'>): Promise<SafetyReport> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getSafetyReports();
    const newReport: SafetyReport = {
        ...reportData,
        id: `sr_${Date.now()}`,
    };
    const updated = [newReport, ...all];
    localStorage.setItem(SAFETY_KEY, JSON.stringify(updated));
    return newReport;
};

export const updateSafetyReport = async (
    reportId: string,
    updates: Partial<Omit<SafetyReport, 'id'>>
): Promise<SafetyReport> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getSafetyReports();
    const idx = all.findIndex(r => r.id === reportId);
    if (idx === -1) throw new Error('Safety report not found');
    const updated = { ...all[idx], ...updates };
    all[idx] = updated;
    localStorage.setItem(SAFETY_KEY, JSON.stringify(all));
    return updated;
};
