
import React, { useMemo } from 'react';
import { HistoricalDay } from '../types';
import { LineChartIcon, DropletsIcon, ThermometerIcon } from './ui/Icon';

interface WeatherTrendChartProps {
    historicalData: HistoricalDay[];
    loading: boolean;
    error: string | null;
}

const WeatherTrendChart: React.FC<WeatherTrendChartProps> = ({ historicalData, loading, error }) => {
    
    const chartData = useMemo(() => {
        if (!historicalData || historicalData.length < 2) return null;

        const temps = historicalData.map(d => d.avgTemp);
        const precips = historicalData.map(d => d.precipitation);

        const tempMin = Math.min(...temps);
        const tempMax = Math.max(...temps);
        const precipMax = Math.max(1, ...precips); // Use 1 to avoid division by zero
        
        // Add some padding to the Y-axis range
        const tempRangeMin = Math.floor(tempMin - 2);
        const tempRangeMax = Math.ceil(tempMax + 2);
        const precipRangeMax = Math.ceil((precipMax + 2) / 5) * 5; // Round up to nearest 5

        return {
            days: historicalData,
            tempRange: { min: tempRangeMin, max: tempRangeMax },
            precipRange: { max: precipRangeMax },
        };
    }, [historicalData]);

    if (loading) {
        return (
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex items-center justify-center h-full min-h-[250px]">
                <p className="text-muted-foreground">Loading historical trends...</p>
            </div>
        );
    }

    if (error || !chartData) {
        return (
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex flex-col items-center justify-center h-full min-h-[250px] text-center">
                 <LineChartIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-destructive font-semibold">Trend Unavailable</p>
                <p className="text-sm text-muted-foreground">{error || 'Not enough data to show trend.'}</p>
            </div>
        );
    }
    
    // SVG dimensions and margins
    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 40, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Scaling functions
    const xScale = (index: number) => margin.left + (index / (chartData.days.length - 1)) * chartWidth;
    const tempYScale = (value: number) => margin.top + chartHeight - ((value - chartData.tempRange.min) / (chartData.tempRange.max - chartData.tempRange.min)) * chartHeight;
    const precipYScale = (value: number) => (value / chartData.precipRange.max) * chartHeight;

    const tempLinePoints = chartData.days.map((d, i) => `${xScale(i)},${tempYScale(d.avgTemp)}`).join(' ');

    const getDayAbbreviation = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-4">
            <h3 className="text-md font-semibold text-foreground">Last 7 Days</h3>
            <div className="h-[250px] w-full">
                 <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                    {/* Y-Axis Temp */}
                    {[chartData.tempRange.min, chartData.tempRange.max].map(value => (
                        <g key={`temp-label-${value}`}>
                            <text x={margin.left - 8} y={tempYScale(value)} textAnchor="end" alignmentBaseline="middle" className="text-xs fill-muted-foreground">
                                {`${value}°`}
                            </text>
                            <line x1={margin.left} y1={tempYScale(value)} x2={width - margin.right} y2={tempYScale(value)} className="stroke-border" strokeDasharray="2,2" />
                        </g>
                    ))}
                     {/* Y-Axis Precip */}
                     {[0, chartData.precipRange.max].map(value => (
                        <g key={`precip-label-${value}`}>
                            <text x={width - margin.right + 8} y={margin.top + chartHeight - precipYScale(value)} textAnchor="start" alignmentBaseline="middle" className="text-xs fill-muted-foreground">
                                {`${value}mm`}
                            </text>
                        </g>
                    ))}

                    {/* X-Axis Labels */}
                    {chartData.days.map((day, index) => (
                        <text key={`x-label-${index}`} x={xScale(index)} y={height - margin.bottom + 15} textAnchor="middle" className="text-xs fill-muted-foreground">
                            {getDayAbbreviation(day.date)}
                        </text>
                    ))}

                    {/* Precip Bars */}
                    {chartData.days.map((day, i) => (
                        <rect 
                            key={`bar-${i}`}
                            x={xScale(i) - 8}
                            y={margin.top + chartHeight - precipYScale(day.precipitation)}
                            width={16}
                            height={precipYScale(day.precipitation)}
                            className="fill-cyan-500/50 hover:fill-cyan-500/80 transition-colors"
                        >
                             <title>{`Precipitation on ${day.date}: ${day.precipitation}mm`}</title>
                        </rect>
                    ))}
                    
                    {/* Temp Line */}
                    <polyline points={tempLinePoints} className="fill-none stroke-yellow-500" strokeWidth="2.5" />
                    {chartData.days.map((d, i) => (
                        <circle key={`temp-dot-${i}`} cx={xScale(i)} cy={tempYScale(d.avgTemp)} r="3" className="fill-yellow-500 stroke-card" strokeWidth="1.5">
                             <title>{`Avg Temp on ${d.date}: ${d.avgTemp}°C`}</title>
                        </circle>
                    ))}
                 </svg>
            </div>
             <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <ThermometerIcon className="h-4 w-4 text-yellow-500"/> Avg. Temp (°C)
                </div>
                 <div className="flex items-center gap-1.5">
                    <DropletsIcon className="h-4 w-4 text-cyan-500"/> Precipitation (mm)
                </div>
            </div>
        </div>
    );
};

export default WeatherTrendChart;
