import React, { useMemo } from 'react';
import { Task, TaskStatus, User, TaskPriority } from '../../types';

interface KanbanBoardProps {
    tasks: Task[];
    usersById: Record<number, User>;
}

const getPriorityStyles = (priority: string) => {
    if (priority.startsWith(TaskPriority.Urgent)) return 'border-purple-500';
    if (priority.startsWith(TaskPriority.High)) return 'border-red-500';
    if (priority.startsWith(TaskPriority.Medium)) return 'border-yellow-500';
    if (priority.startsWith(TaskPriority.Low)) return 'border-green-500';
    return 'border-gray-400';
};


const KanbanCard: React.FC<{ task: Task, assignee?: User }> = ({ task, assignee }) => {
    const priorityClass = getPriorityStyles(task.priority);
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Completed;

    return (
        <div className={`p-3 bg-background rounded-lg border-l-4 shadow-sm ${priorityClass}`}>
            <p className="font-semibold text-sm text-foreground">{task.title}</p>
            <div className="flex justify-between items-center mt-2 text-xs">
                <span className={`font-medium ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>{new Date(task.dueDate).toLocaleDateString()}</span>
                <span className="text-muted-foreground">{assignee?.name || 'Unassigned'}</span>
            </div>
        </div>
    );
};

const KanbanColumn: React.FC<{ title: string; tasks: Task[]; usersById: Record<number, User>; }> = ({ title, tasks, usersById }) => (
    <div className="flex-1 min-w-[250px]">
        <h4 className="font-semibold text-md text-foreground mb-3 px-1">{title} ({tasks.length})</h4>
        <div className="space-y-3 h-[300px] overflow-y-auto p-1 bg-muted rounded-lg">
            {tasks.length > 0 ? (
                tasks.map(task => (
                    <KanbanCard key={task.id} task={task} assignee={usersById[task.assigneeId]} />
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center pt-4">No tasks.</p>
            )}
        </div>
    </div>
);

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, usersById }) => {
    const columns = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const today = tasks.filter(t => t.dueDate === todayStr && t.status === TaskStatus.Pending);
        const inProgress = tasks.filter(t => t.status === TaskStatus.InProgress);
        const blocked = tasks.filter(t => t.status === TaskStatus.Blocked);
        const completed = tasks.filter(t => t.status === TaskStatus.Completed && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === todayStr);

        return { today, inProgress, blocked, completed };
    }, [tasks]);

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            <KanbanColumn title="Due Today" tasks={columns.today} usersById={usersById} />
            <KanbanColumn title="In Progress" tasks={columns.inProgress} usersById={usersById} />
            <KanbanColumn title="Blocked" tasks={columns.blocked} usersById={usersById} />
            <KanbanColumn title="Completed Today" tasks={columns.completed} usersById={usersById} />
        </div>
    );
};

export default KanbanBoard;