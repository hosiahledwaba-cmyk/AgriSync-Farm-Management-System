import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Field, CropSuggestion } from '../../types';
import { getCropSuggestions } from '../../services/geminiService';
import { SparklesIcon, LightBulbIcon } from '../ui/Icon';

interface AddFieldModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddField: (field: Omit<Field, 'id' | 'farm_id'>) => Promise<unknown>;
}

const AddFieldModal: React.FC<AddFieldModalProps> = ({ isOpen, onClose, onAddField }) => {
    const [name, setName] = useState('');
    const [area, setArea] = useState('');
    const [soilType, setSoilType] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [notes, setNotes] = useState('');
    const [suggestions, setSuggestions] = useState<CropSuggestion[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [suggestionError, setSuggestionError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAddField({ 
            name, 
            area: parseFloat(area), 
            soil_type: soilType, 
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            notes,
            soilHistory: [], // Initialize with empty history
        });
        onClose();
    };

    const handleGetSuggestions = async () => {
        if (!soilType || !area) {
            setSuggestionError("Please enter Soil Type and Area to get suggestions.");
            return;
        }
        setSuggestionError('');
        setLoadingSuggestions(true);
        setSuggestions([]); // Clear previous suggestions
        try {
            const result = await getCropSuggestions({ 
                field: {
                    soil_type: soilType,
                    area: parseFloat(area),
                    notes: notes,
                    latitude: latitude ? parseFloat(latitude) : undefined,
                    longitude: longitude ? parseFloat(longitude) : undefined,
                }
            });
            setSuggestions(result);
        } catch (error: any) {
            setSuggestionError(error.message || "Failed to fetch suggestions.");
        } finally {
            setLoadingSuggestions(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Field">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Field Name" value={name} onChange={e => setName(e.target.value)} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Area (hectares)" type="number" value={area} onChange={e => setArea(e.target.value)} required />
                    <div className="flex items-end gap-2">
                        <div className="flex-grow">
                             <Input label="Soil Type" value={soilType} onChange={e => setSoilType(e.target.value)} required />
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleGetSuggestions}
                            disabled={loadingSuggestions}
                            className="flex-shrink-0"
                            title="Get Crop Suggestions"
                            icon={<SparklesIcon />}
                        >
                            {loadingSuggestions ? '...' : 'Suggest'}
                        </Button>
                    </div>
                </div>

                {(loadingSuggestions || suggestionError || suggestions.length > 0) && (
                    <div className="pt-2 space-y-2">
                        {loadingSuggestions && <p className="text-muted-foreground text-sm text-center animate-pulse">Getting suggestions...</p>}
                        {suggestionError && <p className="text-red-500 text-sm">{suggestionError}</p>}
                        {suggestions.length > 0 && (
                            <div>
                                <h5 className="font-semibold flex items-center mb-2"><LightBulbIcon className="mr-2 text-yellow-500"/> Suggestions:</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                                {suggestions.map((s, i) => (
                                    <div key={i} className="p-3 bg-muted rounded-md border border-border">
                                        <p className="font-bold text-sm">{s.cropName} <span className="font-normal text-muted-foreground">({s.variety})</span></p>
                                        <p className="text-xs text-muted-foreground mt-1">{s.reasoning}</p>
                                        <div className="mt-2 pt-2 border-t border-border/50 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                            <span className="font-semibold">Rate:</span> <span className="text-muted-foreground">{s.seedingRate}</span>
                                            <span className="font-semibold">Plant:</span> <span className="text-muted-foreground">{s.plantingWindow}</span>
                                            <span className="font-semibold">Yield:</span> <span className="text-muted-foreground">{s.estimatedYield}</span>
                                            <span className="font-semibold col-span-2">Market:</span> <span className="text-muted-foreground col-span-2 -mt-1">{s.marketOutlook}</span>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Latitude" type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} required placeholder="e.g., 41.8781"/>
                    <Input label="Longitude" type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} required placeholder="e.g., -87.6298"/>
                </div>
                <Input label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} isTextarea />
                
                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Field</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddFieldModal;