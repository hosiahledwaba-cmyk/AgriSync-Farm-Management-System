import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import { User, Shift, TimeLog, TimeLogStatus } from '../../types';

interface ShiftHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    shifts: Shift[];
    timeLogs: TimeLog[];
    dateRange: { start: Date, end: Date };
}

const ShiftHistoryModal: React.FC<ShiftHistoryModalProps> = ({ isOpen, onClose, user, shifts, timeLogs, dateRange }) => {

    const historyData = useMemo(() => {
        const userShifts = shifts.filter(s => s.userId === user.id && new Date(s.start) >= dateRange.start && new Date(s.start) <= dateRange.end);
        const userTimeLogs = timeLogs.filter(tl => tl.userId === user.id && new Date(tl.clockIn) >= dateRange.start && new Date(tl.clockIn) <= dateRange.end);
        
        const allEvents = new Map<string, { shift?: Shift, log?: TimeLog }>();

        // Add all shifts to the map
        userShifts.forEach(shift => {
            const dateKey = new Date(shift.start).toISOString().split('T')[0];
            allEvents.set(dateKey, { ...allEvents.get(dateKey), shift });
        });

        // Add all time logs, associating with a shift if possible
        userTimeLogs.forEach(log => {
            const dateKey = new Date(log.clockIn).toISOString().split('T')[0];
            const existing = allEvents.get(dateKey);
            if (existing) {
                allEvents.set(dateKey, { ...existing, log });
            } else {
                 allEvents.set(dateKey, { log });
            }
        });

        return Array.from(allEvents.entries())
            .map(([date, { shift, log }]) => ({ date, shift, log }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    }, [user, shifts, timeLogs, dateRange]);

    const formatTime = (iso: string | null | undefined) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const formatDate = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

    const getStatusChip = (status: TimeLogStatus) => {
        const styles = {
            [TimeLogStatus.Ongoing]: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
            [TimeLogStatus.Completed]: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
            [TimeLogStatus.Approved]: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
        };
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Shift History for ${user.name}`}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {historyData.length > 0 ? historyData.map(({ date, shift, log }) => {
                    const scheduledHours = shift ? (new Date(shift.end).getTime() - new Date(shift.start).getTime()) / 3.6e6 : null;
                    const workedHours = log?.clockOut ? (new Date(log.clockOut).getTime() - new Date(log.clockIn).getTime()) / 3.6e6 : null;
                    const discrepancy = scheduledHours !== null && workedHours !== null ? workedHours - scheduledHours : null;

                    return (
                        <div key={date} className="p-4 bg-muted/50 rounded-lg border border-border">
                            <h4 className="font-bold">{formatDate(date)}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-2 mt-2 text-sm">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground">Scheduled</p>
                                    <p>{shift ? `${formatTime(shift.start)} - ${formatTime(shift.end)}` : 'Not Scheduled'}</p>
                                    {scheduledHours !== null && <p className="text-xs text-muted-foreground">({scheduledHours.toFixed(2)}h)</p>}
                                </div>
                                 <div>
                                    <p className="text-xs font-semibold text-muted-foreground">Actual</p>
                                    <p>{log ? `${formatTime(log.clockIn)} - ${formatTime(log.clockOut)}` : 'Not Clocked'}</p>
                                    {workedHours !== null && <p className="text-xs text-muted-foreground">({workedHours.toFixed(2)}h)</p>}
                                </div>
                                 <div>
                                    <p className="text-xs font-semibold text-muted-foreground">Discrepancy</p>
                                    {discrepancy !== null ? (
                                        <p className={`font-semibold ${discrepancy > 0.1 ? 'text-green-500' : discrepancy < -0.1 ? 'text-red-500' : ''}`}>
                                            {discrepancy > 0 ? '+' : ''}{discrepancy.toFixed(2)}h
                                        </p>
                                    ) : <p>N/A</p>}
                                </div>
                                 <div>
                                    <p className="text-xs font-semibold text-muted-foreground">Status</p>
                                    <p>{log ? getStatusChip(log.status) : shift ? <span className="text-red-500 font-semibold">Missed</span> : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )
                }) : (
                    <p className="text-center text-muted-foreground py-8">No shift or time log data for this employee in the selected period.</p>
                )}
            </div>
        </Modal>
    );
};

export default ShiftHistoryModal;