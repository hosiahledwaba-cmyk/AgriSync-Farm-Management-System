import React from 'react';
import Modal from '../ui/Modal';
import { CropSuggestion } from '../../types';
import { LightBulbIcon } from '../ui/Icon';

interface CropSuggestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    suggestions: CropSuggestion[];
    loading: boolean;
    error: string;
}

const CropSuggestionsModal: React.FC<CropSuggestionsModalProps> = ({ isOpen, onClose, suggestions, loading, error }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Crop Suggestions">
            <div>
                {loading && <p className="text-center text-muted-foreground">Generating suggestions based on field data...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && suggestions.length > 0 && (
                     <div className="space-y-4">
                        <h5 className="font-semibold flex items-center text-lg"><LightBulbIcon className="mr-2 text-yellow-500"/> Here are a few suggestions:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                        {suggestions.map((s, i) => (
                            <div key={i} className="p-4 bg-muted rounded-lg border border-border">
                                <p className="font-bold text-foreground">{s.cropName} <span className="font-normal text-muted-foreground">({s.variety})</span></p>
                                <p className="text-sm text-muted-foreground mt-2">{s.reasoning}</p>
                                <div className="mt-3 pt-3 border-t border-border/50 space-y-1 text-sm">
                                    <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Planting Window:</span> <span className="text-foreground text-right">{s.plantingWindow}</span></div>
                                    <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Seeding Rate:</span> <span className="text-foreground text-right">{s.seedingRate}</span></div>
                                    <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Est. Yield:</span> <span className="text-foreground text-right">{s.estimatedYield}</span></div>
                                    <div className="flex justify-between items-start"><span className="font-semibold text-muted-foreground flex-shrink-0 mr-2">Market Outlook:</span> <span className="text-foreground text-right">{s.marketOutlook}</span></div>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
                 {!loading && !error && suggestions.length === 0 && (
                     <p className="text-center text-muted-foreground">No suggestions were generated.</p>
                 )}
            </div>
        </Modal>
    );
};

export default CropSuggestionsModal;