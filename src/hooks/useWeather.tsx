import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, AlignJustify } from 'lucide-react';
import React from 'react';

// Types
export interface WeatherData {
    current_weather: {
        temperature: number;
        weathercode: number;
    };
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        weather_code: number[];
    };
}

export function useWeather() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [locationName, setLocationName] = useState('서울'); // Default to Seoul

    // Default: Seoul Coordinates
    const [coords, setCoords] = useState<{ lat: number; lon: number }>({
        lat: 37.5665,
        lon: 126.9780
    });

    useEffect(() => {
        // 1. Try to get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                    setLocationName('내 위치'); // Or reverse geocode if needed
                },
                (error) => {
                    console.warn("Geolocation denied or failed, using default (Seoul).", error);
                    setLoading(false); // Trigger fetch with default
                }
            );
        }
    }, []);

    useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`
                );
                const data = await response.json();
                setWeather(data);
            } catch (error) {
                console.error("Failed to fetch weather", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [coords]);

    const getWeatherIcon = (code: number, className = "w-8 h-8") => {
        if (code === 0) return <Sun className={`${className} text-orange-500`} />;
        if (code >= 1 && code <= 3) return <Cloud className={`${className} text-gray-500`} />;
        if (code >= 45 && code <= 48) return <AlignJustify className={`${className} text-gray-400`} />;
        if (code >= 51 && code <= 67) return <CloudDrizzle className={`${className} text-blue-400`} />;
        if (code >= 71 && code <= 77) return <CloudSnow className={`${className} text-sky-200`} />;
        if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-blue-600`} />;
        if (code >= 95 && code <= 99) return <CloudLightning className={`${className} text-yellow-600`} />;
        return <Sun className={`${className} text-orange-500`} />;
    };

    const getWeatherLabel = (code: number) => {
        if (code === 0) return '맑음';
        if (code >= 1 && code <= 3) return '구름';
        if (code >= 45 && code <= 48) return '안개';
        if (code >= 51 && code <= 67) return '비';
        if (code >= 71 && code <= 77) return '눈';
        if (code >= 80 && code <= 82) return '소나기';
        if (code >= 95 && code <= 99) return '뇌우';
        return '맑음';
    };

    return { weather, loading, locationName, getWeatherIcon, getWeatherLabel };
}
