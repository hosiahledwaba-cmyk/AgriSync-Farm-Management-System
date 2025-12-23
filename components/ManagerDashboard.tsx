import React, { useMemo, useState, useEffect } from 'react';
import { Task, InventoryItem, User, Field, Equipment, MaintenanceLog, TaskStatus, Role, EquipmentStatus, TimeLog, CropHealthSnapshot, Planting, HealthScore, Livestock, WateringEvent, ProductionLog, TaskCategory, TaskExchangeLog } from '../types';
import KPICard from './ui/KPICard';
import { ClipboardListIcon, WrenchIcon, ShieldAlertIcon, GaugeIcon, ArchiveIcon, UsersIcon, TractorIcon, PlusIcon, CheckIcon, PencilIcon, UserIcon, LeafIcon, HeartPulseIcon } from './ui/Icon';
import Button from './ui/Button';
import Modal from './ui/Modal';
import TaskItem from './TaskItem';
import KanbanBoard from './ui/KanbanBoard';
import { formatCurrency } from '../utils/currency';
import { useWeatherData } from '../hooks/useWeatherData';
import WeatherWidget from './WeatherWidget';
import FieldOversight from './ui/FieldOversight';
import { useAuth } from '../context/AuthContext';
import { useTaskExchangeData } from '../hooks/useTaskExchangeData';

interface ManagerDashboardProps {
    tasks: Task[];
    inventoryItems: InventoryItem[];
    users: User[];
    fields: Field[];
    livestock: Livestock[];
    equipment: Equipment[];
    maintenanceLogs: MaintenanceLog[];
    timeLogs: TimeLog[];
    cropHealthSnapshotsByField: Record<number, CropHealthSnapshot[]>;
    plantingsByField: Record<number, Planting[]>;
    wateringEventsByField: Record<number, WateringEvent[]>;
    onAddTask: () => void;
    onManageInventory: () => void;
    onEditTask: (task: Task) => void;
    onCompleteTask: (task: Task) => void;
    onEditEquipment: (equipment: Equipment) => void;
    onAddMaintenanceLog: (equipment: Equipment) => void;
    onExchangeTask: (task: Task) => void;
    onApproveRequest: (log: TaskExchangeLog) => void;
    onDenyRequest: (log: TaskExchangeLog) => void;
    taskExchangeData: ReturnType<typeof useTaskExchangeData>;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ tasks, inventoryItems, users, fields, livestock, equipment, maintenanceLogs, timeLogs, cropHealthSnapshotsByField, plantingsByField, wateringEventsByField, onAddTask, onManageInventory, onEditTask, onCompleteTask, onEditEquipment, onAddMaintenanceLog, onExchangeTask, onApproveRequest, onDenyRequest, taskExchangeData }) => {
    const { user } = useAuth();
    const [activePopover, setActivePopover] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<'tasks' | 'equipment' | 'inventory' | null>(null);
    const usersById = useMemo(() => users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {} as Record<number, User>), [users]);

    const firstField = fields[0];
    const { weatherData, loading: weatherLoading, error: weatherError } = useWeatherData(firstField?.latitude, firstField?.longitude);

    const { tasksDueTodayList, completionRate, equipmentStats, lowStockItems, upcomingTreatments, herdProductivity } = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const tasksDueToday = tasks.filter(t => t.dueDate === todayStr);
        const completedToday = tasksDueToday.filter(t => t.status === TaskStatus.Completed).length;
        const rate = tasksDueToday.length > 0 ? (completedToday / tasksDueToday.length) * 100 : 100;

        const eqStats = equipment.reduce((acc, e) => {
            acc[e.status] = (acc[e.status] || 0) + 1;
            return acc;
        }, {} as Record<EquipmentStatus, number>);

        const lowStock = inventoryItems.filter(i => i.stock_qty <= i.reorder_level && !i.isHarvestedGood);
        
        const treatments = tasks.filter(t => (t.taskCategory === 'Treatment' || t.taskCategory === 'Health Check') && t.status !== TaskStatus.Completed);
        
        const productivity = livestock.reduce((acc, animal) => {
            (animal.productionHistory || [])
                .filter(log => log.date === todayStr)
                .forEach(log => {
                    const key = `${log.type} (${log.unit})`;
                    acc[key] = (acc[key] || 0) + log.quantity;
                });
            return acc;
        }, {} as Record<string, number>);

        return { tasksDueTodayList: tasksDueToday, completionRate: rate, equipmentStats: eqStats, lowStockItems: lowStock, upcomingTreatments: treatments, herdProductivity: productivity };
    }, [tasks, equipment, inventoryItems, livestock]);
    
    const kpis = useMemo(() => {
        const operationalMachines = equipment.filter(e => e.status === EquipmentStatus.Operational).length;
        const utilization = equipment.length > 0 ? (operationalMachines / equipment.length) * 100 : 100;

        return {
            completionRate,
            utilization,
            criticalStockouts: lowStockItems.length,
            laborProductivity: 85.5, // Mocked
            safetyIncidents: 0, // Mocked
        };
    }, [completionRate, equipment, lowStockItems.length]);

    const getEquipmentStatusStyles = (status: EquipmentStatus) => {
        switch (status) {
            case EquipmentStatus.Operational: return { bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-500' };
            case EquipmentStatus.InMaintenance: return { bg: 'bg-yellow-500/10', text: 'text-yellow-600', dot: 'bg-yellow-500' };
            case EquipmentStatus.BrokenDown: return { bg: 'bg-red-500/10', text: 'text-red-600', dot: 'bg-red-500' };
            default: return { bg: 'bg-gray-500/10', text: 'text-gray-600', dot: 'bg-gray-500' };
        }
    };

    const dailyExchanges = taskExchangeData.getTodaysExchangesCount(user.id);
    const weeklyExchanges = taskExchangeData.getThisWeeksExchangesCount(user.id);
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Manager's Dashboard</h2>
                    <p className="text-muted-foreground">Operational cockpit for day-to-day management.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => alert('Feature coming soon!')}>Log Downtime</Button>
                    <Button onClick={onAddTask}>Create Task</Button>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                 <InteractiveKpiWrapper popoverKey="completion" title="View Today's Tasks" popoverContent={<p>Pending: {tasksDueTodayList.filter(t => t.status !== TaskStatus.Completed).length} | Completed: {tasksDueTodayList.filter(t => t.status === TaskStatus.Completed).length}</p>} setActiveModal={() => setActiveModal('tasks')} activePopover={activePopover} setActivePopover={setActivePopover}>
                    <KPICard title="Completion Rate" value={`${kpis.completionRate.toFixed(0)}%`} icon={<ClipboardListIcon />} color="blue" children={<p>Of tasks due today</p>} />
                </InteractiveKpiWrapper>

                <InteractiveKpiWrapper popoverKey="utilization" title="View Fleet Status" popoverContent={
                    <div className="text-xs space-y-1">
                        <p>Operational: {equipmentStats.Operational || 0}</p>
                        <p>In Maintenance: {equipmentStats[EquipmentStatus.InMaintenance] || 0}</p>
                        <p>Broken Down: {equipmentStats[EquipmentStatus.BrokenDown] || 0}</p>
                    </div>} setActiveModal={() => setActiveModal('equipment')} activePopover={activePopover} setActivePopover={setActivePopover}>
                    <KPICard title="Machine Utilization" value={`${kpis.utilization.toFixed(0)}%`} icon={<TractorIcon />} color="purple" children={<p>Operational fleet</p>} />
                </InteractiveKpiWrapper>
                
                <InteractiveKpiWrapper popoverKey="stockouts" title="Manage Stockouts" popoverContent={lowStockItems.length > 0 ? lowStockItems.slice(0,3).map(i => <p key={i.id} className="truncate">&bull; {i.name}</p>) : <p>All stock levels are healthy.</p>} setActiveModal={() => setActiveModal('inventory')} activePopover={activePopover} setActivePopover={setActivePopover}>
                    <KPICard title="Critical Stockouts" value={kpis.criticalStockouts.toString()} icon={<ArchiveIcon />} color={kpis.criticalStockouts > 0 ? 'red' : 'green'} />
                </InteractiveKpiWrapper>

                <InteractiveKpiWrapper popoverKey="productivity" title="View Productivity Report" popoverContent={<p>Based on harvest yield vs labor hours.</p>} setActiveModal={() => alert('Detailed labor productivity reports coming soon!')} activePopover={activePopover} setActivePopover={setActivePopover}>
                    <KPICard title="Labor Productivity" value={`${kpis.laborProductivity}`} icon={<GaugeIcon />} color="yellow" children={<p>kg per labor-hour</p>}/>
                </InteractiveKpiWrapper>
                
                <InteractiveKpiWrapper popoverKey="safety" title="Log a Safety Incident" popoverContent={<p>0 incidents in the last 7 days.</p>} setActiveModal={() => alert('Safety incident logging feature coming soon!')} activePopover={activePopover} setActivePopover={setActivePopover}>
                    <KPICard title="Safety Incidents" value="0" icon={<ShieldAlertIcon />} color="green" children={<p>Last 7 days</p>}/>
                </InteractiveKpiWrapper>
            </div>

             {/* Main Content */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                        <h3 className="text-xl font-semibold mb-4 text-foreground">Today's Focus</h3>
                        <KanbanBoard tasks={tasks} usersById={usersById} />
                    </div>
                    <UpcomingMaintenance equipment={equipment} />
                    <UpcomingTreatments tasks={upcomingTreatments} usersById={usersById} />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <WeatherWidget weatherData={weatherData} loading={weatherLoading} error={weatherError} />
                    <ClockedInTeam timeLogs={timeLogs} users={users} />
                    <CropHealthQuickView snapshotsByField={cropHealthSnapshotsByField} fields={fields} plantingsByField={plantingsByField} />
                    <HerdProductivity productivity={herdProductivity} />
                </div>
                <div className="lg:col-span-3">
                    <FieldOversight 
                        fields={fields} 
                        plantingsByField={plantingsByField}
                        cropHealthSnapshotsByField={cropHealthSnapshotsByField}
                        wateringEventsByField={wateringEventsByField}
                    />
                </div>
            </div>


            {/* Modals */}
            {activeModal === 'tasks' && (
                <TaskListModal 
                    isOpen={true} 
                    onClose={() => setActiveModal(null)} 
                    title="Tasks Due Today"
                    tasks={tasksDueTodayList}
                    usersById={usersById}
                    fields={fields}
                    livestock={livestock}
                    onEditTask={onEditTask}
                    onCompleteTask={onCompleteTask}
                    onExchangeTask={onExchangeTask}
                    onApproveRequest={onApproveRequest}
                    onDenyRequest={onDenyRequest}
                    taskExchangeData={taskExchangeData}
                    dailyExchanges={dailyExchanges}
                    weeklyExchanges={weeklyExchanges}
                />
            )}

            {activeModal === 'equipment' && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Fleet Status">
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {equipment.map(e => {
                             const styles = getEquipmentStatusStyles(e.status);
                             const operator = e.currentOperatorId ? usersById[e.currentOperatorId]?.name : 'Idle';
                             return (
                                <div key={e.id} className={`p-3 rounded-lg ${styles.bg} border-l-4 ${styles.dot.replace('bg-', 'border-')}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-foreground">{e.name}</p>
                                            <p className="text-sm text-muted-foreground">Operator: {operator} | Fuel: {e.fuelLevel}%</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button size="sm" variant="secondary" onClick={() => onEditEquipment(e)} icon={<PencilIcon />} />
                                            <Button size="sm" variant="secondary" onClick={() => onAddMaintenanceLog(e)} icon={<WrenchIcon />} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Modal>
            )}

            {activeModal === 'inventory' && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Critical Stockouts">
                     <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {lowStockItems.length > 0 ? lowStockItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-red-500/10 rounded-md">
                                <p className="font-medium text-red-800 dark:text-red-300">{item.name}</p>
                                <p className="font-bold text-red-700 dark:text-red-200">{item.stock_qty} / {item.reorder_level} {item.unit}</p>
                            </div>
                        )) : <p className="text-center text-muted-foreground py-8">All stock levels are healthy.</p>}
                     </div>
                     <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-border">
                        <Button variant="secondary" onClick={onManageInventory}>Go to Inventory</Button>
                        <Button onClick={() => {
                            onAddTask();
                            // This is a bit of a hack to pre-fill, in a real app you'd pass state to the modal
                            setTimeout(() => {
                                const titleInput = document.getElementById('input-task-title') as HTMLInputElement;
                                if(titleInput) titleInput.value = 'Restock critical inventory items';
                            }, 100);
                        }}>Create Restock Task</Button>
                     </div>
                </Modal>
            )}

        </div>
    );
}

const InteractiveKpiWrapper: React.FC<{
    popoverKey: string;
    title: string;
    popoverContent: React.ReactNode;
    setActiveModal: () => void;
    activePopover: string | null;
    setActivePopover: (key: string | null) => void;
    children: React.ReactNode;
}> = ({ popoverKey, title, popoverContent, setActiveModal, activePopover, setActivePopover, children }) => (
    <div 
        className="relative cursor-pointer"
        onMouseEnter={() => setActivePopover(popoverKey)}
        onMouseLeave={() => setActivePopover(null)}
        onClick={setActiveModal}
        role="button"
        tabIndex={0}
        aria-label={title}
    >
        {children}
        {activePopover === popoverKey && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-popover p-3 rounded-xl shadow-lg border border-border z-10 text-sm animate-fade-in-down">
                {popoverContent}
            </div>
        )}
    </div>
);

const TaskListModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    tasks: Task[];
    usersById: Record<number, User>;
    fields: Field[];
    livestock: Livestock[];
    onEditTask: (task: Task) => void;
    onCompleteTask: (task: Task) => void;
    onExchangeTask: (task: Task) => void;
    onApproveRequest: (log: TaskExchangeLog) => void;
    onDenyRequest: (log: TaskExchangeLog) => void;
    taskExchangeData: ReturnType<typeof useTaskExchangeData>;
    dailyExchanges: number;
    weeklyExchanges: number;
}> = ({ isOpen, onClose, title, tasks, usersById, fields, livestock, onEditTask, onCompleteTask, onExchangeTask, onApproveRequest, onDenyRequest, taskExchangeData, dailyExchanges, weeklyExchanges }) => {
    const fieldsById = useMemo(() => fields.reduce((acc, f) => ({ ...acc, [f.id]: f }), {} as Record<number, Field>), [fields]);
    const livestockById = useMemo(() => livestock.reduce((acc, l) => ({ ...acc, [l.id]: l }), {} as Record<string, Livestock>), [livestock]);
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {tasks.length > 0 ? tasks.map(task => (
                    <TaskItem 
                        key={task.id}
                        task={task}
                        assignee={usersById[task.assigneeId]}
                        completer={task.completedByUserId ? usersById[task.completedByUserId] : undefined}
                        field={task.relatedFieldId ? fieldsById[task.relatedFieldId] : undefined}
                        livestock={task.relatedLivestockId ? livestockById[task.relatedLivestockId] : undefined}
                        onStartTask={() => {}}
                        onEditTask={onEditTask}
                        onCompleteTask={onCompleteTask}
                        onExchangeTask={onExchangeTask}
                        onApproveRequest={onApproveRequest}
                        onDenyRequest={onDenyRequest}
                        taskExchangeData={taskExchangeData}
                        dailyExchanges={dailyExchanges}
                        weeklyExchanges={weeklyExchanges}
                    />
                )) : (
                    <p className="text-center text-muted-foreground py-8">No tasks to display.</p>
                )}
            </div>
        </Modal>
    );
};

const ClockedInTeam: React.FC<{ timeLogs: TimeLog[]; users: User[] }> = ({ timeLogs, users }) => {
    const ClockedInUserRow: React.FC<{ log: TimeLog; user: User }> = ({ log, user }) => {
        const [duration, setDuration] = useState('');

        useEffect(() => {
            const calculateDuration = () => {
                const now = new Date();
                const start = new Date(log.clockIn);
                const diff = now.getTime() - start.getTime();

                const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
                const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
                const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
                
                setDuration(`${hours}:${minutes}:${seconds}`);
            };

            calculateDuration(); // Initial calculation
            const interval = setInterval(calculateDuration, 60000); // Update every minute

            return () => clearInterval(interval);
        }, [log.clockIn]);

        return (
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-3">
                    <UserIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                </div>
                <p className="font-semibold text-sm text-green-600">{duration}</p>
            </div>
        );
    };

    const clockedInUsers = useMemo(() => {
        const ongoingLogs = timeLogs.filter(log => log.status === 'Ongoing');
        const userMap = new Map(users.map(u => [u.id, u]));
        return ongoingLogs.map(log => ({
            log,
            user: userMap.get(log.userId)
        })).filter((item): item is { log: TimeLog, user: User } => !!item.user);
    }, [timeLogs, users]);

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Clocked-In Team</h3>
            {clockedInUsers.length > 0 ? (
                <div className="space-y-3">
                    {clockedInUsers.map(({ log, user }) => (
                       <ClockedInUserRow key={log.id} log={log} user={user} />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No one is currently clocked in.</p>
            )}
        </div>
    );
};

const UpcomingMaintenance: React.FC<{ equipment: Equipment[] }> = ({ equipment }) => {
    const upcoming = useMemo(() => {
        return equipment.filter(e => {
            const hoursRemaining = e.nextMaintenanceHours - e.totalHours;
            return hoursRemaining <= 50 && hoursRemaining > 0;
        }).sort((a, b) => (a.nextMaintenanceHours - a.totalHours) - (b.nextMaintenanceHours - b.totalHours));
    }, [equipment]);

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Upcoming Maintenance</h3>
            {upcoming.length > 0 ? (
                <div className="space-y-3">
                    {upcoming.map(e => (
                         <div key={e.id} className="flex justify-between items-center text-sm p-3 bg-yellow-500/10 rounded-md border-l-4 border-yellow-500">
                            <div>
                                <p className="font-semibold text-foreground">{e.name}</p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">Service due in {e.nextMaintenanceHours - e.totalHours} hours</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-foreground">{e.totalHours.toLocaleString()} / {e.nextMaintenanceHours.toLocaleString()} hrs</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No equipment nearing service interval.</p>
            )}
        </div>
    );
};

const CropHealthQuickView: React.FC<{ 
    snapshotsByField: Record<number, CropHealthSnapshot[]>, 
    fields: Field[],
    plantingsByField: Record<number, Planting[]>
}> = ({ snapshotsByField, fields, plantingsByField }) => {
    
    const fieldHealthData = useMemo(() => {
        // FIX: Add initial value to reduce to fix type error.
        const allPlantings: Planting[] = Object.values(plantingsByField).reduce((acc: Planting[], val: Planting[]) => acc.concat(val), []);

        const activePlantingFieldIds = new Set(
            allPlantings.filter(p => p.status === 'Active').map(p => p.field_id)
        );
        
        // Map over fields that have active plantings
        return fields
            .filter(f => activePlantingFieldIds.has(f.id))
            .map(field => {
                const snapshots = snapshotsByField[field.id] || [];
                const latest = snapshots.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                return { field, latest };
            });

    }, [snapshotsByField, fields, plantingsByField]);

    const getScoreColor = (score: HealthScore) => {
        if (score === 'Excellent') return 'text-green-500';
        if (score === 'Good') return 'text-blue-500';
        if (score === 'Fair') return 'text-yellow-500';
        if (score === 'Poor') return 'text-red-500';
        return 'text-muted-foreground';
    };

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
            <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2"><LeafIcon className="h-5 w-5 text-green-500"/>Crop Health</h3>
            {fieldHealthData.length > 0 ? (
                 <div className="space-y-3">
                    {fieldHealthData.map(({ field, latest }) => (
                        <div key={field.id} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded-md">
                            <p className="font-semibold text-foreground">{field.name}</p>
                            {latest ? (
                                <div className="text-right">
                                    <p className={`font-bold ${getScoreColor(latest.score)}`}>{latest.score}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(latest.date).toLocaleDateString()}</p>
                                </div>
                            ) : (
                                <p className="text-xs font-semibold text-yellow-600">No Snapshot</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                 <p className="text-sm text-muted-foreground text-center py-4">No fields with active crops.</p>
            )}
        </div>
    );
};

const UpcomingTreatments: React.FC<{ tasks: Task[], usersById: Record<number, User> }> = ({ tasks, usersById }) => (
    <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Upcoming Treatments & Health Checks</h3>
        {tasks.length > 0 ? (
            <div className="space-y-3">
                {tasks.map(task => (
                    <div key={task.id} className="flex justify-between items-center text-sm p-3 bg-blue-500/10 rounded-md border-l-4 border-blue-500">
                        <div>
                            <p className="font-semibold text-foreground">{task.title}</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                                Assignee: {usersById[task.assigneeId]?.name || 'N/A'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-foreground">{new Date(task.dueDate + 'T00:00:00Z').toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">{task.priority}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming treatments scheduled.</p>
        )}
    </div>
);

const HerdProductivity: React.FC<{ productivity: Record<string, number> }> = ({ productivity }) => (
    <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Today's Herd Productivity</h3>
        {Object.keys(productivity).length > 0 ? (
            <div className="space-y-3">
                {Object.entries(productivity).map(([key, value]) => (
                     <div key={key} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded-md">
                        <p className="font-semibold text-foreground">{key}</p>
                        <p className="font-bold text-lg text-primary">{value.toLocaleString()}</p>
                    </div>
                ))}
            </div>
        ) : (
             <p className="text-sm text-muted-foreground text-center py-4">No production logged for today.</p>
        )}
    </div>
);

export default ManagerDashboard;