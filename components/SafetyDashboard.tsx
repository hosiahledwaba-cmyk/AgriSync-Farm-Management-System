import React, { useState, useMemo } from 'react';
import { SafetyReport, Role, SafetyStatus, SafetySeverity, User } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { PlusIcon, ShieldAlertIcon, FilterIcon, CameraIcon } from './ui/Icon';
import KPICard from './ui/KPICard';

interface SafetyDashboardProps {
    reports: SafetyReport[];
    onAddReport: () => void;
    onUpdateReport: (report: SafetyReport) => void;
}

const SafetyDashboard: React.FC<SafetyDashboardProps> = ({ reports, onAddReport, onUpdateReport }) => {
    const { user, users } = useAuth();
    const isManagerOrOwner = user.role === Role.Owner || user.role === Role.Manager;

    const userReports = useMemo(() => {
        return reports.filter(r => r.reportedById === user.id);
    }, [reports, user.id]);

    if (isManagerOrOwner) {
        return <ManagerSafetyView reports={reports} onAddReport={onAddReport} onUpdateReport={onUpdateReport} users={users} />;
    } else {
        return <WorkerSafetyView myReports={userReports} onAddReport={onAddReport} />;
    }
};

// =================================================================
// Manager/Owner View
// =================================================================

interface ManagerSafetyViewProps {
    reports: SafetyReport[];
    onAddReport: () => void;
    onUpdateReport: (report: SafetyReport) => void;
    users: User[];
}

const ManagerSafetyView: React.FC<ManagerSafetyViewProps> = ({ reports, onAddReport, onUpdateReport, users }) => {
    const [statusFilter, setStatusFilter] = useState<SafetyStatus | 'all'>(SafetyStatus.Open);
    const [severityFilter, setSeverityFilter] = useState<SafetySeverity | 'all'>('all');
    
    const usersById = useMemo(() => users.reduce((acc, u) => ({ ...acc, [u.id]: u.name }), {} as Record<number, string>), [users]);

    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const statusMatch = statusFilter === 'all' || report.status === statusFilter;
            const severityMatch = severityFilter === 'all' || report.severity === severityFilter;
            return statusMatch && severityMatch;
        });
    }, [reports, statusFilter, severityFilter]);
    
    const stats = useMemo(() => ({
        open: reports.filter(r => r.status === SafetyStatus.Open).length,
        inReview: reports.filter(r => r.status === SafetyStatus.InReview).length,
        critical: reports.filter(r => r.severity === SafetySeverity.Critical && r.status !== SafetyStatus.Resolved).length,
    }), [reports]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Health & Safety Log</h2>
                <Button onClick={onAddReport} icon={<PlusIcon />}>Report Incident</Button>
            </div>
            
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard title="Open Reports" value={stats.open.toString()} icon={<ShieldAlertIcon />} color="yellow" />
                <KPICard title="In Review" value={stats.inReview.toString()} icon={<ShieldAlertIcon />} color="blue" />
                <KPICard title="Active Critical" value={stats.critical.toString()} icon={<ShieldAlertIcon />} color="red" className="col-span-2 lg:col-span-1"/>
            </div>

            <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                <div className="flex flex-wrap gap-4 mb-4">
                    <FilterControl label="Status" value={statusFilter} onChange={setStatusFilter} options={['all', ...Object.values(SafetyStatus)]} />
                    <FilterControl label="Severity" value={severityFilter} onChange={setSeverityFilter} options={['all', ...Object.values(SafetySeverity)]} />
                </div>
                <div className="space-y-3">
                    {filteredReports.length > 0 ? (
                        filteredReports.map(report => <ReportItem key={report.id} report={report} reportedBy={usersById[report.reportedById]} onUpdateReport={onUpdateReport} isManager={true} />)
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No reports match the current filters.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// =================================================================
// Worker/Accountant View
// =================================================================

interface WorkerSafetyViewProps {
    myReports: SafetyReport[];
    onAddReport: () => void;
}

const WorkerSafetyView: React.FC<WorkerSafetyViewProps> = ({ myReports, onAddReport }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Health & Safety</h2>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border text-center">
                <ShieldAlertIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold">See Something? Say Something.</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">Your reports help us maintain a safe working environment for everyone. Report any incidents, hazards, or near-misses immediately.</p>
                <Button onClick={onAddReport} icon={<PlusIcon />} className="mt-6">Submit a New Report</Button>
            </div>
            
            <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                <h3 className="text-xl font-semibold text-foreground mb-4">My Submitted Reports</h3>
                <div className="space-y-3">
                    {myReports.length > 0 ? (
                        myReports.map(report => <ReportItem key={report.id} report={report} isManager={false} />)
                    ) : (
                        <p className="text-center text-muted-foreground py-8">You have not submitted any reports yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// =================================================================
// Shared Components
// =================================================================

const FilterControl: React.FC<{ label: string, value: string, onChange: (val: any) => void, options: string[] }> = ({ label, value, onChange, options }) => (
    <div>
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full sm:w-auto mt-1 block pl-3 pr-10 py-2 text-base border-input focus:outline-none focus:ring-ring focus:border-primary rounded-md bg-background shadow-sm">
            {options.map(opt => <option key={opt} value={opt}>{opt === 'all' ? `All ${label}s` : opt}</option>)}
        </select>
    </div>
);

const getSeverityStyles = (severity: SafetySeverity) => {
    const styles: Record<SafetySeverity, string> = {
        [SafetySeverity.Critical]: 'border-red-700 bg-red-500/10 text-red-700 dark:text-red-300',
        [SafetySeverity.High]: 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400',
        [SafetySeverity.Medium]: 'border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        [SafetySeverity.Low]: 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    };
    return styles[severity];
};

const getStatusStyles = (status: SafetyStatus) => {
    const styles: Record<SafetyStatus, string> = {
        [SafetyStatus.Open]: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
        [SafetyStatus.InReview]: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
        [SafetyStatus.Resolved]: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    };
    return styles[status];
};

const ReportItem: React.FC<{ report: SafetyReport, reportedBy?: string, onUpdateReport?: (report: SafetyReport) => void, isManager: boolean }> = ({ report, reportedBy, onUpdateReport, isManager }) => (
    <div className={`p-4 rounded-lg border-l-4 ${getSeverityStyles(report.severity)}`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
            <div>
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-foreground">{report.type} at {report.location}</span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusStyles(report.status)}`}>{report.status}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Reported by {reportedBy || 'You'} on {new Date(report.dateTime).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-foreground">{report.description}</p>
                 {report.photo && (
                    <a href={report.photo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium flex items-center gap-1 mt-2">
                        <CameraIcon className="h-4 w-4" /> View Attached Photo
                    </a>
                )}
            </div>
            {isManager && onUpdateReport && (
                <Button size="sm" variant="secondary" onClick={() => onUpdateReport(report)}>Update Status</Button>
            )}
        </div>
        {report.status === SafetyStatus.Resolved && (
            <div className="mt-2 ml-4 p-2 bg-green-500/5 rounded-md text-sm border-l-2 border-green-500/30">
                <p className="font-semibold text-green-800 dark:text-green-300">Resolution:</p>
                <p className="text-muted-foreground text-xs italic">"{report.actionsTaken}"</p>
            </div>
        )}
    </div>
);

export default SafetyDashboard;