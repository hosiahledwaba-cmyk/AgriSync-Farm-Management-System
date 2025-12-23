

import React, { useState, useMemo } from 'react';
import { Task, User, TaskCategory } from '../types';
import { ClipboardListIcon, UserIcon, ClockIcon, BarChartIcon } from './ui/Icon';
import KPICard from './ui/KPICard';
import { formatCurrency } from '../utils/currency';
import Button from './ui/Button';

interface TaskRecordsDashboardProps {
    tasks: Task[];
    users: User[];
}

const formatDuration = (minutes?: number) => {
    if (minutes === undefined || minutes === null) return 'N/A';
    if (minutes < 60) return `${minutes.toFixed(0)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
};

const TaskRecordItem: React.FC<{ task: Task; assignee?: User; completer?: User }> = ({ task, assignee, completer }) => {
    return (
        <div className="p-4 bg-card border-b border-border hover:bg-accent transition-colors">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                <div>
                    <p className="font-bold text-foreground">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                        Assigned to: {assignee?.name || 'N/A'} | Completed by: {completer?.name || 'N/A'}
                    </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-right flex-shrink-0">
                    <div>
                        <p className="font-semibold">{formatDuration(task.durationMinutes)}</p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    <div>
                        <p className="font-semibold">{new Date(task.completedAt!).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                </div>
            </div>
            {task.completionNotes && <p className="text-sm italic text-muted-foreground mt-2">"{task.completionNotes}"</p>}
        </div>
    );
};

const TaskRecordsDashboard: React.FC<TaskRecordsDashboardProps> = ({ tasks, users }) => {
    const [groupBy, setGroupBy] = useState<'user' | 'category'>('user');
    const [searchTerm, setSearchTerm] = useState('');
    
    const usersById = useMemo(() => users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {} as Record<number, User>), [users]);

    const completedTasks = useMemo(() => {
        return tasks
            .filter(t => t.status === 'Completed' && t.completedAt)
            .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
    }, [tasks, searchTerm]);
    
    const kpis = useMemo(() => {
        const totalTasks = completedTasks.length;
        const totalDuration = completedTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
        const avgDuration = totalTasks > 0 ? totalDuration / totalTasks : 0;
        return { totalTasks, avgDuration, totalHours: totalDuration / 60 };
    }, [completedTasks]);

    // FIX: Explicitly typed the accumulator in reduce to ensure correct type inference for groupedData.
    const groupedData = useMemo(() => {
        if (groupBy === 'user') {
            return completedTasks.reduce((acc: Record<string, Task[]>, task) => {
                const assigneeName = usersById[task.assigneeId]?.name || 'Unassigned';
                if (!acc[assigneeName]) {
                    acc[assigneeName] = [];
                }
                acc[assigneeName].push(task);
                return acc;
            }, {} as Record<string, Task[]>);
        } else { // group by category
            return completedTasks.reduce((acc: Record<string, Task[]>, task) => {
                const category = task.taskCategory || 'General';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(task);
                return acc;
            }, {} as Record<string, Task[]>);
        }
    }, [completedTasks, groupBy, usersById]);


    return (
        <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Task Records & Analytics</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard title="Total Tasks Completed" value={kpis.totalTasks.toString()} icon={<ClipboardListIcon />} color="blue" />
                <KPICard title="Average Completion Time" value={formatDuration(kpis.avgDuration)} icon={<ClockIcon />} color="purple" />
                <KPICard title="Total Hours Logged" value={`${kpis.totalHours.toFixed(1)}h`} icon={<BarChartIcon />} color="green" />
            </div>

            <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                     <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                        <Button size="sm" variant={groupBy === 'user' ? 'primary' : 'secondary'} onClick={() => setGroupBy('user')}>Group by User</Button>
                        <Button size="sm" variant={groupBy === 'category' ? 'primary' : 'secondary'} onClick={() => setGroupBy('category')}>Group by Category</Button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                
                <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                    {Object.entries(groupedData).map(([groupName, tasksInGroup]) => (
                        <div key={groupName}>
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 sticky top-0 bg-card/80 backdrop-blur-sm py-2 border-b border-border">
                                {groupBy === 'user' ? <UserIcon className="h-5 w-5"/> : <ClipboardListIcon className="h-5 w-5"/>}
                                {groupName} 
                                <span className="text-sm font-normal text-muted-foreground">({tasksInGroup.length} tasks)</span>
                            </h3>
                            <div className="divide-y divide-border">
                                {tasksInGroup.map(task => (
                                    <TaskRecordItem 
                                        key={task.id}
                                        task={task}
                                        assignee={usersById[task.assigneeId]}
                                        completer={task.completedByUserId ? usersById[task.completedByUserId] : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {Object.keys(groupedData).length === 0 && (
                    <p className="text-center py-16 text-muted-foreground">No completed tasks match your search.</p>
                )}
            </div>
        </div>
    );
};

export default TaskRecordsDashboard;