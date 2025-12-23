import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Livestock, LivestockHealthAnalysis } from '../../types';
import { analyzeLivestockHealth } from '../../services/geminiService';
import { BeakerIcon, CheckCircleIcon, ShieldAlertIcon } from '../ui/Icon';

interface LivestockHealthAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    livestock: Livestock;
}

const LivestockHealthAnalysisModal: React.FC<LivestockHealthAnalysisModalProps> = ({ isOpen, onClose, livestock }) => {
    const [analysis, setAnalysis] = useState<LivestockHealthAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const getAnalysis = async () => {
                setLoading(true);
                setError('');
                setAnalysis(null);
                try {
                    const result = await analyzeLivestockHealth(livestock);
                    setAnalysis(result);
                } catch (err: any) {
                    setError(err.message || 'Failed to get analysis.');
                } finally {
                    setLoading(false);
                }
            };
            getAnalysis();
        }
    }, [isOpen, livestock]);
    
    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-500';
        if (score >= 5) return 'text-yellow-500';
        return 'text-red-500';
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`AI Health Analysis for ${livestock.name || livestock.groupName}`}>
            <div className="min-h-[300px]">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <BeakerIcon className="h-12 w-12 text-primary animate-pulse mb-4" />
                        <p className="font-semibold text-lg">Analyzing Data...</p>
                        <p className="text-muted-foreground">The AI is reviewing health records, productivity, and sensor data.</p>
                    </div>
                )}
                {error && <p className="text-center text-red-500">{error}</p>}
                {analysis && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-muted rounded-lg">
                            <div className="flex-shrink-0 text-center">
                                <p className="text-sm font-bold text-muted-foreground">Health Score</p>
                                <p className={`text-6xl font-bold ${getScoreColor(analysis.healthScore)}`}>{analysis.healthScore}<span className="text-3xl text-muted-foreground">/10</span></p>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Summary</h4>
                                <p className="text-muted-foreground">{analysis.summary}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-2"><ShieldAlertIcon className="h-5 w-5 text-red-500"/> Potential Issues</h4>
                             <ul className="list-disc list-inside space-y-1 text-sm">
                                {analysis.potentialIssues.length > 0 ? (
                                    analysis.potentialIssues.map((issue, i) => <li key={i}>{issue}</li>)
                                ) : (
                                    <li className="text-muted-foreground">No significant issues detected.</li>
                                )}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-2"><CheckCircleIcon className="h-5 w-5 text-green-500"/> Recommendations</h4>
                             <ul className="list-disc list-inside space-y-1 text-sm">
                                {analysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default LivestockHealthAnalysisModal;
