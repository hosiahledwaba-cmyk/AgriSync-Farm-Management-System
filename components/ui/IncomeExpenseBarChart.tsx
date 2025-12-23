
import React, { useMemo } from 'react';
import { FinanceTransaction } from '../../types';
import { getMonthsInRange } from '../../utils/dateUtils';
import { BarChartIcon } from './Icon';

interface IncomeExpenseBarChartProps {
    data: FinanceTransaction[];
}

const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({ data }) => {

    const monthlyData = useMemo(() => {
        if (data.length === 0) return [];
        
        const sorted = [...data].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (sorted.length === 0) return [];
        const startDate = new Date(sorted[0].date);
        const endDate = new Date(sorted[sorted.length - 1].date);
        
        const months = getMonthsInRange(startDate, endDate);

        return months.map(({ year, month, label }) => {
            const monthTx = data.filter(t => {
                const d = new Date(t.date);
                return d.getFullYear() === year && d.getMonth() === month;
            });
            return {
                label,
                income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
                expense: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
            };
        });
    }, [data]);

    const maxValue = Math.max(1, ...monthlyData.flatMap(d => [d.income, d.expense])); // use 1 to avoid division by zero

    if (monthlyData.length < 2) {
        return (
             <div className="bg-card p-6 rounded-xl shadow-sm border border-border h-full flex flex-col">
                <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Trends</h3>
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <BarChartIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground font-semibold">Not enough data</p>
                    <p className="text-sm text-muted-foreground">At least two months of data are needed to show trends.</p>
                </div>
            </div>
        )
    }
    
    // SVG dimensions and margins
    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Scaling functions
    const xScale = (index: number) => margin.left + (index / (monthlyData.length - 1)) * chartWidth;
    const yScale = (value: number) => margin.top + chartHeight - (value / maxValue) * chartHeight;

    const incomePoints = monthlyData.map((d, i) => `${xScale(i)},${yScale(d.income)}`).join(' ');
    const expensePoints = monthlyData.map((d, i) => `${xScale(i)},${yScale(d.expense)}`).join(' ');

    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
        const value = (maxValue / 4) * i;
        return {
            value: value,
            y: yScale(value)
        };
    });

    return (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border h-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Trends</h3>
            <div className="h-[320px] w-full">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                    {/* Y-Axis and Grid Lines */}
                    {yAxisLabels.map(({ value, y }, i) => (
                        <g key={i}>
                            <text x={margin.left - 10} y={y} textAnchor="end" alignmentBaseline="middle" className="text-xs fill-muted-foreground">
                                {`R${Math.round(value / 1000)}k`}
                            </text>
                            <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} className="stroke-border" strokeWidth="0.5" />
                        </g>
                    ))}

                    {/* X-Axis Labels */}
                    {monthlyData.map((item, index) => (
                        <text key={index} x={xScale(index)} y={height - margin.bottom + 20} textAnchor="middle" className="text-xs fill-muted-foreground">
                            {item.label}
                        </text>
                    ))}
                    
                    {/* Income Line */}
                    <polyline points={incomePoints} className="fill-none stroke-green-500" strokeWidth="2" />
                    {monthlyData.map((d, i) => (
                        <circle key={`income-dot-${i}`} cx={xScale(i)} cy={yScale(d.income)} r="3" className="fill-green-500 stroke-card" strokeWidth="1.5">
                            <title>{`Income for ${d.label}: R${d.income.toFixed(2)}`}</title>
                        </circle>
                    ))}

                    {/* Expense Line */}
                    <polyline points={expensePoints} className="fill-none stroke-red-500" strokeWidth="2" />
                     {monthlyData.map((d, i) => (
                        <circle key={`expense-dot-${i}`} cx={xScale(i)} cy={yScale(d.expense)} r="3" className="fill-red-500 stroke-card" strokeWidth="1.5">
                            <title>{`Expense for ${d.label}: R${d.expense.toFixed(2)}`}</title>
                        </circle>
                    ))}
                </svg>
            </div>
             <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-muted-foreground">Income</span>
                </div>
                <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                    <span className="text-muted-foreground">Expenses</span>
                </div>
            </div>
        </div>
    );
};

export default IncomeExpenseBarChart;
