import React, { useState, useMemo } from 'react';
import { EquipmentUsageLog, Equipment, User, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import KPICard from './ui/KPICard';
import { ClockIcon, TractorIcon, UserIcon, FileDownIcon } from './ui/Icon';
import { exportUsageLogsToCSV } from '../utils/csvExport';

interface EquipmentTrackingDashboardProps {
    usageLogs: EquipmentUsageLog[];
    equipment: Equipment[];
    users: User[];
}

const EquipmentTrackingDashboard: React.FC<EquipmentTrackingDashboardProps> = ({ usageLogs, equipment, users }) => {
    const { user } = useAuth();
    const canManage = user.role === Role.Owner || user.role === Role.Manager;

    const [dateFilter, setDateFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');
    const [equipmentFilter, setEquipmentFilter] = useState('all');

    const usersById = useMemo(() => users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {} as Record<number, User>), [users]);
    const equipmentById = useMemo(() => equipment.reduce((acc, e) => ({ ...acc, [e.id]: e }), {} as Record<string, Equipment>), [equipment]);

    const filteredLogs = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        return usageLogs.filter(log => {
            const logDate = new Date(log.startTime);
            if (dateFilter === 'today' && logDate < today) return false;
            if (dateFilter === 'last7' && logDate < last7Days) return false;
            if (userFilter !== 'all' && log.userId !== parseInt(userFilter)) return false;
            if (equipmentFilter !== 'all' && log.equipmentId !== equipmentFilter) return false;
            return true;
        });
    }, [usageLogs, dateFilter, userFilter, equipmentFilter]);

    const summaryStats = useMemo(() => {
        const totalHoursUsed = filteredLogs.reduce((sum, log) => {
            if (log.endHours !== null) {
                return sum + (log.endHours - log.startHours);
            }
            return sum;
        }, 0);

        const activeSessions = filteredLogs.filter(log => log.endTime === null).length;

        const usageByUser = filteredLogs.reduce((acc: Record<number, number>, log: EquipmentUsageLog) => {
            if (log.endHours !== null) {
                if (!acc[log.userId]) {
                    acc[log.userId] = 0;
                }
                acc[log.userId] += (log.endHours - log.startHours);
            }
            return acc;
        }, {} as Record<number, number>);

        const topUser = Object.entries(usageByUser)
            .sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0];
        
        return { totalHoursUsed, activeSessions, topUser };
    }, [filteredLogs]);
    
    const handleExport = () => {
        const enrichedData = filteredLogs.map(log => ({
            ...log,
            equipmentName: equipmentById[log.equipmentId]?.name || 'Unknown',
            userName: usersById[log.userId]?.name || 'Unknown',
        }));
        exportUsageLogsToCSV(enrichedData, 'equipment_usage_report');
    };
    
    const selectClasses = "w-full sm:w-auto mt-1 block pl-3 pr-10 py-2 text-base border-input focus:outline-none focus:ring-ring focus:border-primary rounded-md bg-background shadow-sm";


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Equipment Usage Tracking</h2>
                <Button onClick={handleExport} icon={<FileDownIcon />} variant="secondary">Export to CSV</Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Hours Logged" value={`${summaryStats.totalHoursUsed.toFixed(1)}h`} icon={<ClockIcon />} color="blue" />
                <KPICard title="Active Sessions" value={summaryStats.activeSessions.toString()} icon={<TractorIcon />} color="yellow" />
                <KPICard 
                    title="Top User" 
                    value={summaryStats.topUser ? usersById[Number(summaryStats.topUser[0])]?.name : 'N/A'}
                    icon={<UserIcon />} 
                    color="purple" 
                    children={<p>{summaryStats.topUser ? `${summaryStats.topUser[1].toFixed(1)}h logged` : ''}</p>}
                />
                <KPICard 
                    title="Logs in Period" 
                    value={filteredLogs.length.toString()}
                    icon={<TractorIcon />} 
                    color="green" 
                />
            </div>

            <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                <div className="flex flex-wrap gap-4 mb-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Date Range</label>
                        <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className={selectClasses}>
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="last7">Last 7 Days</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">User</label>
                        <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className={selectClasses}>
                            <option value="all">All Users</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Equipment</label>
                        <select value={equipmentFilter} onChange={e => setEquipmentFilter(e.target.value)} className={selectClasses}>
                            <option value="all">All Equipment</option>
                            {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto responsive-table">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-6 py-3">Equipment</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Start Time</th>
                                <th className="px-6 py-3">End Time</th>
                                <th className="px-6 py-3 text-right">Hours Used</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => {
                                const hoursUsed = log.endHours !== null ? (log.endHours - log.startHours).toFixed(2) : 'Ongoing';
                                return (
                                <tr key={log.id} className="bg-card border-b border-border hover:bg-accent">
                                    <td data-label="Equipment" className="px-6 py-4 font-medium text-foreground">{equipmentById[log.equipmentId]?.name || 'N/A'}</td>
                                    <td data-label="User" className="px-6 py-4 text-muted-foreground">{usersById[log.userId]?.name || 'N/A'}</td>
                                    <td data-label="Start Time" className="px-6 py-4 text-muted-foreground">{new Date(log.startTime).toLocaleString()}</td>
                                    <td data-label="End Time" className="px-6 py-4 text-muted-foreground">{log.endTime ? new Date(log.endTime).toLocaleString() : 'Ongoing'}</td>
                                    <td data-label="Hours Used" className="px-6 py-4 text-right font-semibold text-foreground">{hoursUsed}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                    {filteredLogs.length === 0 && <p className="text-center py-8 text-muted-foreground">No usage logs match the current filters.</p>}
                </div>
            </div>
        </div>
    );
};

export default EquipmentTrackingDashboard;