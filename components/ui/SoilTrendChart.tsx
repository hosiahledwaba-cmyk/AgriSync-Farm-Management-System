import React, { useMemo } from 'react';
import { SoilAnalysis } from '../../types';
import { LineChartIcon } from './Icon';

interface SoilTrendChartProps {
    soilHistory: SoilAnalysis[];
}

const NUTRIENT_LEVELS: Record<string, number> = {
    'Low': 1,
    'Slightly Low': 2,
    'Optimal': 3,
    'High': 4,
};
const NUTRIENT_LABELS = ['Low', 'Slightly Low', 'Optimal', 'High'];


const SoilTrendChart: React.FC<SoilTrendChartProps> = ({ soilHistory }) => {
    
    const chartData = useMemo(() => {
        if (!soilHistory || soilHistory.length < 2) return null;
        return soilHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [soilHistory]);

    if (!chartData) {
        return (
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex flex-col items-center justify-center h-full min-h-[250px] text-center">
                <LineChartIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-md font-semibold text-foreground">Soil Nutrient Trends</h3>
                <p className="text-sm text-muted-foreground">Not enough data to show trends. Add at least two soil analyses.</p>
            </div>
        );
    }
    
    // SVG dimensions
    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Scaling functions
    const xScale = (index: number) => margin.left + (index / (chartData.length - 1)) * chartWidth;
    const nutrientYScale = (value: number) => margin.top + chartHeight - ((value - 0.5) / 4) * chartHeight; // Range from 0.5 to 4.5

    const nLine = chartData.map((d, i) => `${xScale(i)},${nutrientYScale(NUTRIENT_LEVELS[d.nitrogen])}`).join(' ');
    const pLine = chartData.map((d, i) => `${xScale(i)},${nutrientYScale(NUTRIENT_LEVELS[d.phosphorus])}`).join(' ');
    const kLine = chartData.map((d, i) => `${xScale(i)},${nutrientYScale(NUTRIENT_LEVELS[d.potassium])}`).join(' ');

    const getDayAbbreviation = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: '2-digit', month: 'short' });

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-4">
            <h3 className="text-md font-semibold text-foreground">Soil Nutrient Trends</h3>
            <div className="h-[250px] w-full">
                 <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                    {/* Y-Axis Labels (Nutrients) */}
                    {NUTRIENT_LABELS.map((label, i) => (
                        <g key={label}>
                            <text x={margin.left - 8} y={nutrientYScale(i + 1)} textAnchor="end" alignmentBaseline="middle" className="text-xs fill-muted-foreground">
                                {label}
                            </text>
                             <line x1={margin.left} y1={nutrientYScale(i + 1)} x2={width - margin.right} y2={nutrientYScale(i + 1)} className="stroke-border" strokeDasharray="2,2" />
                        </g>
                    ))}

                    {/* X-Axis Labels */}
                    {chartData.map((day, index) => (
                        <text key={`x-label-${index}`} x={xScale(index)} y={height - margin.bottom + 15} textAnchor="middle" className="text-xs fill-muted-foreground">
                            {getDayAbbreviation(day.date)}
                        </text>
                    ))}
                    
                    {/* Nutrient Lines */}
                    <polyline points={nLine} className="fill-none stroke-blue-500" strokeWidth="2" />
                    <polyline points={pLine} className="fill-none stroke-green-500" strokeWidth="2" />
                    <polyline points={kLine} className="fill-none stroke-yellow-500" strokeWidth="2" />
                 </svg>
            </div>
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-blue-500"></span> Nitrogen (N)</div>
                <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-green-500"></span> Phosphorus (P)</div>
                <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-yellow-500"></span> Potassium (K)</div>
            </div>
        </div>
    );
};

export default SoilTrendChart;
