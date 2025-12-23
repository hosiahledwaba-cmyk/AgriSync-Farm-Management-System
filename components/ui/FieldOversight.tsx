import React, { useMemo } from 'react';
import { Field, Planting, CropHealthSnapshot, WateringEvent, HealthScore } from '../../types';
import { MapPinIcon } from './Icon';

interface FieldOversightProps {
    fields: Field[];
    plantingsByField: Record<number, Planting[]>;
    cropHealthSnapshotsByField: Record<number, CropHealthSnapshot[]>;
    wateringEventsByField: Record<number, WateringEvent[]>;
}

const getScoreColor = (score?: HealthScore) => {
    if (score === 'Excellent') return 'text-green-500';
    if (score === 'Good') return 'text-blue-500';
    if (score === 'Fair') return 'text-yellow-500';
    if (score === 'Poor') return 'text-red-500';
    return 'text-muted-foreground';
};

const FieldOversight: React.FC<FieldOversightProps> = ({ fields, plantingsByField, cropHealthSnapshotsByField, wateringEventsByField }) => {
    
    const oversightData = useMemo(() => {
        return fields.map(field => {
            const activePlantings = (plantingsByField[field.id] || []).filter(p => p.status === 'Active');
            const primaryPlanting = activePlantings.sort((a,b) => b.area_planted - a.area_planted)[0];

            const totalAreaPlanted = activePlantings.reduce((sum, p) => sum + p.area_planted, 0);
            const utilizationPercent = field.area > 0 ? (totalAreaPlanted / field.area) * 100 : 0;

            const snapshots = cropHealthSnapshotsByField[field.id] || [];
            const latestSnapshot = snapshots.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            const waterings = wateringEventsByField[field.id] || [];
            const nextWatering = waterings.filter(w => w.status === 'Scheduled').sort((a,b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())[0];
            
            return {
                field,
                currentCrop: primaryPlanting ? `${primaryPlanting.crop_name} (${primaryPlanting.variety})` : 'Fallow',
                utilization: utilizationPercent,
                health: latestSnapshot,
                nextWatering,
            };
        }).sort((a,b) => a.field.id - b.field.id);
    }, [fields, plantingsByField, cropHealthSnapshotsByField, wateringEventsByField]);

    return (
         <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
            <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2"><MapPinIcon className="h-5 w-5 text-primary"/>Quick Field Oversight</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                            <th className="px-6 py-3">Field</th>
                            <th className="px-6 py-3">Current Crop</th>
                            <th className="px-6 py-3 text-right">Utilization</th>
                            <th className="px-6 py-3">Health Score</th>
                            <th className="px-6 py-3">Next Watering</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {oversightData.map(data => (
                            <tr key={data.field.id} className="hover:bg-accent">
                                <td className="px-6 py-3 font-medium text-foreground">{data.field.name}</td>
                                <td className="px-6 py-3 text-muted-foreground">{data.currentCrop}</td>
                                <td className="px-6 py-3 text-right font-semibold text-foreground">{data.utilization.toFixed(0)}%</td>
                                <td className="px-6 py-3">
                                    {data.health ? (
                                        <span className={`font-semibold ${getScoreColor(data.health.score)}`}>{data.health.score}</span>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">No Data</span>
                                    )}
                                </td>
                                 <td className="px-6 py-3 text-muted-foreground">
                                    {data.nextWatering ? new Date(data.nextWatering.scheduled_date + 'T00:00:00Z').toLocaleDateString() : 'N/A'}
                                 </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FieldOversight;