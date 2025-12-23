import { useState, useEffect } from 'react';
import { WeatherData } from '../types';
import * as weatherApi from '../services/weatherApi';

export const useWeatherData = (latitude?: number, longitude?: number) => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            if (latitude === undefined || longitude === undefined) {
                setError("Location is not set.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const data = await weatherApi.getWeatherForLocation(latitude, longitude);
                setWeatherData(data);
            } catch (error) {
                setError("Could not fetch weather data.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [latitude, longitude]);

    return { weatherData, loading, error };
};
