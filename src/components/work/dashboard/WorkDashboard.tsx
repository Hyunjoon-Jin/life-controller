import { TodayTimeline } from './TodayTimeline';
import { MainProjects } from './MainProjects';
import { TodayWorkTime } from './TodayWorkTime';
import { BriefingCard } from './BriefingCard';
import { motion } from 'framer-motion';
import { Terminal, Activity, Zap } from 'lucide-react';

interface WorkDashboardProps {
    onNavigate?: (tab: string) => void;
    onOpenProject?: (id: string) => void;
}

export function WorkDashboard({ onNavigate, onOpenProject }: WorkDashboardProps) {
    return (
        <div className="h-full flex flex-col gap-8 p-8 overflow-y-auto custom-scrollbar relative">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header / Briefing Area */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
            >
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(99,102,241,0.4)]">
                        <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">전략 지휘 센터</h2>
                        <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-1 flex items-center gap-2">
                            <Terminal className="w-3 h-3 text-indigo-500" /> 운영 신경 센터: 온라인
                        </p>
                    </div>
                </div>
                <BriefingCard />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 relative z-10">
                {/* Left: Today's Timeline (4 cols) */}
                <motion.div
                    className="lg:col-span-4 flex flex-col"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                    <TodayTimeline />
                </motion.div>

                {/* Right: Projects & WorkTime (8 cols) */}
                <motion.div
                    className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="flex flex-col h-full">
                        <MainProjects onOpenProject={onOpenProject} />
                    </div>
                    <div className="flex flex-col h-full">
                        <TodayWorkTime onNavigateToWorkTime={() => onNavigate?.('work_time')} />
                    </div>
                </motion.div>
            </div>

            {/* Footer Decorative Status */}
            <div className="flex items-center justify-between px-2 pt-4 border-t border-white/5 opacity-30 mt-auto">
                <div className="flex items-center gap-4">
                    <span className="text-[8px] font-bold text-white tracking-[0.2em] uppercase">시스템 상태: 정상</span>
                    <span className="text-[8px] font-bold text-white tracking-[0.2em] uppercase">암호화: AES-256</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-indigo-500" />
                    <span className="text-[8px] font-bold text-white tracking-[0.2em] uppercase">실시간 데이터 동기화 중</span>
                </div>
            </div>
        </div>
    );
}
