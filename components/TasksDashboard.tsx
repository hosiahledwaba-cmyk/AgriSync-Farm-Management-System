import React, { useState, useMemo } from 'react';
import { Task, Role, User, Field, TaskStatus, TaskPriority, Livestock, TaskExchangeLog } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import TaskItem from './TaskItem';
import { PlusIcon } from './ui/Icon';
import { useTaskExchangeData } from '../hooks/useTaskExchangeData';

interface TasksDashboardProps {
    tasks: Task[];
    users: User[];
    fields: Field[];
    livestock: Livestock[];
    onAddTask: () => void;
    onStartTask: (taskId: string) => void;
    onEditTask: (task: Task) => void;
    onCompleteTask: (task: Task) => void;
    onExchangeTask: (task: Task) => void;
    onApproveRequest: (log: TaskExchangeLog) => void;
    onDenyRequest: (log: TaskExchangeLog) => void;
    taskExchangeData: ReturnType<typeof useTaskExchangeData>;
}

const TasksDashboard: React.FC<TasksDashboardProps> = ({ tasks, users, fields, livestock, onAddTask, onStartTask, onEditTask, onCompleteTask, onExchangeTask, onApproveRequest, onDenyRequest, taskExchangeData }) => {
    const { user } = useAuth();
    const canManage = user.role === Role.Owner || user.role === Role.Manager;

    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>(TaskStatus.Pending);
    const [assigneeFilter, setAssigneeFilter] = useState<'my_tasks' | 'all'>('my_tasks');
    
    const usersById = useMemo(() => users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {} as Record<number, User>), [users]);
    const fieldsById = useMemo(() => fields.reduce((acc, f) => ({ ...acc, [f.id]: f }), {} as Record<number, Field>), [fields]);
    const livestockById = useMemo(() => livestock.reduce((acc, l) => ({ ...acc, [l.id]: l }), {} as Record<string, Livestock>), [livestock]);

    const priorityOrder = { [TaskPriority.Urgent]: 0, [TaskPriority.High]: 1, [TaskPriority.Medium]: 2, [TaskPriority.Low]: 3 };

    const getPriorityLevel = (priority: string): number => {
        const priorityKeys = Object.keys(priorityOrder) as Array<keyof typeof priorityOrder>;
        for (const key of priorityKeys) {
            if (priority.startsWith(key)) {
                return priorityOrder[key];
            }
        }
        return priorityKeys.length; // Custom priorities without a prefix are sorted last
    };

    const { incomingRequests, regularTasks } = useMemo(() => {
        const requests: Task[] = [];
        const regulars: Task[] = [];
        tasks.forEach(task => {
            const exchangeLog = task.relatedExchangeId ? taskExchangeData.exchangeLogs.find(log => log.id === task.relatedExchangeId) : undefined;
            if (task.taskCategory === 'Notification' && exchangeLog && exchangeLog.exchangedToUserId === user.id && exchangeLog.status === 'pending') {
                requests.push(task);
            } else if (task.taskCategory !== 'Notification') {
                regulars.push(task);
            }
        });
        return { incomingRequests: requests, regularTasks: regulars };
    }, [tasks, user.id, taskExchangeData.exchangeLogs]);


    const filteredAndSortedTasks = useMemo(() => {
        return regularTasks
            .filter(task => {
                const statusMatch = statusFilter === 'all' || task.status === statusFilter;
                
                let assigneeMatch = true;
                if (assigneeFilter === 'my_tasks') {
                    assigneeMatch = task.assigneeId === user.id || (task.secondaryAssigneeIds || []).includes(user.id);
                }

                return statusMatch && assigneeMatch;
            })
            .sort((a, b) => {
                // Primary sort: Completed tasks go to the bottom
                if (a.status === TaskStatus.Completed && b.status !== TaskStatus.Completed) return 1;
                if (a.status !== TaskStatus.Completed && b.status === TaskStatus.Completed) return -1;
                
                // If both are completed, sort by completion date (newest first)
                if (a.status === TaskStatus.Completed && b.status === TaskStatus.Completed) {
                    return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
                }

                // For pending tasks, sort by priority then due date
                const priorityA = getPriorityLevel(a.priority);
                const priorityB = getPriorityLevel(b.priority);
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });
    }, [regularTasks, statusFilter, assigneeFilter, user.id]);

    const selectClasses = "w-full sm:w-auto mt-1 block pl-3 pr-10 py-2 text-base border-input focus:outline-none focus:ring-ring focus:border-primary rounded-md bg-background shadow-sm";

    const dailyExchanges = taskExchangeData.getTodaysExchangesCount(user.id);
    const weeklyExchanges = taskExchangeData.getThisWeeksExchangesCount(user.id);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-foreground">Task Management</h2>
                {canManage && (
                    <Button onClick={onAddTask} icon={<PlusIcon />}>
                        Create New Task
                    </Button>
                )}
            </div>

            {/* Incoming Requests Section */}
            {incomingRequests.length > 0 && (
                <div className="bg-blue-500/5 p-4 rounded-xl shadow-sm border border-blue-500/20">
                    <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Incoming Requests</h3>
                    <div className="space-y-4">
                        {incomingRequests.map(task => (
                             <TaskItem 
                                key={task.id} 
                                task={task} 
                                onApproveRequest={onApproveRequest}
                                onDenyRequest={onDenyRequest}
                                taskExchangeData={taskExchangeData}
                                assignee={usersById[task.assigneeId]}
                                onStartTask={() => {}}
                                onEditTask={() => {}}
                                onCompleteTask={() => {}}
                                dailyExchanges={0}
                                weeklyExchanges={0}
                            />
                        ))}
                    </div>
                </div>
            )}


            {/* Filters */}
            <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-col sm:flex-row gap-4">
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className={selectClasses}>
                        <option value="all">All Statuses</option>
                        <option value={TaskStatus.Pending}>Pending</option>
                        <option value={TaskStatus.InProgress}>In Progress</option>
                        <option value={TaskStatus.Blocked}>Blocked</option>
                        <option value={TaskStatus.Completed}>Completed</option>
                    </select>
                </div>
                 <div>
                    <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                    <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value as any)} className={selectClasses}>
                        <option value="my_tasks">My Tasks</option>
                        {canManage && <option value="all">All Assignees</option>}
                    </select>
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-4">
                {filteredAndSortedTasks.length > 0 ? (
                    filteredAndSortedTasks.map(task => (
                        <TaskItem 
                            key={task.id} 
                            task={task} 
                            assignee={usersById[task.assigneeId]}
                            secondaryAssignees={(task.secondaryAssigneeIds || []).map(id => usersById[id])}
                            completer={task.completedByUserId ? usersById[task.completedByUserId] : undefined}
                            field={task.relatedFieldId ? fieldsById[task.relatedFieldId] : undefined}
                            livestock={task.relatedLivestockId ? livestockById[task.relatedLivestockId] : undefined}
                            onStartTask={() => onStartTask(task.id)}
                            onEditTask={onEditTask}
                            onCompleteTask={onCompleteTask}
                            onExchangeTask={onExchangeTask}
                            onApproveRequest={onApproveRequest}
                            onDenyRequest={onDenyRequest}
                            taskExchangeData={taskExchangeData}
                            dailyExchanges={dailyExchanges}
                            weeklyExchanges={weeklyExchanges}
                        />
                    ))
                ) : (
                    <div className="text-center py-16 bg-card rounded-xl shadow-sm border border-border">
                        <p className="text-muted-foreground font-semibold">No tasks match the current filters.</p>
                        <p className="text-muted-foreground text-sm">Try adjusting your filters or creating a new task.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TasksDashboard;