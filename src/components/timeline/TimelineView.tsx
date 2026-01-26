'use client';

import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Placeholder import, will fix if Button doesn't exist
import { Plus } from 'lucide-react';

export function TimelineView() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="flex flex-col h-[600px] border rounded-lg bg-card text-card-foreground overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-muted/40">
                <h2 className="text-xl font-bold">Timeline</h2>
                <span className="text-muted-foreground">{format(selectedDate, 'MMM d, yyyy')}</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {hours.map((hour) => (
                    <div key={hour} className="group flex border-b min-h-[60px] relative hover:bg-muted/20 transition-colors">
                        {/* Time Label */}
                        <div className="w-16 p-2 text-xs font-medium text-muted-foreground text-right border-r bg-background/50 sticky left-0">
                            {format(new Date().setHours(hour, 0, 0, 0), 'h aa')}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-1 relative">
                            {/* Add Button on Hover */}
                            <button className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 transition-opacity">
                                <div className="bg-primary/10 text-primary rounded-full p-1">
                                    <Plus className="w-4 h-4" />
                                </div>
                            </button>

                            {/* Grid Lines for 30m? */}
                            <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-muted/20 pointer-events-none" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
