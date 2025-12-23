import React from 'react';
import { Field, Planting } from '../types';
import { MapPinIcon, LeafIcon, BarChartIcon } from './ui/Icon';

interface FieldCardProps {
    field: Field;
    plantings: Planting[];
    onClick: () => void;
}

const FieldCard: React.FC<FieldCardProps> = ({ field, plantings, onClick }) => {
    const activePlantings = plantings ? plantings.filter(p => p.status === 'Active') : [];
    const totalAreaPlanted = activePlantings.reduce((sum, p) => sum + p.area_planted, 0);
    const utilizationPercent = field.area > 0 ? (totalAreaPlanted / field.area) * 100 : 0;
    const primaryPlanting = activePlantings.sort((a, b) => b.area_planted - a.area_planted)[0];

    return (
        <div 
            className="bg-card rounded-xl shadow-sm p-6 cursor-pointer border border-border hover:shadow-md hover:border-primary/40 transition-all duration-300 group flex flex-col justify-between"
            onClick={onClick}
        >
            <div>
                <div className="flex items-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <MapPinIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="ml-4 text-lg font-bold text-foreground group-hover:text-primary transition-colors">{field.name}</h3>
                </div>

                <div className="space-y-4 text-sm mb-4">
                    {/* Current Planting */}
                    <div className="flex items-start">
                        <LeafIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-muted-foreground">Currently Planted</p>
                            {primaryPlanting ? (
                                <p className="font-bold text-foreground">{primaryPlanting.crop_name} <span className="font-normal">({primaryPlanting.variety})</span></p>
                            ) : (
                                <p className="font-bold text-foreground">Fallow</p>
                            )}
                        </div>
                    </div>

                    {/* Utilization */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                             <p className="font-medium text-muted-foreground flex items-center"><BarChartIcon className="h-4 w-4 mr-2"/>Utilization</p>
                            <span className="font-bold text-foreground">{totalAreaPlanted.toFixed(1)} / {field.area} ha</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${utilizationPercent}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Soil Type */}
            <div className="text-sm border-t border-border pt-3">
                <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Soil Type:</span>
                    <span className="font-bold text-foreground">{field.soil_type}</span>
                </div>
            </div>
        </div>
    );
};

export default FieldCard;