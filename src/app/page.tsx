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
import { WorkTimeSection } from '@/components/work/sections/WorkTimeSection';
import { WorkTemplateSection } from '@/components/project/WorkTemplateSection';
import { WorkPeopleSection } from '@/components/work/sections/WorkPeopleSection';
import { HomeDashboard } from '@/components/home/HomeDashboard';
import { LanguageLog } from '@/components/growth/LanguageLog';
import { ReadingLog } from '@/components/growth/ReadingLog';
import { ExerciseLog } from '@/components/growth/ExerciseLog';
import { DietLog } from '@/components/growth/DietLog';
import { InBodyLog } from '@/components/growth/InBodyLog';
import { HobbyLog } from '@/components/growth/HobbyLog';
import { MegaMenuNav } from '@/components/layout/MegaMenu';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { CloudSyncStatus } from '@/components/layout/CloudSyncStatus'; // Added
import { CATEGORIES, SUB_MENUS, CategoryType, WORK_NAV_ITEMS } from '@/constants/menu';
import { TabHeader } from '@/components/layout/TabHeader';

import { CertificateManager } from '@/components/growth/CertificateManager';
import { PortfolioBoard } from '@/components/growth/PortfolioBoard';
import { LedgerView } from '@/components/finance/LedgerView';
import { AssetDashboard } from '@/components/finance/AssetDashboard';
import { FundManagement } from '@/components/finance/FundManagement';
import { RealEstateTab } from '@/components/finance/RealEstateTab';
import { InvestmentTab } from '@/components/finance/InvestmentTab';
import { LearningPlanner } from '@/components/growth/LearningPlanner';
import { ReportGenerator } from '@/components/report/ReportGenerator';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { HelpCircle, Calendar, Lightbulb, Users as UsersIcon, Link as LinkIcon, Target, Book, CheckSquare, ListTodo, Sparkles, Trophy, NotebookPen, UsersRound, Bookmark, Scale, Award, Briefcase, Home as HomeIcon, Clock, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

import { useBirthdayNotifications } from '@/hooks/useBirthdayNotifications';

export default function Home() {
  useBirthdayNotifications(); // Initialize Birthday Check
  const [appMode, setAppMode] = useState<'life' | 'work'>('life');
  const [mainMode, setMainMode] = useState<'home' | 'schedule' | 'work'>('home');
  const [activeCategory, setActiveCategory] = useState<'basic' | 'health' | 'growth' | 'record' | 'finance'>('basic');
  const [activeTab, setActiveTab] = useState<'calendar' | 'tasks' | 'projects' | 'people' | 'goals' | 'language' | 'reading' | 'exercise' | 'diet' | 'inbody' | 'hobby' | 'learning' | 'report' | 'ideas' | 'journal' | 'scraps' | 'widgets' | 'ledger' | 'assets' | 'fund' | 'realestate' | 'investment' | 'certificate' | 'portfolio' | 'work_time' | 'templates' | 'full_schedule'>('calendar');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    setTodayDate(new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }));
  }, []);

  // When switching directly to 'Work Mode' via toggle, ensure we are in a compatible view
  useEffect(() => {
    if (appMode === 'work') {
      // ALWAYS switch to 'calendar' (Project Schedule/Dashboard) when entering Work Mode
      setActiveCategory('basic');
      setActiveTab('calendar');

    } else if (appMode === 'life') {
      // If switching to Life Mode while in Work Management, go back to Home
      if (mainMode === 'work') {
        setMainMode('home');
      }
    }
  }, [appMode, activeCategory, mainMode]);

  const handleQuickLink = (mode: 'home' | 'schedule' | 'work', category: CategoryType, tab: string) => {
    setMainMode(mode);
    if (mode === 'schedule') {
      setActiveCategory(category);
      setActiveTab(tab as any);
    }
  };

  return (
    <main className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 bg-background text-foreground flex flex-col">
      {/* Mobile Header (Hidden on Desktop) */}
      <MobileHeader
        appMode={appMode}
        setAppMode={setAppMode}
        mainMode={mainMode}
        setMainMode={setMainMode}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Desktop Header (Hidden on Mobile) */}
      <header className="hidden md:flex mb-2 justify-between items-center w-full max-w-7xl mx-auto pt-2">
        <div className="flex items-center gap-4">
          <button onClick={() => setMainMode('home')} className="hover:opacity-80 transition-opacity cursor-pointer">
            <Logo variant="full" className="scale-100" />
          </button>

          {/* Mode Toggle Switch */}
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full flex items-center">
            <button
              onClick={() => setAppMode('life')}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                appMode === 'life'
                  ? "bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
              )}
            >
              <Sparkles className="w-3 h-3 text-yellow-500" /> 일상 모드
            </button>
            <button
              onClick={() => setAppMode('work')}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                appMode === 'work'
                  ? "bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
              )}
            >
              <Briefcase className="w-3 h-3 text-blue-500" /> 업무 모드
            </button>
          </div>

          <div className="flex items-center text-sm font-medium text-muted-foreground border-l pl-4 h-4 leading-none">
            {todayDate}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMainMode('home')} className={cn("rounded-full", mainMode === 'home' && "bg-gray-100 text-black")}>
            <HomeIcon className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsGuideOpen(true)} className="text-muted-foreground rounded-full">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <CloudSyncStatus />
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {/* Global Navigation Bar (Hidden on Mobile) */}
      <div className="hidden md:flex w-full max-w-7xl mx-auto mb-6 items-center justify-between gap-4 z-50 relative">
        <div className="flex-1 min-w-0">
          <MegaMenuNav
            activeCategory={activeCategory}
            activeTab={activeTab}
            appMode={appMode} // Pass the mode
            onSelect={(category, tab) => {
              setMainMode('schedule');
              setActiveCategory(category);
              setActiveTab(tab as any);
            }}
          />
        </div>
      </div>

      {
        mainMode === 'home' ? (
          <HomeDashboard onNavigate={setMainMode} onQuickLink={handleQuickLink} />
        ) : mainMode === 'schedule' ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-8 min-h-0">
            {/* Left Column: Main Tabbed View (8 cols - widened) */}
            <div className="md:col-span-12 lg:col-span-9 xl:col-span-9 flex flex-col min-h-[600px] md:min-h-[800px]">

              {/* Content Area */}
              <div className="flex-1 relative">
                {/* Dynamic Tab Header */}
                {(() => {
                  if (appMode === 'work') {
                    const item = WORK_NAV_ITEMS.find(i => i.id === activeTab);
                    if (item) {
                      return (
                        <TabHeader
                          title={item.label}
                          description="업무 효율을 높이는 공간"
                          icon={item.icon}
                        />
                      );
                    }
                  }

                  const currentCategoryItems = SUB_MENUS[activeCategory];
                  const currentItem = currentCategoryItems?.find(item => item.id === activeTab);

                  if (currentItem) {
                    return (
                      <TabHeader
                        title={currentItem.label}
                        description={currentItem.desc}
                        icon={currentItem.icon}
                      />
                    );
                  }
                  return null;
                })()}

                {activeTab === 'calendar' && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 h-full">
                    {appMode === 'work' ? <WorkLayout viewMode="schedule" /> : <CalendarView />}
                  </div>
                )}
                {activeTab === 'full_schedule' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <CalendarView />
                  </div>
                )}
                {activeTab === 'tasks' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <TaskBoard hideHeader={true} />
                  </div>
                )}
                {activeTab === 'projects' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <WorkLayout viewMode="project" />
                  </div>
                )}
                {activeTab === 'people' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    {appMode === 'work' ? <WorkPeopleSection /> : <PeopleManager />}
                  </div>
                )}
                {activeTab === 'work_time' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <WorkTimeSection />
                  </div>
                )}
                {activeTab === 'templates' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <WorkTemplateSection />
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
                {activeTab === 'learning' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <LearningPlanner onNavigate={(tab) => handleQuickLink('schedule', 'basic', tab as any)} />
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
                {activeTab === 'report' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <ReportGenerator />
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
                {activeTab === 'fund' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <FundManagement />
                  </div>
                )}
                {activeTab === 'realestate' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <RealEstateTab />
                  </div>
                )}
                {activeTab === 'investment' && (
                  <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                    <InvestmentTab />
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
            <div className="hidden lg:flex lg:col-span-3 xl:col-span-3 space-y-4 md:space-y-6 flex-col h-full overflow-y-auto custom-scrollbar pb-6">
              <UpcomingTasks />
              <Pomodoro />
              <HabitTracker />
            </div>
          </div>
        ) : (
          <WorkLayout />
        )
      }

      <GuideModal
        isOpen={isGuideOpen}
        onOpenChange={setIsGuideOpen}
        initialCategory={activeCategory || 'basic'}
        onNavigate={(cat, tab) => handleQuickLink('schedule', cat, tab)}
      />
    </main>
  );
}
