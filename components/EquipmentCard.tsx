

import React from 'react';
import { Equipment, EquipmentStatus } from '../types';
import { TractorIcon } from './ui/Icon';

interface EquipmentCardProps {
    equipment: Equipment;
    onClick: () => void;
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

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onClick }) => {
    const statusStyles = getStatusStyles(equipment.status);

    return (
        <div 
            className="bg-card rounded-xl shadow-sm p-6 border border-border flex flex-col justify-between cursor-pointer group hover:shadow-md hover:border-primary/40 transition-all"
            onClick={onClick}
        >
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <TractorIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{equipment.name}</h3>
                            <p className="text-sm text-muted-foreground">{equipment.type}</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles.bg}`}>
                        <span className={`h-2 w-2 rounded-full ${statusStyles.dot}`}></span>
                        <span className={statusStyles.text}>{equipment.status}</span>
                    </div>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">Total Hours:</span>
                        <span className="font-bold text-foreground">{equipment.totalHours} hrs</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">Next Service:</span>
                        <span className="font-bold text-foreground">{equipment.nextMaintenanceHours} hrs</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-muted-foreground">Fuel Level:</span>
                        <div className="w-1/2 bg-muted rounded-full h-2.5">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${equipment.fuelLevel}%` }}></div>
                        </div>
                        <span className="font-bold text-foreground">{equipment.fuelLevel}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentCard;
