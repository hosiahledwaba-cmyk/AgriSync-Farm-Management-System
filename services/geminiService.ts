import { Field, Planting, WeatherData, CropHealthSnapshot, CropSuggestion, FieldInsights, FieldAlert, Livestock, LivestockHealthAnalysis } from '../types';

export const getCropSuggestions = async (params: {
    field: Partial<Field>;
    weather?: WeatherData | null;
    historicalWeather?: any[];
    cropHistory?: any[];
}): Promise<CropSuggestion[]> => {
    await new Promise(r => setTimeout(r, 400));

    const soil = (params.field.soil_type || '').toLowerCase();
    const suggestions: CropSuggestion[] = [];

    if (soil.includes('sand') || soil.includes('loam')) {
        suggestions.push({
            cropName: 'Maize (White Hybrid)',
            variety: 'PAN 6R-710BR / Pioneer 1615',
            seedingRate: '22 - 25 kg/ha (~55,000 seeds/ha)',
            plantingWindow: 'Mid-October to Early December',
            reasoning: 'Well-draining loamy soil combined with seasonal rainfall provides ideal root development and grain fill conditions.',
            marketOutlook: 'High domestic feed and food demand with robust SAFEX forward contract pricing.',
            estimatedYield: '7.5 - 9.5 t/ha',
        });
        suggestions.push({
            cropName: 'Soybeans',
            variety: 'Don Mario 5953 RSF',
            seedingRate: '65 - 75 kg/ha',
            plantingWindow: 'November to Mid-December',
            reasoning: 'Excellent nitrogen-fixing rotational partner for maize to replenish soil nitrogen naturally.',
            marketOutlook: 'Strong crush margins and high protein meal demand.',
            estimatedYield: '2.8 - 3.4 t/ha',
        });
    }

    if (soil.includes('clay') || soil.includes('red') || suggestions.length < 3) {
        suggestions.push({
            cropName: 'Canola',
            variety: 'Hyola 559TT (Triazine Tolerant)',
            seedingRate: '3.5 - 4.5 kg/ha',
            plantingWindow: 'Mid-April to Late May (Winter cycle)',
            reasoning: 'Good moisture-retention soil supports steady early vegetative growth and high oil content.',
            marketOutlook: 'Premium pricing for non-GMO healthy culinary oil extraction.',
            estimatedYield: '2.0 - 2.8 t/ha',
        });
        suggestions.push({
            cropName: 'Sunflower',
            variety: 'PAN 7080',
            seedingRate: '4.5 - 5.5 kg/ha (~40,000 plants/ha)',
            plantingWindow: 'December to Mid-January',
            reasoning: 'Deep taproot structure withstands dry spells and scavenges residual nutrients efficiently.',
            marketOutlook: 'Consistently liquid market through local commercial oilseed processors.',
            estimatedYield: '1.8 - 2.5 t/ha',
        });
    }

    return suggestions;
};

export const getFieldInsights = async (params: {
    field: Field;
    activePlanting?: Planting;
    weather?: WeatherData | null;
    recentHealthSnapshots?: CropHealthSnapshot[];
}): Promise<FieldInsights> => {
    await new Promise(r => setTimeout(r, 400));

    const cropName = params.activePlanting?.crop_name || 'General Field';
    const latestSoil = params.field.soilHistory?.[0];
    const nitrogenStatus = latestSoil?.nitrogen || 'Optimal';

    return {
        fertilizer: {
            recommendation: nitrogenStatus === 'Slightly Low' 
                ? 'Apply LAN (28%) topdressing at 150 kg/ha before incoming precipitation.'
                : 'Maintain standard foliar micronutrient feeding program (Zinc + Boron).',
            reasoning: `Latest soil test indicates nitrogen is ${nitrogenStatus} on ${params.field.soil_type}. Timely application ensures maximum canopy biomass.`,
        },
        pesticide: {
            recommendation: 'Scout western perimeter for early stalk borer and aphid presence. No chemical spray required yet.',
            reasoning: 'Scouting trap thresholds remain below economic injury levels (EIL < 5% infestation).',
        },
        irrigation: {
            recommendation: 'Target 25mm pivot application every 5 days; reduce duration if forecast rain exceeds 10mm.',
            reasoning: 'Soil moisture profiles in upper 40cm root zone are currently at 68% field capacity.',
        },
        harvest: {
            prediction: `Estimated physiological maturity within 45-55 days for ${cropName}.`,
            reasoning: 'Growing Degree Days (GDD) accumulation is tracking within 2% of the 5-year historical average.',
        },
        expectedYield: 8.4,
    };
};

export const generateFieldAlerts = async (params: {
    field: Field;
    activePlanting?: Planting;
    weather?: WeatherData | null;
    recentHealthSnapshots?: CropHealthSnapshot[];
}): Promise<FieldAlert[]> => {
    await new Promise(r => setTimeout(r, 200));

    const alerts: FieldAlert[] = [];

    if (params.weather?.forecast?.some(f => f.condition === 'Rain')) {
        alerts.push({
            id: 'alt_rain',
            type: 'info',
            message: 'Rain expected in 48-hour forecast. Consider pausing pivot irrigation to conserve energy and pumping costs.',
        });
    }

    if (params.field.soilHistory?.some(s => s.ph < 6.2)) {
        alerts.push({
            id: 'alt_ph',
            type: 'warning',
            message: 'Soil pH is slightly acidic (pH < 6.2). Recommend scheduled agricultural lime application post-harvest.',
        });
    }

    return alerts;
};

export const analyzeLivestockHealth = async (livestock: Livestock): Promise<LivestockHealthAnalysis> => {
    await new Promise(r => setTimeout(r, 500));

    const name = livestock.name || livestock.groupName || 'Livestock';
    const hasIssues = (livestock.healthHistory || []).some(h => h.eventType === 'Illness');

    return {
        healthScore: hasIssues ? 7 : 9,
        summary: `${name} is demonstrating solid physiological metrics with regular feed intake, consistent weight gain, and normal activity levels.`,
        potentialIssues: [
            'Seasonal tick load elevation during warm humid weather',
            'Slight protein requirement spike as winter pasture quality drops',
        ],
        recommendations: [
            'Maintain bi-weekly dip tank / pour-on acaricide schedule.',
            'Provide uninterrupted access to high-phosphorus summer/winter lick blocks.',
            'Confirm booster vaccination dates on the AgriSync task board.',
        ],
    };
};
