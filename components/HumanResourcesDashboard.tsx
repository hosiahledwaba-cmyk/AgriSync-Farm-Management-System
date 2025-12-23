import React, { useMemo } from 'react';
import { User, Role, Task, TaskStatus, TimeLog } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import KPICard from './ui/KPICard';
import { PlusIcon, UsersIcon, DollarSignIcon, BarChartIcon, ShieldAlertIcon, PencilIcon, XIcon } from './ui/Icon';
import { formatCurrency } from '../utils/currency';
import { getStartOfWeek } from '../utils/dateUtils';

interface HumanResourcesDashboardProps {
    tasks: Task[];
    timeLogs: TimeLog[];
    onAddEmployee: () => void;
    onEditEmployee: (user: User) => void;
}

const HumanResourcesDashboard: React.FC<HumanResourcesDashboardProps> = ({ tasks, timeLogs, onAddEmployee, onEditEmployee }) => {
    const { user: currentUser, users, removeUser } = useAuth();
    
    const startOfWeek = useMemo(() => getStartOfWeek(new Date()), []);

    const employeeStats = useMemo(() => {
        const workers = users.filter(u => u.role === Role.Worker);
        const managers = users.filter(u => u.role === Role.Manager);

        const totalLaborCostPerHour = users.reduce((sum, u) => sum + (u.wageRate || 0), 0);
        const managerToWorkerRatio = workers.length > 0 && managers.length > 0 ? (managers.length / workers.length) : NaN;
        
        const totalHoursThisWeek = timeLogs
            .filter(s => new Date(s.clockIn) >= startOfWeek)
            .reduce((sum, s) => {
                if (s.clockOut) {
                    const duration = (new Date(s.clockOut).getTime() - new Date(s.clockIn).getTime()) / (1000 * 60 * 60);
                    return sum + duration;
                }
                return sum;
            }, 0);
            
        const totalLaborCostThisWeek = users.reduce((totalCost, user) => {
            const userShifts = timeLogs.filter(s => s.userId === user.id && new Date(s.clockIn) >= startOfWeek && s.clockOut);
            const userHours = userShifts.reduce((sum, s) => sum + (new Date(s.clockOut!).getTime() - new Date(s.clockIn).getTime()) / (1000 * 60 * 60), 0);
            return totalCost + (userHours * (user.wageRate || 0));
        }, 0);


        return {
            totalEmployees: users.length,
            totalLaborCostPerHour,
            totalLaborCostThisWeek,
            totalHoursThisWeek,
            managerToWorkerRatio,
        };
    }, [users, timeLogs, startOfWeek]);

    const ratioValue = !isNaN(employeeStats.managerToWorkerRatio)
        ? `1 : ${(1 / employeeStats.managerToWorkerRatio).toFixed(1)}`
        : 'N/A';

    const employeeList = useMemo(() => {
        return users.map(user => {
            const userShifts = timeLogs.filter(s => s.userId === user.id && new Date(s.clockIn) >= startOfWeek);
            const hoursThisWeek = userShifts.reduce((sum, s) => {
                 if (s.clockOut) {
                    const duration = (new Date(s.clockOut).getTime() - new Date(s.clockIn).getTime()) / (1000 * 60 * 60);
                    return sum + duration;
                }
                return sum;
            }, 0);
            
            const estWeeklyPay = hoursThisWeek * (user.wageRate || 0);

            return {
                ...user,
                hoursThisWeek,
                estWeeklyPay,
            };
        }).sort((a,b) => a.id - b.id);
    }, [users, timeLogs, startOfWeek]);

    const handleRemove = (userId: number) => {
        if (confirm('Are you sure you want to remove this employee? This action cannot be undone.')) {
            removeUser(userId);
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Human Resources</h2>
                <Button onClick={onAddEmployee} icon={<PlusIcon />}>
                    Add Employee
                </Button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Employees" value={employeeStats.totalEmployees.toString()} icon={<UsersIcon />} color="blue" />
                <KPICard title="Est. Labor Cost (Week)" value={`${formatCurrency(employeeStats.totalLaborCostThisWeek, 0)}`} icon={<DollarSignIcon />} color="yellow" />
                <KPICard title="Total Hours (Week)" value={`${employeeStats.totalHoursThisWeek.toFixed(1)}`} icon={<BarChartIcon />} color="green" />
                <KPICard title="M:W Ratio" value={ratioValue} icon={<ShieldAlertIcon />} color="purple" />
            </div>

            <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                 <h3 className="text-xl font-semibold text-foreground mb-4">Employee Roster</h3>
                 <div className="overflow-x-auto responsive-table">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3 text-right">Hourly Wage</th>
                                <th className="px-6 py-3 text-right">Hours (Week)</th>
                                <th className="px-6 py-3 text-right">Est. Pay (Week)</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                         <tbody>
                            {employeeList.map(emp => (
                                <tr key={emp.id} className="bg-card border-b border-border hover:bg-accent">
                                    <td data-label="Name" className="px-6 py-4 font-medium text-foreground">{emp.name}</td>
                                    <td data-label="Role" className="px-6 py-4 text-muted-foreground">{emp.role}</td>
                                    <td data-label="Hourly Wage" className="px-6 py-4 text-right text-foreground">{formatCurrency(emp.wageRate || 0)}</td>
                                    <td data-label="Hours (Week)" className="px-6 py-4 text-right text-foreground">{emp.hoursThisWeek.toFixed(1)} / {emp.expectedHours || 40}</td>
                                    <td data-label="Est. Pay (Week)" className="px-6 py-4 text-right font-semibold text-foreground">{formatCurrency(emp.estWeeklyPay)}</td>
                                    <td data-label="Actions" className="px-6 py-4 text-center no-label">
                                        <button 
                                            onClick={() => onEditEmployee(emp)} 
                                            className="p-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                                            title="Edit employee"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleRemove(emp.id)} 
                                            className="p-1.5 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10 transition-colors ml-2"
                                            title="Remove employee"
                                            disabled={emp.id === currentUser.id}
                                        >
                                            <XIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default HumanResourcesDashboard;