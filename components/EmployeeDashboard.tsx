import React, { useMemo, useState } from 'react';
import { User, Role, Task, Planting, Harvest, FinanceTransaction, TaskStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { UserIcon, ShieldAlertIcon, ClipboardListIcon, BarChartIcon, FilterIcon, ArrowUpDownIcon, TractorIcon, DollarSignIcon } from './ui/Icon';

interface EmployeeDashboardProps {
    users: User[];
    tasks: Task[];
    plantings: Planting[];
    harvests: Harvest[];
    transactions: FinanceTransaction[];
    onSelectEmployee: (user: User) => void;
}

interface EmployeeCardProps {
    employee: User;
    stats: {
        totalTasks: number;
        completedTasks: number;
        overdueTasks: number;
        completionRate: number;
    };
    onClick: () => void;
}

const RoleIcon: React.FC<{ role: Role }> = ({ role }) => {
    switch (role) {
        case Role.Manager: return <TractorIcon className="h-4 w-4 text-purple-500" />;
        case Role.Accountant: return <DollarSignIcon className="h-4 w-4 text-blue-500" />;
        case Role.Worker: return <UserIcon className="h-4 w-4 text-green-500" />;
        default: return <UserIcon className="h-4 w-4 text-muted-foreground" />;
    }
};


const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, stats, onClick }) => {
    return (
        <div 
            onClick={onClick} 
            className="bg-card p-6 rounded-xl shadow-sm border border-border cursor-pointer hover:border-primary hover:shadow-md transition-all group"
        >
            <div className="flex items-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                    <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{employee.name}</h3>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        <RoleIcon role={employee.role} />
                        {employee.role}
                    </p>
                </div>
            </div>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground flex items-center"><ClipboardListIcon className="h-4 w-4 mr-2"/> Tasks Completed</span>
                    <span className="font-bold text-foreground">{stats.completedTasks} / {stats.totalTasks}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground flex items-center"><BarChartIcon className="h-4 w-4 mr-2"/> Completion Rate</span>
                    <span className="font-bold text-foreground">{stats.completionRate.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground flex items-center"><ShieldAlertIcon className="h-4 w-4 mr-2"/> Overdue Tasks</span>
                    <span className={`font-bold ${stats.overdueTasks > 0 ? 'text-red-500' : 'text-foreground'}`}>{stats.overdueTasks}</span>
                </div>
            </div>
        </div>
    );
};

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ users, tasks, onSelectEmployee }) => {
    const { user: currentUser } = useAuth();
    const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
    const [sortBy, setSortBy] = useState<'completion_desc' | 'overdue_desc' | 'name_asc'>('completion_desc');

    const managedUsers = useMemo(() => {
        if (currentUser.role === Role.Owner) {
            return users.filter(u => u.id !== currentUser.id);
        }
        if (currentUser.role === Role.Manager) {
            return users.filter(u => (u.role === Role.Worker || u.role === Role.Accountant));
        }
        return [];
    }, [users, currentUser]);

    const userStats = useMemo(() => {
        const statsMap = new Map<number, any>();

        for (const user of managedUsers) {
            const userTasks = tasks.filter(t => t.assigneeId === user.id);
            const completedTasks = userTasks.filter(t => t.status === TaskStatus.Completed).length;
            const overdueTasks = userTasks.filter(t => t.status !== TaskStatus.Completed && new Date(t.dueDate) < new Date()).length;
            
            statsMap.set(user.id, {
                totalTasks: userTasks.length,
                completedTasks,
                overdueTasks,
                completionRate: userTasks.length > 0 ? (completedTasks / userTasks.length) * 100 : 0,
            });
        }
        return statsMap;
    }, [managedUsers, tasks]);

    const filteredAndSortedUsers = useMemo(() => {
        return managedUsers
            .filter(user => roleFilter === 'all' || user.role === roleFilter)
            .sort((a, b) => {
                const statsA = userStats.get(a.id);
                const statsB = userStats.get(b.id);
                switch (sortBy) {
                    case 'completion_desc':
                        return statsB.completionRate - statsA.completionRate;
                    case 'overdue_desc':
                        return statsB.overdueTasks - statsA.overdueTasks;
                    case 'name_asc':
                        return a.name.localeCompare(b.name);
                    default:
                        return 0;
                }
            });
    }, [managedUsers, roleFilter, sortBy, userStats]);

    const selectClasses = "pl-3 pr-8 py-2 text-sm border-input focus:outline-none focus:ring-ring focus:border-primary rounded-md bg-background shadow-sm";

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-foreground">Team Performance Overview</h2>
                    <p className="text-muted-foreground mt-1">Monitor employee productivity and task management.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="relative">
                        <FilterIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className={selectClasses + ' pl-8'}>
                            <option value="all">All Roles</option>
                            {currentUser.role === Role.Owner && <option value={Role.Manager}>Managers</option>}
                            <option value={Role.Worker}>Workers</option>
                            <option value={Role.Accountant}>Accountants</option>
                        </select>
                    </div>
                     <div className="relative">
                        <ArrowUpDownIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className={selectClasses + ' pl-8'}>
                            <option value="completion_desc">Sort by Completion</option>
                            <option value="overdue_desc">Sort by Overdue</option>
                            <option value="name_asc">Sort by Name</option>
                        </select>
                    </div>
                </div>
            </div>

            {filteredAndSortedUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedUsers.map(user => (
                        <EmployeeCard
                            key={user.id}
                            employee={user}
                            stats={userStats.get(user.id)}
                            onClick={() => onSelectEmployee(user)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-card rounded-xl shadow-sm border border-border">
                    <p className="text-muted-foreground font-semibold">No employees match the current filters.</p>
                    <p className="text-muted-foreground text-sm">Try adjusting your filters to see more team members.</p>
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;