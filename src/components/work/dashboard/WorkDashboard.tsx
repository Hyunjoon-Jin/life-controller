'use client';

import { useData } from '@/context/DataProvider';
import { TodayTimeline } from './TodayTimeline';
import { PriorityTasks } from './PriorityTasks';
import { BriefingCard } from './BriefingCard';
import { motion } from 'framer-motion';

export function WorkDashboard() {
    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            {/* Header / Briefing Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <BriefingCard />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Left: Today's Timeline (4 cols) */}
                <motion.div
                    className="lg:col-span-4 flex flex-col gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <TodayTimeline />
                </motion.div>

                {/* Right: Priority Tasks (8 cols) */}
                <motion.div
                    className="lg:col-span-8 flex flex-col gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <PriorityTasks />
                </motion.div>
            </div>
        </div>
    );
}
