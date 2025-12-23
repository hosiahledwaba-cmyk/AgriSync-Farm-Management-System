import React from 'react';
import { Livestock, LivestockStatus, LivestockTrackingType, Role, Task, TaskStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { ArrowLeftIcon, BeakerIcon, ClipboardPlusIcon, HeartPlusIcon, MilkIcon, PencilIcon, ScaleIcon, SparklesIcon } from './ui/Icon';
import KPICard from './ui/KPICard';
import LineChart from './ui/LineChart';

interface LivestockDetailProps {
    livestock: Livestock;
    onBack: () => void;
    onOpenModal: (modal: 'EDIT_LIVESTOCK' | 'ADD_HEALTH_EVENT' | 'ADD_WEIGHT_LOG' | 'ADD_PRODUCTION_LOG' | 'ADD_FEED_LOG' | 'ADD_TREATMENT_LOG', livestock: Livestock) => void;
    onAnalyze: (livestock: Livestock) => void;
}

const LivestockDetail: React.FC<LivestockDetailProps> = ({ livestock, onBack, onOpenModal, onAnalyze }) => {
    const { user } = useAuth();
    const canManage = user.role === Role.Owner || user.role === Role.Manager;

    const isIndividual = livestock.trackingType === LivestockTrackingType.Individual;
    const title = isIndividual ? livestock.name || `Tag: ${livestock.tagId}` : livestock.groupName || 'Group';
    
    const getAge = (birthDate?: string) => {
        if (!birthDate) return 'N/A';
        const ageDifMs = Date.now() - new Date(birthDate).getTime();
        const ageDate = new Date(ageDifMs);
        const years = Math.abs(ageDate.getUTCFullYear() - 1970);
        const months = ageDate.getUTCMonth();
        return `${years}y ${months}m`;
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    
    const getStatusColor = (status?: LivestockStatus) => {
        switch (status) {
            case LivestockStatus.Active: return 'text-green-500';
            case LivestockStatus.Sold: return 'text-yellow-500';
            case LivestockStatus.Deceased: return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    };
    
    const kpis = React.useMemo(() => {
        const sortedWeights = [...(livestock.weightHistory || [])].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let adg: number | null = null;
        if (sortedWeights.length >= 2) {
            const first = sortedWeights[0];
            const last = sortedWeights[sortedWeights.length - 1];
            const days = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24);
            if (days > 0) {
                adg = (last.weight - first.weight) / days;
            }
        }
        const lastWeight = sortedWeights[sortedWeights.length - 1];
        const lastProduction = [...(livestock.productionHistory || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        return { adg, lastWeight, lastProduction };
    }, [livestock]);
    
    const unifiedHealthHistory = React.useMemo(() => {
        const events = (livestock.healthHistory || []).map(e => ({...e, type: 'Health Event', date: e.date}));
        const treatments = (livestock.treatmentHistory || []).map(t => ({...t, type: 'Treatment', date: t.date}));
        return [...events, ...treatments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [livestock.healthHistory, livestock.treatmentHistory]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-accent mr-4">
                        <ArrowLeftIcon className="h-6 w-6 text-muted-foreground" />
                    </button>
                    <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                </div>
                 {canManage && <Button onClick={() => onOpenModal('EDIT_LIVESTOCK', livestock)} icon={<PencilIcon />}>Edit Details</Button>}
            </div>

            <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                <h3 className="text-md font-semibold text-muted-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    <Button variant="secondary" onClick={() => onOpenModal('ADD_WEIGHT_LOG', livestock)} icon={<ScaleIcon/>}>Log Weight</Button>
                    <Button variant="secondary" onClick={() => onOpenModal('ADD_PRODUCTION_LOG', livestock)} icon={<MilkIcon/>}>Log Production</Button>
                    <Button variant="secondary" onClick={() => onOpenModal('ADD_FEED_LOG', livestock)}>Log Feed</Button>
                    <Button variant="secondary" onClick={() => onOpenModal('ADD_TREATMENT_LOG', livestock)} icon={<ClipboardPlusIcon />}>Log Treatment</Button>
                    <Button variant="secondary" onClick={() => onOpenModal('ADD_HEALTH_EVENT', livestock)} icon={<HeartPlusIcon/>}>Log Event</Button>
                    <Button onClick={() => onAnalyze(livestock)} icon={<BeakerIcon/>}>Analyze Health</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-3">
                         <InfoItem label="Species" value={livestock.species} />
                         <InfoItem label="Breed" value={livestock.breed || 'N/A'} />
                         {isIndividual ? (
                             <>
                                <InfoItem label="Tag ID" value={livestock.tagId || 'N/A'} />
                                <InfoItem label="Age" value={getAge(livestock.birthDate)} />
                                <InfoItem label="Status" value={livestock.status || 'N/A'} colorClass={getStatusColor(livestock.status)} />
                             </>
                         ) : (
                             <>
                                <InfoItem label="Count" value={livestock.count?.toString() || 'N/A'} />
                                <InfoItem label="Acquired" value={livestock.acquisitionDate ? formatDate(livestock.acquisitionDate) : 'N/A'} />
                            </>
                         )}
                    </div>
                    {isIndividual && (
                         <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-4">
                            <h3 className="font-semibold text-foreground">Productivity KPIs</h3>
                            <KPICard title="Avg Daily Gain" value={kpis.adg ? `${kpis.adg.toFixed(2)} kg/day` : 'N/A'} icon={<SparklesIcon/>} color="green"/>
                            <KPICard title="Last Weight" value={kpis.lastWeight ? `${kpis.lastWeight.weight} kg` : 'N/A'} icon={<ScaleIcon/>} color="blue"/>
                            <KPICard title="Last Production" value={kpis.lastProduction ? `${kpis.lastProduction.quantity} ${kpis.lastProduction.unit}` : 'N/A'} icon={<MilkIcon/>} color="purple"/>
                         </div>
                    )}
                     {livestock.iotData && (
                        <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                             <h3 className="font-semibold text-foreground mb-3">Sensor Data</h3>
                             <div className="space-y-2 text-sm">
                                <InfoItem label="Temperature" value={`${livestock.iotData.temperature}°C`} />
                                <InfoItem label="Activity Level" value={livestock.iotData.activityLevel} />
                                <p className="text-xs text-muted-foreground pt-2">Last updated: {new Date(livestock.iotData.lastUpdate).toLocaleTimeString()}</p>
                             </div>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                        <h3 className="font-semibold text-foreground mb-4">Performance Trends</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <LineChart title="Weight (kg)" data={livestock.weightHistory?.map(h => ({date: h.date, value: h.weight})) || []} color="hsl(var(--primary))" />
                            <LineChart title="Production" data={livestock.productionHistory?.map(h => ({date: h.date, value: h.quantity})) || []} color="#8b5cf6" />
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                        <h3 className="font-semibold text-foreground mb-4">Health Timeline</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {unifiedHealthHistory.length > 0 ? unifiedHealthHistory.map((event: any, i) => (
                                <div key={i} className={`p-3 rounded-md border-l-4 ${event.type === 'Treatment' ? 'border-purple-500 bg-purple-500/10' : 'border-blue-500 bg-blue-500/10'}`}>
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-sm">{event.type}: {event.eventType || event.treatmentType}</p>
                                        <p className="text-xs font-semibold text-muted-foreground">{formatDate(event.date)}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{event.notes || event.description}</p>
                                </div>
                            )) : <p className="text-sm text-center text-muted-foreground py-4">No health or treatment events recorded.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoItem: React.FC<{label: string, value: string, colorClass?: string}> = ({label, value, colorClass}) => (
    <div className="flex justify-between text-sm">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className={`font-bold text-foreground ${colorClass}`}>{value}</span>
    </div>
);

export default LivestockDetail;
