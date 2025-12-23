import React from 'react';
import { Field, Role, Task, TaskStatus, Planting } from '../types';
import { useAuth } from '../context/AuthContext';
import FieldCard from './FieldCard';
import Button from './ui/Button';
import { PlusIcon, TractorIcon, MapPinIcon, BarChartIcon } from './ui/Icon';

interface DashboardProps {
    fields: Field[];
    tasks: Task[];
    plantingsByField: Record<number, Planting[]>;
    onSelectField: (field: Field) => void;
    onAddField: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ fields, tasks, plantingsByField, onSelectField, onAddField }) => {
    const { user } = useAuth();
    const canManage = user.role === Role.Owner || user.role === Role.Manager;

    const totalArea = fields.reduce((sum, field) => sum + field.area, 0).toFixed(1);
    const pendingTasksCount = tasks.filter(t => t.status === TaskStatus.Pending).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Dashboard</h2>
                {canManage && (
                    <Button onClick={onAddField} icon={<PlusIcon />}>
                        Add New Field
                    </Button>
                )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-500/10 rounded-full">
                            <MapPinIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">Total Fields</p>
                            <p className="text-2xl font-bold">{fields.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-500/10 rounded-full">
                            <TractorIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">Total Area</p>
                            <p className="text-2xl font-bold">{totalArea} ha</p>
                        </div>
                    </div>
                </div>
                 <div className="bg-card p-4 rounded-xl shadow-sm border border-border col-span-2 lg:col-span-1">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-500/10 rounded-full">
                            <BarChartIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                            <p className="text-2xl font-bold">{pendingTasksCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Field List */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">Fields</h3>
                 {fields.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fields.map(field => (
                            <FieldCard 
                                key={field.id} 
                                field={field} 
                                plantings={plantingsByField[field.id] || []}
                                onClick={() => onSelectField(field)} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-card rounded-xl shadow-sm border border-border">
                        <p className="text-muted-foreground">No fields found.</p>
                        {canManage && <p className="text-muted-foreground">Click "Add New Field" to get started.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;