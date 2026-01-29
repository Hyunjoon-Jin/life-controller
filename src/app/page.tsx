'use client';

import { useState, useEffect } from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { GoalTree } from '@/components/goals/GoalTree';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { UpcomingTasks } from '@/components/tasks/UpcomingTasks'; // Import
import { UserMenu } from '@/components/auth/UserMenu';
import { JournalView } from '@/components/journal/JournalView';
import { IdeaBoard } from '@/components/ideas/IdeaBoard';
import { PeopleManager } from '@/components/people/PeopleManager';
import { ScrapManager } from '@/components/scraps/ScrapManager';
import { Pomodoro } from '@/components/tools/Pomodoro';
import { GuideModal } from '@/components/guide/GuideModal';
import { WorkLayout } from '@/components/project/WorkLayout';
import { HomeDashboard } from '@/components/home/HomeDashboard';
import { LanguageLog } from '@/components/growth/LanguageLog';
import { ReadingLog } from '@/components/growth/ReadingLog';
import { ExerciseLog } from '@/components/growth/ExerciseLog';
import { DietLog } from '@/components/growth/DietLog';
import { InBodyLog } from '@/components/growth/InBodyLog';
import { HobbyLog } from '@/components/growth/HobbyLog';
import { MegaMenuNav } from '@/components/layout/MegaMenu';

import { CertificateManager } from '@/components/growth/CertificateManager';
import { PortfolioBoard } from '@/components/growth/PortfolioBoard';
import { LedgerView } from '@/components/finance/LedgerView';
import { AssetDashboard } from '@/components/finance/AssetDashboard';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { HelpCircle, Calendar, Lightbulb, Users as UsersIcon, Link as LinkIcon, Target, Book, CheckSquare, ListTodo, Sparkles, Trophy, NotebookPen, UsersRound, Bookmark, Scale, Award, Briefcase, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

import { useBirthdayNotifications } from '@/hooks/useBirthdayNotifications';

export default function Home() {
  useBirthdayNotifications(); // Initialize Birthday Check
  const [mainMode, setMainMode] = useState<'home' | 'schedule' | 'work'>('home');
  const [activeCategory, setActiveCategory] = useState<'basic' | 'health' | 'growth' | 'record' | 'finance'>('basic');
  const [activeTab, setActiveTab] = useState<'calendar' | 'tasks' | 'people' | 'goals' | 'language' | 'reading' | 'exercise' | 'diet' | 'inbody' | 'hobby' | 'ideas' | 'journal' | 'scraps' | 'widgets' | 'ledger' | 'assets' | 'certificate' | 'portfolio'>('calendar');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    setTodayDate(new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }));
  }, []);

  const handleQuickLink = (mode: 'home' | 'schedule' | 'work', category: 'basic' | 'growth' | 'record' | 'finance', tab: string) => {
    setMainMode(mode);
    if (mode === 'schedule') {
      setActiveCategory(category);
      setActiveTab(tab as any);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-6 bg-background text-foreground flex flex-col">
      <header className="mb-2 flex justify-between items-center w-full max-w-4xl mx-auto pt-2">
        <button onClick={() => setMainMode('home')} className="hover:opacity-80 transition-opacity">
          <Logo variant="icon" className="scale-110" />
        </button>
        <div className="flex items-center gap-2">
          {/* Main Mode Toggles (If needed later, but simplified for now to keep home clean) */}
          <Button variant="ghost" size="icon" onClick={() => setMainMode('home')} className={cn("rounded-full", mainMode === 'home' && "bg-gray-100 text-black")}>
            <HomeIcon className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsGuideOpen(true)} className="text-muted-foreground rounded-full">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {/* Global Navigation Bar */}
      <div className="w-full max-w-4xl mx-auto mb-6 flex items-center justify-between gap-4 z-50 relative">
        <div className="flex-1 min-w-0">
          <MegaMenuNav
            activeCategory={activeCategory}
            activeTab={activeTab}
            onSelect={(category, tab) => {
              setMainMode('schedule');
              setActiveCategory(category);
              setActiveTab(tab as any);
            }}
          />
        </div>
        <Button
          onClick={() => setMainMode('work')}
          className={cn(
            "rounded-full px-5 font-bold shadow-sm transition-all shrink-0",
            mainMode === 'work' ? "bg-black text-white hover:bg-gray-800" : "bg-white text-black hover:bg-gray-100 border border-gray-200"
          )}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          업무 관리
        </Button>
      </div>

      {
        mainMode === 'home' ? (
          <HomeDashboard onNavigate={setMainMode} onQuickLink={handleQuickLink} />
        ) : mainMode === 'schedule' ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
            {/* Left Column: Main Tabbed View (8 cols - widened) */}
            <div className="md:col-span-12 lg:col-span-8 flex flex-col min-h-[800px]">

              {/* Content Area */}
              <div className="flex-1 relative">
                {activeTab === 'calendar' && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <CalendarView />
                  </div>
                )}
                {activeTab === 'tasks' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <TaskBoard />
                  </div>
                )}
                {activeTab === 'people' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <PeopleManager />
                  </div>
                )}

                {/* Growth Tabs */}
                {activeTab === 'goals' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <GoalTree />
                  </div>
                )}
                {activeTab === 'language' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <LanguageLog />
                  </div>
                )}
                {activeTab === 'reading' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <ReadingLog />
                  </div>
                )}
                {activeTab === 'exercise' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <ExerciseLog />
                  </div>
                )}
                {activeTab === 'diet' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <DietLog />
                  </div>
                )}
                {activeTab === 'inbody' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <InBodyLog />
                  </div>
                )}
                {activeTab === 'hobby' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <HobbyLog />
                  </div>
                )}
                {activeTab === 'certificate' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <CertificateManager />
                  </div>
                )}
                {activeTab === 'portfolio' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <PortfolioBoard />
                  </div>
                )}

                {/* Record Tabs */}
                {activeTab === 'journal' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <JournalView />
                  </div>
                )}
                {activeTab === 'ideas' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <IdeaBoard />
                  </div>
                )}
                {activeTab === 'scraps' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <ScrapManager />
                  </div>
                )}

                {/* Finance Tabs */}
                {activeTab === 'ledger' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <LedgerView />
                  </div>
                )}
                {activeTab === 'assets' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <AssetDashboard />
                  </div>
                )}

                {/* Mobile Only: Widgets Tab */}
                {activeTab === 'widgets' && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 pb-20">
                    <Pomodoro />
                    <UpcomingTasks />
                    <HabitTracker />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Tools & Widgets (Desktop Only) */}
            <div className="hidden md:flex md:col-span-12 lg:col-span-4 space-y-6 flex-col h-full overflow-y-auto custom-scrollbar pb-6">
              <UpcomingTasks />
              <Pomodoro />
              <HabitTracker />
            </div>
          </div>
        ) : (
          <WorkLayout />
        )
      }

      <GuideModal isOpen={isGuideOpen} onOpenChange={setIsGuideOpen} />
    </main >
  );
}

