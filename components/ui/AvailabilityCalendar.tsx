import React, { useState, useMemo } from 'react';
import { EmployeeAvailability, AvailabilityStatus } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icon';

interface AvailabilityCalendarProps {
    userId: number;
    availability: EmployeeAvailability[];
    onDayClick: (date: string, availabilityForDay?: EmployeeAvailability) => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ userId, availability, onDayClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const userAvailability = useMemo(() => {
        return availability.filter(a => a.userId === userId);
    }, [availability, userId]);

    const changeMonth = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const grid = [];
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDay) || day > daysInMonth) {
                    week.push(null);
                } else {
                    week.push(day++);
                }
            }
            grid.push(week);
            if (day > daysInMonth) break;
        }
        return grid;
    }, [currentDate]);
    
    const getStatusClass = (status?: AvailabilityStatus) => {
        switch (status) {
            case AvailabilityStatus.Available: return 'bg-green-500/10 hover:bg-green-500/20 text-green-800 dark:text-green-300';
            case AvailabilityStatus.Preferred: return 'bg-green-500/20 hover:bg-green-500/30 text-green-700 dark:text-green-200 ring-2 ring-green-500';
            case AvailabilityStatus.Unavailable: return 'bg-red-500/10 hover:bg-red-500/20 text-red-800 dark:text-red-300 line-through';
            default: return 'bg-muted/50 hover:bg-accent';
        }
    };

    return (
        <div className="p-4 bg-background rounded-lg border border-border">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-accent"><ChevronLeftIcon className="h-5 w-5"/></button>
                <h4 className="font-bold text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-accent"><ChevronRightIcon className="h-5 w-5"/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
                {calendarGrid.flat().map((day, index) => {
                    if (!day) return <div key={`empty-${index}`}></div>;
                    
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dateStr = date.toISOString().split('T')[0];
                    const availabilityForDay = userAvailability.find(a => a.date === dateStr);

                    return (
                        <button 
                            key={day}
                            onClick={() => onDayClick(dateStr, availabilityForDay)}
                            className={`h-12 w-full rounded-md flex items-center justify-center font-semibold transition-colors text-foreground ${getStatusClass(availabilityForDay?.status)}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
             <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs">
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-green-500/20 ring-1 ring-green-500"></span> Preferred</div>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-green-500/10"></span> Available</div>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-red-500/10"></span> Unavailable</div>
            </div>
        </div>
    );
};

export default AvailabilityCalendar;
