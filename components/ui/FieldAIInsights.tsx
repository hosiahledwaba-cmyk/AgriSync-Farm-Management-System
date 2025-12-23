
import React from 'react';
import { FieldInsights } from '../../types';
import { SparklesIcon, FlaskConicalIcon, DropletsIcon, BarChartIcon, ShieldAlertIcon } from './Icon';

interface FieldAIInsightsProps {
    insights: FieldInsights | null;
    loading: boolean;
    error: string;
}

const InsightCard: React.FC<{ title: string; icon: React.ReactNode; recommendation: string; reasoning: string }> = ({ title, icon, recommendation, reasoning }) => (
    <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-bold text-foreground flex items-center gap-2 mb-2">
            {icon} {title}
        </h4>
        <p className="text-sm font-semibold text-primary">{recommendation}</p>
        <p className="text-xs text-muted-foreground mt-1">{reasoning}</p>
    </div>
);

const SkeletonInsightCard: React.FC = () => (
    <div className="bg-muted/50 p-4 rounded-lg animate-pulse">
        <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-full bg-muted"></div>
            <div className="h-4 w-24 bg-muted rounded"></div>
        </div>
        <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
        <div className="h-3 w-full bg-muted rounded"></div>
        <div className="h-3 w-5/6 bg-muted rounded mt-1"></div>
    </div>
);


const FieldAIInsights: React.FC<FieldAIInsightsProps> = ({ insights, loading, error }) => {
    if (loading) {
        return (
            <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <SparklesIcon className="text-primary animate-pulse" /> Agronomist AI Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SkeletonInsightCard />
                    <SkeletonInsightCard />
                    <SkeletonInsightCard />
                    <SkeletonInsightCard />
                </div>
            </div>
        );
    }
    
    if (error || !insights) {
        return (
            <div className="bg-card p-4 rounded-xl shadow-sm border border-border text-center">
                 <p className="text-destructive font-semibold">Could not load AI Insights.</p>
                 <p className="text-sm text-muted-foreground">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <SparklesIcon className="text-primary" /> Agronomist AI Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard 
                    title="Fertilizer"
                    icon={<FlaskConicalIcon />}
                    recommendation={insights.fertilizer.recommendation}
                    reasoning={insights.fertilizer.reasoning}
                />
                <InsightCard 
                    title="Pest & Disease"
                    icon={<ShieldAlertIcon />}
                    recommendation={insights.pesticide.recommendation}
                    reasoning={insights.pesticide.reasoning}
                />
                <InsightCard 
                    title="Irrigation"
                    icon={<DropletsIcon />}
                    recommendation={insights.irrigation.recommendation}
                    reasoning={insights.irrigation.reasoning}
                />
                 <InsightCard 
                    title="Harvest"
                    icon={<BarChartIcon />}
                    recommendation={insights.harvest.prediction}
                    reasoning={insights.harvest.reasoning}
                />
            </div>
        </div>
    );
};

export default FieldAIInsights;
