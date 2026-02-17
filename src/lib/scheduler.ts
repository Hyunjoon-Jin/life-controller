
import { Task, CalendarEvent } from "@/types";
import { addMinutes, setHours, setMinutes, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";

export interface ScheduleResult {
    taskId: string;
    startDate: Date;
    endDate: Date;
}

export function autoScheduleTasks(
    tasks: Task[],
    existingEvents: CalendarEvent[],
    workStartHour: number = 9,
    workEndHour: number = 18
): ScheduleResult[] {
    // 1. Filter tasks needing scheduling
    // Must have estimatedTime, not completed, and NO existing start/end date (to avoid overwriting locked tasks)
    const pendingTasks = tasks.filter(t =>
        !t.completed &&
        t.estimatedTime &&
        (!t.startDate || !t.endDate)
    );

    // 2. Sort by Priority (High > Medium > Low)
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    pendingTasks.sort((a, b) => {
        const weightA = priorityWeight[a.priority || 'medium'];
        const weightB = priorityWeight[b.priority || 'medium'];
        if (weightA !== weightB) return weightB - weightA;
        // If same priority, maybe estimate time desc? (Fit big rocks first? or small first?)
        // Let's go with smaller first for better packing, or larger first for importance.
        // Let's stick to larger first to ensure big important tasks get done.
        return (b.estimatedTime || 0) - (a.estimatedTime || 0);
    });

    // 3. Define Time Slots (Today)
    const today = new Date();
    let currentSlotStart = setMinutes(setHours(today, workStartHour), 0);
    const workEndTime = setMinutes(setHours(today, workEndHour), 0);

    // Ensure we don't schedule in the past if running late in the day
    if (isBefore(currentSlotStart, today)) {
        // If it's already past 9 AM, start from next 30 min block (or now)
        // usage: round up to next 30 mins
        const now = new Date();
        const remainder = 30 - (now.getMinutes() % 30);
        currentSlotStart = addMinutes(now, remainder);
    }

    // If work day is over, maybe return empty? Or schedule for tomorrow?
    // For MVP, let's just handle "Today". 
    if (isAfter(currentSlotStart, workEndTime)) {
        return [];
    }

    const scheduledUpdates: ScheduleResult[] = [];
    const busyRanges = existingEvents
        .filter(e => {
            // Filter events for today (or crossing today)
            const todayStart = startOfDay(today);
            const todayEnd = endOfDay(today);
            return isBefore(e.start, todayEnd) && isAfter(e.end, todayStart);
        })
        .map(e => ({ start: new Date(e.start), end: new Date(e.end) }))
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    // 4. Fill Gaps

    // Helper to check if a range overlaps with any busy range
    const isBusy = (start: Date, end: Date) => {
        for (const range of busyRanges) {
            // Overlap logic: (StartA < EndB) and (EndA > StartB)
            if (isBefore(start, range.end) && isAfter(end, range.start)) {
                return true;
            }
        }
        return false;
    };

    // Iterate through tasks
    for (const task of pendingTasks) {
        if (!task.estimatedTime) continue;
        const duration = task.estimatedTime;

        // Find a slot for this task
        // We scan from currentSlotStart to workEndTime
        let attemptStart = new Date(currentSlotStart);
        let placed = false;

        // Simple linear scan with 15 min steps
        while (isBefore(attemptStart, workEndTime)) {
            const attemptEnd = addMinutes(attemptStart, duration);

            if (isAfter(attemptEnd, workEndTime)) break; // Wont fit in work day

            if (!isBusy(attemptStart, attemptEnd)) {
                // Found a slot!
                scheduledUpdates.push({
                    taskId: task.id,
                    startDate: attemptStart,
                    endDate: attemptEnd
                });

                // Mark this time as busy for subsequent tasks
                busyRanges.push({ start: attemptStart, end: attemptEnd });
                busyRanges.sort((a, b) => a.start.getTime() - b.start.getTime()); // Keep sorted

                placed = true;
                break;
            }

            // Advance by 15 mins
            attemptStart = addMinutes(attemptStart, 15);
        }
    }

    return scheduledUpdates;
}
