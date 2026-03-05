import { TodayTimeline } from './TodayTimeline';
import { MainProjects } from './MainProjects';
import { TodayWorkTime } from './TodayWorkTime';
import { BriefingCard } from './BriefingCard';
import { TodayTasksCard } from './TodayTasksCard';
import { TodayCommCard } from './TodayCommCard';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface WorkDashboardProps {
    onNavigate?: (tab: string) => void;
    onOpenProject?: (id: string) => void;
}

export function WorkDashboard({ onNavigate, onOpenProject }: WorkDashboardProps) {
    return (
        <div className="h-full flex flex-col gap-6 p-8 overflow-y-auto custom-scrollbar relative">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header / Briefing */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
            >
                <div className="flex items-center gap-3 mb-5 px-1">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(99,102,241,0.4)]">
                        <Activity className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground leading-none">업무 대시보드</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">오늘의 업무 현황</p>
                    </div>
                </div>
                <BriefingCard />
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 relative z-10">

                {/* ── Left: Today's Timeline (4 cols, full height) ── */}
                <motion.div
                    className="lg:col-span-4 flex flex-col min-h-[500px]"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                    <TodayTimeline />
                </motion.div>

                {/* ── Right: 2×2 grid (8 cols) ── */}
                <motion.div
                    className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 grid-rows-[auto_1fr] gap-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Row 1: 오늘 할 일 + 오늘 소통 */}
                    <div className="min-h-[220px]">
                        <TodayTasksCard />
                    </div>
                    <div className="min-h-[220px]">
                        <TodayCommCard />
                    </div>

                    {/* Row 2: 주요 프로젝트 (full width) */}
                    <div className="md:col-span-2 min-h-[200px]">
                        <MainProjects onOpenProject={onOpenProject} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
