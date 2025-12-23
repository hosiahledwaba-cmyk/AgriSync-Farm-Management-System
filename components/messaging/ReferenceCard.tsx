import React from 'react';
import { MessageReference } from '../../types';
import { ClipboardListIcon, ClockIcon, TractorIcon, ArchiveIcon, MapPinIcon, CowIcon } from '../ui/Icon';

interface ReferenceCardProps {
    reference: MessageReference;
    onNavigate: (reference: MessageReference) => void;
}

const ReferenceCard: React.FC<ReferenceCardProps> = ({ reference, onNavigate }) => {
    const getIconAndColor = () => {
        switch (reference.type) {
            case 'task': return { icon: <ClipboardListIcon className="h-5 w-5" />, color: 'border-purple-500', textColor: 'text-purple-500' };
            case 'shift': return { icon: <ClockIcon className="h-5 w-5" />, color: 'border-blue-500', textColor: 'text-blue-500' };
            case 'equipment': return { icon: <TractorIcon className="h-5 w-5" />, color: 'border-yellow-500', textColor: 'text-yellow-500' };
            case 'inventory': return { icon: <ArchiveIcon className="h-5 w-5" />, color: 'border-orange-500', textColor: 'text-orange-500' };
            case 'field': return { icon: <MapPinIcon className="h-5 w-5" />, color: 'border-green-500', textColor: 'text-green-500' };
            case 'livestock': return { icon: <CowIcon className="h-5 w-5" />, color: 'border-pink-500', textColor: 'text-pink-500' };
            default: return { icon: null, color: 'border-gray-500', textColor: 'text-gray-500' };
        }
    };

    const { icon, color, textColor } = getIconAndColor();

    return (
        <div className={`mt-2 p-3 rounded-lg bg-background/50 border-l-4 ${color}`}>
            <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${textColor}`}>{icon}</div>
                <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>{reference.type}</p>
                    <p className="font-semibold text-current">{reference.name}</p>
                    {reference.details && <p className="text-xs text-current/80">{reference.details}</p>}
                </div>
            </div>
            <button
                onClick={() => onNavigate(reference)}
                className="text-sm font-bold mt-2 hover:underline text-current/90"
            >
                View Details &rarr;
            </button>
        </div>
    );
};

export default ReferenceCard;
