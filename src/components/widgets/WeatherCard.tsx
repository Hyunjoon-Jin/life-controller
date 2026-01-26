'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, AlignJustify, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface WeatherData {
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

export function WeatherCard() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    // Seoul Coordinates
    const LAT = 37.5665;
    const LON = 126.9780;

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=weather_code,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`
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
    }, []);

    const getWeatherIcon = (code: number) => {
        if (code === 0) return <Sun className="w-8 h-8 text-orange-500" />; // Clear
        if (code >= 1 && code <= 3) return <Cloud className="w-8 h-8 text-gray-500" />; // Cloudy
        if (code >= 45 && code <= 48) return <AlignJustify className="w-8 h-8 text-gray-400" />; // Fog
        if (code >= 51 && code <= 67) return <CloudDrizzle className="w-8 h-8 text-blue-400" />; // Drizzle/Rain
        if (code >= 71 && code <= 77) return <CloudSnow className="w-8 h-8 text-sky-200" />; // Snow
        if (code >= 80 && code <= 82) return <CloudRain className="w-8 h-8 text-blue-600" />; // Showers
        if (code >= 95 && code <= 99) return <CloudLightning className="w-8 h-8 text-yellow-600" />; // Thunderstorm
        return <Sun className="w-8 h-8 text-orange-500" />;
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
    }

    if (loading) {
        return (
            <Card className="h-full border-none shadow-sm animate-pulse">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">날씨 로딩중...</CardTitle>
                </CardHeader>
                <CardContent className="h-40 bg-muted/20" />
            </Card>
        );
    }

    if (!weather) return null;

    return (
        <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
            <CardHeader className="pb-2 border-b border-blue-100/50 dark:border-blue-900/50">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Sun className="w-5 h-5 text-orange-500" /> 날씨 예보
                    </CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" /> 서울
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {/* Current Weather */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        {getWeatherIcon(weather.current_weather.weathercode)}
                        <div>
                            <div className="text-3xl font-bold font-mono">
                                {Math.round(weather.current_weather.temperature)}°
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                                {getWeatherLabel(weather.current_weather.weathercode)}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium">최고 {Math.round(weather.daily.temperature_2m_max[0])}°</div>
                        <div className="text-sm text-muted-foreground">최저 {Math.round(weather.daily.temperature_2m_min[0])}°</div>
                    </div>
                </div>

                {/* Weekly Forecast */}
                <div className="grid grid-cols-7 gap-2 text-center">
                    {weather.daily.time.slice(1, 8).map((time, index) => {
                        // slice(1, 8) gets tomorrow + 6 days = 7 days forecast excluding today
                        const date = new Date(time);
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                        return (
                            <div key={time} className="flex flex-col items-center gap-1 group cursor-default">
                                <span className={`text-[10px] font-bold ${date.getDay() === 0 ? 'text-red-500' : date.getDay() === 6 ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                    {format(date, 'EEE', { locale: ko })}
                                </span>
                                <div className="p-1 rounded-full group-hover:bg-muted/50 transition-colors">
                                    {/* Simplified Icons for small view */}
                                    {getWeatherIcon(weather.daily.weather_code[index + 1])}
                                    {/* Note: index + 1 because we sliced from index 1 */}
                                </div>
                                <div className="text-xs font-medium">
                                    {Math.round(weather.daily.temperature_2m_max[index + 1])}°
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {Math.round(weather.daily.temperature_2m_min[index + 1])}°
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
