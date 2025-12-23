
import React from 'react';
import { WeatherData, WeatherCondition } from '../types';
import { SunIcon, CloudIcon, CloudRainIcon, WindIcon, ThermometerIcon, DropletIcon } from './ui/Icon';

interface WeatherWidgetProps {
    weatherData: WeatherData | null;
    loading: boolean;
    error: string | null;
}

const WeatherIcon: React.FC<{ condition: WeatherCondition, className?: string }> = ({ condition, className }) => {
    switch (condition) {
        case 'Sunny':
            return <SunIcon className={className} />;
        case 'Partly Cloudy':
            return <CloudIcon className={className} />;
        case 'Cloudy':
            return <CloudIcon className={className} />;
        case 'Rain':
            return <CloudRainIcon className={className} />;
        default:
            return <SunIcon className={className} />;
    }
};


const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weatherData, loading, error }) => {
    if (loading) {
        return (
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex items-center justify-center h-full min-h-[200px]">
                <p className="text-muted-foreground">Loading weather data...</p>
            </div>
        );
    }

    if (error || !weatherData) {
        return (
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                 <CloudIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-destructive font-semibold">Weather Unavailable</p>
                <p className="text-sm text-muted-foreground">{error || 'Could not load data.'}</p>
            </div>
        );
    }
    
    const { current, forecast } = weatherData;
    const getDayAbbreviation = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-4">
            <div>
                <p className="text-sm text-muted-foreground">Current Conditions</p>
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center">
                        <WeatherIcon condition={current.condition} className="h-12 w-12 text-primary" />
                        <div className="ml-3">
                             <p className="text-3xl font-bold">{current.temperature}°C</p>
                             <p className="text-muted-foreground font-semibold">{current.condition}</p>
                        </div>
                    </div>
                    <div className="text-sm text-right space-y-1">
                        <p className="flex items-center justify-end"><WindIcon className="h-4 w-4 mr-1 text-muted-foreground" /> {current.windSpeed} km/h</p>
                        <p className="flex items-center justify-end"><DropletIcon className="h-4 w-4 mr-1 text-muted-foreground" /> {current.humidity}%</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-border pt-3">
                <p className="text-sm text-muted-foreground mb-2">5-Day Forecast</p>
                <div className="flex justify-between text-center text-sm">
                    {forecast.map(day => (
                        <div key={day.date} className="flex flex-col items-center space-y-1">
                            <p className="font-semibold text-muted-foreground">{getDayAbbreviation(day.date)}</p>
                            <WeatherIcon condition={day.condition} className="h-6 w-6 text-primary/80"/>
                            <p className="font-bold text-foreground">{day.maxTemp}°</p>
                            <p className="text-muted-foreground">{day.minTemp}°</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
