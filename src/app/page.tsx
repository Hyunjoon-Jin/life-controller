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

import { CertificateManager } from '@/components/growth/CertificateManager';
import { PortfolioBoard } from '@/components/growth/PortfolioBoard';
import { LedgerView } from '@/components/finance/LedgerView';
import { AssetDashboard } from '@/components/finance/AssetDashboard';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { HelpCircle, Calendar, Lightbulb, Users as UsersIcon, Link as LinkIcon, Target, Book, CheckSquare, ListTodo, Sparkles, Trophy, NotebookPen, UsersRound, Bookmark, Scale, Award, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

export default function Home() {
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
    <main className="min-h-screen p-6 bg-background text-foreground flex flex-col">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end flex-shrink-0 gap-4">
        <div>
          <div className="flex items-baseline gap-4 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              LIFE Controller
            </h1>
            {/* Top Level Navigation */}
            {/* Top Level Navigation - Pill Style */}
            <div className="flex gap-2">
              <button
                onClick={() => setMainMode('home')}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-bold transition-all duration-300",
                  mainMode === 'home'
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                )}
              >
                홈
              </button>
              <button
                onClick={() => setMainMode('schedule')}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-bold transition-all duration-300",
                  mainMode === 'schedule'
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                )}
              >
                일상 관리
              </button>
              <button
                onClick={() => setMainMode('work')}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-bold transition-all duration-300",
                  mainMode === 'work'
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                )}
              >
                업무 관리
              </button>
            </div>
          </div>
          <p className="text-muted-foreground">
            {mainMode === 'home' && '오늘 하루를 한눈에 확인하세요.'}
            {mainMode === 'schedule' && '시간을 지배하고, 목표를 달성하세요.'}
            {mainMode === 'work' && '프로젝트의 모든 것을 한눈에 관리하세요.'}
          </p>
        </div>
        <div className="flex items-center gap-4 self-end md:self-auto">
          <WeatherWidget />
          <div className="text-sm text-muted-foreground hidden sm:block border-l border-gray-700 pl-4 h-5">
            {todayDate}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsGuideOpen(true)} className="text-muted-foreground">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {
        mainMode === 'home' ? (
          <HomeDashboard onNavigate={setMainMode} onQuickLink={handleQuickLink} />
        ) : mainMode === 'schedule' ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
            {/* Left Column: Main Tabbed View (8 cols - widened) */}
            <div className="md:col-span-12 lg:col-span-8 flex flex-col min-h-[800px]">
              {/* Navigation Tabs - Floating Card Style */}
              <div className="flex flex-col gap-4 mb-6">

                {/* Level 1: Categories */}
                {/* Level 1: Categories - Transparent Pills */}
                <div className="flex gap-1 p-1 w-fit">
                  <button
                    onClick={() => setActiveCategory('basic')}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold transition-all",
                      activeCategory === 'basic' ? "bg-white text-primary shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                    )}
                  >
                    기본 관리
                  </button>
                  <button
                    onClick={() => setActiveCategory('health')}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold transition-all",
                      activeCategory === 'health' ? "bg-white text-primary shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                    )}
                  >
                    건강 관리
                  </button>
                  <button
                    onClick={() => setActiveCategory('growth')}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold transition-all",
                      activeCategory === 'growth' ? "bg-white text-primary shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                    )}
                  >
                    자기 성장
                  </button>
                  <button
                    onClick={() => setActiveCategory('record')}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold transition-all",
                      activeCategory === 'record' ? "bg-white text-primary shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                    )}
                  >
                    기록 보관
                  </button>
                  <button
                    onClick={() => setActiveCategory('finance')}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold transition-all",
                      activeCategory === 'finance' ? "bg-white text-primary shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                    )}
                  >
                    자산 관리
                  </button>
                </div>

                {/* Level 2: Tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                  {activeCategory === 'basic' && (
                    <>
                      <button onClick={() => setActiveTab('calendar')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'calendar' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <Calendar className="w-4 h-4" /> 일정
                      </button>
                      <button onClick={() => setActiveTab('tasks')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'tasks' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <ListTodo className="w-4 h-4" /> 작업
                      </button>
                      <button onClick={() => setActiveTab('people')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'people' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <UsersRound className="w-4 h-4" /> 인맥
                      </button>
                    </>
                  )}
                  {activeCategory === 'health' && (
                    <>
                      <button onClick={() => setActiveTab('exercise')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'exercise' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <Target className="w-4 h-4" /> 운동
                      </button>
                      <button onClick={() => setActiveTab('diet')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'diet' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <CheckSquare className="w-4 h-4" /> 식단
                      </button>
                      <button onClick={() => setActiveTab('inbody')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'inbody' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <Scale className="w-4 h-4" /> InBody
                      </button>
                    </>
                  )}
                  {activeCategory === 'growth' && (
                    <>
                      <button onClick={() => setActiveTab('goals')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'goals' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <Trophy className="w-4 h-4" /> 목표
                      </button>
                      <button onClick={() => setActiveTab('language')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'language' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <Book className="w-4 h-4" /> 어학
                      </button>
                      <button onClick={() => setActiveTab('reading')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'reading' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <Book className="w-4 h-4" /> 독서
                      </button>
                      <button onClick={() => setActiveTab('hobby')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'hobby' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <Sparkles className="w-4 h-4" /> 취미
                      </button>
                      <button onClick={() => setActiveTab('certificate')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'certificate' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <Award className="w-4 h-4" /> 자격증
                      </button>
                      <button onClick={() => setActiveTab('portfolio')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'portfolio' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <Briefcase className="w-4 h-4" /> 포트폴리오
                      </button>
                    </>
                  )}
                  {activeCategory === 'record' && (
                    <>
                      <button onClick={() => setActiveTab('journal')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'journal' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <NotebookPen className="w-4 h-4" /> 일기장
                      </button>
                      <button onClick={() => setActiveTab('ideas')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'ideas' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <Lightbulb className="w-4 h-4" /> 아이디어
                      </button>
                      <button onClick={() => setActiveTab('scraps')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'scraps' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <Bookmark className="w-4 h-4" /> 스크랩
                      </button>
                    </>
                  )}
                  {activeCategory === 'finance' && (
                    <>
                      <button onClick={() => setActiveTab('ledger')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'ledger' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <CheckSquare className="w-4 h-4" /> 가계부
                      </button>
                      <button onClick={() => setActiveTab('assets')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", activeTab === 'assets' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}>
                        <Scale className="w-4 h-4" /> 자산 현황
                      </button>
                    </>
                  )}
                  {/* Mobile Only: Widgets Tab */}
                  <button
                    onClick={() => setActiveTab('widgets')}
                    className={cn(
                      "flex md:hidden items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                      activeTab === 'widgets' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50"
                    )}
                  >
                    <Calendar className="w-4 h-4" /> 도구
                  </button>
                </div>
              </div>

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
