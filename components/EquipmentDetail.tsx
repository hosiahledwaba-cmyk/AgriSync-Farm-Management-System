

import React from 'react';
import { Equipment, MaintenanceLog, Role, EquipmentStatus, EquipmentUsageLog, User } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { ArrowLeftIcon, PencilIcon, WrenchIcon, ClockIcon } from './ui/Icon';
import { formatCurrency } from '../utils/currency';

interface EquipmentDetailProps {
    equipment: Equipment;
    maintenanceLogs: MaintenanceLog[];
    usageLogs: EquipmentUsageLog[];
    users: User[];
    onBack: () => void;
    onEdit: () => void;
    onAddMaintenanceLog: () => void;
    onStartSession: (equipment: Equipment) => void;
    onEndSession: (log: EquipmentUsageLog) => void;
}

const getStatusStyles = (status: EquipmentStatus) => {
    switch (status) {
        case EquipmentStatus.Operational: return { bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-500' };
        case EquipmentStatus.InUse: return { bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-500' };
        case EquipmentStatus.InMaintenance: return { bg: 'bg-yellow-500/10', text: 'text-yellow-600', dot: 'bg-yellow-500' };
        case EquipmentStatus.BrokenDown: return { bg: 'bg-red-500/10', text: 'text-red-600', dot: 'bg-red-500' };
        default: return { bg: 'bg-gray-500/10', text: 'text-gray-600', dot: 'bg-gray-500' };
    }
};

const EquipmentDetail: React.FC<EquipmentDetailProps> = ({ equipment, maintenanceLogs, usageLogs, users, onBack, onEdit, onAddMaintenanceLog, onStartSession, onEndSession }) => {
    const { user } = useAuth();
    const canManage = user.role === Role.Owner || user.role === Role.Manager;
    const statusStyles = getStatusStyles(equipment.status);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

    const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
    const ongoingSession = usageLogs.find(log => log.id === equipment.currentUsageLogId && log.endTime === null);
    const operator = ongoingSession ? users.find(u => u.id === ongoingSession.userId) : null;

    const renderActionButton = () => {
        if (equipment.status === EquipmentStatus.Operational) {
            return <Button onClick={() => onStartSession(equipment)} icon={<ClockIcon />} className="w-full">Start Session</Button>;
        }
        if (equipment.status === EquipmentStatus.InUse && ongoingSession && ongoingSession.userId === user.id) {
            return <Button onClick={() => onEndSession(ongoingSession)} icon={<ClockIcon />} className="w-full bg-red-600 hover:bg-red-700">End Session</Button>;
        }
        if (equipment.status === EquipmentStatus.InUse) {
             return <div className="text-center p-3 bg-blue-500/10 text-blue-700 rounded-md">In use by {operator?.name || '...'}</div>;
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-accent mr-4">
                    <ArrowLeftIcon className="h-6 w-6 text-muted-foreground" />
                </button>
                <h2 className="text-2xl font-bold text-foreground">{equipment.name}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Details Card */}
                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold">Details</h3>
                            <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles.bg}`}>
                                <span className={`h-2 w-2 rounded-full ${statusStyles.dot}`}></span>
                                <span className={statusStyles.text}>{equipment.status}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                            <div><strong className="text-muted-foreground block">Type</strong> {equipment.type}</div>
                            <div><strong className="text-muted-foreground block">Total Hours</strong> {equipment.totalHours} hrs</div>
                            <div><strong className="text-muted-foreground block">Next Service</strong> {equipment.nextMaintenanceHours} hrs</div>
                            <div>
                                <strong className="text-muted-foreground block">Fuel Level</strong>
                                <div className="flex items-center gap-2">
                                    <div className="w-full bg-muted rounded-full h-2.5">
                                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${equipment.fuelLevel}%` }}></div>
                                    </div>
                                    <span>{equipment.fuelLevel}%</span>
                                </div>
                            </div>
                            <div className="sm:col-span-2"><strong className="text-muted-foreground block">Total Maintenance Cost</strong> {formatCurrency(totalMaintenanceCost)}</div>
                        </div>
                    </div>

                    {/* Maintenance History */}
                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                        <h3 className="text-lg font-semibold mb-4">Maintenance History</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {maintenanceLogs.length > 0 ? maintenanceLogs.map(log => (
                                <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-500/10 rounded-r-md">
                                    <p className="font-bold">{log.description}</p>
                                    <p className="text-sm text-muted-foreground">Date: {formatDate(log.date)} &bull; Cost: {formatCurrency(log.cost)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Serviced by: {log.mechanic}</p>
                                </div>
                            )) : <p className="text-muted-foreground text-sm text-center py-4">No maintenance records found.</p>}
                        </div>
                    </div>
                </div>

                {/* Management Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border sticky top-24 space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Usage Tracking</h3>
                            <div className="space-y-3">
                                {renderActionButton()}
                            </div>
                        </div>
                         <div className="pt-4 border-t border-border">
                            <h3 className="text-lg font-semibold mb-4">Maintenance</h3>
                            <div className="space-y-3">
                                {canManage && <Button onClick={onEdit} icon={<PencilIcon />} className="w-full">Edit Details</Button>}
                                {canManage && <Button onClick={onAddMaintenanceLog} icon={<WrenchIcon />} className="w-full" variant="secondary">Log Maintenance</Button>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentDetail;
