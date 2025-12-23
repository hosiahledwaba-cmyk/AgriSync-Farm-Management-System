import React, { useMemo } from 'react';
import { Equipment, Role, EquipmentStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import EquipmentCard from './EquipmentCard';
import KPICard from './ui/KPICard';
import { PlusIcon, TractorIcon, WrenchIcon, ShieldAlertIcon } from './ui/Icon';

interface EquipmentDashboardProps {
    equipment: Equipment[];
    onAddEquipment: () => void;
    onSelectEquipment: (equipment: Equipment) => void;
}

const EquipmentDashboard: React.FC<EquipmentDashboardProps> = ({ equipment, onAddEquipment, onSelectEquipment }) => {
    const { user } = useAuth();
    const canManage = user.role === Role.Owner || user.role === Role.Manager;

    const stats = useMemo(() => {
        return equipment.reduce((acc, e) => {
            acc.total++;
            if (e.status === EquipmentStatus.Operational) acc.operational++;
            if (e.status === EquipmentStatus.InMaintenance) acc.inMaintenance++;
            if (e.status === EquipmentStatus.BrokenDown) acc.brokenDown++;
            return acc;
        }, { total: 0, operational: 0, inMaintenance: 0, brokenDown: 0 });
    }, [equipment]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Fleet Management</h2>
                {canManage && (
                    <Button onClick={onAddEquipment} icon={<PlusIcon />}>
                        Add Equipment
                    </Button>
                )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Machines" value={stats.total.toString()} icon={<TractorIcon />} color="blue" />
                <KPICard title="Operational" value={stats.operational.toString()} icon={<TractorIcon />} color="green" />
                <KPICard title="In Maintenance" value={stats.inMaintenance.toString()} icon={<WrenchIcon />} color="yellow" />
                <KPICard title="Broken Down" value={stats.brokenDown.toString()} icon={<ShieldAlertIcon />} color="red" />
            </div>

            {/* Equipment List */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">Equipment List</h3>
                {equipment.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {equipment.map(e => (
                            <EquipmentCard
                                key={e.id}
                                equipment={e}
                                onClick={() => onSelectEquipment(e)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-card rounded-xl shadow-sm border border-border">
                        <p className="text-muted-foreground">No equipment found.</p>
                        {canManage && <p className="text-muted-foreground">Click "Add Equipment" to get started.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EquipmentDashboard;