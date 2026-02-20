import { useData } from '@/context/DataProvider';
import { TodayTimeline } from './TodayTimeline';
import { MainProjects } from './MainProjects';
import { TodayWorkTime } from './TodayWorkTime';
import { Briefcase, Clock, Calendar } from 'lucide-react';
import { BriefingCard } from './BriefingCard';
import { motion } from 'framer-motion';

interface WorkDashboardProps {
    onNavigate?: (tab: string) => void;
    onOpenProject?: (id: string) => void;
}

export function WorkDashboard({ onNavigate, onOpenProject }: WorkDashboardProps) {
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
                    className="lg:col-span-4 flex flex-col"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <TodayTimeline />
                </motion.div>

                {/* Right: Projects & WorkTime (8 cols) */}
                <motion.div
                    className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <MainProjects onOpenProject={onOpenProject} />
                    <TodayWorkTime onNavigateToWorkTime={() => onNavigate?.('work_time')} />
                </motion.div>
            </div>
        </div>
    );
}
