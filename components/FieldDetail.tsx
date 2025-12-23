import React, { useState, useEffect, useMemo } from 'react';
import { Field, Planting, Harvest, Role, Task, WeatherData, CropHealthSnapshot, WateringEvent, HealthScore, WateringStatus, HistoricalDay, CropSuggestion, FieldAlert, FieldInsights, SoilAnalysis } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { ArrowLeftIcon, PlusIcon, FlaskConicalIcon, HistoryIcon, DropletsIcon, SparklesIcon, PencilIcon } from './ui/Icon';
import * as weatherApi from '../services/weatherApi';
import WeatherWidget from './WeatherWidget';
import FieldTimeline from './FieldTimeline';
import WeatherTrendChart from './WeatherTrendChart';
import { getCropSuggestions, getFieldInsights, generateFieldAlerts } from '../services/geminiService';
import CropSuggestionsModal from './modals/CropSuggestionsModal';
import FieldAIInsights from './ui/FieldAIInsights';
import SmartAlertBanner from './ui/SmartAlertBanner';
import SoilTrendChart from './ui/SoilTrendChart';
import YieldComparisonChart from './ui/YieldComparisonChart';

interface FieldDetailProps {
    field: Field;
    plantings: Planting[];
    harvests: Harvest[];
    tasks: Task[];
    healthSnapshots: CropHealthSnapshot[];
    wateringEvents: WateringEvent[];
    onBack: () => void;
    onAddPlanting: () => void;
    onAddHarvest: () => void;
    onAddHealthSnapshot: (planting: Planting) => void;
    onUpdateWateringEvent: (eventId: string, fieldId: number, updates: Partial<WateringEvent>) => void;
    onUpdateSoilAnalysis: () => void;
}

const FieldDetail: React.FC<FieldDetailProps> = ({ 
    field, plantings, harvests, tasks, healthSnapshots, wateringEvents, 
    onBack, onAddPlanting, onAddHarvest, onAddHealthSnapshot, onUpdateWateringEvent,
    onUpdateSoilAnalysis
}) => {
    const { user } = useAuth();
    const canManage = user.role === Role.Owner || user.role === Role.Manager;
    
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [weatherError, setWeatherError] = useState<string | null>(null);

    const [historicalWeather, setHistoricalWeather] = useState<HistoricalDay[]>([]);
    const [historicalLoading, setHistoricalLoading] = useState(true);
    const [historicalError, setHistoricalError] = useState<string | null>(null);
    
    const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<CropSuggestion[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [suggestionsError, setSuggestionsError] = useState('');

    const [insights, setInsights] = useState<FieldInsights | null>(null);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const [insightsError, setInsightsError] = useState('');

    const [alerts, setAlerts] = useState<FieldAlert[]>([]);
    
    const activePlanting = useMemo(() => plantings.find(p => p.status === 'Active'), [plantings]);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!field.latitude || !field.longitude) {
                const errorMsg = "Field location is not set.";
                setWeatherError(errorMsg);
                setWeatherLoading(false);
                setHistoricalError(errorMsg);
                setHistoricalLoading(false);
                setInsightsError(errorMsg);
                setInsightsLoading(false);
                return;
            }
            try {
                // Reset states
                setWeatherLoading(true);
                setHistoricalLoading(true);
                setInsightsLoading(true);
                setAlerts([]);

                const [currentForecastData, historicalData] = await Promise.all([
                    weatherApi.getWeatherForLocation(field.latitude, field.longitude),
                    weatherApi.getHistoricalWeatherForLocation(field.latitude, field.longitude)
                ]);
                
                setWeatherData(currentForecastData);
                setHistoricalWeather(historicalData);
                setWeatherLoading(false);
                setHistoricalLoading(false);

                // Fetch AI data after weather is loaded
                const insightParams = {
                    field,
                    activePlanting,
                    weather: currentForecastData,
                    recentHealthSnapshots: healthSnapshots,
                };
                
                const [fetchedInsights, fetchedAlerts] = await Promise.all([
                    getFieldInsights(insightParams),
                    generateFieldAlerts(insightParams),
                ]);

                setInsights(fetchedInsights);
                setAlerts(fetchedAlerts);

            } catch (error) {
                const errorMsg = "Could not fetch all field data.";
                console.error(error);
                setWeatherError(errorMsg);
                setHistoricalError(errorMsg);
                setInsightsError("Failed to load AI insights.");
            } finally {
                setWeatherLoading(false);
                setHistoricalLoading(false);
                setInsightsLoading(false);
            }
        };

        fetchAllData();
    }, [field, activePlanting, healthSnapshots]);
    
    const activePlantings = useMemo(() => plantings.filter(p => p.status === 'Active'), [plantings]);

    const fieldIntel = useMemo(() => {
        const cropHistory = plantings
            .filter(p => p.status === 'Harvested')
            .map(p => {
                const harvest = harvests.find(h => h.planting_id === p.id);
                return {
                    id: p.id,
                    name: p.crop_name,
                    variety: p.variety,
                    harvestDate: harvest?.date,
                    yield: harvest?.weight_kg ? (harvest.weight_kg / 1000) / (p.area_planted || field.area) : undefined, // tons per hectare
                };
            })
            .sort((a, b) => new Date(b.harvestDate || 0).getTime() - new Date(a.harvestDate || 0).getTime());
            
        const lastCompletedWatering = [...wateringEvents]
            .filter(w => w.status === 'Completed' && w.completed_date)
            .sort((a, b) => new Date(b.completed_date!).getTime() - new Date(a.completed_date!).getTime())[0];

        const latestSoilAnalysis = [...field.soilHistory].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        return { cropHistory, lastCompletedWatering, latestSoilAnalysis };
    }, [plantings, harvests, wateringEvents, field.area, field.soilHistory]);
    
    const historicalAvgYield = useMemo(() => {
        if (!activePlanting || fieldIntel.cropHistory.length === 0) return 0;
        const relevantHistory = fieldIntel.cropHistory.filter(h => h.name === activePlanting.crop_name && h.yield);
        if (relevantHistory.length === 0) return 0;
        const totalYield = relevantHistory.reduce((sum, h) => sum + h.yield!, 0);
        return totalYield / relevantHistory.length;
    }, [fieldIntel.cropHistory, activePlanting]);


    const kpis = useMemo(() => {
        const usedArea = activePlantings.reduce((sum, p) => sum + p.area_planted, 0);
        const latestSnapshot = [...healthSnapshots].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const nextWatering = [...wateringEvents]
            .filter(w => w.status === 'Scheduled')
            .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())[0];
        
        return {
            usedArea,
            areaUtilization: field.area > 0 ? (usedArea / field.area) * 100 : 0,
            latestHealthScore: latestSnapshot?.score,
            nextWatering,
        };
    }, [activePlantings, healthSnapshots, wateringEvents, field.area]);

    const getScoreColor = (score?: HealthScore) => {
        if (score === 'Excellent') return 'text-green-500';
        if (score === 'Good') return 'text-blue-500';
        if (score === 'Fair') return 'text-yellow-500';
        if (score === 'Poor') return 'text-red-500';
        return 'text-muted-foreground';
    };

    const handleGetSuggestions = async () => {
        setIsSuggestionsModalOpen(true);
        setSuggestionsLoading(true);
        setSuggestionsError('');
        setSuggestions([]);

        try {
            const result = await getCropSuggestions({
                field: field,
                weather: weatherData,
                historicalWeather: historicalWeather,
                cropHistory: fieldIntel.cropHistory,
            });
            setSuggestions(result);
        } catch (error: any) {
            setSuggestionsError(error.message || "Failed to fetch suggestions.");
        } finally {
            setSuggestionsLoading(false);
        }
    };
    
    const StatusCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-2xl font-bold text-foreground truncate">{children}</div>
        </div>
    );


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-accent mr-4">
                        <ArrowLeftIcon className="h-6 w-6 text-muted-foreground" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">{field.name}</h2>
                        <p className="text-muted-foreground text-sm">{field.area} ha &bull; {field.soil_type}</p>
                    </div>
                </div>
                 {canManage && (
                    <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                        <Button onClick={handleGetSuggestions} variant="secondary" icon={<SparklesIcon />}>Suggest Crops</Button>
                        <Button onClick={onAddHarvest} variant="secondary">Record Harvest</Button>
                        <Button onClick={onAddPlanting} icon={<PlusIcon />}>Log Planting</Button>
                    </div>
                )}
            </div>

            <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                <h3 className="text-md font-semibold text-foreground mb-2">Field Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatusCard title="Area Used">
                        {kpis.usedArea.toFixed(1)} / {field.area} ha
                    </StatusCard>
                    <StatusCard title="Utilization">
                        {kpis.areaUtilization.toFixed(0)}%
                    </StatusCard>
                    <StatusCard title="Health">
                        <span className={getScoreColor(kpis.latestHealthScore)}>{kpis.latestHealthScore || 'N/A'}</span>
                    </StatusCard>
                    <StatusCard title="Next Watering">
                        {kpis.nextWatering ? new Date(kpis.nextWatering.scheduled_date + 'T00:00:00Z').toLocaleDateString() : 'N/A'}
                    </StatusCard>
                </div>
            </div>
            
             <SmartAlertBanner alerts={alerts} onDismiss={(id) => setAlerts(current => current.filter(a => a.id !== id))} />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 space-y-6">
                    <FieldAIInsights insights={insights} loading={insightsLoading} error={insightsError} />
                     <FieldTimeline 
                        plantings={plantings}
                        harvests={harvests}
                        tasks={tasks}
                        healthSnapshots={healthSnapshots}
                        wateringEvents={wateringEvents}
                        onAddHealthSnapshot={onAddHealthSnapshot}
                        onUpdateWateringEvent={(eventId, updates) => onUpdateWateringEvent(eventId, field.id, updates)}
                    />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <WeatherWidget 
                        weatherData={weatherData}
                        loading={weatherLoading}
                        error={weatherError}
                    />

                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Field Intel</h3>
                        
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-sm flex items-center"><FlaskConicalIcon className="h-4 w-4 mr-2 text-muted-foreground"/> Soil Analysis</h4>
                                {canManage && (
                                    <Button onClick={onUpdateSoilAnalysis} size="sm" variant="secondary" icon={<PencilIcon className="h-4 w-4" />}>
                                        Update
                                    </Button>
                                )}
                            </div>
                            {fieldIntel.latestSoilAnalysis ? (
                                <div className="text-sm space-y-1">
                                    <div className="grid grid-cols-2 gap-x-4">
                                        <p><span className="text-muted-foreground">pH:</span> <span className="font-bold">{fieldIntel.latestSoilAnalysis.ph}</span></p>
                                        <p><span className="text-muted-foreground">Nitrogen (N):</span> <span className="font-bold">{fieldIntel.latestSoilAnalysis.nitrogen}</span></p>
                                        <p><span className="text-muted-foreground">Phosphorus (P):</span> <span className="font-bold">{fieldIntel.latestSoilAnalysis.phosphorus}</span></p>
                                        <p><span className="text-muted-foreground">Potassium (K):</span> <span className="font-bold">{fieldIntel.latestSoilAnalysis.potassium}</span></p>
                                    </div>
                                    <p className="text-xs text-muted-foreground pt-1">Last Analysis: {new Date(fieldIntel.latestSoilAnalysis.date).toLocaleDateString()}</p>
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No soil analysis data.</p>}
                        </div>

                        <div className="border-t border-border pt-3">
                            <h4 className="font-semibold text-sm mb-2 flex items-center"><HistoryIcon className="h-4 w-4 mr-2 text-muted-foreground"/> Crop History</h4>
                            <div className="text-sm space-y-1">
                                {fieldIntel.cropHistory.slice(0, 3).map(crop => (
                                    <div key={crop.id} className="flex justify-between">
                                        <span>{crop.name} ({new Date(crop.harvestDate!).getFullYear()})</span>
                                        <span className="font-semibold">{crop.yield ? `${(crop.yield * field.area).toFixed(1)} t` : 'N/A'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-border pt-3">
                            <h4 className="font-semibold text-sm mb-2 flex items-center"><DropletsIcon className="h-4 w-4 mr-2 text-muted-foreground"/> Irrigation</h4>
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="bg-muted/50 p-2 rounded">
                                    <p className="text-xs text-muted-foreground">Last Completed</p>
                                    <p className="font-bold">{fieldIntel.lastCompletedWatering ? new Date(fieldIntel.lastCompletedWatering.completed_date! + 'T00:00:00Z').toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="bg-muted/50 p-2 rounded">
                                    <p className="text-xs text-muted-foreground">Next Scheduled</p>
                                    <p className="font-bold">{kpis.nextWatering ? new Date(kpis.nextWatering.scheduled_date + 'T00:00:00Z').toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <SoilTrendChart soilHistory={field.soilHistory} />
                    <YieldComparisonChart historicalYield={historicalAvgYield} predictedYield={insights?.expectedYield} loading={insightsLoading} />
                    <WeatherTrendChart 
                        historicalData={historicalWeather}
                        loading={historicalLoading}
                        error={historicalError}
                    />
                </div>
            </div>

            <CropSuggestionsModal
                isOpen={isSuggestionsModalOpen}
                onClose={() => setIsSuggestionsModalOpen(false)}
                suggestions={suggestions}
                loading={suggestionsLoading}
                error={suggestionsError}
            />
        </div>
    );
};

export default FieldDetail;