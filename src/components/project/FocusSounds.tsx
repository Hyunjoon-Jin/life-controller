"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

// Free sounds from reliable sources (or placeholders)
// Using Mixkit free license assets for demo or standard placeholders
const SOUNDS = [
    { id: 'rain', name: 'Rain', icon: '🌧️', url: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-1611.mp3' },
    { id: 'coffee', name: 'Cafe', icon: '☕', url: 'https://assets.mixkit.co/sfx/preview/mixkit-restaurant-ambience-1309.mp3' },
    { id: 'forest', name: 'Forest', icon: '🌲', url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3' },
    { id: 'fire', name: 'Fire', icon: '🔥', url: 'https://assets.mixkit.co/sfx/preview/mixkit-campfire-crackles-1330.mp3' },
    { id: 'white', name: 'White Noise', icon: '📻', url: 'https://assets.mixkit.co/sfx/preview/mixkit-white-noise-frequency-loop-1629.mp3' },
];

export function FocusSounds() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSound, setCurrentSound] = useState(SOUNDS[0]);
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.loop = true;
        audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentSound]);

    const handleSelectSound = (sound: typeof SOUNDS[0]) => {
        if (currentSound.id === sound.id) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentSound(sound);
            setIsPlaying(true);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Hidden Audio Element */}
            <audio ref={audioRef} src={currentSound.url} />

            <div className="grid grid-cols-5 gap-2">
                {SOUNDS.map(sound => (
                    <button
                        key={sound.id}
                        onClick={() => handleSelectSound(sound)}
                        className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs gap-1",
                            currentSound.id === sound.id && isPlaying
                                ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                                : "bg-card hover:bg-muted border-border"
                        )}
                    >
                        <span className="text-xl">{sound.icon}</span>
                        <span className="font-medium">{sound.name}</span>
                        {currentSound.id === sound.id && isPlaying && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse my-1"></div>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4 bg-muted/20 p-3 rounded-lg border border-border">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => setIsPlaying(!isPlaying)}
                >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>

                <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{currentSound.name} Playing</span>
                        <span>{Math.round(volume * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                        <Slider
                            value={[volume * 100]}
                            max={100}
                            step={1}
                            onValueChange={(val) => setVolume(val[0] / 100)}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
