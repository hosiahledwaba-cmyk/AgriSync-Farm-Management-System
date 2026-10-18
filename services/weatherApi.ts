import { WeatherData, HistoricalDay, WeatherCondition } from '../types';

export const getWeatherForLocation = async (lat: number, lon: number): Promise<WeatherData> => {
    await new Promise(r => setTimeout(r, 100));

    // Realistic South African agricultural climate conditions
    const today = new Date();
    const conditions: WeatherCondition[] = ['Sunny', 'Partly Cloudy', 'Sunny', 'Rain', 'Partly Cloudy', 'Sunny', 'Sunny'];

    const forecast = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return {
            date: d.toISOString().split('T')[0],
            maxTemp: 24 + Math.round((Math.sin(i + lat) * 4)),
            minTemp: 11 + Math.round((Math.cos(i + lon) * 3)),
            condition: conditions[i % conditions.length],
        };
    });

    return {
        current: {
            temperature: 22.5,
            condition: 'Sunny',
            windSpeed: 14,
            humidity: 48,
        },
        forecast,
    };
};

export const getHistoricalWeatherForLocation = async (lat: number, lon: number): Promise<HistoricalDay[]> => {
    await new Promise(r => setTimeout(r, 100));

    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (14 - i));
        return {
            date: d.toISOString().split('T')[0],
            avgTemp: 18 + Math.round((Math.sin(i * 0.5) * 5)),
            precipitation: i === 4 ? 12 : i === 9 ? 6 : 0,
        };
    });
};
