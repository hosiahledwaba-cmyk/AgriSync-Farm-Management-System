import React from 'react';
import { BarChartIcon } from './Icon';

interface YieldComparisonChartProps {
    historicalYield?: number;
    predictedYield?: number;
    loading?: boolean;
}

const SkeletonLoader: React.FC = () => (
    <div className="bg-card p-4 rounded-xl shadow-sm border border-border animate-pulse min-h-[220px]">
        <div className="h-5 bg-muted rounded w-3/4 mb-4"></div>
        <div className="flex justify-around items-end h-40">
            <div className="flex flex-col items-center w-1/3">
                <div className="w-full bg-muted rounded-t-lg h-2/3"></div>
                <div className="h-3 w-1/2 bg-muted rounded mt-1"></div>
            </div>
            <div className="flex flex-col items-center w-1/3">
                <div className="w-full bg-muted rounded-t-lg h-1/2"></div>
                <div className="h-3 w-1/2 bg-muted rounded mt-1"></div>
            </div>
        </div>
        <div className="flex justify-center gap-4 mt-2 border-t border-border pt-2">
            <div className="h-3 w-24 bg-muted rounded"></div>
            <div className="h-3 w-24 bg-muted rounded"></div>
        </div>
    </div>
);


const YieldComparisonChart: React.FC<YieldComparisonChartProps> = ({ historicalYield = 0, predictedYield = 0, loading = false }) => {

    if (loading) {
        return <SkeletonLoader />;
    }

    if (historicalYield === 0 && predictedYield === 0) {
         return (
            <div className="bg-card p-4 rounded-xl shadow-sm border border-border h-full flex flex-col items-center justify-center text-center min-h-[220px]">
                <BarChartIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-md font-semibold text-foreground">Yield Projection</h3>
                <p className="text-sm text-muted-foreground">No yield data available for comparison.</p>
            </div>
        );
    }
    
    const maxValue = Math.max(historicalYield, predictedYield, 1) * 1.2;

    const historicalHeight = (historicalYield / maxValue) * 100;
    const predictedHeight = (predictedYield / maxValue) * 100;

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border min-h-[220px]">
            <h3 className="text-md font-semibold text-foreground mb-4">Yield Projection (tons/ha)</h3>
            <div className="flex justify-around items-end h-40">
                <div className="flex flex-col items-center w-1/3">
                    <div className="w-full bg-muted rounded-t-lg flex items-end" style={{ height: `${historicalHeight}%` }}>
                        <div className="w-full h-full bg-blue-500 rounded-t-lg"></div>
                    </div>
                    <p className="text-xs font-semibold mt-1">{historicalYield.toFixed(1)}</p>
                </div>
                 <div className="flex flex-col items-center w-1/3">
                    <div className="w-full bg-muted rounded-t-lg flex items-end" style={{ height: `${predictedHeight}%` }}>
                        <div className="w-full h-full bg-primary rounded-t-lg"></div>
                    </div>
                    <p className="text-xs font-semibold mt-1">{predictedYield.toFixed(1)}</p>
                </div>
            </div>
             <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-2 border-t border-border pt-2">
                <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-blue-500"></span> Historical Avg.</div>
                <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-primary"></span> AI Predicted</div>
            </div>
        </div>
    );
};

export default YieldComparisonChart;