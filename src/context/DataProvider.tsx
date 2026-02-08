'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import {
    Task, Project, Goal, Habit, CalendarEvent, JournalEntry, Memo, Person, Scrap,
    LanguageEntry, Book, ExerciseSession, DietEntry, InBodyEntry, HobbyEntry,
    Transaction, Asset, Certificate, PortfolioItem, ArchiveDocument,
    UserProfile, Education, Career, BodyCompositionGoal, LanguageResource,
    Hobby, HobbyPost, Activity, RealEstateScrap, StockAnalysis, WorkLog,
    ExerciseRoutine, FinanceGoal, CustomFood, MonthlyBudget, ExerciseDefinition // Added ExerciseDefinition
} from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { differenceInMinutes, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';

interface DataContextType {
    // ... existing types
    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
    projects: Project[];
    setProjects: (projects: Project[]) => void;
    addProject: (project: Project) => void;
    updateProject: (project: Project) => void;
    deleteProject: (id: string) => void;
    archiveDocuments: ArchiveDocument[];
    setArchiveDocuments: (docs: ArchiveDocument[]) => void;
    addDocument: (doc: ArchiveDocument) => void;
    updateDocument: (doc: ArchiveDocument) => void;
    deleteDocument: (id: string) => void;
    goals: Goal[];
    setGoals: (goals: Goal[]) => void;
    habits: Habit[];
    setHabits: (habits: Habit[]) => void;
    events: CalendarEvent[];
    setEvents: (events: CalendarEvent[]) => void;

    // Helpers
    addTask: (task: Task) => void;
    updateTask: (task: Task) => void;
    deleteTask: (id: string) => void;

    addGoal: (goal: Goal) => void;
    updateGoal: (goal: Goal) => void;
    deleteGoal: (id: string) => void;

    addHabit: (habit: Habit) => void;
    updateHabit: (habit: Habit) => void;
    deleteHabit: (id: string) => void;

    addEvent: (event: CalendarEvent) => void;
    updateEvent: (event: CalendarEvent) => void;
    deleteEvent: (id: string) => void;

    journals: JournalEntry[];
    setJournals: (journals: JournalEntry[]) => void;
    addJournal: (journal: JournalEntry) => void;
    updateJournal: (journal: JournalEntry) => void;
    deleteJournal: (id: string) => void;

    memos: Memo[];
    setMemos: (memos: Memo[]) => void;
    addMemo: (memo: Memo) => void;
    updateMemo: (memo: Memo) => void;
    deleteMemo: (id: string) => void;

    people: Person[];
    setPeople: (people: Person[]) => void;
    addPerson: (person: Person) => void;
    updatePerson: (person: Person) => void;
    deletePerson: (id: string) => void;

    scraps: Scrap[];
    setScraps: (scraps: Scrap[]) => void;
    addScrap: (scrap: Scrap) => void;
    updateScrap: (scrap: Scrap) => void;
    deleteScrap: (id: string) => void;

    // Work Mode
    selectedWorkProjectId: string | null;
    setSelectedWorkProjectId: (id: string | null) => void;

    // New Logs
    languageEntries: LanguageEntry[];
    setLanguageEntries: (entries: LanguageEntry[]) => void;
    addLanguageEntry: (entry: LanguageEntry) => void;
    updateLanguageEntry: (entry: LanguageEntry) => void;
    deleteLanguageEntry: (id: string) => void;
    languageResources: LanguageResource[];
    setLanguageResources: (resources: LanguageResource[]) => void;
    addLanguageResource: (resource: LanguageResource) => void;
    updateLanguageResource: (resource: LanguageResource) => void;
    deleteLanguageResource: (id: string) => void;

    books: Book[];
    setBooks: (books: Book[]) => void;
    addBook: (book: Book) => void;
    updateBook: (book: Book) => void;
    deleteBook: (id: string) => void;

    exerciseSessions: ExerciseSession[];
    setExerciseSessions: (sessions: ExerciseSession[]) => void;
    addExerciseSession: (session: ExerciseSession) => void;
    updateExerciseSession: (session: ExerciseSession) => void;
    deleteExerciseSession: (id: string) => void;

    dietEntries: DietEntry[];
    setDietEntries: (entries: DietEntry[]) => void;
    addDietEntry: (entry: DietEntry) => void;
    updateDietEntry: (entry: DietEntry) => void;
    deleteDietEntry: (id: string) => void;

    inBodyEntries: InBodyEntry[];
    setInBodyEntries: (entries: InBodyEntry[]) => void;
    addInBodyEntry: (entry: InBodyEntry) => void;
    updateInBodyEntry: (entry: InBodyEntry) => void;
    deleteInBodyEntry: (id: string) => void;

    hobbyEntries: HobbyEntry[];
    setHobbyEntries: (entries: HobbyEntry[]) => void;
    addHobbyEntry: (entry: HobbyEntry) => void;
    updateHobbyEntry: (entry: HobbyEntry) => void;
    deleteHobbyEntry: (id: string) => void;

    // New Hobby Revamp
    hobbies: Hobby[];
    setHobbies: (hobbies: Hobby[]) => void;
    addHobby: (hobby: Hobby) => void;
    updateHobby: (hobby: Hobby) => void;
    deleteHobby: (id: string) => void;

    hobbyPosts: HobbyPost[];
    setHobbyPosts: (posts: HobbyPost[]) => void;
    addHobbyPost: (post: HobbyPost) => void;
    updateHobbyPost: (post: HobbyPost) => void;
    deleteHobbyPost: (id: string) => void;

    // Finance
    transactions: Transaction[];
    setTransactions: (transactions: Transaction[]) => void;
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (transaction: Transaction) => void;
    deleteTransaction: (id: string) => void;

    assets: Asset[];
    setAssets: (assets: Asset[]) => void;
    addAsset: (asset: Asset) => void;
    updateAsset: (asset: Asset) => void;
    deleteAsset: (id: string) => void;
    certificates: Certificate[];
    addCertificate: (cert: Certificate) => void;
    updateCertificate: (cert: Certificate) => void;
    deleteCertificate: (id: string) => void;
    portfolios: PortfolioItem[];
    addPortfolio: (item: PortfolioItem) => void;
    updatePortfolio: (item: PortfolioItem) => void;
    deletePortfolio: (id: string) => void;
    userProfile: UserProfile;
    updateUserProfile: (profile: UserProfile) => void;
    educations: Education[];
    addEducation: (edu: Education) => void;
    updateEducation: (edu: Education) => void;
    deleteEducation: (id: string) => void;
    careers: Career[];
    setCareers: (careers: Career[]) => void;
    addCareer: (career: Career) => void;
    updateCareer: (career: Career) => void;
    deleteCareer: (id: string) => void;

    // Activities (New)
    activities: Activity[];
    setActivities: (val: Activity[]) => void;
    addActivity: (act: Activity) => void;
    updateActivity: (act: Activity) => void;
    deleteActivity: (id: string) => void;

    realEstateScraps: RealEstateScrap[];
    setRealEstateScraps: (scraps: RealEstateScrap[]) => void;
    addRealEstateScrap: (scrap: RealEstateScrap) => void;
    updateRealEstateScrap: (scrap: RealEstateScrap) => void;
    deleteRealEstateScrap: (id: string) => void;

    stockAnalyses: StockAnalysis[];
    setStockAnalyses: (analyses: StockAnalysis[]) => void;
    addStockAnalysis: (analysis: StockAnalysis) => void;
    updateStockAnalysis: (analysis: StockAnalysis) => void;
    deleteStockAnalysis: (id: string) => void;

    workLogs: WorkLog[];
    setWorkLogs: (logs: WorkLog[]) => void;
    addWorkLog: (log: WorkLog) => void;
    updateWorkLog: (log: WorkLog) => void;
    deleteWorkLog: (id: string) => void;

    exerciseRoutines: ExerciseRoutine[];
    setExerciseRoutines: (routines: ExerciseRoutine[]) => void;
    addExerciseRoutine: (routine: ExerciseRoutine) => void;
    updateExerciseRoutine: (routine: ExerciseRoutine) => void;
    deleteExerciseRoutine: (id: string) => void;

    isSyncing: boolean;
    forceSync: () => Promise<void>;
    bodyCompositionGoal: BodyCompositionGoal | null;
    setBodyCompositionGoal: (goal: BodyCompositionGoal) => void;
    financeGoals: FinanceGoal[];
    setFinanceGoals: (goals: FinanceGoal[]) => void;
    addFinanceGoal: (goal: FinanceGoal) => void;
    updateFinanceGoal: (goal: FinanceGoal) => void;
    deleteFinanceGoal: (id: string) => void;
    monthlyBudgets: MonthlyBudget[];
    setMonthlyBudgets: (budgets: MonthlyBudget[]) => void;
    updateMonthlyBudget: (budget: MonthlyBudget) => void;

    homeShortcuts: string[];
    setHomeShortcuts: (shortcuts: string[]) => void;

    customFoods: CustomFood[];
    setCustomFoods: (foods: CustomFood[]) => void;
    addCustomFood: (food: CustomFood) => void;
    deleteCustomFood: (id: string) => void;

    // Custom Exercises
    customExercises: ExerciseDefinition[];
    addCustomExercise: (exercise: ExerciseDefinition) => void;
    deleteCustomExercise: (id: string) => void;
}


const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', [
        { id: '1', title: 'Design Database Schema', completed: false, priority: 'high', projectId: '2' },
        { id: '2', title: 'Buy Groceries', completed: true, priority: 'low', projectId: '1' },
    ]);
    const [projects, setProjects] = useLocalStorage<Project[]>('projects', [
        { id: '2', title: 'Work Project', color: '#10b981', status: 'active', manager: 'Manager', budget: { total: 1000000, spent: 250000 }, startDate: new Date(), progress: 25 }
    ]);
    const [selectedWorkProjectId, setSelectedWorkProjectId] = useState<string | null>(null);
    const [archiveDocuments, setArchiveDocuments] = useLocalStorage<ArchiveDocument[]>('archiveDocuments', []);
    const [goals, setGoals] = useLocalStorage<Goal[]>('goals', [
        {
            id: '1',
            title: 'Become a Senior Developer',
            progress: 45,
            subGoals: [
                { id: '1-1', title: 'Master Next.js 14', progress: 80 },
            ]
        }
    ]);
    const [habits, setHabits] = useLocalStorage<Habit[]>('habits', [
        { id: '1', title: 'Drink 2L Water', streak: 12, completedDates: [] }
    ]);
    const [events, setEvents] = useLocalStorage<CalendarEvent[]>('events', []);
    const [journals, setJournals] = useLocalStorage<JournalEntry[]>('journals', []);
    const [memos, setMemos] = useLocalStorage<Memo[]>('memos', []);
    const [people, setPeople] = useLocalStorage<Person[]>('people', []);
    const [scraps, setScraps] = useLocalStorage<Scrap[]>('scraps', []);

    // New Log States
    const [languageEntries, setLanguageEntries] = useLocalStorage<LanguageEntry[]>('languageEntries', []);
    const [languageResources, setLanguageResources] = useLocalStorage<LanguageResource[]>('languageResources', []); // New
    const [books, setBooks] = useLocalStorage<Book[]>('books', []);
    const [exerciseSessions, setExerciseSessions] = useLocalStorage<ExerciseSession[]>('exerciseSessions', []);
    const [dietEntries, setDietEntries] = useLocalStorage<DietEntry[]>('dietEntries', []);
    const [inBodyEntries, setInBodyEntries] = useLocalStorage<InBodyEntry[]>('inbodyEntries', []);
    const [hobbyEntries, setHobbyEntries] = useLocalStorage<HobbyEntry[]>('hobbyEntries', []);
    const [hobbies, setHobbies] = useLocalStorage<Hobby[]>('hobbies', []);
    const [hobbyPosts, setHobbyPosts] = useLocalStorage<HobbyPost[]>('hobbyPosts', []);

    // Finance States
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    const [assets, setAssets] = useLocalStorage<Asset[]>('assets', []);
    const [certificates, setCertificates] = useLocalStorage<Certificate[]>('certificates', []);
    const [portfolios, setPortfolios] = useLocalStorage<PortfolioItem[]>('portfolios', []);
    const [realEstateScraps, setRealEstateScraps] = useLocalStorage<RealEstateScrap[]>('realEstateScraps', []);
    const [stockAnalyses, setStockAnalyses] = useLocalStorage<StockAnalysis[]>('stockAnalyses', []);
    const [workLogs, setWorkLogs] = useLocalStorage<WorkLog[]>('workLogs', []);
    const [exerciseRoutines, setExerciseRoutines] = useLocalStorage<ExerciseRoutine[]>('exerciseRoutines', []);
    const [financeGoals, setFinanceGoals] = useLocalStorage<FinanceGoal[]>('financeGoals', [
        { id: '1', title: '주택 마련 기금', targetAmount: 500000000, currentAmount: 125000000, createdAt: new Date() },
        { id: '2', title: '노후 자금', targetAmount: 1000000000, currentAmount: 100000000, createdAt: new Date() }
    ]);
    const [monthlyBudgets, setMonthlyBudgets] = useLocalStorage<MonthlyBudget[]>('monthlyBudgets', []);
    const [customFoods, setCustomFoods] = useLocalStorage<CustomFood[]>('customFoods', []);
    const [customExercises, setCustomExercises] = useLocalStorage<ExerciseDefinition[]>('customExercises', []);

    // Resume States
    const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('userProfile', {
        id: '',
        name: '',
        jobTitle: '',
        email: '',
        phone: '',
        bio: '',
        socialLinks: []
    });
    const [educations, setEducations] = useLocalStorage<Education[]>('educations', []);
    const [careers, setCareers] = useLocalStorage<Career[]>('careers', []);
    const [activities, setActivities] = useLocalStorage<Activity[]>('activities', []); // New

    // Body Composition Goal State
    const [bodyCompositionGoal, setBodyCompositionGoal] = useLocalStorage<BodyCompositionGoal>('bodyCompositionGoal', {
        targetDate: new Date()
    });

    // Home Shortcuts State
    const [homeShortcuts, setHomeShortcuts] = useLocalStorage<string[]>('homeShortcuts', ['calendar', 'tasks', 'goals', 'reading', 'language', 'people', 'diet', 'ideas', 'work', 'hobby']);

    // Cloud Sync Integration
    const { saveData, loadData, isSyncing } = useCloudSync();
    const { data: session } = useSession();
    const [isLoadedFromCloud, setIsLoadedFromCloud] = useState(false);

    // 1. Load data from cloud on login
    useEffect(() => {
        if (session?.user) {
            setIsLoadedFromCloud(false); // Reset on login
            loadData().then(data => {
                if (data) {
                    // Update all states from cloud data
                    // Note: This matches the JSON structure from useCloudSync
                    if (data.tasks) setTasks(data.tasks);
                    if (data.projects) setProjects(data.projects);
                    if (data.goals) setGoals(data.goals);
                    if (data.habits) setHabits(data.habits);
                    if (data.events) setEvents(data.events);
                    if (data.userProfile) setUserProfile(data.userProfile);
                    if (data.homeShortcuts) setHomeShortcuts(data.homeShortcuts);
                    // Load other states
                    if (data.journals) setJournals(data.journals);
                    if (data.memos) setMemos(data.memos);
                    if (data.people) setPeople(data.people);
                    if (data.scraps) setScraps(data.scraps);
                    if (data.languageEntries) setLanguageEntries(data.languageEntries);
                    if (data.languageResources) setLanguageResources(data.languageResources);
                    if (data.books) setBooks(data.books);
                    if (data.exerciseSessions) setExerciseSessions(data.exerciseSessions);
                    if (data.dietEntries) setDietEntries(data.dietEntries);
                    if (data.inBodyEntries) setInBodyEntries(data.inBodyEntries);
                    if (data.hobbyEntries) setHobbyEntries(data.hobbyEntries);
                    if (data.hobbies) setHobbies(data.hobbies);
                    if (data.hobbyPosts) setHobbyPosts(data.hobbyPosts);
                    if (data.transactions) setTransactions(data.transactions);
                    if (data.assets) setAssets(data.assets);
                    if (data.certificates) setCertificates(data.certificates);
                    if (data.portfolios) setPortfolios(data.portfolios);
                    if (data.archiveDocuments) setArchiveDocuments(data.archiveDocuments);
                    if (data.educations) setEducations(data.educations);
                    if (data.careers) setCareers(data.careers);
                    if (data.activities) setActivities(data.activities);
                    if (data.bodyCompositionGoal) setBodyCompositionGoal(data.bodyCompositionGoal);
                    if (data.workLogs) setWorkLogs(data.workLogs);
                    if (data.exerciseRoutines) setExerciseRoutines(data.exerciseRoutines);
                    if (data.financeGoals) setFinanceGoals(data.financeGoals);
                    if (data.monthlyBudgets) setMonthlyBudgets(data.monthlyBudgets);
                    if (data.customFoods) setCustomFoods(data.customFoods);
                    if (data.customExercises) setCustomExercises(data.customExercises);
                }
                setIsLoadedFromCloud(true);
            });
        }
    }, [session?.user?.email, loadData]);



    // Helper Functions
    const addTask = (task: Task) => setTasks([...tasks, task]);
    const updateTask = (updatedTask: Task) => setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

    const addProject = (project: Project) => setProjects([...projects, project]);
    const updateProject = (updatedProject: Project) => setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    const deleteProject = (id: string) => setProjects(projects.filter(p => p.id !== id));

    const addDocument = (doc: ArchiveDocument) => setArchiveDocuments([...archiveDocuments, doc]);
    const updateDocument = (updatedDoc: ArchiveDocument) => setArchiveDocuments(archiveDocuments.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    const deleteDocument = (id: string) => setArchiveDocuments(archiveDocuments.filter(d => d.id !== id));

    const addGoal = (goal: Goal) => setGoals([...goals, goal]);
    const updateGoal = (updatedGoal: Goal) => {
        const updateRecursive = (list: Goal[]): Goal[] => {
            return list.map(g => {
                if (g.id === updatedGoal.id) return updatedGoal;
                if (g.subGoals) {
                    return { ...g, subGoals: updateRecursive(g.subGoals) };
                }
                return g;
            });
        };
        setGoals(updateRecursive(goals));
    };
    const deleteGoal = (id: string) => {
        const deleteRecursive = (list: Goal[]): Goal[] => {
            return list
                .filter(g => g.id !== id)
                .map(g => {
                    if (g.subGoals) {
                        return { ...g, subGoals: deleteRecursive(g.subGoals) };
                    }
                    return g;
                });
        };
        setGoals(deleteRecursive(goals));
    };

    // Helper Function: Generate Calendar Events from Habit
    const generateEventsFromHabit = (habit: Habit): CalendarEvent[] => {
        // Only generate events if habit has both time and endTime
        if (!habit.time || !habit.endTime) return [];

        const generatedEvents: CalendarEvent[] = [];
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
        const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
        const daysToGenerate = eachDayOfInterval({ start: weekStart, end: weekEnd });

        daysToGenerate.forEach(day => {
            const dayOfWeek = day.getDay();

            // Check if this habit should occur on this day
            if (habit.days && !habit.days.includes(dayOfWeek)) return;

            // Parse time strings
            const [startHour, startMin] = habit.time!.split(':').map(Number);
            const [endHour, endMin] = habit.endTime!.split(':').map(Number);

            // Create start and end dates
            const startDate = new Date(day);
            startDate.setHours(startHour, startMin, 0, 0);

            const endDate = new Date(day);
            endDate.setHours(endHour, endMin, 0, 0);

            // If end time is before start time, it means it ends the next day
            if (endDate < startDate) {
                endDate.setDate(endDate.getDate() + 1);
            }

            // Generate unique ID for this event instance
            const eventId = `habit-${habit.id}-${format(day, 'yyyy-MM-dd')}`;

            // Create calendar event with habit metadata
            const event: CalendarEvent = {
                id: eventId,
                title: habit.title,
                start: startDate,
                end: endDate,
                habitId: habit.id,
                isHabitEvent: true,
                type: habit.type,
                priority: habit.priority,
                isMeeting: habit.isMeeting,
                isAppointment: habit.isAppointment,
                connectedProjectId: habit.connectedProjectId,
                connectedGoalId: habit.connectedGoalId,
                prepTime: habit.prepTime,
                travelTime: habit.travelTime,
                color: habit.color,
                description: habit.description
            };

            generatedEvents.push(event);
        });

        return generatedEvents;
    };

    const addHabit = (habit: Habit) => {
        setHabits([...habits, habit]);

        // Generate and add calendar events if habit has time slots
        const newEvents = generateEventsFromHabit(habit);
        if (newEvents.length > 0) {
            setEvents([...events, ...newEvents]);
        }
    };

    const updateHabit = (updatedHabit: Habit) => {
        setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));

        // Generate new events that should exist based on updated habit
        const shouldExistEvents = generateEventsFromHabit(updatedHabit);

        // Keep all existing events from this habit (user may have edited them)
        const existingHabitEvents = events.filter(e => e.habitId === updatedHabit.id);
        const existingEventIds = new Set(existingHabitEvents.map(e => e.id));

        // Only add NEW events that don't already exist (preserves user edits to existing events)
        const newEventsToAdd = shouldExistEvents.filter(e => !existingEventIds.has(e.id));

        // Remove events that should no longer exist (e.g., if habit days changed from Mon-Fri to only Mon-Wed)
        const shouldExistIds = new Set(shouldExistEvents.map(e => e.id));
        const eventsToKeep = events.filter(e => {
            // Keep non-habit events
            if (e.habitId !== updatedHabit.id) return true;
            // Keep habit events that should still exist
            return shouldExistIds.has(e.id);
        });

        // Update events
        setEvents([...eventsToKeep, ...newEventsToAdd]);
    };

    const deleteHabit = (id: string) => {
        setHabits(habits.filter(h => h.id !== id));

        // Remove all events generated from this habit
        setEvents(events.filter(e => e.habitId !== id));
    };

    const addEvent = (event: CalendarEvent) => setEvents([...events, event]);
    const updateEvent = (updatedEvent: CalendarEvent) => setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    const deleteEvent = (id: string) => setEvents(events.filter(e => e.id !== id));

    const addJournal = (journal: JournalEntry) => setJournals([...journals, journal]);
    const updateJournal = (updatedJournal: JournalEntry) => setJournals(journals.map(j => j.id === updatedJournal.id ? updatedJournal : j));
    const deleteJournal = (id: string) => setJournals(journals.filter(j => j.id !== id));

    const addMemo = (memo: Memo) => setMemos([...memos, memo]);
    const updateMemo = (updatedMemo: Memo) => setMemos(memos.map(m => m.id === updatedMemo.id ? updatedMemo : m));
    const deleteMemo = (id: string) => setMemos(memos.filter(m => m.id !== id));

    const addPerson = (person: Person) => setPeople([...people, person]);
    const updatePerson = (updatedPerson: Person) => setPeople(people.map(p => p.id === updatedPerson.id ? updatedPerson : p));
    const deletePerson = (id: string) => setPeople(people.filter(p => p.id !== id));

    const addScrap = (scrap: Scrap) => setScraps([...scraps, scrap]);
    const updateScrap = (updatedScrap: Scrap) => setScraps(scraps.map(s => s.id === updatedScrap.id ? updatedScrap : s));
    const deleteScrap = (id: string) => setScraps(scraps.filter(s => s.id !== id));

    const addLanguageEntry = (entry: LanguageEntry) => setLanguageEntries([...languageEntries, entry]);
    const updateLanguageEntry = (updatedEntry: LanguageEntry) => setLanguageEntries(languageEntries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    const deleteLanguageEntry = (id: string) => setLanguageEntries(languageEntries.filter(e => e.id !== id));

    // Language Resources (New)
    const addLanguageResource = (resource: LanguageResource) => setLanguageResources([...languageResources, resource]);
    const updateLanguageResource = (resource: LanguageResource) => setLanguageResources(languageResources.map(r => r.id === resource.id ? resource : r));
    const deleteLanguageResource = (id: string) => setLanguageResources(languageResources.filter(r => r.id !== id));

    const addBook = (book: Book) => setBooks([...books, book]);
    const updateBook = (updatedBook: Book) => setBooks(books.map(b => b.id === updatedBook.id ? updatedBook : b));
    const deleteBook = (id: string) => setBooks(books.filter(b => b.id !== id));

    const addExerciseSession = (session: ExerciseSession) => setExerciseSessions(prev => [...prev, session]);
    const updateExerciseSession = (updatedSession: ExerciseSession) => setExerciseSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    const deleteExerciseSession = (id: string) => setExerciseSessions(prev => prev.filter(s => s.id !== id));

    const addDietEntry = (entry: DietEntry) => setDietEntries(prev => [...prev, entry]);
    const updateDietEntry = (updatedEntry: DietEntry) => setDietEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    const deleteDietEntry = (id: string) => setDietEntries(prev => prev.filter(e => e.id !== id));

    const addInBodyEntry = (entry: InBodyEntry) => setInBodyEntries(prev => [...prev, entry]);
    const updateInBodyEntry = (updatedEntry: InBodyEntry) => setInBodyEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    const deleteInBodyEntry = (id: string) => setInBodyEntries(prev => prev.filter(e => e.id !== id));

    const addHobbyEntry = (entry: HobbyEntry) => setHobbyEntries(prev => [...prev, entry]);
    const updateHobbyEntry = (updatedEntry: HobbyEntry) => setHobbyEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    const deleteHobbyEntry = (id: string) => setHobbyEntries(prev => prev.filter(e => e.id !== id));

    // New Hobby Functions
    const addHobby = (hobby: Hobby) => setHobbies(prev => [...prev, hobby]);
    const updateHobby = (updatedHobby: Hobby) => setHobbies(prev => prev.map(h => h.id === updatedHobby.id ? updatedHobby : h));
    const deleteHobby = (id: string) => {
        setHobbies(prev => prev.filter(h => h.id !== id));
    };

    const addHobbyPost = (post: HobbyPost) => setHobbyPosts(prev => [...prev, post]);
    const updateHobbyPost = (updatedPost: HobbyPost) => setHobbyPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    const deleteHobbyPost = (id: string) => setHobbyPosts(prev => prev.filter(p => p.id !== id));

    // Finance Logic (Updated for Asset Sync)
    const addTransaction = (transaction: Transaction) => {
        setTransactions(prev => [...prev, transaction]);

        // Sync Asset Balance
        const { type, assetId, targetAssetId, amount, cardId } = transaction;
        // Optimization: Use functional update here if assets depend on prev state, but complex logic might be better as is or carefully refactored.
        // For simplicity and safety on transactions list, we fixed that. Asset updates usually are one-off.
        let newAssets = [...assets]; // This reads current state 'assets', might be stale if inside batch.
        // Ideally should be setAssets(prev => ...). But let's stick to the requested scope (ExerciseSession) and widespread obvious fixes.

        // 1. Basic Income/Expense
        if (assetId) {
            newAssets = newAssets.map(asset => {
                if (asset.id === assetId) {
                    if (type === 'expense') {
                        return { ...asset, balance: asset.balance - amount };
                    } else if (type === 'income') {
                        return { ...asset, balance: asset.balance + amount };
                    } else if (type === 'transfer' || type === 'investment' || type === 'saving') {
                        return { ...asset, balance: asset.balance - amount };
                    } else if (type === 'repayment') {
                        return { ...asset, balance: asset.balance - amount };
                    } else if (type === 'card_bill') {
                        return { ...asset, balance: asset.balance - amount };
                    }
                }
                return asset;
            });
        }

        // 2. Transfer/Investment/Saving Target
        if (targetAssetId && (type === 'transfer' || type === 'investment' || type === 'saving' || type === 'repayment')) {
            newAssets = newAssets.map(asset => {
                if (asset.id === targetAssetId) {
                    if (type === 'repayment') {
                        // Repaying a loan reduces the loan balance (which is usually a positive number representing debt, or negative balance)
                        // If loan balance is positive debt, we subtract. If it's negative balance, we add.
                        // Assuming Asset balance for loan is debt amount (positive).
                        return { ...asset, balance: asset.balance - amount };
                    }
                    return { ...asset, balance: asset.balance + amount };
                }
                return asset;
            });
        }

        // 3. Credit Card Usage
        if (cardId && type === 'expense') {
            newAssets = newAssets.map(asset => {
                if (asset.id === cardId) {
                    // Credit card balance usually represents "used amount" (positive)
                    return { ...asset, balance: asset.balance + amount };
                }
                return asset;
            });
        }

        setAssets(newAssets);
    };

    const updateTransaction = (updatedTransaction: Transaction) => {
        setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));

        // Sync Asset Balance: Revert Old -> Apply New
        const oldTransaction = transactions.find(t => t.id === updatedTransaction.id);
        if (oldTransaction) {
            let newAssets = [...assets];

            // 1. Revert Old Transaction
            const { type: oldType, assetId: oldAssetId, targetAssetId: oldTargetAssetId, amount: oldAmount, cardId: oldCardId } = oldTransaction;

            if (oldAssetId) {
                newAssets = newAssets.map(asset => {
                    if (asset.id === oldAssetId) {
                        if (oldType === 'expense') return { ...asset, balance: asset.balance + oldAmount };
                        if (oldType === 'income') return { ...asset, balance: asset.balance - oldAmount };
                        if (['transfer', 'investment', 'saving', 'repayment', 'card_bill'].includes(oldType)) {
                            return { ...asset, balance: asset.balance + oldAmount };
                        }
                    }
                    return asset;
                });
            }

            if (oldTargetAssetId && ['transfer', 'investment', 'saving', 'repayment'].includes(oldType)) {
                newAssets = newAssets.map(asset => {
                    if (asset.id === oldTargetAssetId) {
                        if (oldType === 'repayment') return { ...asset, balance: asset.balance + oldAmount };
                        return { ...asset, balance: asset.balance - oldAmount };
                    }
                    return asset;
                });
            }

            if (oldCardId && oldType === 'expense') {
                newAssets = newAssets.map(asset => {
                    if (asset.id === oldCardId) return { ...asset, balance: asset.balance - oldAmount };
                    return asset;
                });
            }

            // 2. Apply New Transaction
            const { type, assetId, targetAssetId, amount, cardId } = updatedTransaction;

            if (assetId) {
                newAssets = newAssets.map(asset => {
                    if (asset.id === assetId) {
                        if (type === 'expense') return { ...asset, balance: asset.balance - amount };
                        if (type === 'income') return { ...asset, balance: asset.balance + amount };
                        if (['transfer', 'investment', 'saving', 'repayment', 'card_bill'].includes(type)) {
                            return { ...asset, balance: asset.balance - amount };
                        }
                    }
                    return asset;
                });
            }

            if (targetAssetId && ['transfer', 'investment', 'saving', 'repayment'].includes(type)) {
                newAssets = newAssets.map(asset => {
                    if (asset.id === targetAssetId) {
                        if (type === 'repayment') return { ...asset, balance: asset.balance - amount };
                        return { ...asset, balance: asset.balance + amount };
                    }
                    return asset;
                });
            }

            if (cardId && type === 'expense') {
                newAssets = newAssets.map(asset => {
                    if (asset.id === cardId) return { ...asset, balance: asset.balance + amount };
                    return asset;
                });
            }

            setAssets(newAssets);
        }
    };
    const deleteTransaction = (id: string) => {
        const tx = transactions.find(t => t.id === id);
        setTransactions(transactions.filter(t => t.id !== id));

        // Revert Asset Balance (Optional but good UX)
        if (tx) {
            const { type, assetId, targetAssetId, amount, cardId } = tx;
            let newAssets = [...assets];

            if (assetId) {
                newAssets = newAssets.map(asset => {
                    if (asset.id === assetId) {
                        if (type === 'expense') return { ...asset, balance: asset.balance + amount };
                        if (type === 'income') return { ...asset, balance: asset.balance - amount };
                        if (type === 'transfer' || type === 'investment' || type === 'saving' || type === 'repayment' || type === 'card_bill') {
                            return { ...asset, balance: asset.balance + amount };
                        }
                    }
                    return asset;
                });
            }

            if (targetAssetId && (type === 'transfer' || type === 'investment' || type === 'saving' || type === 'repayment')) {
                newAssets = newAssets.map(asset => {
                    if (asset.id === targetAssetId) {
                        if (type === 'repayment') return { ...asset, balance: asset.balance + amount };
                        return { ...asset, balance: asset.balance - amount };
                    }
                    return asset;
                });
            }

            if (cardId && type === 'expense') {
                newAssets = newAssets.map(asset => {
                    if (asset.id === cardId) return { ...asset, balance: asset.balance - amount };
                    return asset;
                });
            }

            setAssets(newAssets);
        }
    };

    const addAsset = (asset: Asset) => setAssets([...assets, asset]);
    const updateAsset = (updatedAsset: Asset) => setAssets(assets.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    const deleteAsset = (id: string) => setAssets(assets.filter(a => a.id !== id));

    const addCertificate = (cert: Certificate) => setCertificates([...certificates, cert]);
    const updateCertificate = (cert: Certificate) => setCertificates(certificates.map(c => c.id === cert.id ? cert : c));
    const deleteCertificate = (id: string) => setCertificates(certificates.filter(c => c.id !== id));

    const addPortfolio = (item: PortfolioItem) => setPortfolios([...portfolios, item]);
    const updatePortfolio = (item: PortfolioItem) => setPortfolios(portfolios.map(p => p.id === item.id ? item : p));
    const deletePortfolio = (id: string) => setPortfolios(portfolios.filter(p => p.id !== id));

    const updateUserProfile = (profile: UserProfile) => setUserProfile(profile);

    const addEducation = (edu: Education) => setEducations([...educations, edu]);
    const updateEducation = (edu: Education) => setEducations(educations.map(e => e.id === edu.id ? edu : e));
    const deleteEducation = (id: string) => setEducations(educations.filter(e => e.id !== id));

    const addCareer = (career: Career) => setCareers([...careers, career]);
    const updateCareer = (career: Career) => setCareers(careers.map(c => c.id === career.id ? career : c));
    const deleteCareer = (id: string) => setCareers(careers.filter(c => c.id !== id));

    const addActivity = (act: Activity) => setActivities([...activities, act]);
    const updateActivity = (act: Activity) => setActivities(activities.map(a => a.id === act.id ? act : a));
    const deleteActivity = (id: string) => setActivities(activities.filter(a => a.id !== id));

    // Alarm State
    const alertedEventIdsRef = React.useRef<Set<string>>(new Set());

    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        const checkAlarms = () => {
            const now = new Date();
            events.forEach(event => {
                if (!event.start) return;
                const start = new Date(event.start);
                const prep = event.prepTime || 0;
                const travel = event.travelTime || 0;

                // Alarm triggers at: Start - (Prep + Travel)
                const alarmTime = new Date(start.getTime() - (prep + travel) * 60 * 1000);

                // Trigger if alarm time is passed within last 60 seconds (to avoid spamming old alarms on refresh)
                // OR just simply if passed and not alerted, assuming we only care about future alarms from session start?
                // But alertedEventIdsRef is reset on refresh. So old events would trigger immediately.
                // Constraint: Only trigger if alarmTime is within recent past (e.g. 1 min) or future?
                // Actually, for a daily scheduler, maybe we only care about alarms happening NOW.
                // Let's say: if alarmTime <= now && alarmTime > now - 1 minute.

                const timeDiff = now.getTime() - alarmTime.getTime();

                // If it's time (within last 60 seconds) and not alerted
                if (timeDiff >= 0 && timeDiff < 60000 && !alertedEventIdsRef.current.has(event.id)) {
                    const message = `${format(start, 'HH:mm')} 시작` +
                        (prep > 0 ? `, 준비 ${prep}분` : '') +
                        (travel > 0 ? `, 이동 ${travel}분` : '') + ' 전입니다.';

                    if (Notification.permission === 'granted') {
                        new Notification(`[일정 알림] ${event.title}`, {
                            body: message,
                        });
                    }
                    toast.info(`[일정] ${event.title}`, { description: message });

                    alertedEventIdsRef.current.add(event.id);
                }
            });
        };

        const interval = setInterval(checkAlarms, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, [events]);

    // 2. Save data to cloud on change
    useEffect(() => {
        if (session?.user && isLoadedFromCloud) {
            saveData({
                tasks, projects, goals, habits, events, journals, memos, people, scraps,
                languageEntries, languageResources, books, exerciseSessions, dietEntries, inBodyEntries, hobbyEntries,
                hobbies, hobbyPosts,
                transactions, assets, certificates, portfolios, archiveDocuments,
                userProfile, educations, careers, activities, bodyCompositionGoal, homeShortcuts,
                realEstateScraps, stockAnalyses, workLogs, exerciseRoutines, financeGoals, customFoods,
                monthlyBudgets,
                customExercises // Added
            });
        }
    }, [
        session?.user, isLoadedFromCloud, saveData,
        tasks, projects, goals, habits, events, journals, memos, people, scraps,
        languageEntries, languageResources, books, exerciseSessions, dietEntries, inBodyEntries, hobbyEntries,
        hobbies, hobbyPosts,
        transactions, assets, certificates, portfolios, archiveDocuments,
        userProfile, educations, careers, activities, bodyCompositionGoal, homeShortcuts,
        realEstateScraps, stockAnalyses, workLogs, exerciseRoutines, financeGoals, customFoods,
        monthlyBudgets, customExercises
    ]);

    const forceSync = async () => {
        if (session?.user) {
            await saveData({
                tasks, projects, goals, habits, events, journals, memos, people, scraps,
                languageEntries, languageResources, books, exerciseSessions, dietEntries, inBodyEntries, hobbyEntries,
                hobbies, hobbyPosts,
                transactions, assets, certificates, portfolios, archiveDocuments,
                userProfile, educations, careers, activities, bodyCompositionGoal, homeShortcuts,
                realEstateScraps, stockAnalyses, workLogs, exerciseRoutines, financeGoals, customFoods,
                monthlyBudgets,
                customExercises // Added
            });
        }
    };

    useEffect(() => {
        const checkAlarms = () => {
            const now = new Date();
            const upcomingEvents = events.filter(event => {
                if (event.priority !== 'high') return false;
                if (alertedEventIdsRef.current.has(event.id)) return false;

                const start = new Date(event.start);
                if (!isSameDay(start, now)) return false;

                const diff = differenceInMinutes(start, now);
                return diff >= 0 && diff <= 10;
            });

            upcomingEvents.forEach(event => {
                toast.error(`중요 일정 알림 ⏰`, {
                    description: `'${event.title}' 일정이 10분 내에 시작됩니다!`,
                    duration: 5000,
                    style: {
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #f87171'
                    }
                });
                alertedEventIdsRef.current.add(event.id);
            });
        };

        const interval = setInterval(checkAlarms, 60000); // Check every minute
        checkAlarms(); // Initial check

        return () => clearInterval(interval);
    }, [events]);

    const addRealEstateScrap = (scrap: RealEstateScrap) => setRealEstateScraps([...realEstateScraps, scrap]);
    const updateRealEstateScrap = (updatedScrap: RealEstateScrap) => setRealEstateScraps(realEstateScraps.map(s => s.id === updatedScrap.id ? updatedScrap : s));
    const deleteRealEstateScrap = (id: string) => setRealEstateScraps(realEstateScraps.filter(s => s.id !== id));

    const addStockAnalysis = (analysis: StockAnalysis) => setStockAnalyses([...stockAnalyses, analysis]);
    const updateStockAnalysis = (updatedAnalysis: StockAnalysis) => setStockAnalyses(stockAnalyses.map(s => s.id === updatedAnalysis.id ? updatedAnalysis : s));
    const deleteStockAnalysis = (id: string) => setStockAnalyses(stockAnalyses.filter(s => s.id !== id));

    const addWorkLog = (log: WorkLog) => setWorkLogs([...workLogs, log]);
    const updateWorkLog = (updatedLog: WorkLog) => setWorkLogs(workLogs.map(l => l.id === updatedLog.id ? updatedLog : l));
    const deleteWorkLog = (id: string) => setWorkLogs(workLogs.filter(l => l.id !== id));

    const addExerciseRoutine = (routine: ExerciseRoutine) => setExerciseRoutines([...exerciseRoutines, routine]);
    const updateExerciseRoutine = (updatedRoutine: ExerciseRoutine) => setExerciseRoutines(exerciseRoutines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
    const deleteExerciseRoutine = (id: string) => setExerciseRoutines(exerciseRoutines.filter(r => r.id !== id));

    const addFinanceGoal = (goal: FinanceGoal) => setFinanceGoals([...financeGoals, goal]);
    const updateFinanceGoal = (updatedGoal: FinanceGoal) => setFinanceGoals(financeGoals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    const deleteFinanceGoal = (id: string) => setFinanceGoals(financeGoals.filter(g => g.id !== id));

    const addCustomFood = (food: CustomFood) => setCustomFoods([...customFoods, food]);
    const deleteCustomFood = (id: string) => setCustomFoods(customFoods.filter(f => f.id !== id));

    const updateMonthlyBudget = (budget: MonthlyBudget) => {
        const exists = monthlyBudgets.find(b => b.id === budget.id);
        if (exists) {
            setMonthlyBudgets(monthlyBudgets.map(b => b.id === budget.id ? budget : b));
        } else {
            setMonthlyBudgets([...monthlyBudgets, budget]);
        }
    };

    return (
        <DataContext.Provider value={{
            tasks, setTasks,
            projects, setProjects, addProject, updateProject, deleteProject,
            archiveDocuments, setArchiveDocuments, addDocument, updateDocument, deleteDocument,
            goals, setGoals,
            habits, setHabits,
            events, setEvents,
            journals, setJournals,
            memos, setMemos,
            people, setPeople,
            scraps, setScraps,
            addTask, updateTask, deleteTask,
            addGoal, updateGoal, deleteGoal,
            addHabit, updateHabit, deleteHabit,
            addEvent, updateEvent, deleteEvent,
            addJournal, updateJournal, deleteJournal,
            addMemo, updateMemo, deleteMemo,
            addPerson, updatePerson, deletePerson,
            addScrap, updateScrap, deleteScrap,

            // Work Mode State
            selectedWorkProjectId, setSelectedWorkProjectId,

            // New Logs
            languageEntries, setLanguageEntries,
            addLanguageEntry, updateLanguageEntry, deleteLanguageEntry,
            languageResources, setLanguageResources,
            addLanguageResource, updateLanguageResource, deleteLanguageResource,

            books, setBooks,
            addBook, updateBook, deleteBook,

            exerciseSessions, setExerciseSessions,
            addExerciseSession, updateExerciseSession, deleteExerciseSession,

            dietEntries, setDietEntries, addDietEntry, updateDietEntry, deleteDietEntry,
            inBodyEntries, setInBodyEntries, addInBodyEntry, updateInBodyEntry, deleteInBodyEntry,

            // Hobby Revamp
            hobbies, setHobbies, addHobby, updateHobby, deleteHobby,
            hobbyPosts, setHobbyPosts, addHobbyPost, updateHobbyPost, deleteHobbyPost,
            // Deprecated but kept for compatibility during migration
            hobbyEntries, setHobbyEntries, addHobbyEntry, updateHobbyEntry, deleteHobbyEntry,

            // Finance
            transactions, setTransactions,
            addTransaction, updateTransaction, deleteTransaction,

            assets, setAssets,
            addAsset,
            updateAsset,
            deleteAsset,
            certificates,
            addCertificate,
            updateCertificate,
            deleteCertificate,
            portfolios,
            addPortfolio,
            updatePortfolio,
            deletePortfolio,
            realEstateScraps, setRealEstateScraps, addRealEstateScrap, updateRealEstateScrap, deleteRealEstateScrap,
            stockAnalyses, setStockAnalyses, addStockAnalysis, updateStockAnalysis, deleteStockAnalysis,
            workLogs, setWorkLogs, addWorkLog, updateWorkLog, deleteWorkLog,
            exerciseRoutines, setExerciseRoutines, addExerciseRoutine, updateExerciseRoutine, deleteExerciseRoutine,
            financeGoals, setFinanceGoals, addFinanceGoal, updateFinanceGoal, deleteFinanceGoal,
            monthlyBudgets, setMonthlyBudgets, updateMonthlyBudget,
            userProfile,
            updateUserProfile,
            educations,
            addEducation,
            updateEducation,
            deleteEducation,
            careers, setCareers, // Added setCareers back
            addCareer,
            updateCareer,
            deleteCareer,
            activities, setActivities, addActivity, updateActivity, deleteActivity, // New

            isSyncing,
            forceSync,
            bodyCompositionGoal,
            setBodyCompositionGoal,
            homeShortcuts, setHomeShortcuts,
            customFoods,
            setCustomFoods,
            addCustomFood,
            deleteCustomFood,

            customExercises,
            addCustomExercise: (ex) => setCustomExercises([...customExercises, ex]),
            deleteCustomExercise: (id) => setCustomExercises(customExercises.filter(e => e.id !== id)),
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
