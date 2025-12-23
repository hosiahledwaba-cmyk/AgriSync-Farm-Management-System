import React from 'react';
import { Field } from '../../types';

interface FarmMapProps {
    fields: Field[];
    onSelectField: (field: Field) => void;
}

// Define a simple layout for the fields
const fieldPositions: { [key: number]: { x: number; y: number; width: number; height: number; color: string; } } = {
    1: { x: 5, y: 5, width: 40, height: 25, color: 'fill-green-500/30' }, // North Field
    2: { x: 5, y: 35, width: 55, height: 60, color: 'fill-blue-500/30' }, // West Valley
    3: { x: 50, y: 5, width: 20, height: 25, color: 'fill-yellow-500/30' }, // Hillside Patch
};

const FarmMap: React.FC<FarmMapProps> = ({ fields, onSelectField }) => {
    return (
        <div className="bg-muted rounded-md aspect-video p-2 border border-border/50">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {fields.map((field, index) => {
                    const pos = fieldPositions[field.id] || { 
                        x: 65 + (index % 2 * 15), 
                        y: 35 + Math.floor(index / 2) * 15, 
                        width: 12, 
                        height: 12,
                        color: 'fill-purple-500/30'
                    };
                    
                    return (
                        <g key={field.id} onClick={() => onSelectField(field)} className="cursor-pointer group">
                            <rect
                                x={pos.x}
                                y={pos.y}
                                width={pos.width}
                                height={pos.height}
                                rx="2"
                                className={`${pos.color} stroke-primary/50 group-hover:stroke-primary group-hover:stroke-2 transition-all`}
                                strokeWidth="1"
                            />
                            <text 
                                x={pos.x + pos.width / 2} 
                                y={pos.y + pos.height / 2} 
                                textAnchor="middle" 
                                dominantBaseline="central"
                                fontSize="4"
                                className="fill-foreground font-semibold pointer-events-none"
                            >
                                {field.name}
                            </text>
                             <title>{`${field.name} - ${field.area} ha`}</title>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default FarmMap;
