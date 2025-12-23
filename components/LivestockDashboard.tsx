import React, { useMemo } from 'react';
import { Livestock, FeedingSchedule, Role, User, LivestockTrackingType } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import LivestockCard from './LivestockCard';
import { PlusIcon, CowIcon, UserIcon, UsersIcon, RepeatIcon } from './ui/Icon';

interface LivestockDashboardProps {
    livestock: Livestock[];
    feedingSchedules: FeedingSchedule[];
    users: User[];
    onAddLivestock: () => void;
    onAddFeedingSchedule: () => void;
    onSelectLivestock: (livestock: Livestock) => void;
}

const LivestockDashboard: React.FC<LivestockDashboardProps> = ({ livestock, feedingSchedules, users, onAddLivestock, onAddFeedingSchedule, onSelectLivestock }) => {
    const { user } = useAuth();
    const canManage = user.role === Role.Owner || user.role === Role.Manager;
    const usersById = useMemo(() => users.reduce((acc, u) => ({ ...acc, [u.id]: u.name }), {} as Record<number, string>), [users]);

    const { individuals, groups } = useMemo(() => {
        return livestock.reduce((acc, animal) => {
            if (animal.trackingType === LivestockTrackingType.Individual) {
                acc.individuals.push(animal);
            } else {
                acc.groups.push(animal);
            }
            return acc;
        }, { individuals: [] as Livestock[], groups: [] as Livestock[] });
    }, [livestock]);
    
    const totalAnimals = livestock.reduce((sum, item) => sum + (item.count || 1), 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Livestock Management</h2>
                {canManage && (
                    <div className="flex gap-2">
                        <Button onClick={onAddFeedingSchedule} icon={<RepeatIcon />} variant="secondary">
                            Manage Schedules
                        </Button>
                        <Button onClick={onAddLivestock} icon={<PlusIcon />}>
                            Add Livestock
                        </Button>
                    </div>
                )}
            </div>
            
            {/* KPIs */}
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <KPI_Card title="Total Animals" value={totalAnimals.toString()} icon={<CowIcon className="h-6 w-6 text-blue-600"/>} color="blue" />
                <KPI_Card title="Individual" value={individuals.length.toString()} icon={<UserIcon className="h-6 w-6 text-green-600"/>} color="green" />
                <KPI_Card title="Groups" value={groups.length.toString()} icon={<UsersIcon className="h-6 w-6 text-purple-600"/>} color="purple" className="col-span-2 lg:col-span-1" />
            </div>

            {/* Individual Animals */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">Individual Animals</h3>
                 {individuals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {individuals.map(animal => (
                            <LivestockCard key={animal.id} livestock={animal} onClick={() => onSelectLivestock(animal)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-card rounded-xl shadow-sm border border-border">
                        <p className="text-muted-foreground">No individual animals tracked.</p>
                        {canManage && <p className="text-muted-foreground text-sm">Click "Add Livestock" to add a cow, pig, etc.</p>}
                    </div>
                )}
            </div>
            
            {/* Groups */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">Groups & Flocks</h3>
                 {groups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map(group => (
                            <LivestockCard key={group.id} livestock={group} onClick={() => onSelectLivestock(group)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-card rounded-xl shadow-sm border border-border">
                        <p className="text-muted-foreground">No groups tracked.</p>
                         {canManage && <p className="text-muted-foreground text-sm">Click "Add Livestock" to add chickens, etc.</p>}
                    </div>
                )}
            </div>

            {/* Feeding Schedules */}
            {canManage && (
                <div className="bg-card p-4 sm:p-6 rounded-xl shadow-sm border border-border">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Active Feeding Schedules</h3>
                     {feedingSchedules.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {feedingSchedules.map(s => (
                                <div key={s.id} className="p-3 bg-muted/50 border rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{s.livestockName}</p>
                                        <p className="text-sm text-muted-foreground">Feed {s.quantity} {s.unit} of {s.feedType} daily</p>
                                    </div>
                                    <p className="text-sm font-medium">Assigned to: {usersById[s.assigneeId] || 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No daily feeding schedules configured.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const KPI_Card: React.FC<{title: string, value: string, icon: React.ReactNode, color: string, className?: string}> = ({title, value, icon, color, className}) => (
    <div className={`bg-card p-4 rounded-xl shadow-sm border border-border ${className}`}>
        <div className="flex items-center">
            <div className={`p-2 bg-${color}-500/10 rounded-full`}>
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    </div>
);


export default LivestockDashboard;