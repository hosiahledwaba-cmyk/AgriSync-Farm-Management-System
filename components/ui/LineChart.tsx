import React from 'react';
import { LineChartIcon } from './Icon';

interface LineChartProps {
    data: { date: string, value: number }[];
    title: string;
    color: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title, color }) => {

    if (!data || data.length < 2) {
        return (
            <div className="p-4 bg-muted/50 rounded-lg h-64 flex flex-col items-center justify-center text-center">
                <LineChartIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">Not enough data to show a trend.</p>
            </div>
        );
    }
    
    // SVG dimensions and margins
    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const sortedData = [...data].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const values = sortedData.map(d => d.value);
    const dates = sortedData.map(d => new Date(d.date));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    // Scaling functions
    const xScale = (index: number) => margin.left + (index / (sortedData.length - 1)) * chartWidth;
    const yScale = (value: number) => margin.top + chartHeight - ((value - minVal) / range) * chartHeight;

    const linePoints = sortedData.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(' ');

    const yAxisLabels = Array.from({ length: 4 }, (_, i) => {
        const value = minVal + (range / 3) * i;
        return {
            value: value.toFixed(1),
            y: yScale(value)
        };
    });

    const xAxisLabels = [
        { label: dates[0].toLocaleDateString([], {month: 'short', day: 'numeric'}), x: xScale(0) },
        { label: dates[dates.length - 1].toLocaleDateString([], {month: 'short', day: 'numeric'}), x: xScale(dates.length - 1) }
    ];

    return (
        <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-center text-sm mb-2">{title}</h4>
            <div className="w-full h-48">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
                    {/* Y-Axis and Grid Lines */}
                    {yAxisLabels.map(({ value, y }, i) => (
                        <g key={i}>
                            <text x={margin.left - 5} y={y} textAnchor="end" alignmentBaseline="middle" className="text-[10px] fill-muted-foreground">
                                {value}
                            </text>
                            <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} className="stroke-border" strokeDasharray="2,2" />
                        </g>
                    ))}
                     {/* X-Axis Labels */}
                    {xAxisLabels.map(({ label, x }, i) => (
                        <text key={i} x={x} y={height - margin.bottom + 15} textAnchor={i === 0 ? 'start' : 'end'} className="text-[10px] fill-muted-foreground">
                            {label}
                        </text>
                    ))}

                    {/* Line and Dots */}
                    <polyline points={linePoints} fill="none" stroke={color} strokeWidth="2" />
                    {sortedData.map((d, i) => (
                        <circle key={i} cx={xScale(i)} cy={yScale(d.value)} r="3" fill={color} stroke="hsl(var(--card))" strokeWidth="1.5">
                            <title>{`${d.date}: ${d.value}`}</title>
                        </circle>
                    ))}
                </svg>
            </div>
        </div>
    );
};

export default LineChart;
