import React from 'react';
import { Task, User, Field, Role, TaskPriority, TaskStatus, TaskRecurrence, Livestock, TaskExchangeLog } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { RepeatIcon, UserIcon, MapPinIcon, CameraIcon, CowIcon, PencilIcon, RobotIcon, ChevronRightIcon, ThumbsUpIcon, ThumbsDownIcon } from './ui/Icon';

interface TaskItemProps {
    task: Task;
    assignee?: User;
    secondaryAssignees?: User[];
    completer?: User;
    field?: Field;
    livestock?: Livestock;
    onStartTask: () => void;
    onEditTask: (task: Task) => void;
    onCompleteTask: (task: Task) => void;
    onExchangeTask?: (task: Task) => void;
    onApproveRequest?: (log: TaskExchangeLog) => void;
    onDenyRequest?: (log: TaskExchangeLog) => void;
    taskExchangeData?: { exchangeLogs: TaskExchangeLog[] };
    dailyExchanges: number;
    weeklyExchanges: number;
    showDetailedActions?: boolean;
}

const getPriorityStyles = (priority: string) => {
    const styles = {
        [TaskPriority.Urgent]: { border: 'border-purple-500', badge: 'bg-purple-500/10 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' },
        [TaskPriority.High]: { border: 'border-red-500', badge: 'bg-red-500/10 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
        [TaskPriority.Medium]: { border: 'border-yellow-500', badge: 'bg-yellow-500/10 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' },
        [TaskPriority.Low]: { border: 'border-green-500', badge: 'bg-green-500/10 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
    };

    for (const key of Object.keys(styles) as Array<keyof typeof styles>) {
        if (priority.startsWith(key)) {
            return styles[key];
        }
    }
    
    return { border: 'border-gray-400', badge: 'bg-gray-500/10 dark:bg-gray-800/20 text-gray-700 dark:text-gray-400' };
};


const TaskItem: React.FC<TaskItemProps> = ({ task, assignee, secondaryAssignees = [], completer, field, livestock, onStartTask, onEditTask, onCompleteTask, onExchangeTask, onApproveRequest, onDenyRequest, taskExchangeData, dailyExchanges, weeklyExchanges, showDetailedActions = true }) => {
    const { user } = useAuth();
    const canManage = user.role === Role.Owner || user.role === Role.Manager;
    const isAssignee = user.id === task.assigneeId;

    const canStart = task.status === TaskStatus.Pending && (isAssignee || canManage);
    const canComplete = task.status === TaskStatus.InProgress && (isAssignee || canManage || (task.secondaryAssigneeIds || []).includes(user.id));
    const canEdit = canManage && task.status !== TaskStatus.Completed;
    
    const canExchange = isAssignee && user.role === Role.Worker && task.status !== TaskStatus.Completed && dailyExchanges < 1 && weeklyExchanges < 2;
    const hasPendingExchange = !!task.pendingExchangeId;

    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Completed;

    const priorityStyles = getPriorityStyles(task.priority);
    
    const statusClasses = {
        [TaskStatus.Pending]: 'border-border',
        [TaskStatus.InProgress]: 'border-blue-500 bg-blue-500/5',
        [TaskStatus.Blocked]: 'border-border',
        [TaskStatus.Completed]: 'border-border opacity-70',
    }

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
    });
    
    const getLivestockName = (l: Livestock) => {
        return l.trackingType === 'Individual' ? l.name || `Tag ${l.tagId}` : l.groupName;
    }

    const secondaryAssigneeNames = secondaryAssignees.map(u => u.name).join(', ');

    // Handle notification tasks for exchange requests
    if (task.taskCategory === 'Notification' && task.relatedExchangeId) {
        if (!taskExchangeData) return null; // Prevent crash if data is missing
        const exchangeLog = taskExchangeData.exchangeLogs.find(log => log.id === task.relatedExchangeId);
        if (!exchangeLog) return null; // Don't render if the log is gone
        
        // The actionable request is for the person the exchange was sent TO.
        const isActionableRequest = user.id === exchangeLog.exchangedToUserId;

        return (
             <div className="bg-blue-500/10 rounded-xl shadow-sm border-l-4 border-blue-500 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                    <h4 className="font-bold text-lg text-blue-800 dark:text-blue-200">{task.title}</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{task.description}</p>
                 </div>
                 {isAssignee && exchangeLog.status === 'pending' && isActionableRequest && (
                    <div className="flex gap-2 self-end">
                        <Button size="sm" variant="secondary" onClick={() => onDenyRequest && onDenyRequest(exchangeLog)} icon={<ThumbsDownIcon/>}>Deny</Button>
                        <Button size="sm" variant="primary" onClick={() => onApproveRequest && onApproveRequest(exchangeLog)} icon={<ThumbsUpIcon/>}>Approve</Button>
                    </div>
                 )}
             </div>
        );
    }


    return (
        <div className={`bg-card rounded-xl shadow-sm border-l-4 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${priorityStyles.border} ${statusClasses[task.status]}`}>
            <div className="flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                    {task.isAutomated && (
                        <span title="Automated Task">
                            <RobotIcon className="h-4 w-4 text-muted-foreground" />
                        </span>
                    )}
                    {task.recurrence !== TaskRecurrence.None && (
                        <span title={`Recurs ${task.recurrence}`}>
                            <RepeatIcon className="h-4 w-4 text-muted-foreground" />
                        </span>
                    )}
                    <h4 className={`font-bold text-lg text-foreground ${task.status === TaskStatus.Completed ? 'line-through' : ''}`}>{task.title}</h4>
                     <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${priorityStyles.badge}`}>
                        {task.priority}
                    </span>
                    {task.status === TaskStatus.InProgress && (
                         <span className="px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap bg-blue-500/10 text-blue-700 dark:text-blue-300">
                            In Progress
                        </span>
                    )}
                    {hasPendingExchange && (
                         <span className="px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">
                            Exchange Requested
                        </span>
                    )}
                </div>
                {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1.5" />
                        <span>{assignee?.name || 'Unassigned'}</span>
                        {secondaryAssignees.length > 0 && (
                            <span className="ml-1 font-semibold text-xs text-blue-600" title={`Assisted by: ${secondaryAssigneeNames}`}>
                                (+{secondaryAssignees.length})
                            </span>
                        )}
                    </div>
                    {field && (
                        <div className="flex items-center">
                           <MapPinIcon className="h-4 w-4 mr-1.5" />
                           <span>{field.name}</span>
                        </div>
                    )}
                    {livestock && (
                         <div className="flex items-center">
                           <CowIcon className="h-4 w-4 mr-1.5" />
                           <span>{getLivestockName(livestock)}</span>
                        </div>
                    )}
                </div>

                {task.status === TaskStatus.Completed && task.completedAt && (
                     <div className="mt-2 p-2 bg-background/50 rounded text-xs border border-border">
                        <p className="font-semibold text-foreground">Completed by {completer?.name || 'N/A'} on {formatDate(task.completedAt)}</p>
                        {task.completionNotes && <p className="italic text-muted-foreground">"{task.completionNotes}"</p>}
                        {task.completionPhoto && (
                            <div className="flex items-center gap-2 mt-1">
                                <CameraIcon className="h-4 w-4 text-primary" />
                                <a href={task.completionPhoto} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">View Photo</a>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-shrink-0 flex flex-col items-end gap-2 text-right">
                <div className={`font-semibold px-2 py-0.5 rounded-full text-xs ${isOverdue ? 'bg-destructive text-destructive-foreground' : 'text-foreground'}`}>
                    Due: {formatDate(task.dueDate)}
                </div>
                {showDetailedActions && (
                    <div className="flex gap-2 items-center">
                        {canExchange && onExchangeTask && (
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => onExchangeTask(task)}
                                icon={<ChevronRightIcon />}
                                disabled={hasPendingExchange}
                            >
                                Exchange
                            </Button>
                        )}
                        {canEdit && (
                            <button 
                                onClick={() => onEditTask(task)} 
                                className="p-2 text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                                aria-label="Edit task"
                                title="Edit task"
                            >
                                <PencilIcon className="h-4 w-4" />
                            </button>
                        )}
                        {canStart && (
                            <Button size="sm" variant="secondary" onClick={onStartTask}>
                                Start Task
                            </Button>
                        )}
                        {canComplete && (
                            <Button size="sm" onClick={() => onCompleteTask(task)}>
                                Complete Task
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskItem;