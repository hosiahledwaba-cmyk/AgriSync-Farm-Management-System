import React, { useMemo, useState } from 'react';
import { User, Task, Planting, Harvest, FinanceTransaction, TaskStatus, Role, TransactionType, TaskExchangeLog } from '../types';
import { ArrowLeftIcon, ClipboardListIcon, BarChartIcon, ShieldAlertIcon, TractorIcon, DollarSignIcon, FilterIcon, ArrowUpDownIcon, PlusIcon } from './ui/Icon';
import KPICard from './ui/KPICard';
import TaskItem from './TaskItem';
import { formatCurrency } from '../utils/currency';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTaskExchangeData } from '../hooks/useTaskExchangeData';

interface EmployeeDetailProps {
    employee: User;
    onBack: () => void;
    tasks: Task[];
    plantings: Planting[];
    harvests: Harvest[];
    transactions: FinanceTransaction[];
    users: User[]; 
    onEditTask: (task: Task) => void;
    onLogWageChange: (employee: User) => void;
    onExchangeTask: (task: Task) => void;
    onApproveRequest: (log: TaskExchangeLog) => void;
    onDenyRequest: (log: TaskExchangeLog) => void;
    taskExchangeData: ReturnType<typeof useTaskExchangeData>;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employee, onBack, tasks, plantings, harvests, transactions, users, onEditTask, onLogWageChange, onExchangeTask, onApproveRequest, onDenyRequest, taskExchangeData }) => {
    
    const { user: currentUser } = useAuth();
    const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | 'all'>('all');
    const [taskSortBy, setTaskSortBy] = useState<'due_date_asc' | 'priority_desc'>('priority_desc');
    const usersById = useMemo(() => users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {} as Record<number, User>), [users]);

    const employeeData = useMemo(() => {
        const assignedTasks = tasks.filter(t => t.assigneeId === employee.id);
        const completedTasks = assignedTasks.filter(t => t.status === TaskStatus.Completed);
        
        const onTimeTasks = completedTasks.filter(t => {
            if (!t.completedAt) return false;
            const due = new Date(t.dueDate);
            due.setUTCHours(23, 59, 59, 999); // Due at end of day
            return new Date(t.completedAt) <= due;
        });
        
        const overdueTasks = assignedTasks.filter(t => t.status !== TaskStatus.Completed && new Date(t.dueDate) < new Date());

        const loggedActivities = [
            ...plantings.filter(p => p.operator_id === employee.id),
            ...harvests.filter(h => h.operator_id === employee.id),
            // Could add maintenance logs here if they had an operator_id
        ];

        const financialContribution = transactions
            .filter(t => t.createdByUserId === employee.id && t.type === TransactionType.Income)
            .reduce((sum, t) => sum + t.amount, 0);

        const recentActivities: { date: string, type: string, description: string }[] = [
            ...plantings.filter(p => p.operator_id === employee.id).map(p => ({ 
                date: p.date_planted, 
                type: 'Planting', 
                description: `Planted ${p.crop_name} (${p.variety})` 
            })),
            ...harvests.filter(h => h.operator_id === employee.id).map(h => ({ 
                date: h.date, 
                type: 'Harvest', 
                description: `Harvested ${h.weight_kg}kg of ${h.crop_name}` 
            })),
            ...transactions.filter(t => t.createdByUserId === employee.id).map(t => ({ 
                date: t.date, 
                type: 'Finance', 
                description: `Logged transaction: ${t.description}` 
            })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
            assignedTasks,
            totalTasks: assignedTasks.length,
            completedCount: completedTasks.length,
            onTimeRate: completedTasks.length > 0 ? (onTimeTasks.length / completedTasks.length) * 100 : 100,
            overdueCount: overdueTasks.length,
            activitiesLogged: loggedActivities.length,
            financialContribution,
            recentActivities: recentActivities.slice(0, 5),
        };
    }, [employee, tasks, plantings, harvests, transactions]);
    
    const filteredAndSortedTasks = useMemo(() => {
        return employeeData.assignedTasks
            .filter(task => taskStatusFilter === 'all' || task.status === taskStatusFilter)
            .sort((a, b) => {
                if (taskSortBy === 'priority_desc') {
                    const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
                    return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4) - (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4);
                }
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });
    }, [employeeData.assignedTasks, taskStatusFilter, taskSortBy]);

    const dailyExchanges = taskExchangeData.getTodaysExchangesCount(currentUser.id);
    const weeklyExchanges = taskExchangeData.getThisWeeksExchangesCount(currentUser.id);


    const formatDate = (dateString: string) => new Date(dateString).toLocaleString();
    const selectClasses = "pl-3 pr-8 py-2 text-sm border-input focus:outline-none focus:ring-ring focus:border-primary rounded-md bg-background shadow-sm";

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-accent mr-4">
                        <ArrowLeftIcon className="h-6 w-6 text-muted-foreground" />
                    </button>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">{employee.name}</h2>
                        <p className="text-muted-foreground text-sm">{employee.role}</p>
                    </div>
                </div>
                {currentUser.role === Role.Owner && (
                    <Button onClick={() => onLogWageChange(employee)} icon={<PlusIcon />}>
                        Log Wage Change
                    </Button>
                )}
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <KPICard title="Tasks Assigned" value={`${employeeData.completedCount} / ${employeeData.totalTasks}`} icon={<ClipboardListIcon />} color="blue" />
                <KPICard title="On-Time Rate" value={`${employeeData.onTimeRate.toFixed(0)}%`} icon={<BarChartIcon />} color="green" />
                <KPICard title="Overdue Tasks" value={employeeData.overdueCount.toString()} icon={<ShieldAlertIcon />} color={employeeData.overdueCount > 0 ? 'red' : 'green'} />
                <KPICard title="Activities Logged" value={employeeData.activitiesLogged.toString()} icon={<TractorIcon />} color="purple" />
                <KPICard title="Financial Impact" value={formatCurrency(employeeData.financialContribution, 0)} icon={<DollarSignIcon />} color="yellow" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-card p-4 rounded-xl shadow-sm border border-border">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                        <h3 className="text-xl font-semibold text-foreground">Assigned Tasks</h3>
                        <div className="flex gap-2 items-center">
                            <div className="relative">
                                <FilterIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <select value={taskStatusFilter} onChange={e => setTaskStatusFilter(e.target.value as any)} className={selectClasses + ' pl-8'}>
                                    <option value="all">All Statuses</option>
                                    <option value={TaskStatus.Pending}>Pending</option>
                                    <option value={TaskStatus.InProgress}>In Progress</option>
                                    <option value={TaskStatus.Completed}>Completed</option>
                                </select>
                            </div>
                            <div className="relative">
                                <ArrowUpDownIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <select value={taskSortBy} onChange={e => setTaskSortBy(e.target.value as any)} className={selectClasses + ' pl-8'}>
                                    <option value="priority_desc">Sort by Priority</option>
                                    <option value="due_date_asc">Sort by Due Date</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {filteredAndSortedTasks.length > 0 ? (
                            filteredAndSortedTasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    assignee={usersById[task.assigneeId]}
                                    completer={task.completedByUserId ? usersById[task.completedByUserId] : undefined}
                                    onEditTask={onEditTask}
                                    onStartTask={() => {}}
                                    onCompleteTask={() => {}} // Completion is done from the main tasks dashboard for now
                                    onExchangeTask={onExchangeTask}
                                    onApproveRequest={onApproveRequest}
                                    onDenyRequest={onDenyRequest}
                                    taskExchangeData={taskExchangeData}
                                    dailyExchanges={dailyExchanges}
                                    weeklyExchanges={weeklyExchanges}
                                    showDetailedActions={false}
                                />
                            ))
                        ) : (
                            <p className="text-center py-8 text-muted-foreground">No tasks match the current filters.</p>
                        )}
                    </div>
                </div>
                 <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                        <h3 className="text-xl font-semibold text-foreground mb-4">Wage History</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 responsive-table">
                            {employee.wageHistory && employee.wageHistory.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase">
                                        <tr>
                                            <th className="py-2">Date</th>
                                            <th className="py-2 text-right">Old Rate</th>
                                            <th className="py-2 text-right">New Rate</th>
                                            <th className="py-2">Changed By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employee.wageHistory.map((change, index) => (
                                            <tr key={index} className="border-b border-border last:border-0">
                                                <td data-label="Date" className="py-2 text-muted-foreground">{formatDate(change.date).split(',')[0]}</td>
                                                <td data-label="Old Rate" className="py-2 text-right text-muted-foreground">{formatCurrency(change.oldRate)}</td>
                                                <td data-label="New Rate" className="py-2 text-right font-semibold text-foreground">{formatCurrency(change.newRate)}</td>
                                                <td data-label="Changed By" className="py-2 pl-2">{usersById[change.changedById]?.name || 'System'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center py-8 text-muted-foreground">No wage history available.</p>
                            )}
                        </div>
                    </div>
                     <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                        <h3 className="text-xl font-semibold text-foreground mb-4">Recent Activity Feed</h3>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {employeeData.recentActivities.length > 0 ? (
                                employeeData.recentActivities.map((activity, index) => (
                                    <div key={index} className="relative pl-6">
                                        <div className="absolute top-2 left-0 w-2 h-2 bg-primary rounded-full"></div>
                                        <div className="absolute top-2 left-0.5 w-full h-full border-l-2 border-border -z-10"></div>
                                        <p className="font-semibold text-sm">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground">{activity.type} &bull; {new Date(activity.date).toLocaleDateString()}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-8 text-muted-foreground">No recent farm activities logged.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetail;
