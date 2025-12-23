import React, { useState, useMemo } from 'react';
import { Shift, TimeLog, User, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { getStartOfWeek } from '../utils/dateUtils';
import Button from './ui/Button';
import { ChevronLeftIcon, ChevronRightIcon, UsersIcon, BarChartIcon, PlusIcon } from './ui/Icon';
import ShiftHistoryModal from './modals/ShiftHistoryModal';
import KPICard from './ui/KPICard';

interface TeamAnalyticsDashboardProps {
    users: User[];
    shifts: Shift[];
    timeLogs: TimeLog[];
    onUpdateShift: (shiftId: string, updates: Partial<Shift>) => void;
    onUpsertShift: (shift: Shift | { date: string, userId: number | null }) => void;
}

type Tab = 'roster' | 'performance';

const TeamAnalyticsDashboard: React.FC<TeamAnalyticsDashboardProps> = ({ users, shifts, timeLogs, onUpdateShift, onUpsertShift }) => {
    const [activeTab, setActiveTab] = useState<Tab>('roster');
    const { user: currentUser } = useAuth();
    
    // Filter out the owner and the current manager from the list of employees to display
    const employees = users.filter(u => u.role !== Role.Owner);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-foreground">Team Analytics</h2>
                <div className="border-b border-border">
                    <nav className="-mb-px flex gap-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('roster')} className={`flex items-center gap-2 px-3 py-2 font-semibold text-sm rounded-t-md transition-colors ${activeTab === 'roster' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-accent-foreground'}`}>
                            <UsersIcon className="h-5 w-5" /> Shift Roster
                        </button>
                        <button onClick={() => setActiveTab('performance')} className={`flex items-center gap-2 px-3 py-2 font-semibold text-sm rounded-t-md transition-colors ${activeTab === 'performance' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-accent-foreground'}`}>
                            <BarChartIcon className="h-5 w-5" /> Performance
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'roster' && <ShiftRosterView shifts={shifts} employees={employees} onUpdateShift={onUpdateShift} onUpsertShift={onUpsertShift} />}
            {activeTab === 'performance' && <PerformanceAnalyticsView shifts={shifts} timeLogs={timeLogs} employees={employees} />}
        </div>
    );
};

// =================================================================
// Shift Roster View
// =================================================================
const ShiftRosterView: React.FC<{ 
    shifts: Shift[]; 
    employees: User[];
    onUpdateShift: (shiftId: string, updates: Partial<Shift>) => void;
    onUpsertShift: (shift: Shift | { date: string, userId: number | null }) => void;
}> = ({ shifts, employees, onUpdateShift, onUpsertShift }) => {
    const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
    const [draggedShiftId, setDraggedShiftId] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<{ userId: number; date: string } | null>(null);

    const changeWeek = (direction: 'prev' | 'next') => {
        setWeekStart(current => {
            const newDate = new Date(current);
            newDate.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    };

    const handleDrop = (e: React.DragEvent, newUserId: number, newDateStr: string) => {
        e.preventDefault();
        const shiftId = e.dataTransfer.getData('shiftId');
        if (!shiftId) return;

        const originalShift = shifts.find(s => s.id === shiftId);
        if (!originalShift) return;
        
        const originalDateStr = new Date(originalShift.start).toISOString().split('T')[0];
        if (originalShift.userId === newUserId && originalDateStr === newDateStr) {
            handleDragEnd();
            return;
        }

        const originalStartDate = new Date(originalShift.start);
        const originalEndDate = new Date(originalShift.end);
        
        const newDate = new Date(newDateStr + 'T00:00:00Z');
        
        const newStart = new Date(newDate);
        newStart.setUTCHours(originalStartDate.getUTCHours(), originalStartDate.getUTCMinutes(), originalStartDate.getUTCSeconds());

        const newEnd = new Date(newDate);
        newEnd.setUTCHours(originalEndDate.getUTCHours(), originalEndDate.getUTCMinutes(), originalEndDate.getUTCSeconds());

        onUpdateShift(shiftId, {
            userId: newUserId,
            start: newStart.toISOString(),
            end: newEnd.toISOString(),
        });

        handleDragEnd();
    };

    const handleDragStart = (e: React.DragEvent, shiftId: string) => {
        e.dataTransfer.setData('shiftId', shiftId);
        setDraggedShiftId(shiftId);
    };
    
    const handleDragEnd = () => {
        setDraggedShiftId(null);
        setDropTarget(null);
    }

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        return date;
    });

    const RosterShiftBlock: React.FC<{ shift: Shift, onUpsertShift: (shift: Shift) => void, onDragStart: (e: React.DragEvent) => void, onDragEnd: () => void, isDragging: boolean }> = ({ shift, onUpsertShift, onDragStart, onDragEnd, isDragging }) => {
        const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        
        return (
            <div 
                draggable="true"
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onClick={(e) => { e.stopPropagation(); onUpsertShift(shift); }} 
                className={`p-1.5 rounded bg-blue-500/10 border border-blue-500/30 cursor-grab active:cursor-grabbing hover:bg-blue-500/20 transition-all ${isDragging ? 'opacity-30 ring-2 ring-primary ring-offset-background' : ''}`}
            >
                <p className="font-bold text-xs text-blue-800 dark:text-blue-200">{formatTime(shift.start)} - {formatTime(shift.end)}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 truncate">{shift.notes || 'General Shift'}</p>
            </div>
        )
    };

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <Button variant="secondary" onClick={() => changeWeek('prev')} icon={<ChevronLeftIcon />}>Prev Week</Button>
                <h3 className="text-xl font-semibold text-foreground text-center">
                    Week of {weekStart.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                </h3>
                <Button variant="secondary" onClick={() => changeWeek('next')} icon={<ChevronRightIcon className="order-2 ml-2"/>}>Next Week</Button>
            </div>
            <div className="overflow-x-auto">
                <div className="grid grid-cols-[150px_repeat(7,minmax(150px,1fr))] gap-px bg-border text-sm">
                    {/* Header */}
                    <div className="bg-muted p-2 font-semibold sticky left-0 z-10">Employee</div>
                    {weekDays.map(day => (
                        <div key={day.toISOString()} className="bg-muted p-2 text-center font-semibold">
                            {day.toLocaleDateString(undefined, { weekday: 'short' })}
                            <span className="block text-xs font-normal text-muted-foreground">{day.getDate()}</span>
                        </div>
                    ))}
                    {/* Rows */}
                    {employees.map(user => (
                        <React.Fragment key={user.id}>
                            <div className="bg-card p-2 font-semibold sticky left-0 z-10 flex items-center">{user.name}</div>
                            {weekDays.map(day => {
                                const dayStr = day.toISOString().split('T')[0];
                                const userShifts = shifts.filter(s => s.userId === user.id && s.start.startsWith(dayStr));
                                return (
                                    <div 
                                        key={dayStr}
                                        className={`p-1 min-h-[80px] space-y-1 relative group transition-colors ${dropTarget?.userId === user.id && dropTarget?.date === dayStr ? 'bg-primary/10' : 'bg-card'}`}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDragEnter={() => setDropTarget({ userId: user.id, date: dayStr })}
                                        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { setDropTarget(null); }}}
                                        onDrop={(e) => handleDrop(e, user.id, dayStr)}
                                    >
                                        {userShifts.map(shift => (
                                            <RosterShiftBlock 
                                                key={shift.id} 
                                                shift={shift} 
                                                onUpsertShift={() => onUpsertShift(shift)}
                                                onDragStart={(e) => handleDragStart(e, shift.id)}
                                                onDragEnd={handleDragEnd}
                                                isDragging={draggedShiftId === shift.id}
                                            />
                                        ))}
                                        {userShifts.length === 0 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onUpsertShift({ date: dayStr, userId: user.id }) }}
                                                className="absolute inset-0 flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <PlusIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};


// =================================================================
// Performance Analytics View
// =================================================================
type DateRange = 'week' | 'month';

const PerformanceAnalyticsView: React.FC<{ shifts: Shift[]; timeLogs: TimeLog[]; employees: User[] }> = ({ shifts, timeLogs, employees }) => {
    const [dateRange, setDateRange] = useState<DateRange>('week');
    const [historyUser, setHistoryUser] = useState<User | null>(null);

    const { startDate, endDate } = useMemo(() => {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        let start;
        if (dateRange === 'week') {
            start = getStartOfWeek(new Date());
        } else { // month
            start = new Date();
            start.setDate(start.getDate() - 30);
        }
        start.setHours(0, 0, 0, 0);
        return { startDate: start, endDate: end };
    }, [dateRange]);

    const performanceData = useMemo(() => {
        return employees.map(user => {
            const userShifts = shifts.filter(s => s.userId === user.id && new Date(s.start) >= startDate && new Date(s.start) <= endDate);
            const userTimeLogs = timeLogs.filter(tl => tl.userId === user.id && new Date(tl.clockIn) >= startDate && new Date(tl.clockIn) <= endDate);

            const scheduledHours = userShifts.reduce((total, shift) => total + (new Date(shift.end).getTime() - new Date(shift.start).getTime()) / 3.6e6, 0);
            const workedHours = userTimeLogs.reduce((total, log) => log.clockOut ? total + (new Date(log.clockOut).getTime() - new Date(log.clockIn).getTime()) / 3.6e6 : total, 0);
            
            let totalPunctualityMinutes = 0;
            let punctualShiftsCount = 0;
            let missedShifts = 0;

            userShifts.forEach(shift => {
                const associatedLog = userTimeLogs.find(log => Math.abs(new Date(log.clockIn).getTime() - new Date(shift.start).getTime()) < 3.6e6);
                if (associatedLog) {
                    const diffMinutes = (new Date(associatedLog.clockIn).getTime() - new Date(shift.start).getTime()) / 60000;
                    totalPunctualityMinutes += diffMinutes;
                    punctualShiftsCount++;
                } else if (new Date(shift.start) < new Date()) {
                    missedShifts++;
                }
            });

            const avgPunctuality = punctualShiftsCount > 0 ? totalPunctualityMinutes / punctualShiftsCount : 0;
            const overtime = Math.max(0, workedHours - scheduledHours);

            return { userId: user.id, name: user.name, scheduledHours, workedHours, avgPunctuality, overtime, missedShifts };
        }).sort((a,b) => (b.workedHours - a.workedHours));
    }, [employees, shifts, timeLogs, startDate, endDate]);

    return (
        <>
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Employee Performance</h3>
                <div className="flex gap-2">
                    <Button size="sm" variant={dateRange === 'week' ? 'primary' : 'secondary'} onClick={() => setDateRange('week')}>This Week</Button>
                    <Button size="sm" variant={dateRange === 'month' ? 'primary' : 'secondary'} onClick={() => setDateRange('month')}>Last 30 Days</Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                            <th className="px-6 py-3">Employee</th>
                            <th className="px-6 py-3 text-right">Scheduled</th>
                            <th className="px-6 py-3 text-right">Worked</th>
                            <th className="px-6 py-3 text-right">Overtime</th>
                            <th className="px-6 py-3 text-right">Punctuality (Avg)</th>
                            <th className="px-6 py-3 text-right">Missed Shifts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {performanceData.map(data => (
                            <tr key={data.userId} onClick={() => setHistoryUser(employees.find(e => e.id === data.userId)!)} className="bg-card border-b border-border hover:bg-accent cursor-pointer">
                                <td className="px-6 py-4 font-medium text-foreground">{data.name}</td>
                                <td className="px-6 py-4 text-right text-foreground">{data.scheduledHours.toFixed(2)}h</td>
                                <td className="px-6 py-4 text-right font-semibold text-foreground">{data.workedHours.toFixed(2)}h</td>
                                <td className="px-6 py-4 text-right text-foreground">{data.overtime.toFixed(2)}h</td>
                                <td className={`px-6 py-4 text-right font-semibold ${data.avgPunctuality > 5 ? 'text-red-500' : data.avgPunctuality < -5 ? 'text-green-500' : 'text-foreground'}`}>
                                    {data.avgPunctuality > 0 ? '+' : ''}{data.avgPunctuality.toFixed(1)} min
                                </td>
                                <td className={`px-6 py-4 text-right font-semibold ${data.missedShifts > 0 ? 'text-red-500' : 'text-foreground'}`}>{data.missedShifts}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        {historyUser && (
            <ShiftHistoryModal 
                isOpen={!!historyUser}
                onClose={() => setHistoryUser(null)}
                user={historyUser}
                shifts={shifts}
                timeLogs={timeLogs}
                dateRange={{ start: startDate, end: endDate }}
            />
        )}
        </>
    );
};


export default TeamAnalyticsDashboard;
