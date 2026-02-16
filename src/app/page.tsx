'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarView } from '@/components/calendar/CalendarView';
import GoalTree from '@/components/goals/GoalTree';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { UpcomingTasks } from '@/components/tasks/UpcomingTasks'; // Import
import { UserMenu } from '@/components/auth/UserMenu';
import { JournalView } from '@/components/journal/JournalView';
import { IdeaBoard } from '@/components/ideas/IdeaBoard';
import { PeopleManager } from '@/components/people/PeopleManager';
import { ScrapManager } from '@/components/scraps/ScrapManager';
import { Pomodoro } from '@/components/tools/Pomodoro';
import { DataExportButton } from '@/components/tools/DataExportButton';
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
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'; // Added
import { MobileCategoryTabs } from '@/components/layout/MobileCategoryTabs'; // Added
import { CloudSyncStatus } from '@/components/layout/CloudSyncStatus'; // Added
import { CATEGORIES, SUB_MENUS, CategoryType, WORK_NAV_ITEMS, TabType } from '@/constants/menu';
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
import { HelpCircle, Calendar, Sparkles, Briefcase, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { cn } from '@/lib/utils';

import { LandingPage } from '@/components/landing/LandingPage';
import { useAuth } from '@/components/auth/SessionProvider';
import { useBirthdayNotifications } from '@/hooks/useBirthdayNotifications';
import { AdBanner } from '@/components/ads/AdBanner';

export default function Home() {
  const { user, isLoading } = useAuth(); // Auth Check
  useBirthdayNotifications(); // Initialize Birthday Check
  const [appMode, setAppMode] = useState<'life' | 'work'>('life');
  const [mainMode, setMainMode] = useState<'home' | 'schedule' | 'work'>('home');
  const [activeCategory, setActiveCategory] = useState<'basic' | 'health' | 'growth' | 'record' | 'finance'>('basic');
  const [activeTab, setActiveTab] = useState<'calendar' | 'tasks' | 'projects' | 'people' | 'goals' | 'language' | 'reading' | 'exercise' | 'diet' | 'inbody' | 'hobby' | 'learning' | 'report' | 'ideas' | 'journal' | 'scraps' | 'widgets' | 'ledger' | 'assets' | 'fund' | 'realestate' | 'investment' | 'certificate' | 'portfolio' | 'work_time' | 'templates' | 'full_schedule'>('calendar');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTodayDate(new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }));
  }, []);

  // When switching directly to 'Work Mode' via toggle, ensure we are in a compatible view
  // Effect 1: Handle entering Work Mode
  useEffect(() => {
    if (appMode === 'work') {
      // Only reset to Dashboard when AppMode changes to Work
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setActiveCategory('basic');
      setActiveTab('calendar');
    }
  }, [appMode]); // Critical: Only run when appMode changes

  // Effect 2: Handle Life Mode safety check
  useEffect(() => {
    if (appMode === 'life') {
      // If switching to Life Mode while in Work Management, go back to Home
      if (mainMode === 'work') {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setMainMode('home');
      }
    }
  }, [appMode, mainMode]);

  const handleQuickLink = (mode: 'home' | 'schedule' | 'work', category: CategoryType, tab: string) => {
    setMainMode(mode);
    if (mode === 'schedule') {
      setActiveCategory(category);
      setActiveTab(tab as TabType);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white gap-6">
        <div className="relative animate-pulse">
          <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl scale-150" />
          <div className="relative w-16 h-16 bg-primary rounded-2xl shadow-lg flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-extrabold text-xl tracking-tighter text-slate-900">
            LIFE <span className="text-primary">Controller</span>
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated -> Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // 3. Authenticated -> Dashboard
  return (
    <main className={cn(
      "min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col transition-all duration-500 pb-24 md:pb-6", // Added pb-24 for mobile nav
      "bg-gray-50 text-slate-900"
    )}>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        appMode={appMode}
        setAppMode={setAppMode}
        mainMode={mainMode}
        setMainMode={setMainMode}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
      />
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

      {/* Mobile Category Tabs - Hidden: sub-tabs now handled by bottom nav popup */}
      {/* {mainMode === 'schedule' && (
        <MobileCategoryTabs
          activeCategory={activeCategory}
          activeTab={activeTab}
          onSelect={(t) => setActiveTab(t as TabType)}
        />
      )} */}

      {/* Desktop Header (Hidden on Mobile) */}
      <header className={cn(
        "hidden md:flex mb-4 justify-between items-center w-full max-w-7xl mx-auto px-6 py-4 rounded-3xl transition-all duration-500 shadow-md border-2",
        appMode === 'work'
          ? "bg-[#E1BEE7] border-[#CE93D8]"
          : "bg-[#B2DFDB] border-[#80CBC4]"
      )}>
        <div className="flex items-center gap-4">
          <button onClick={() => {
            setAppMode('life');
            setMainMode('home');
          }} className="hover:opacity-80 transition-opacity cursor-pointer">
            <Logo variant="full" className="scale-100" />
          </button>


          {/* Mode Toggle Switch */}
          <div className="flex items-center gap-2">
            <HoverBorderGradient
              as="button"
              containerClassName="rounded-full"
              className={cn(
                "px-4 py-2 text-sm font-bold flex items-center gap-2",
                appMode === 'life' ? "bg-[#009688] text-white" : "bg-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setAppMode('life')}
              duration={1.5}
            >
              <Sparkles className="w-4 h-4" /> 일상 모드
            </HoverBorderGradient>

            <HoverBorderGradient
              as="button"
              containerClassName="rounded-full"
              className={cn(
                "px-4 py-2 text-sm font-bold flex items-center gap-2",
                appMode === 'work' ? "bg-[#9C27B0] text-white" : "bg-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => {
                setAppMode('work');
                setMainMode('work');
              }}
              duration={1.5}
            >
              <Briefcase className="w-4 h-4" /> 업무 모드
            </HoverBorderGradient>
          </div>

          <div className={cn(
            "flex items-center text-sm font-bold border-l-2 pl-4 h-5 leading-none",
            appMode === 'work' ? "text-[#4A148C] border-[#CE93D8]" : "text-[#004D40] border-[#80CBC4]"
          )}>
            {todayDate}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMainMode('home')} className={cn(
            "rounded-full font-bold transition-all",
            appMode === 'work'
              ? "text-[#4A148C] hover:bg-[#CE93D8]/30"
              : "text-[#004D40] hover:bg-[#80CBC4]/30",
            mainMode === 'home' && (appMode === 'work' ? "bg-[#CE93D8]/40" : "bg-[#80CBC4]/40")
          )}>
            <HomeIcon className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsGuideOpen(true)} className={cn(
            "rounded-full transition-all",
            appMode === 'work' ? "text-[#4A148C]/70 hover:bg-[#CE93D8]/30" : "text-[#004D40]/70 hover:bg-[#80CBC4]/30"
          )}>
            <HelpCircle className="w-5 h-5" />
          </Button>
          <CloudSyncStatus />
          <DataExportButton />
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {/* Global Navigation Bar (Hidden on Mobile) */}
      <div className="hidden md:flex w-full max-w-7xl mx-auto mb-6 items-center justify-between gap-4 z-50 relative px-6">
        <div className="flex-1 min-w-0">
          <MegaMenuNav
            activeCategory={activeCategory}
            activeTab={activeTab}
            appMode={appMode} // Pass the mode
            onSelect={(category, tab) => {
              setMainMode('schedule');
              setActiveCategory(category);
              setActiveTab(tab as TabType);
            }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mainMode === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <HomeDashboard onNavigate={setMainMode} onQuickLink={handleQuickLink} />
          </motion.div>
        ) : mainMode === 'schedule' ? (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-8 min-h-0"
          >
            {/* Left Column: Main Tabbed View */}
            <div className={cn(
              "flex flex-col min-h-[600px] md:min-h-[800px]",
              activeTab === 'calendar'
                ? "md:col-span-12 lg:col-span-9 xl:col-span-9" // Dashboard: 9 cols with sidebar
                : "md:col-span-12 lg:col-span-12 xl:col-span-12" // Others: Full width
            )}>

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
                    <LearningPlanner onNavigate={(tab) => handleQuickLink('schedule', 'basic', tab)} />
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

            {/* Right Column: Tools & Widgets (Desktop Only) - Show ONLY on Dashboard */}
            <div className="hidden lg:flex lg:col-span-3 xl:col-span-3 space-y-4 md:space-y-6 flex-col h-full overflow-y-auto custom-scrollbar pb-6">
              <UpcomingTasks />
              <Pomodoro />
              <HabitTracker />
              <AdBanner dataAdSlot="1234567890" dataAdFormat="rectangle" className="w-full" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="work"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <WorkLayout viewMode="schedule" />
          </motion.div>
        )}
      </AnimatePresence>

      <GuideModal
        isOpen={isGuideOpen}
        onOpenChange={setIsGuideOpen}
        initialCategory={activeCategory || 'basic'}
        onNavigate={(cat, tab) => handleQuickLink('schedule', cat, tab)}
      />
    </main>
  );
}
