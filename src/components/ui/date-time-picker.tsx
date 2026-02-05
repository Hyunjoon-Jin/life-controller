"use client";

import * as React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
    date: Date;
    setDate: (date: Date) => void;
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    // Time state derived from date
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "오후" : "오전";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            newDate.setHours(hours);
            newDate.setMinutes(minutes);
            setDate(newDate);
        }
    };

    const handleTimeChange = (type: "ampm" | "hour" | "minute", value: string | number) => {
        const newDate = new Date(date);
        if (type === "ampm") {
            if (value === "오전" && hours >= 12) {
                newDate.setHours(hours - 12);
            } else if (value === "오후" && hours < 12) {
                newDate.setHours(hours + 12);
            }
        } else if (type === "hour") {
            const val = value as number;
            if (ampm === "오전") {
                newDate.setHours(val === 12 ? 0 : val);
            } else {
                newDate.setHours(val === 12 ? 12 : val + 12);
            }
        } else if (type === "minute") {
            newDate.setMinutes(value as number);
        }
        setDate(newDate);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                        format(date, "PPP p", { locale: ko })
                    ) : (
                        <span>날짜를 선택하세요</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x">
                    <div className="p-3">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            initialFocus
                            locale={ko}
                        />
                    </div>

                    <div className="p-3 flex flex-col gap-3 min-w-[200px]">
                        <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground mb-1">
                            <Clock className="w-4 h-4" /> 시간 설정
                        </div>
                        <div className="flex h-[280px] divide-x border rounded-md overflow-hidden bg-white dark:bg-slate-950">
                            {/* AM/PM */}
                            <div className="flex flex-col w-16 overflow-y-auto no-scrollbar">
                                {["오전", "오후"].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => handleTimeChange("ampm", item)}
                                        className={cn(
                                            "flex items-center justify-center h-10 shrink-0 text-sm hover:bg-slate-100 transition-colors",
                                            ampm === item && "bg-blue-50 text-blue-600 font-bold"
                                        )}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>

                            {/* Hours */}
                            <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar text-center border-l border-r">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                    <button
                                        key={h}
                                        onClick={() => handleTimeChange("hour", h)}
                                        className={cn(
                                            "flex items-center justify-center h-10 shrink-0 text-gray-600 text-sm hover:bg-slate-100 transition-colors",
                                            displayHours === h && "bg-blue-50 text-blue-600 font-bold"
                                        )}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>

                            {/* Minutes */}
                            <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar text-center">
                                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => handleTimeChange("minute", m)}
                                        className={cn(
                                            "flex items-center justify-center h-10 shrink-0 text-gray-600 text-sm hover:bg-slate-100 transition-colors",
                                            minutes === m && "bg-blue-50 text-blue-600 font-bold"
                                        )}
                                    >
                                        {m.toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Exact Minute Wrapper - if 5 min step above, we can add this, but let's replace above with full 0-59 list */}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
