'use client';

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, AlignJustify, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherData {
    temp: number;
    min: number;
    max: number;
    code: number;
    city: string;
}

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = async (lat: number, lon: number, cityName?: string) => {
        try {
            // 1. Fetch Weather
            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
            );
            const weatherData = await weatherRes.json();

            // 2. Fetch City Name if not provided
            let finalCity = cityName;
            if (!finalCity) {
                const geoRes = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ko`
                );
                const geoData = await geoRes.json();
                finalCity = geoData.city || geoData.locality || '나의 위치';
            }

            if (!weatherData.current || !weatherData.daily) {
                throw new Error('Invalid data');
            }

            setWeather({
                temp: Math.round(weatherData.current.temperature_2m),
                code: weatherData.current.weather_code,
                min: Math.round(weatherData.daily.temperature_2m_min[0]),
                max: Math.round(weatherData.daily.temperature_2m_max[0]),
                city: finalCity || '나의 위치'
            });
            setError(null);
        } catch (err) {
            console.error('Weather fetch error:', err);
            setError('날씨 정보를 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!navigator.geolocation) {
            // Fallback to Seoul if no geolocation support
            fetchWeather(37.5665, 126.9780, '서울');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                console.warn('Geolocation error, falling back to Seoul:', err);
                // Fallback to Seoul on error (permission denied, etc.)
                fetchWeather(37.5665, 126.9780, '서울');
            },
            { timeout: 10000 }
        );
    }, []);

    const getWeatherIcon = (code: number) => {
        if (code === 0) return <Sun className="w-5 h-5 text-yellow-500" />;
        if (code >= 1 && code <= 3) return <Cloud className="w-5 h-5 text-gray-400" />;
        if (code >= 45 && code <= 48) return <AlignJustify className="w-5 h-5 text-gray-400" />;
        if (code >= 51 && code <= 67) return <CloudDrizzle className="w-5 h-5 text-blue-300" />;
        if (code >= 71 && code <= 77) return <CloudSnow className="w-5 h-5 text-sky-100" />;
        if (code >= 80 && code <= 82) return <CloudRain className="w-5 h-5 text-blue-400" />;
        if (code >= 95 && code <= 99) return <CloudLightning className="w-5 h-5 text-yellow-400" />;
        return <Sun className="w-5 h-5 text-yellow-500" />;
    };

    if (loading) return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> 날씨 로딩 중...
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-full">
            ⚠️ {error}
        </div>
    );

    if (!weather) return null;

    return (
        <div className="flex items-center gap-3 bg-card hover:bg-muted/50 transition-colors px-4 py-1.5 rounded-full shadow-sm border border-border">
            <div className="flex items-center gap-1.5 border-r border-border pr-3">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{weather.city}</span>
            </div>

            <div className="flex items-center gap-2">
                {getWeatherIcon(weather.code)}
                <span className="text-lg font-bold text-foreground">{weather.temp}°</span>
            </div>

            <div className="flex flex-col text-[10px] leading-tight text-muted-foreground">
                <span className="text-red-400">H: {weather.max}°</span>
                <span className="text-blue-400">L: {weather.min}°</span>
            </div>
        </div>
    );
}
