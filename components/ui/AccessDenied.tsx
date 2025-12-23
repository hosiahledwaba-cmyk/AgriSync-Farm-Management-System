import React from 'react';
import { ShieldAlertIcon } from './Icon';

interface AccessDeniedProps {
    requiredRole: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredRole }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-xl shadow-sm border border-border mt-10">
            <ShieldAlertIcon className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground max-w-md">
                You do not have the necessary permissions to view this page. Access is restricted to users with the '{requiredRole}' role or higher.
            </p>
        </div>
    );
};

export default AccessDenied;
