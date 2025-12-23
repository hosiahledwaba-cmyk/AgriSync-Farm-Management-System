import React from 'react';

interface KPICardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color?: 'green' | 'red' | 'blue' | 'yellow' | 'purple';
    children?: React.ReactNode;
    className?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color = 'blue', children, className = '' }) => {
    
    const colorClasses = {
        green: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
        red: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
        yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400' },
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
    };

    return (
        <div className={`bg-card p-4 rounded-xl shadow-sm border border-border flex-grow ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${colorClasses[color].bg}`}>
                        <div className={`h-6 w-6 ${colorClasses[color].text}`}>{icon}</div>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold text-foreground">{value}</p>
                    </div>
                </div>
            </div>
            {children && <div className="mt-2 text-xs text-muted-foreground">{children}</div>}
        </div>
    );
};

export default KPICard;