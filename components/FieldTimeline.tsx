
import React, { useMemo } from 'react';
import { Planting, Harvest, Task, CropHealthSnapshot, WateringEvent, HealthScore } from '../types';
import { PlusIcon, LeafIcon, BarChartIcon, DropletsIcon, HeartPulseIcon, ClipboardListIcon, CameraIcon } from './ui/Icon';
import Button from './ui/Button';

type TimelineEvent = 
    | (Planting & { eventType: 'Planting'; eventDate: string; })
    | (Harvest & { eventType: 'Harvest'; eventDate: string; })
    | (Task & { eventType: 'Task'; eventDate: string; })
    | (CropHealthSnapshot & { eventType: 'Health Snapshot'; eventDate: string; })
    | (WateringEvent & { eventType: 'Watering'; eventDate: string; });

interface FieldTimelineProps {
    plantings: Planting[];
    harvests: Harvest[];
    tasks: Task[];
    healthSnapshots: CropHealthSnapshot[];
    wateringEvents: WateringEvent[];
    onAddHealthSnapshot: (planting: Planting) => void;
    onUpdateWateringEvent: (eventId: string, updates: Partial<WateringEvent>) => void;
}

const EventIcon: React.FC<{ type: TimelineEvent['eventType'] }> = ({ type }) => {
    const iconMap = {
        'Planting': <LeafIcon className="h-5 w-5 text-green-500" />,
        'Harvest': <BarChartIcon className="h-5 w-5 text-yellow-500" />,
        'Task': <ClipboardListIcon className="h-5 w-5 text-purple-500" />,
        'Health Snapshot': <HeartPulseIcon className="h-5 w-5 text-blue-500" />,
        'Watering': <DropletsIcon className="h-5 w-5 text-cyan-500" />,
    };
    return <div className="absolute -left-4 top-1 h-8 w-8 bg-card rounded-full flex items-center justify-center border-2 border-border">{iconMap[type]}</div>;
};

const getScoreStyles = (score: HealthScore) => {
    switch (score) {
        case 'Excellent': return 'bg-green-500/10 text-green-700 dark:text-green-300';
        case 'Good': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
        case 'Fair': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
        case 'Poor': return 'bg-red-500/10 text-red-700 dark:text-red-300';
    }
};


const FieldTimeline: React.FC<FieldTimelineProps> = ({ plantings, harvests, tasks, healthSnapshots, wateringEvents, onAddHealthSnapshot, onUpdateWateringEvent }) => {
    const timelineEvents = useMemo(() => {
        const events: TimelineEvent[] = [
            ...plantings.map(p => ({ ...p, eventType: 'Planting' as const, eventDate: p.date_planted })),
            ...harvests.map(h => ({ ...h, eventType: 'Harvest' as const, eventDate: h.date })),
            ...tasks.map(t => ({ ...t, eventType: 'Task' as const, eventDate: t.dueDate })),
            ...healthSnapshots.map(s => ({ ...s, eventType: 'Health Snapshot' as const, eventDate: s.date })),
            ...wateringEvents.map(w => ({ ...w, eventType: 'Watering' as const, eventDate: w.scheduled_date })),
        ];
        return events.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    }, [plantings, harvests, tasks, healthSnapshots, wateringEvents]);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    const renderEventContent = (event: TimelineEvent) => {
        switch (event.eventType) {
            case 'Planting':
                return (
                    <div>
                        <p className="font-bold">{event.crop_name} <span className="text-sm font-normal text-muted-foreground">({event.variety})</span> Planted</p>
                        <p className="text-sm text-muted-foreground">{event.area_planted} ha &bull; Watering: {event.watering_schedule}</p>
                        {event.status === 'Active' && (
                             <Button size="sm" onClick={() => onAddHealthSnapshot(event)} icon={<HeartPulseIcon />} className="mt-2">Log Health</Button>
                        )}
                    </div>
                );
            case 'Harvest':
                return (
                     <div>
                        <p className="font-bold">{event.crop_name} Harvested</p>
                        <p className="text-sm text-muted-foreground">Yield: {event.weight_kg.toLocaleString()} kg at {event.moisture_pct}% moisture</p>
                    </div>
                );
            case 'Health Snapshot':
                return (
                     <div>
                        <div className="flex justify-between items-start">
                             <p className="font-bold">Health Snapshot for {plantings.find(p => p.id === event.planting_id)?.crop_name}</p>
                             <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getScoreStyles(event.score)}`}>{event.score}</span>
                        </div>
                        <p className="text-sm text-muted-foreground italic mt-1">"{event.notes}"</p>
                         {event.photo && (
                            <div className="flex items-center gap-2 mt-2">
                                <CameraIcon className="h-4 w-4 text-primary" />
                                <a href={event.photo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium text-sm">View Photo</a>
                            </div>
                        )}
                    </div>
                );
            case 'Watering':
                return (
                    <div>
                        <p className="font-bold">Watering {event.status}</p>
                        <p className="text-sm text-muted-foreground">Scheduled for planting of {plantings.find(p => p.id === event.planting_id)?.crop_name}</p>
                         {event.status === 'Scheduled' && (
                             <div className="flex gap-2 mt-2">
                                <Button size="sm" onClick={() => onUpdateWateringEvent(event.id, { status: 'Completed', completed_date: new Date().toISOString() })}>Complete</Button>
                                <Button size="sm" variant="secondary" onClick={() => onUpdateWateringEvent(event.id, { status: 'Skipped' })}>Skip</Button>
                            </div>
                         )}
                    </div>
                );
            case 'Task':
                 return (
                    <div>
                        <div className="flex justify-between items-start">
                            <p className="font-bold">{event.title}</p>
                            <span className="text-xs font-semibold text-muted-foreground">{event.status}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h3 className="text-xl font-semibold mb-6">Field Timeline</h3>
            <div className="relative pl-8">
                <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-border"></div>
                {timelineEvents.map((event, index) => (
                    <div key={`${event.eventType}-${(event as any).id}`} className="relative mb-6">
                        <EventIcon type={event.eventType} />
                        <div className="pl-6">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">{formatDate(event.eventDate)}</p>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                {renderEventContent(event)}
                            </div>
                        </div>
                    </div>
                ))}
                {timelineEvents.length === 0 && <p className="text-muted-foreground text-center">No activities recorded for this field yet.</p>}
            </div>
        </div>
    );
};

export default FieldTimeline;
