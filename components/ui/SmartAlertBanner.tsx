import React from 'react';
import { FieldAlert } from '../../types';
import { InfoIcon, ShieldAlertIcon, XIcon } from './Icon';

interface SmartAlertBannerProps {
    alerts: FieldAlert[];
    onDismiss: (id: string) => void;
}

const SmartAlertBanner: React.FC<SmartAlertBannerProps> = ({ alerts, onDismiss }) => {
    if (!alerts || alerts.length === 0) {
        return null;
    }

    const getAlertStyles = (type: FieldAlert['type']) => {
        switch (type) {
            case 'critical':
                return { bg: 'bg-red-500/10', text: 'text-red-700 dark:text-red-300', border: 'border-red-500/30' };
            case 'warning':
                return { bg: 'bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-500/30' };
            case 'info':
            default:
                return { bg: 'bg-blue-500/10', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500/30' };
        }
    };
    
    return (
        <div className="space-y-2">
            {alerts.map(alert => {
                const styles = getAlertStyles(alert.type);
                return (
                    <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${styles.bg} ${styles.border} ${styles.text}`}>
                        <div className="flex items-center gap-3">
                            {alert.type === 'info' ? <InfoIcon className="h-5 w-5" /> : <ShieldAlertIcon className="h-5 w-5" />}
                            <p className="font-semibold text-sm">{alert.message}</p>
                        </div>
                        <button onClick={() => onDismiss(alert.id)} className="p-1 rounded-full hover:bg-black/10">
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default SmartAlertBanner;
