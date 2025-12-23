import React from 'react';
import { Livestock, LivestockTrackingType } from '../types';
import { CowIcon, UsersIcon } from './ui/Icon';

interface LivestockCardProps {
    livestock: Livestock;
    onClick: () => void;
}

const LivestockCard: React.FC<LivestockCardProps> = ({ livestock, onClick }) => {
    
    const isIndividual = livestock.trackingType === LivestockTrackingType.Individual;
    
    const getAge = (birthDate?: string) => {
        if (!birthDate) return 'N/A';
        const ageDifMs = Date.now() - new Date(birthDate).getTime();
        const ageDate = new Date(ageDifMs);
        const years = Math.abs(ageDate.getUTCFullYear() - 1970);
        const months = ageDate.getUTCMonth();
        return `${years}y ${months}m`;
    };

    return (
        <div 
            className="bg-card rounded-xl shadow-sm p-6 border border-border transition-all duration-300 group hover:shadow-md hover:border-primary/40 cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                     {isIndividual ? <CowIcon className="h-6 w-6 text-primary" /> : <UsersIcon className="h-6 w-6 text-primary" />}
                </div>
                <h3 className="ml-4 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {isIndividual ? livestock.name || `Tag: ${livestock.tagId}` : livestock.groupName}
                </h3>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Species:</span>
                    <span className="font-bold text-foreground">{livestock.species}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Breed:</span>
                    <span className="font-bold text-foreground">{livestock.breed || 'N/A'}</span>
                </div>
                {isIndividual ? (
                     <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">Age:</span>
                        <span className="font-bold text-foreground">{getAge(livestock.birthDate)}</span>
                    </div>
                ) : (
                     <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">Count:</span>
                        <span className="font-bold text-foreground">{livestock.count}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LivestockCard;
