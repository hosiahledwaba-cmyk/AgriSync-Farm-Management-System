
import React, { useState, useMemo, useEffect } from 'react';
import { Shift, TimeLog, User, Role, TimeLogStatus, ShiftTemplate, EmployeeAvailability } from '../types';
import { useAuth } from '../context/AuthContext';
import { getStartOfWeek } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currency';
import ClockInWidget from './ui/ClockInWidget';
import Button from './ui/Button';
import { CheckCheckIcon, ClockIcon, PencilIcon, UsersIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from './ui/Icon';

interface ShiftManagementDashboardProps {
    shifts: Shift[];
    timeLogs: TimeLog[];
    availability: EmployeeAvailability[];
    clockIn: (userId: number) => void;
    clockOut: (userId: number) => void;
    updateTimeLog: (timeLogId: string, updates: Partial<TimeLog>, notes: string) => void;
    approveTimeLogs: (timeLogIds: string[]) => void;
    onEditTimeLog: (timeLog: TimeLog) => void;
    onUpsertShift: (shift: Shift | { date: string, userId: number | null }) => void;
    onUpdateShift: (shiftId: string, updates: Partial<Shift>) => void;
    templates: ShiftTemplate[];
    onOpenTemplateManager: () => void;
    onSetAvailability: (date: string, availability?: EmployeeAvailability) => void;
}

const ShiftManagementDashboard: React.FC<ShiftManagementDashboardProps> = (props) => {
    const { user, users } = useAuth();
    const isManagerOrOwner = user.role === Role.Owner || user.role === Role.Manager;

    if (isManagerOrOwner) {
        return <ManagerView {...props} user={user} users={users} />;
    } else {
        return <WorkerView {...props} user={user} />;
    }
};

// =================================================================
// Shared Row Component
// =================================================================
const ShiftRow: React.FC<{ shift?: Shift, timeLog?: TimeLog, isManagerView: boolean, onEditTimeLog?: (log: TimeLog) => void }> = ({ shift, timeLog, isManagerView, onEditTimeLog }) => {
    const formatTime = (iso: string | null | undefined) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const formatDate = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

    const getStatusChip = (status: TimeLogStatus) => {
        const styles = {
            [TimeLogStatus.Ongoing]: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
            [TimeLogStatus.Completed]: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
            [TimeLogStatus.Approved]: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
        };
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };

    if (timeLog) {
        const duration = timeLog.clockOut ? ((new Date(timeLog.clockOut).getTime() - new Date(timeLog.clockIn).getTime()) / 3.6e6).toFixed(2) + 'h' : '-';
        return (
            <div className="p-3 bg-muted/50 rounded-md">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{formatDate(timeLog.clockIn)}</p>
                        <p className="text-sm text-muted-foreground">{formatTime(timeLog.clockIn)} - {formatTime(timeLog.clockOut)}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                        <div className="flex flex-col items-end">
                            <span className="font-bold">{duration}</span>
                            {getStatusChip(timeLog.status)}
                        </div>
                        {isManagerView && onEditTimeLog && timeLog.status !== TimeLogStatus.Ongoing && (
                            <Button size="sm" variant="secondary" icon={<PencilIcon/>} onClick={() => onEditTimeLog(timeLog)} />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (shift) {
        return (
             <div className="p-3 bg-muted/50 rounded-md">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{formatDate(shift.start)}</p>
                        <p className="text-sm text-muted-foreground">{formatTime(shift.start)} - {formatTime(shift.end)}</p>
                    </div>
                    {shift.notes && <p className="text-sm italic text-muted-foreground self-center">"{shift.notes}"</p>}
                </div>
            </div>
        );
    }
    
    return null;
};


// =================================================================
// Worker/Accountant View
// =================================================================
interface WorkerViewProps {
    timeLogs: TimeLog[];
    shifts: Shift[];
    user: User;
    clockIn: (userId: number) => void;
    clockOut: (userId: number) => void;
}
const WorkerView: React.FC<WorkerViewProps> = ({ timeLogs, shifts, user, clockIn, clockOut }) => {
    const startOfWeek = useMemo(() => getStartOfWeek(new Date()), []);
    
    const { currentWeekShifts, currentWeekTimeLogs, totalHours, estimatedPay } = useMemo(() => {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const currentWeekShifts = shifts
            .filter(s => s.userId === user.id && new Date(s.start) >= startOfWeek && new Date(s.start) < endOfWeek)
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        const currentWeekTimeLogs = timeLogs
            .filter(s => s.userId === user.id && new Date(s.clockIn) >= startOfWeek)
            .sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime());

        const totalHours = currentWeekTimeLogs.reduce((sum, s) => {
            if (s.clockOut) {
                const duration = (new Date(s.clockOut).getTime() - new Date(s.clockIn).getTime()) / (1000 * 60 * 60);
                return sum + duration;
            }
            return sum;
        }, 0);

        const estimatedPay = totalHours * (user.wageRate || 0);

        return { currentWeekShifts, currentWeekTimeLogs, totalHours, estimatedPay };
    }, [timeLogs, shifts, user, startOfWeek]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">My Shifts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <ClockInWidget timeLogs={timeLogs} userId={user.id} clockIn={() => clockIn(user.id)} clockOut={() => clockOut(user.id)} />
                </div>
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <p className="text-sm font-medium text-muted-foreground">Hours This Week</p>
                    <p className="text-3xl font-bold text-foreground">{totalHours.toFixed(2)}</p>
                </div>
                 <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <p className="text-sm font-medium text-muted-foreground">Estimated Gross Pay (Week)</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(estimatedPay)}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Upcoming Shifts</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {currentWeekShifts.length > 0 ? (
                            currentWeekShifts.map(shift => <ShiftRow key={shift.id} shift={shift} isManagerView={false} />)
                        ) : (
                            <p className="text-center text-muted-foreground py-4">No upcoming shifts scheduled for this week.</p>
                        )}
                    </div>
                </div>
                <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Recent Time Logs</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {currentWeekTimeLogs.map(log => <ShiftRow key={log.id} timeLog={log} isManagerView={false} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

// =================================================================
// Manager/Owner View
// =================================================================
interface ManagerViewProps extends ShiftManagementDashboardProps {
    users: User[];
    user: User;
}

const ManagerView: React.FC<ManagerViewProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'scheduler' | 'approvals'>('scheduler');
    const { user, users } = props;
    const subordinates = users.filter(u => u.id !== user.id && u.role !== Role.Owner);

    return (
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-foreground">Shift Management</h2>
                 <div className="border-b border-border">
                    <nav className="-mb-px flex gap-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('scheduler')} className={`px-3 py-2 font-semibold text-sm rounded-t-md transition-colors ${activeTab === 'scheduler' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-accent-foreground'}`}>Scheduler</button>
                        <button onClick={() => setActiveTab('approvals')} className={`px-3 py-2 font-semibold text-sm rounded-t-md transition-colors ${activeTab === 'approvals' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-accent-foreground'}`}>Timesheet Approvals</button>
                    </nav>
                </div>
            </div>
            {activeTab === 'scheduler' && <SchedulerView {...props} subordinates={subordinates} />}
            {activeTab === 'approvals' && <TimesheetApprovals {...props} subordinates={subordinates} />}
        </div>
    );
};


const SchedulerView: React.FC<ManagerViewProps & {subordinates: User[]}> = ({ shifts, subordinates, onUpsertShift, onUpdateShift, onOpenTemplateManager }) => {
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
    };
    
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
                className={`p-1.5 rounded bg-blue-500/10 border border-blue-500/30 cursor-grab active:cursor-grabbing hover:bg-blue-500/20 transition-all text-left ${isDragging ? 'opacity-30' : ''}`}
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
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={onOpenTemplateManager}>Templates</Button>
                    <Button variant="secondary" onClick={() => changeWeek('next')} icon={<ChevronRightIcon className="order-2 ml-2"/>}>Next Week</Button>
                </div>
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
                    {subordinates.map(user => (
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


const TimesheetApprovals: React.FC<ManagerViewProps & {subordinates: User[]}> = ({ timeLogs, subordinates, onEditTimeLog, approveTimeLogs }) => {
    const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
    
    const usersById = useMemo(() => subordinates.reduce((acc, u) => ({...acc, [u.id]: u}), {} as Record<number,User>), [subordinates]);

    const logsToApprove = useMemo(() => {
        const subordinateIds = new Set(subordinates.map(u => u.id));
        return timeLogs
            .filter(log => log.status === TimeLogStatus.Completed && subordinateIds.has(log.userId))
            .sort((a,b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime());
    }, [timeLogs, subordinates]);
    
    const toggleLogSelection = (logId: string) => {
        setSelectedLogs(prev => prev.includes(logId) ? prev.filter(id => id !== logId) : [...prev, logId]);
    };

    const handleApproveSelected = () => {
        if (selectedLogs.length > 0) {
            approveTimeLogs(selectedLogs);
            setSelectedLogs([]);
        }
    };
    
    const selectAll = () => {
        if (selectedLogs.length === logsToApprove.length) {
            setSelectedLogs([]);
        } else {
            setSelectedLogs(logsToApprove.map(log => log.id));
        }
    };

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-foreground">Timesheet Approvals</h3>
                <Button onClick={handleApproveSelected} disabled={selectedLogs.length === 0} icon={<CheckCheckIcon/>}>
                    Approve Selected ({selectedLogs.length})
                </Button>
            </div>
            {logsToApprove.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="p-2"><input type="checkbox" onChange={selectAll} checked={selectedLogs.length === logsToApprove.length && logsToApprove.length > 0} /></th>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Clock In</th>
                                <th className="px-4 py-3">Clock Out</th>
                                <th className="px-4 py-3 text-right">Duration</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logsToApprove.map(log => {
                                const duration = log.clockOut ? ((new Date(log.clockOut).getTime() - new Date(log.clockIn).getTime()) / 3.6e6) : 0;
                                return (
                                <tr key={log.id} className="border-b border-border hover:bg-accent">
                                    <td className="p-2"><input type="checkbox" checked={selectedLogs.includes(log.id)} onChange={() => toggleLogSelection(log.id)} /></td>
                                    <td className="px-4 py-2 font-medium">{usersById[log.userId]?.name}</td>
                                    <td className="px-4 py-2">{new Date(log.clockIn).toLocaleDateString()}</td>
                                    <td className="px-4 py-2">{new Date(log.clockIn).toLocaleTimeString()}</td>
                                    <td className="px-4 py-2">{log.clockOut ? new Date(log.clockOut).toLocaleTimeString() : '...'}</td>
                                    <td className="px-4 py-2 text-right font-semibold">{duration.toFixed(2)}h</td>
                                    <td className="px-4 py-2 text-center">
                                        <Button size="sm" variant="secondary" icon={<PencilIcon/>} onClick={() => onEditTimeLog(log)}>Edit</Button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            ) : (
                 <p className="text-center text-muted-foreground py-12">No timesheets are currently pending approval.</p>
            )}
        </div>
    );
};

export default ShiftManagementDashboard;
