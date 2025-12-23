import React, { useMemo, useState, useEffect } from 'react';
import { TimeLog, TimeLogStatus } from '../../types';
import Button from './Button';
import { ClockIcon } from './Icon';

interface ClockInWidgetProps {
    timeLogs: TimeLog[];
    userId: number;
    clockIn: () => void;
    clockOut: () => void;
}

const ClockInWidget: React.FC<ClockInWidgetProps> = ({ timeLogs, userId, clockIn, clockOut }) => {
    const ongoingShift = useMemo(() => timeLogs.find(s => s.userId === userId && s.status === TimeLogStatus.Ongoing), [timeLogs, userId]);
    
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    useEffect(() => {
        if (ongoingShift) {
            const interval = setInterval(() => {
                const now = new Date();
                const start = new Date(ongoingShift.clockIn);
                const diff = now.getTime() - start.getTime();

                const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
                const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
                const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
                
                setElapsedTime(`${hours}:${minutes}:${seconds}`);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [ongoingShift]);

    return (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border text-center flex flex-col items-center justify-center h-full">
            <ClockIcon className="h-10 w-10 text-primary mb-3" />
            {ongoingShift ? (
                <>
                    <p className="text-xl font-bold text-green-600">You are Clocked In</p>
                    <p className="text-sm text-muted-foreground">Shift started at {new Date(ongoingShift.clockIn).toLocaleTimeString()}</p>
                    <p className="font-mono text-3xl font-bold my-4">{elapsedTime}</p>
                    <Button onClick={clockOut} variant="primary" className="w-full bg-red-600 hover:bg-red-700">Clock Out</Button>
                </>
            ) : (
                <>
                    <p className="text-xl font-bold text-muted-foreground">You are Clocked Out</p>
                    <p className="text-sm text-muted-foreground mb-4">Ready to start your shift?</p>
                    <Button onClick={clockIn} variant="primary" className="w-full">Clock In</Button>
                </>
            )}
        </div>
    );
};

export default ClockInWidget;
