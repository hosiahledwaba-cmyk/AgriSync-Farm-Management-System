import React, { useMemo, useState, useEffect } from 'react';
import { Field, Task, Livestock, FinanceTransaction, User, Planting, Harvest, TaskStatus, InventoryItem, Role, FieldInsights } from '../types';
import KPICard from './ui/KPICard';
import { BarChartIcon, DollarSignIcon, MapPinIcon, ShieldAlertIcon, ClipboardListIcon, CowIcon, TractorIcon, ArchiveIcon, PlusIcon, PencilIcon, CheckIcon } from './ui/Icon';
import FarmMap from './ui/FarmMap';
import Button from './ui/Button';
import { formatCurrency } from '../utils/currency';
import Modal from './ui/Modal';
import { getFieldInsights } from '../services/geminiService';
import YieldComparisonChart from './ui/YieldComparisonChart';

// Props interface
interface OwnerDashboardProps {
  fields: Field[];
  tasks: Task[];
  livestock: Livestock[];
  transactions: FinanceTransaction[];
  users: User[];
  plantingsByField: Record<number, Planting[]>;
  harvestsByField: Record<number, Harvest[]>;
  inventoryItems: InventoryItem[];
  onSelectField: (field: Field) => void;
  onManageInventory: () => void;
  onEditTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onAddTransaction: () => void;
}

// A simple sparkline component
const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
    if (data.length < 2) return <div className="h-8 w-20 text-xs text-muted-foreground">Not enough data</div>;
    const width = 80;
    const height = 32;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min === 0 ? 1 : max - min;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-20 h-8">
            <polyline
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                points={points}
            />
        </svg>
    );
};

const FieldYieldProjection: React.FC<{
    field: Field;
    plantings: Planting[];
    allHarvests: Harvest[];
    allPlantingsForHistory: Planting[];
}> = ({ field, plantings, allHarvests, allPlantingsForHistory }) => {
    const [insights, setInsights] = useState<FieldInsights | null>(null);
    const [loading, setLoading] = useState(true);

    const activePlanting = useMemo(() => plantings.find(p => p.status === 'Active'), [plantings]);

    useEffect(() => {
        const fetchInsights = async () => {
            if (!activePlanting) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const simpleField = { ...field };
                const result = await getFieldInsights({ field: simpleField, activePlanting });
                setInsights(result);
            } catch (error) {
                console.error(`Failed to get insights for ${field.name}`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [field, activePlanting]);

    const historicalAvgYield = useMemo(() => {
        if (!activePlanting) return 0;
        
        const relevantPlantings = allPlantingsForHistory.filter(p => 
            p.crop_name === activePlanting.crop_name && 
            p.status === 'Harvested' && 
            p.field_id === field.id
        );

        if (relevantPlantings.length === 0) return 0;

        const yields = relevantPlantings.map(p => {
            const harvest = allHarvests.find(h => h.planting_id === p.id);
            if (!harvest || !p.area_planted || p.area_planted === 0) return 0;
            return (harvest.weight_kg / 1000) / p.area_planted; // tons per hectare
        }).filter(y => y > 0);
            
        if (yields.length === 0) return 0;
        
        const totalYield = yields.reduce((sum, y) => sum + y, 0);
        return totalYield / yields.length;
    }, [allHarvests, allPlantingsForHistory, activePlanting, field.id]);


    if (!activePlanting) return null;

    return (
        <div>
            <h4 className="font-semibold text-foreground mb-2">{field.name} - <span className="text-muted-foreground">{activePlanting.crop_name}</span></h4>
            <YieldComparisonChart 
                historicalYield={historicalAvgYield}
                predictedYield={insights?.expectedYield}
                loading={loading}
            />
        </div>
    );
};


const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ fields, tasks, livestock, transactions, users, plantingsByField, harvestsByField, inventoryItems, onSelectField, onManageInventory, onEditTask, onCompleteTask, onAddTransaction }) => {
    const [activePopover, setActivePopover] = useState<string | null>(null);
    const [modalData, setModalData] = useState<{ title: string; tasks: Task[] } | null>(null);
    
    const { overdueTasks, tasksDueTodayList } = useMemo(() => {
        const overdue = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status === TaskStatus.Pending);
        const todayStr = new Date().toISOString().split('T')[0];
        const today = tasks.filter(t => t.dueDate === todayStr && t.status === TaskStatus.Pending);
        return { overdueTasks: overdue, tasksDueTodayList: today };
    }, [tasks]);

    const financeSummary = useMemo(() => {
        const totalRevenue = transactions.filter(t=>t.type === 'income').reduce((s,t) => s+t.amount, 0);
        const totalExpenses = transactions.filter(t=>t.type === 'expense').reduce((s,t) => s+t.amount, 0);
        const netIncome = totalRevenue - totalExpenses;
        return { totalRevenue, totalExpenses, netIncome };
    }, [transactions]);
    
    const kpis = useMemo(() => {
        return { 
            netIncome: financeSummary.netIncome, 
            criticalAlertsCount: overdueTasks.length, 
            tasksDueToday: tasksDueTodayList.length 
        };
    }, [financeSummary.netIncome, overdueTasks.length, tasksDueTodayList.length]);

    const fieldProductivity = useMemo(() => {
        // FIX: Ensure reduce has a typed initial value to correctly flatten the array.
        const allHarvests: Harvest[] = Object.values(harvestsByField).reduce((acc: Harvest[], val: Harvest[]) => acc.concat(val), []);
        if (fields.length === 0 || allHarvests.length === 0) return { fieldStats: [], averageYield: 0 };
        
        const yieldByField = fields.map(field => {
            const fieldHarvests = allHarvests.filter(h => h.field_id === field.id);
            const totalYield = fieldHarvests.reduce((sum, h) => sum + h.weight_kg, 0);
            const yieldPerHa = field.area > 0 ? totalYield / field.area : 0;
            return { ...field, yieldPerHa };
        });

        const totalYieldSum = yieldByField.reduce((sum, f) => sum + f.yieldPerHa, 0);
        const averageYield = yieldByField.length > 0 ? totalYieldSum / yieldByField.length : 0;
        
        return { fieldStats: yieldByField.sort((a,b) => b.yieldPerHa - a.yieldPerHa), averageYield };

    }, [fields, harvestsByField]);

    const getProductivityStatus = (yieldPerHa: number, averageYield: number): { color: string, label: string } => {
        if (averageYield === 0) return { color: 'gray-400', label: 'No data' };
        const ratio = yieldPerHa / averageYield;
        if (ratio > 1.1) return { color: 'green-500', label: 'High' };
        if (ratio >= 0.9) return { color: 'yellow-500', label: 'Average' };
        return { color: 'red-500', label: 'Low' };
    };

    const operationsSummary = useMemo(() => {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const recentTasks = tasks.filter(t => new Date(t.dueDate) >= last7Days);
        const completedRecent = recentTasks.filter(t => t.status === TaskStatus.Completed);
        const completionRate = recentTasks.length > 0 ? (completedRecent.length / recentTasks.length) * 100 : 0;

        const totalAnimals = livestock.reduce((sum, item) => sum + (item.count || 1), 0);
        return { completionRate, totalAnimals };
    }, [tasks, livestock]);

    const financeTrend = useMemo(() => {
        // FIX: Explicitly type the accumulator to ensure correct type inference.
        const pnlMonthly = transactions.reduce((acc: Record<string, number>, t) => {
            const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            // FIX: Operator precedence was wrong, added parentheses.
            const amount = (acc[month] || 0) + (t.type === 'income' ? t.amount : -t.amount);
            return {
                ...acc,
                [month]: amount,
            };
        }, {} as Record<string, number>);
        
        const pnlTrendData = Object.values(pnlMonthly).reverse();

        const revenueByProduct = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => {
                const product = t.relatedEntityName || t.description.split(' from ')[0] || 'General Sale';
                if (!acc[product]) acc[product] = 0;
                acc[product] += t.amount;
                return acc;
            }, {} as Record<string, number>);

        const topProducts = Object.entries(revenueByProduct).sort((a,b) => b[1] - a[1]).slice(0, 3);
        
        return { pnlTrendData, topProducts };
    }, [transactions]);
    
    const recentActivity = useMemo(() => {
        const activities: { date: Date; type: string; description: string; user?: string }[] = [];
        const usersById = users.reduce((acc, u) => ({...acc, [u.id]: u.name}), {} as Record<number, string>);

        tasks.filter(t => t.completedAt).forEach(t => activities.push({
            date: new Date(t.completedAt!),
            type: 'Task',
            description: `Completed: ${t.title}`,
            user: t.completedByUserId ? usersById[t.completedByUserId] : undefined
        }));

        // FIX: Ensure reduce has a typed initial value to correctly flatten the array.
        const allPlantingsForActivity: Planting[] = Object.values(plantingsByField).reduce((acc: Planting[], val: Planting[]) => acc.concat(val), []);
        allPlantingsForActivity.forEach(p => activities.push({
            date: new Date(p.date_planted),
            type: 'Planting',
            description: `Planted ${p.crop_name} in field ${fields.find(f => f.id === p.field_id)?.name || ''}`,
            user: usersById[p.operator_id]
        }));
        
         // FIX: Ensure reduce has a typed initial value to correctly flatten the array.
         const allHarvestsForActivity: Harvest[] = Object.values(harvestsByField).reduce((acc: Harvest[], val: Harvest[]) => acc.concat(val), []);
         allHarvestsForActivity.forEach(h => activities.push({
            date: new Date(h.date),
            type: 'Harvest',
            description: `Harvested ${h.weight_kg}kg of ${h.crop_name} from ${fields.find(f => f.id === h.field_id)?.name || ''}`,
            user: usersById[h.operator_id]
        }));

        transactions.forEach(t => activities.push({
            date: new Date(t.date),
            type: t.type === 'income' ? 'Sale' : 'Expense',
            description: t.description,
        }));
        
        return activities.sort((a,b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    }, [tasks, transactions, plantingsByField, harvestsByField, users, fields]);

    const lowStockItems = useMemo(() => {
        return inventoryItems.filter(item => item.stock_qty <= item.reorder_level);
    }, [inventoryItems]);

    // FIX: Ensure reduce has a typed initial value to correctly flatten the arrays.
    const allPlantings = useMemo(() => Object.values(plantingsByField).reduce((acc: Planting[], val: Planting[]) => acc.concat(val), []), [plantingsByField]);
    const allHarvests = useMemo(() => Object.values(harvestsByField).reduce((acc: Harvest[], val: Harvest[]) => acc.concat(val), []), [harvestsByField]);
    
    const fieldsWithActivePlantings = useMemo(() => {
        const activeFieldIds = new Set(allPlantings.filter(p => p.status === 'Active').map(p => p.field_id));
        return fields.filter(f => activeFieldIds.has(f.id));
    }, [fields, allPlantings]);


    return (
        <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Owner's Command Center</h2>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <div 
                    className="relative cursor-pointer"
                    onMouseEnter={() => setActivePopover('income')}
                    onMouseLeave={() => setActivePopover(null)}
                    onClick={onAddTransaction}
                    role="button"
                    tabIndex={0}
                    aria-label="View net income details and add transaction"
                >
                    <KPICard title="Net Income (All Time)" value={formatCurrency(kpis.netIncome, 0)} icon={<DollarSignIcon />} color={kpis.netIncome >= 0 ? 'green' : 'red'} />
                    {activePopover === 'income' && (
                        <div className="absolute top-full left-0 mt-2 w-full min-w-[250px] bg-popover p-3 rounded-xl shadow-lg border border-border z-10 text-sm animate-fade-in-down">
                            <div className="flex justify-between border-b border-border pb-1 mb-1">
                                <span className="text-muted-foreground">Total Revenue:</span> 
                                <span className="font-bold text-green-500">{formatCurrency(financeSummary.totalRevenue, 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Expenses:</span> 
                                <span className="font-bold text-red-500">{formatCurrency(financeSummary.totalExpenses, 0)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div 
                    className="relative cursor-pointer"
                    onMouseEnter={() => setActivePopover('alerts')}
                    onMouseLeave={() => setActivePopover(null)}
                    onClick={() => setModalData({ title: 'Overdue Tasks', tasks: overdueTasks })}
                    role="button"
                    tabIndex={0}
                    aria-label="View and manage critical alerts"
                >
                    <KPICard title="Critical Alerts" value={kpis.criticalAlertsCount.toString()} icon={<ShieldAlertIcon />} color="red" children={<p>{kpis.criticalAlertsCount} tasks are overdue.</p>} />
                    {activePopover === 'alerts' && (
                        <div className="absolute top-full left-0 mt-2 w-full min-w-[250px] bg-popover p-3 rounded-xl shadow-lg border border-border z-10 text-sm space-y-1 animate-fade-in-down">
                            <p className="font-bold border-b border-border pb-1 mb-1">Overdue Tasks:</p>
                            {overdueTasks.slice(0,3).map(t => <p key={t.id} className="truncate text-muted-foreground">&bull; {t.title}</p>)}
                            {overdueTasks.length > 3 && <p className="text-xs text-center text-muted-foreground">...and {overdueTasks.length - 3} more.</p>}
                            {overdueTasks.length === 0 && <p className="text-xs text-center text-muted-foreground">No overdue tasks.</p>}
                        </div>
                    )}
                </div>

                <div 
                    className="relative cursor-pointer col-span-2 md:col-span-1"
                    onMouseEnter={() => setActivePopover('today')}
                    onMouseLeave={() => setActivePopover(null)}
                    onClick={() => setModalData({ title: 'Tasks Due Today', tasks: tasksDueTodayList })}
                    role="button"
                    tabIndex={0}
                    aria-label="View and manage tasks due today"
                >
                    <KPICard title="Tasks Due Today" value={kpis.tasksDueToday.toString()} icon={<ClipboardListIcon />} color="yellow" />
                    {activePopover === 'today' && (
                        <div className="absolute top-full left-0 mt-2 w-full min-w-[250px] bg-popover p-3 rounded-xl shadow-lg border border-border z-10 text-sm space-y-1 animate-fade-in-down">
                            <p className="font-bold border-b border-border pb-1 mb-1">Tasks Due Today:</p>
                            {tasksDueTodayList.slice(0,3).map(t => <p key={t.id} className="truncate text-muted-foreground">&bull; {t.title}</p>)}
                            {tasksDueTodayList.length > 3 && <p className="text-xs text-center text-muted-foreground">...and {tasksDueTodayList.length - 3} more.</p>}
                            {tasksDueTodayList.length === 0 && <p className="text-xs text-center text-muted-foreground">No tasks due today.</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Map & Fields */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><MapPinIcon className="mr-2 h-5 w-5 text-primary"/> Farm Map & Fields</h3>
                        <FarmMap fields={fields} onSelectField={onSelectField} />
                         <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                            {fieldProductivity.fieldStats.map(field => {
                                const status = getProductivityStatus(field.yieldPerHa, fieldProductivity.averageYield);
                                return (
                                    <div key={field.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted">
                                        <div className="flex items-center">
                                             <span className={`h-2.5 w-2.5 rounded-full mr-3 bg-${status.color}`}></span>
                                             <span className="font-medium text-foreground">{field.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold">{field.yieldPerHa.toFixed(0)} kg/ha</span>
                                            <span className="text-xs text-muted-foreground block">{status.label}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Middle Column - Operations & Livestock */}
                <div className="lg:col-span-1 space-y-4">
                     <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center"><TractorIcon className="mr-2 h-5 w-5 text-primary"/> Operations</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Task Completion (last 7d)</span>
                                <span className="font-bold text-lg text-foreground">{operationsSummary.completionRate.toFixed(0)}%</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Crop Pipeline</span>
                                <span className="font-semibold text-sm text-muted-foreground">Planting &#8594; Growing &#8594; Harvest</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center"><CowIcon className="mr-2 h-5 w-5 text-primary"/> Livestock</h3>
                        <div className="space-y-3">
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Animals</span>
                                <span className="font-bold text-lg text-foreground">{operationsSummary.totalAnimals}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Health Index</span>
                                <span className="font-bold text-lg text-green-500">92%</span>
                            </div>
                        </div>
                    </div>
                     <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Recent Activity</h3>
                        <div className="space-y-2 text-sm">
                            {recentActivity.map((act, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-foreground">{act.description}</p>
                                        <p className="text-xs text-muted-foreground">{act.type}{act.user ? ` by ${act.user}`: ''}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">{act.date.toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Finance & Inventory */}
                <div className="lg:col-span-1 space-y-4">
                     <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><BarChartIcon className="mr-2 h-5 w-5 text-primary"/> Finance</h3>
                        <div className="flex justify-between items-center mb-2">
                             <div>
                                <p className="text-sm text-muted-foreground">Net Income</p>
                                <p className={`font-bold text-xl ${financeSummary.netIncome >= 0 ? 'text-foreground' : 'text-red-500'}`}>{formatCurrency(financeSummary.netIncome, 0)}</p>
                            </div>
                            <Sparkline data={financeTrend.pnlTrendData} />
                        </div>
                         <div className="text-xs space-y-1">
                            <div className="flex justify-between"><span className="text-muted-foreground">Revenue:</span> <span className="text-green-500">{formatCurrency(financeSummary.totalRevenue, 0)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Expenses:</span> <span className="text-red-500">{formatCurrency(financeSummary.totalExpenses, 0)}</span></div>
                        </div>
                        <h4 className="font-semibold text-sm mt-4 mb-2">Top Revenue Sources</h4>
                        <div className="space-y-1 text-sm">
                            {financeTrend.topProducts.map(([name, amount]) => (
                                <div key={name} className="flex justify-between">
                                    <span>{name}</span>
                                    <span className="font-medium">{formatCurrency(amount, 0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-foreground flex items-center"><ArchiveIcon className="mr-2 h-5 w-5 text-primary"/> Inventory Health</h3>
                            <Button size="sm" variant="secondary" onClick={onManageInventory}>Manage</Button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Items Low on Stock</span>
                                <span className={`font-bold text-lg ${lowStockItems.length > 0 ? 'text-red-500' : 'text-foreground'}`}>{lowStockItems.length}</span>
                            </div>
                             {lowStockItems.length > 0 && (
                                <div className="text-sm space-y-1 pt-2 border-t border-border">
                                    <h4 className="font-semibold text-muted-foreground">Reorder Needed:</h4>
                                    {lowStockItems.slice(0, 3).map(item => (
                                        <div key={item.id} className="flex justify-between">
                                            <span>{item.name}</span>
                                            <span className="font-medium">{item.stock_qty} / {item.reorder_level} {item.unit}</span>
                                        </div>
                                    ))}
                                    {lowStockItems.length > 3 && <p className="text-xs text-muted-foreground text-center">...and {lowStockItems.length - 3} more.</p>}
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>

             {/* New Section */}
            {fieldsWithActivePlantings.length > 0 && (
                <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Farm-Wide Yield Projections</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fieldsWithActivePlantings.map(field => (
                            <FieldYieldProjection 
                                key={field.id}
                                field={field}
                                plantings={plantingsByField[field.id] || []}
                                allHarvests={allHarvests}
                                allPlantingsForHistory={allPlantings}
                            />
                        ))}
                    </div>
                </div>
            )}

            {modalData && (
                <TaskListModal
                    isOpen={!!modalData}
                    onClose={() => setModalData(null)}
                    title={modalData.title}
                    tasks={modalData.tasks}
                    users={users}
                    onEditTask={(task) => { setModalData(null); onEditTask(task); }}
                    onCompleteTask={(task) => { setModalData(null); onCompleteTask(task); }}
                />
            )}
        </div>
    );
}

interface TaskListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    tasks: Task[];
    users: User[];
    onEditTask: (task: Task) => void;
    onCompleteTask: (task: Task) => void;
}

const TaskListModal: React.FC<TaskListModalProps> = ({ isOpen, onClose, title, tasks, users, onEditTask, onCompleteTask }) => {
    const usersById = React.useMemo(() => users.reduce((acc, u) => ({ ...acc, [u.id]: u.name }), {} as Record<number, string>), [users]);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {tasks.length > 0 ? tasks.map(task => (
                    <div key={task.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 rounded-md bg-muted/50 border border-border gap-2">
                        <div>
                            <p className="font-medium text-foreground">{task.title}</p>
                            <p className="text-sm text-muted-foreground">
                                Assignee: {usersById[task.assigneeId] || 'N/A'} &bull; Due: {formatDate(task.dueDate)}
                            </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2 self-end sm:self-center">
                            <Button size="sm" variant="secondary" icon={<PencilIcon />} onClick={() => onEditTask(task)}>
                                Edit
                            </Button>
                            <Button size="sm" icon={<CheckIcon />} onClick={() => onCompleteTask(task)}>
                                Complete
                            </Button>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-muted-foreground py-8">No tasks to display.</p>
                )}
            </div>
        </Modal>
    );
};


export default OwnerDashboard;