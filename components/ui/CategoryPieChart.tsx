import React from 'react';
import { formatCurrency } from '../../utils/currency';

interface PieChartData {
    label: string;
    value: number;
}

interface CategoryPieChartProps {
    data: PieChartData[];
    title: string;
}

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return (
             <div className="bg-card p-4 rounded-xl shadow-sm border border-border h-full flex flex-col">
                <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-muted-foreground">No data for this period.</p>
                </div>
            </div>
        )
    }

    let cumulativePercent = 0;

    const slices = data.map((item, index) => {
        const percent = item.value / total;
        const startAngle = cumulativePercent * 2 * Math.PI;
        cumulativePercent += percent;
        const endAngle = cumulativePercent * 2 * Math.PI;

        const x1 = 50 + 40 * Math.cos(startAngle);
        const y1 = 50 + 40 * Math.sin(startAngle);
        const x2 = 50 + 40 * Math.cos(endAngle);
        const y2 = 50 + 40 * Math.sin(endAngle);

        const largeArcFlag = percent > 0.5 ? 1 : 0;

        const pathData = `M 50,50 L ${x1},${y1} A 40,40 0 ${largeArcFlag} 1 ${x2},${y2} Z`;
        
        return {
            path: pathData,
            color: COLORS[index % COLORS.length],
            label: item.label,
            value: item.value,
            percent: (percent * 100).toFixed(1)
        };
    });

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border h-full flex flex-col">
            <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-shrink-0 w-48 h-48">
                    <svg viewBox="0 0 100 100">
                        {slices.map((slice, i) => (
                            <path key={i} d={slice.path} fill={slice.color}>
                                <title>{`${slice.label}: ${formatCurrency(slice.value)} (${slice.percent}%)`}</title>
                            </path>
                        ))}
                    </svg>
                </div>
                <div className="w-full text-sm space-y-2 overflow-y-auto max-h-48">
                    {slices.map((slice, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: slice.color }}></span>
                                <span>{slice.label}</span>
                            </div>
                            <span className="font-semibold">{slice.percent}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryPieChart;