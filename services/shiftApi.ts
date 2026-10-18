import { Shift, TimeLog, ShiftTemplate, EmployeeAvailability, TimeLogStatus, AvailabilityStatus } from '../types';

const SHIFTS_KEY = 'agrisync_shifts';
const TIME_LOGS_KEY = 'agrisync_time_logs';
const SHIFT_TEMPLATES_KEY = 'agrisync_shift_templates';
const AVAILABILITY_KEY = 'agrisync_availability';

const initialTemplates: ShiftTemplate[] = [
    { id: 'tpl1', name: 'Early Morning Milking & Feeding', startTime: '05:30', endTime: '13:30', notes: 'Includes dairy hygiene checklist' },
    { id: 'tpl2', name: 'General Field Day Shift', startTime: '07:00', endTime: '16:00', notes: '1 hour lunch break' },
    { id: 'tpl3', name: 'Evening Livestock & Security Check', startTime: '14:00', endTime: '21:00', notes: 'Lock up perimeter and coops' },
];

const initialShifts: Shift[] = [
    {
        id: 'shift1',
        userId: 3,
        start: '2025-08-15T07:00:00Z',
        end: '2025-08-15T16:00:00Z',
        notes: 'North Field topdressing with Bob',
    },
    {
        id: 'shift2',
        userId: 9,
        start: '2025-08-15T05:30:00Z',
        end: '2025-08-15T13:30:00Z',
        notes: 'Dairy milking and feed prep',
    },
    {
        id: 'shift3',
        userId: 8,
        start: '2025-08-16T07:00:00Z',
        end: '2025-08-16T16:00:00Z',
        notes: 'Dorper sheep flock health check',
    },
];

const initialTimeLogs: TimeLog[] = [
    {
        id: 'tl1',
        userId: 3,
        shiftId: 'shift1',
        clockIn: '2025-08-15T06:55:00Z',
        clockOut: null,
        status: TimeLogStatus.Ongoing,
    },
    {
        id: 'tl2',
        userId: 9,
        shiftId: 'shift2',
        clockIn: '2025-08-14T05:28:00Z',
        clockOut: '2025-08-14T13:32:00Z',
        status: TimeLogStatus.Approved,
        editedById: 2,
    },
];

const initialAvailability: EmployeeAvailability[] = [
    { id: 'av1', userId: 3, date: '2025-08-15', status: AvailabilityStatus.Available },
    { id: 'av2', userId: 8, date: '2025-08-17', status: AvailabilityStatus.Unavailable },
];

export const getScheduledShifts = async (): Promise<Shift[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(SHIFTS_KEY);
    if (!data) {
        localStorage.setItem(SHIFTS_KEY, JSON.stringify(initialShifts));
        return initialShifts;
    }
    return JSON.parse(data);
};

export const getTimeLogs = async (): Promise<TimeLog[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(TIME_LOGS_KEY);
    if (!data) {
        localStorage.setItem(TIME_LOGS_KEY, JSON.stringify(initialTimeLogs));
        return initialTimeLogs;
    }
    return JSON.parse(data);
};

export const getShiftTemplates = async (): Promise<ShiftTemplate[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(SHIFT_TEMPLATES_KEY);
    if (!data) {
        localStorage.setItem(SHIFT_TEMPLATES_KEY, JSON.stringify(initialTemplates));
        return initialTemplates;
    }
    return JSON.parse(data);
};

export const getAvailability = async (): Promise<EmployeeAvailability[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(AVAILABILITY_KEY);
    if (!data) {
        localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(initialAvailability));
        return initialAvailability;
    }
    return JSON.parse(data);
};

export const startTimeLog = async (userId: number): Promise<TimeLog> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getTimeLogs();
    const ongoing = all.find(t => t.userId === userId && !t.clockOut);
    if (ongoing) throw new Error('User already has an ongoing clocked-in session.');

    const newLog: TimeLog = {
        id: `tl_${Date.now()}`,
        userId,
        clockIn: new Date().toISOString(),
        clockOut: null,
        status: TimeLogStatus.Ongoing,
    };
    const updated = [newLog, ...all];
    localStorage.setItem(TIME_LOGS_KEY, JSON.stringify(updated));
    return newLog;
};

export const endTimeLog = async (userId: number): Promise<TimeLog> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getTimeLogs();
    const idx = all.findIndex(t => t.userId === userId && !t.clockOut);
    if (idx === -1) throw new Error('No active clocked-in session found.');

    const updatedLog: TimeLog = {
        ...all[idx],
        clockOut: new Date().toISOString(),
        status: TimeLogStatus.Completed,
    };
    all[idx] = updatedLog;
    localStorage.setItem(TIME_LOGS_KEY, JSON.stringify(all));
    return updatedLog;
};

export const updateTimeLog = async (
    timeLogId: string,
    updates: Partial<TimeLog>,
    editorId: number
): Promise<TimeLog> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getTimeLogs();
    const idx = all.findIndex(t => t.id === timeLogId);
    if (idx === -1) throw new Error('Time log not found');

    const updatedLog: TimeLog = {
        ...all[idx],
        ...updates,
        editedById: editorId,
    };
    all[idx] = updatedLog;
    localStorage.setItem(TIME_LOGS_KEY, JSON.stringify(all));
    return updatedLog;
};

export const approveTimeLogs = async (timeLogIds: string[], approverId: number): Promise<TimeLog[]> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getTimeLogs();
    const updatedLogs: TimeLog[] = [];

    const updatedAll = all.map(log => {
        if (timeLogIds.includes(log.id)) {
            const approved = {
                ...log,
                status: TimeLogStatus.Approved,
                editedById: approverId,
            };
            updatedLogs.push(approved);
            return approved;
        }
        return log;
    });

    localStorage.setItem(TIME_LOGS_KEY, JSON.stringify(updatedAll));
    return updatedLogs;
};

export const addScheduledShift = async (shiftData: Omit<Shift, 'id'>): Promise<Shift> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getScheduledShifts();
    const newShift: Shift = {
        ...shiftData,
        id: `shift_${Date.now()}`,
    };
    const updated = [newShift, ...all];
    localStorage.setItem(SHIFTS_KEY, JSON.stringify(updated));
    return newShift;
};

export const addScheduledShifts = async (shiftsData: Omit<Shift, 'id'>[]): Promise<Shift[]> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getScheduledShifts();
    const newShifts: Shift[] = shiftsData.map((s, idx) => ({
        ...s,
        id: `shift_${Date.now()}_${idx}`,
    }));
    const updated = [...newShifts, ...all];
    localStorage.setItem(SHIFTS_KEY, JSON.stringify(updated));
    return newShifts;
};

export const updateScheduledShift = async (shiftId: string, updates: Partial<Omit<Shift, 'id'>>): Promise<Shift> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getScheduledShifts();
    const idx = all.findIndex(s => s.id === shiftId);
    if (idx === -1) throw new Error('Shift not found');
    const updated = { ...all[idx], ...updates };
    all[idx] = updated;
    localStorage.setItem(SHIFTS_KEY, JSON.stringify(all));
    return updated;
};

export const deleteScheduledShift = async (shiftId: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getScheduledShifts();
    const filtered = all.filter(s => s.id !== shiftId);
    localStorage.setItem(SHIFTS_KEY, JSON.stringify(filtered));
};

export const addShiftTemplate = async (templateData: Omit<ShiftTemplate, 'id'>): Promise<ShiftTemplate> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getShiftTemplates();
    const newTpl: ShiftTemplate = {
        ...templateData,
        id: `tpl_${Date.now()}`,
    };
    const updated = [newTpl, ...all];
    localStorage.setItem(SHIFT_TEMPLATES_KEY, JSON.stringify(updated));
    return newTpl;
};

export const updateShiftTemplate = async (templateId: string, updates: Partial<Omit<ShiftTemplate, 'id'>>): Promise<ShiftTemplate> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getShiftTemplates();
    const idx = all.findIndex(t => t.id === templateId);
    if (idx === -1) throw new Error('Template not found');
    const updated = { ...all[idx], ...updates };
    all[idx] = updated;
    localStorage.setItem(SHIFT_TEMPLATES_KEY, JSON.stringify(all));
    return updated;
};

export const deleteShiftTemplate = async (templateId: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getShiftTemplates();
    const filtered = all.filter(t => t.id !== templateId);
    localStorage.setItem(SHIFT_TEMPLATES_KEY, JSON.stringify(filtered));
};

export const upsertAvailability = async (availabilityData: Omit<EmployeeAvailability, 'id'>): Promise<EmployeeAvailability> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getAvailability();
    const idx = all.findIndex(a => a.userId === availabilityData.userId && a.date === availabilityData.date);
    let result: EmployeeAvailability;
    if (idx !== -1) {
        result = { ...all[idx], status: availabilityData.status };
        all[idx] = result;
    } else {
        result = { ...availabilityData, id: `av_${Date.now()}` };
        all.push(result);
    }
    localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(all));
    return result;
};

export const deleteAvailability = async (availabilityId: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getAvailability();
    const filtered = all.filter(a => a.id !== availabilityId);
    localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(filtered));
};
