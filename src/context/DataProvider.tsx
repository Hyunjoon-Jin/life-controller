'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import {
    Task, Project, Goal, Habit, CalendarEvent, JournalEntry, Memo, Person, Scrap,
    LanguageEntry, Book, ExerciseSession, DietEntry, InBodyEntry, HobbyEntry,
    Transaction, Asset, Certificate, PortfolioItem, RealEstateScrap, StockAnalysis, PortfolioHolding,
    WorkLog, ExerciseRoutine, FinanceGoal, MonthlyBudget, CustomFood, ExerciseDefinition,
    ArchiveDocument, UserProfile, Education, Career, Activity, Hobby, HobbyPost,
    LanguageResource, BodyCompositionGoal, WikiPage, ProjectResource, ProjectRisk, CustomFieldDefinition
} from '@/types';
import { fetchAll, insertRow, updateRow, deleteRow, upsertSingleton, fetchSingleton, toSnakeCase } from '@/lib/supabase-data';
const dbUpdate = updateRow;
const dbDelete = deleteRow;
import { useAuth } from '@/components/auth/SessionProvider';
import { toast } from 'sonner';
import { differenceInMinutes, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface DataContextType {
    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
    // ...
    // Custom Fields
    customFieldDefinitions: CustomFieldDefinition[];
    addCustomFieldDefinition: (def: CustomFieldDefinition) => void;
    updateCustomFieldDefinition: (def: CustomFieldDefinition) => void;
    deleteCustomFieldDefinition: (id: string) => void;

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
    journals: JournalEntry[];
    setJournals: (journals: JournalEntry[]) => void;
    memos: Memo[];
    setMemos: (memos: Memo[]) => void;
    people: Person[];
    setPeople: (people: Person[]) => void;
    scraps: Scrap[];
    setScraps: (scraps: Scrap[]) => void;
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
    addJournal: (journal: JournalEntry) => void;
    updateJournal: (journal: JournalEntry) => void;
    deleteJournal: (id: string) => void;
    addMemo: (memo: Memo) => void;
    updateMemo: (memo: Memo) => void;
    deleteMemo: (id: string) => void;
    addPerson: (person: Person) => void;
    updatePerson: (person: Person) => void;
    deletePerson: (id: string) => void;
    addScrap: (scrap: Scrap) => void;
    updateScrap: (scrap: Scrap) => void;
    deleteScrap: (id: string) => void;
    selectedWorkProjectId: string | null;
    setSelectedWorkProjectId: (id: string | null) => void;
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
    hobbyEntries: HobbyEntry[];
    setHobbyEntries: (entries: HobbyEntry[]) => void;
    addHobbyEntry: (entry: HobbyEntry) => void;
    updateHobbyEntry: (entry: HobbyEntry) => void;
    deleteHobbyEntry: (id: string) => void;
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
    portfolioHoldings: PortfolioHolding[];
    setPortfolioHoldings: (holdings: PortfolioHolding[]) => void;
    addPortfolioHolding: (holding: PortfolioHolding) => void;
    updatePortfolioHolding: (holding: PortfolioHolding) => void;
    deletePortfolioHolding: (id: string) => void;
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
    financeGoals: FinanceGoal[];
    setFinanceGoals: (goals: FinanceGoal[]) => void;
    addFinanceGoal: (goal: FinanceGoal) => void;
    updateFinanceGoal: (goal: FinanceGoal) => void;
    deleteFinanceGoal: (id: string) => void;
    monthlyBudgets: MonthlyBudget[];
    setMonthlyBudgets: (budgets: MonthlyBudget[]) => void;
    updateMonthlyBudget: (budget: MonthlyBudget) => void;
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
    activities: Activity[];
    setActivities: (activities: Activity[]) => void;
    addActivity: (act: Activity) => void;
    updateActivity: (act: Activity) => void;
    deleteActivity: (id: string) => void;
    isSyncing: boolean;
    forceSync: () => Promise<void>;
    bodyCompositionGoal: BodyCompositionGoal;
    setBodyCompositionGoal: (goal: BodyCompositionGoal) => void;
    homeShortcuts: string[];
    setHomeShortcuts: (shortcuts: string[]) => void;
    customFoods: CustomFood[];
    setCustomFoods: (foods: CustomFood[]) => void;
    addCustomFood: (food: CustomFood) => void;
    deleteCustomFood: (id: string) => void;
    customExercises: ExerciseDefinition[];
    addCustomExercise: (ex: ExerciseDefinition) => void;
    deleteCustomExercise: (id: string) => void;
    globalMemo: string;
    setGlobalMemo: (memo: string) => void;
    activeTaskId: string | null;
    taskTimer: number;
    toggleTaskTimer: (taskId: string) => void;

    // Project Mgmt 2.0
    wikiPages: WikiPage[];
    addWikiPage: (page: WikiPage) => void;
    updateWikiPage: (page: WikiPage) => void;
    deleteWikiPage: (id: string) => void;

    projectResources: ProjectResource[];
    addProjectResource: (resource: ProjectResource) => void;
    updateProjectResource: (resource: ProjectResource) => void;
    deleteProjectResource: (id: string) => void;

    projectRisks: ProjectRisk[];
    addProjectRisk: (risk: ProjectRisk) => void;
    updateProjectRisk: (risk: ProjectRisk) => void;
    deleteProjectRisk: (id: string) => void;
}


const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    // All state — starts empty, loaded from Supabase on auth
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedWorkProjectId, setSelectedWorkProjectId] = useState<string | null>(null);
    const [archiveDocuments, setArchiveDocuments] = useState<ArchiveDocument[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);

    // Project Mgmt 2.0 State
    const [wikiPages, setWikiPages] = useState<WikiPage[]>([]);
    const [projectResources, setProjectResources] = useState<ProjectResource[]>([]);
    const [projectRisks, setProjectRisks] = useState<ProjectRisk[]>([]);

    // Custom Field Definitions (Persisted locally for now as per PM 2.0)
    const [customFieldDefinitions, setCustomFieldDefinitions] = useLocalStorage<CustomFieldDefinition[]>('customFieldDefinitions', []);

    const addCustomFieldDefinition = (def: CustomFieldDefinition) => {
        setCustomFieldDefinitions(prev => [...prev, def]);
    };

    const updateCustomFieldDefinition = (def: CustomFieldDefinition) => {
        setCustomFieldDefinitions(prev => prev.map(d => d.id === def.id ? def : d));
    };

    const deleteCustomFieldDefinition = (id: string) => {
        setCustomFieldDefinitions(prev => prev.filter(d => d.id !== id));
    };

    const [habits, setHabits] = useState<Habit[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [journals, setJournals] = useState<JournalEntry[]>([]);
    const [memos, setMemos] = useState<Memo[]>([]);
    const [people, setPeople] = useState<Person[]>([]);
    const [scraps, setScraps] = useState<Scrap[]>([]);

    const [languageEntries, setLanguageEntries] = useState<LanguageEntry[]>([]);
    const [languageResources, setLanguageResources] = useState<LanguageResource[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [exerciseSessions, setExerciseSessions] = useState<ExerciseSession[]>([]);
    const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
    const [inBodyEntries, setInBodyEntries] = useState<InBodyEntry[]>([]);
    const [hobbyEntries, setHobbyEntries] = useState<HobbyEntry[]>([]);
    const [hobbies, setHobbies] = useState<Hobby[]>([]);
    const [hobbyPosts, setHobbyPosts] = useState<HobbyPost[]>([]);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
    const [realEstateScraps, setRealEstateScraps] = useState<RealEstateScrap[]>([]);
    const [stockAnalyses, setStockAnalyses] = useState<StockAnalysis[]>([]);
    const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>([]);
    const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
    const [exerciseRoutines, setExerciseRoutines] = useState<ExerciseRoutine[]>([]);
    const [financeGoals, setFinanceGoals] = useState<FinanceGoal[]>([]);
    const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>([]);
    const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
    const [customExercises, setCustomExercises] = useState<ExerciseDefinition[]>([]);
    const [globalMemo, setGlobalMemo] = useState<string>('');

    const [userProfile, setUserProfile] = useState<UserProfile>({
        id: '', name: '', jobTitle: '', email: '', phone: '', bio: '', socialLinks: []
    });
    const [educations, setEducations] = useState<Education[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [bodyCompositionGoal, setBodyCompositionGoal] = useState<BodyCompositionGoal>({ targetDate: new Date() });
    const [homeShortcuts, setHomeShortcuts] = useState<string[]>(['calendar', 'tasks', 'goals', 'reading', 'language', 'people', 'diet', 'ideas', 'work', 'hobby']);

    const [isSyncing, setIsSyncing] = useState(false);
    const [isAccountWithdrawn, setIsAccountWithdrawn] = useState(false); // New: Account Status State
    const { user, signOut } = useAuth(); // Use signOut from useAuth
    const dataLoadedRef = useRef(false);

    // ============================================
    // Time Tracking Logic
    // ============================================
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [taskTimer, setTaskTimer] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer Effect
    useEffect(() => {
        if (activeTaskId) {
            timerRef.current = setInterval(() => {
                setTaskTimer(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [activeTaskId]);

    const toggleTaskTimer = async (taskId: string) => {
        if (activeTaskId === taskId) {
            // Stop current
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                const newTime = (task.actualTime || 0) + taskTimer;
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, actualTime: newTime } : t));
                bg(() => dbUpdate('tasks', taskId, { actual_time: newTime }));
            }
            setActiveTaskId(null);
            setTaskTimer(0);
        } else {
            // If another task was running, save its time
            if (activeTaskId) {
                const prevTask = tasks.find(t => t.id === activeTaskId);
                if (prevTask) {
                    const newTime = (prevTask.actualTime || 0) + taskTimer;
                    setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, actualTime: newTime } : t));
                    bg(() => dbUpdate('tasks', activeTaskId, { actual_time: newTime }));
                }
            }
            // Start new task
            setActiveTaskId(taskId);
            setTaskTimer(0);
        }
    };

    // ============================================
    // Helper: background DB operation (fire and forget with error logging)
    // ============================================
    const bg = useCallback((fn: () => Promise<any>) => {
        fn().catch(err => console.error('[DataProvider] Background DB error:', err));
    }, []);

    // New: Restore Account Logic
    const restoreAccount = async () => {
        if (!user || !userProfile.id) return;
        setIsSyncing(true);
        try {
            await updateRow('user_profiles', userProfile.id, {
                status: 'active',
                deletedAt: null,
            });
            setIsAccountWithdrawn(false);
            window.location.reload(); // Reload to fetch all data
        } catch (e) {
            console.error('Failed to restore account', e);
            alert('계정 복구에 실패했습니다. 관리자에게 문의하세요.');
        } finally {
            setIsSyncing(false);
        }
    };


    // ============================================
    // Load all data from Supabase on login
    // ============================================
    useEffect(() => {
        if (!user) {
            dataLoadedRef.current = false;
            // Clear all data on logout to prevent data leakage
            setTasks([]);
            setProjects([]);
            setSelectedWorkProjectId(null);
            setArchiveDocuments([]);
            setGoals([]);
            setHabits([]);
            setEvents([]);
            setJournals([]);
            setMemos([]);
            setPeople([]);
            setScraps([]);
            setLanguageEntries([]);
            setLanguageResources([]);
            setBooks([]);
            setExerciseSessions([]);
            setDietEntries([]);
            setInBodyEntries([]);
            setHobbyEntries([]);
            setHobbies([]);
            setHobbyPosts([]);
            setTransactions([]);
            setAssets([]);
            setCertificates([]);
            setPortfolios([]);
            setRealEstateScraps([]);
            setStockAnalyses([]);
            setWorkLogs([]);
            setExerciseRoutines([]);
            setFinanceGoals([]);
            setMonthlyBudgets([]);
            setCustomFoods([]);
            setCustomExercises([]);
            setGlobalMemo('');
            setUserProfile({ id: '', name: '', jobTitle: '', email: '', phone: '', bio: '', socialLinks: [] });
            setEducations([]);
            setCareers([]);
            setActivities([]);
            setBodyCompositionGoal({ targetDate: new Date() });
            setIsAccountWithdrawn(false);
            return;
        }
        if (dataLoadedRef.current) return;
        dataLoadedRef.current = true;

        const loadAllData = async () => {
            setIsSyncing(true);
            try {
                const [
                    tasksData, projectsData, goalsData, habitsData, eventsData,
                    journalsData, memosData, peopleData, scrapsData,
                    langEntriesData, langResourcesData, booksData,
                    exerciseData, dietData, inbodyData, hobbyEntriesData,
                    hobbiesData, hobbyPostsData,
                    txData, assetsData, certsData, portfoliosData,
                    reData, stockData, wlData, erData, fgData, mbData,
                    cfData, ceData, archiveData,
                    eduData, careerData, actData, holdingsData,
                ] = await Promise.all([
                    fetchAll<Task>('tasks'),
                    fetchAll<Project>('projects'),
                    fetchAll<Goal>('goals'),
                    fetchAll<Habit>('habits'),
                    fetchAll<CalendarEvent>('calendar_events'),
                    fetchAll<JournalEntry>('journals'),
                    fetchAll<Memo>('memos'),
                    fetchAll<Person>('people'),
                    fetchAll<Scrap>('scraps'),
                    fetchAll<LanguageEntry>('language_entries'),
                    fetchAll<LanguageResource>('language_resources'),
                    fetchAll<Book>('books'),
                    fetchAll<ExerciseSession>('exercise_sessions'),
                    fetchAll<DietEntry>('diet_entries'),
                    fetchAll<InBodyEntry>('inbody_entries'),
                    fetchAll<HobbyEntry>('hobby_entries'),
                    fetchAll<Hobby>('hobbies'),
                    fetchAll<HobbyPost>('hobby_posts'),
                    fetchAll<Transaction>('transactions'),
                    fetchAll<Asset>('assets'),
                    fetchAll<Certificate>('certificates'),
                    fetchAll<PortfolioItem>('portfolios'),
                    fetchAll<RealEstateScrap>('real_estate_scraps'),
                    fetchAll<StockAnalysis>('stock_analyses'),
                    fetchAll<WorkLog>('work_logs'),
                    fetchAll<ExerciseRoutine>('exercise_routines'),
                    fetchAll<FinanceGoal>('finance_goals'),
                    fetchAll<MonthlyBudget>('monthly_budgets'),
                    fetchAll<CustomFood>('custom_foods'),
                    fetchAll<ExerciseDefinition>('custom_exercises'),
                    fetchAll<ArchiveDocument>('archive_documents'),
                    fetchAll<Education>('educations'),
                    fetchAll<Career>('careers'),
                    fetchAll<Activity>('activities'),
                    fetchAll<PortfolioHolding>('portfolio_holdings'),
                ]);

                setTasks(tasksData);
                setProjects(projectsData);
                setGoals(goalsData);
                setHabits(habitsData);
                setEvents(eventsData);
                setJournals(journalsData);
                setMemos(memosData);
                setPeople(peopleData);
                setScraps(scrapsData);
                setLanguageEntries(langEntriesData);
                setLanguageResources(langResourcesData);
                setBooks(booksData);
                setExerciseSessions(exerciseData);
                setDietEntries(dietData);
                setInBodyEntries(inbodyData);
                setHobbyEntries(hobbyEntriesData);
                setHobbies(hobbiesData);
                setHobbyPosts(hobbyPostsData);
                setTransactions(txData);
                setAssets(assetsData);
                setCertificates(certsData);
                setPortfolios(portfoliosData);
                setRealEstateScraps(reData);
                setStockAnalyses(stockData);
                setPortfolioHoldings(holdingsData);
                setWorkLogs(wlData);
                setExerciseRoutines(erData);
                setFinanceGoals(fgData);
                setMonthlyBudgets(mbData);
                setCustomFoods(cfData);
                setCustomExercises(ceData);
                setArchiveDocuments(archiveData);
                setEducations(eduData);
                setCareers(careerData);
                setEducations(eduData);
                setCareers(careerData);
                setActivities(actData);

                // Project Management 2.0 Load - Lazy load or eager? Eager for now.
                // Note: These tables might not exist yet in Supabase, so wrapping in try-catch block individually is safer, 
                // but for now we assume schema exists or fetchAll handles error gracefully (it usually returns [] on specific errors if handled).
                // Actually fetchAll returns empty array on error? No, it throws.
                // We should add these to the Promise.all
                // BUT, to avoid breaking existing flow if tables are missing, let's do a separate block or adding to array.
                // Let's assume tables will be created.

                const [wikiData, resourceData, riskData] = await Promise.all([
                    fetchAll<WikiPage>('wiki_pages').catch(() => []),
                    fetchAll<ProjectResource>('project_resources').catch(() => []),
                    fetchAll<ProjectRisk>('project_risks').catch(() => [])
                ]);
                setWikiPages(wikiData);
                setProjectResources(resourceData);
                setProjectRisks(riskData);

                // Load singletons
                // Load singletons
                const profileData = await fetchSingleton<UserProfile>('user_profiles');
                if (profileData) {
                    if (profileData.status === 'withdrawn') {
                        setIsAccountWithdrawn(true);
                        setUserProfile(profileData);
                        setIsSyncing(false);
                        return; // Stop loading other data for withdrawn users
                    }

                    // Update Last Active (Fire & Forget)
                    if (profileData.id) {
                        bg(() => updateRow('user_profiles', profileData.id, { lastActiveAt: new Date() }));
                    }
                    setUserProfile(profileData);
                }

                const settingsData = await fetchSingleton<any>('user_settings');
                if (settingsData) {
                    if (settingsData.homeShortcuts) setHomeShortcuts(settingsData.homeShortcuts);
                    if (settingsData.bodyCompositionGoal) setBodyCompositionGoal(settingsData.bodyCompositionGoal);
                    if (settingsData.globalMemo !== undefined) setGlobalMemo(settingsData.globalMemo);
                }
            } catch (err) {
                console.error('[DataProvider] Failed to load data from Supabase:', err);
            } finally {
                setIsSyncing(false);
            }
        };

        loadAllData();
    }, [user]);



    // ============================================
    // CRUD Helpers — optimistic local update + background Supabase call
    // ============================================

    // Tasks
    const addTask = (task: Task) => { setTasks(prev => [...prev, task]); bg(() => insertRow('tasks', task)); };
    const updateTask = (t: Task) => { setTasks(prev => prev.map(x => x.id === t.id ? t : x)); bg(() => dbUpdate('tasks', t.id, t)); };
    const deleteTask = (id: string) => { setTasks(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('tasks', id)); };

    // Projects
    const addProject = (p: Project) => { setProjects(prev => [...prev, p]); bg(() => insertRow('projects', p)); };
    const updateProject = (p: Project) => { setProjects(prev => prev.map(x => x.id === p.id ? p : x)); bg(() => dbUpdate('projects', p.id, p)); };
    const deleteProject = (id: string) => { setProjects(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('projects', id)); };

    // Archive Documents
    const addDocument = (doc: ArchiveDocument) => { setArchiveDocuments(prev => [...prev, doc]); bg(() => insertRow('archive_documents', doc)); };
    const updateDocument = (doc: ArchiveDocument) => { setArchiveDocuments(prev => prev.map(x => x.id === doc.id ? doc : x)); bg(() => dbUpdate('archive_documents', doc.id, doc)); };
    const deleteDocument = (id: string) => { setArchiveDocuments(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('archive_documents', id)); };

    // Goals (recursive sub-goals)
    const addGoal = (goal: Goal) => {
        setGoals(prev => [...prev, goal]);
        bg(() => insertRow('goals', goal));
        if (goal.isHabit) {
            const newEvents = generateEventsFromGoalHabit(goal);
            if (newEvents.length > 0) setEvents(prev => [...prev, ...newEvents]);
        }
    };
    const updateGoal = (updatedGoal: Goal) => {
        const updateRecursive = (list: Goal[]): Goal[] => {
            return list.map(g => {
                if (g.id === updatedGoal.id) return updatedGoal;
                if (g.subGoals) return { ...g, subGoals: updateRecursive(g.subGoals) };
                return g;
            });
        };
        setGoals(updateRecursive(goals));
        bg(() => dbUpdate('goals', updatedGoal.id, updatedGoal));

        // Sync habit events
        const shouldExistEvents = generateEventsFromGoalHabit(updatedGoal);
        const existingGoalHabitEvents = events.filter(e => e.id.startsWith(`goal-habit-${updatedGoal.id}`));
        const existingEventIds = new Set(existingGoalHabitEvents.map(e => e.id));
        const newEventsToAdd = shouldExistEvents.filter(e => !existingEventIds.has(e.id));
        const shouldExistIds = new Set(shouldExistEvents.map(e => e.id));
        const eventsToKeep = events.filter(e => {
            if (!e.id.startsWith(`goal-habit-${updatedGoal.id}`)) return true;
            return shouldExistIds.has(e.id);
        });
        setEvents([...eventsToKeep, ...newEventsToAdd]);
    };
    const deleteGoal = (id: string) => {
        const deleteRecursive = (list: Goal[]): Goal[] => {
            return list.filter(g => g.id !== id).map(g => {
                if (g.subGoals) return { ...g, subGoals: deleteRecursive(g.subGoals) };
                return g;
            });
        };
        setGoals(deleteRecursive(goals));
        bg(() => dbDelete('goals', id));
        setEvents(prev => prev.filter(e => !e.id.startsWith(`goal-habit-${id}`)));
    };

    // Habit → Calendar Event generation
    const generateEventsFromHabit = (habit: Habit): CalendarEvent[] => {
        if (!habit.time || !habit.endTime) return [];
        const generatedEvents: CalendarEvent[] = [];
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
        const daysToGenerate = eachDayOfInterval({ start: weekStart, end: weekEnd });

        daysToGenerate.forEach(day => {
            const dayOfWeek = day.getDay();
            if (habit.days && !habit.days.includes(dayOfWeek)) return;
            const [startHour, startMin] = habit.time!.split(':').map(Number);
            const [endHour, endMin] = habit.endTime!.split(':').map(Number);
            const startDate = new Date(day); startDate.setHours(startHour, startMin, 0, 0);
            const endDate = new Date(day); endDate.setHours(endHour, endMin, 0, 0);
            if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
            const eventId = `habit-${habit.id}-${format(day, 'yyyy-MM-dd')}`;
            generatedEvents.push({
                id: eventId, title: habit.title, start: startDate, end: endDate,
                habitId: habit.id, isHabitEvent: true, type: habit.type, priority: habit.priority,
                isMeeting: habit.isMeeting, isAppointment: habit.isAppointment,
                connectedProjectId: habit.connectedProjectId, connectedGoalId: habit.connectedGoalId,
                prepTime: habit.prepTime, travelTime: habit.travelTime, color: habit.color, description: habit.description
            });
        });
        return generatedEvents;
    };

    const generateEventsFromGoalHabit = (goal: Goal): CalendarEvent[] => {
        if (!goal.isHabit || !goal.habitFrequency) return [];
        const generatedEvents: CalendarEvent[] = [];
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
        const daysToGenerate = eachDayOfInterval({ start: weekStart, end: weekEnd });

        daysToGenerate.forEach(day => {
            const dayOfWeek = day.getDay();

            // For now: daily = all days, weekly = Monday (day 1), monthly = 1st of month
            let shouldAdd = false;
            if (goal.habitFrequency === 'daily') shouldAdd = true;
            else if (goal.habitFrequency === 'weekly' && dayOfWeek === 1) shouldAdd = true;
            else if (goal.habitFrequency === 'monthly' && day.getDate() === 1) shouldAdd = true;

            if (shouldAdd) {
                const startDate = new Date(day); startDate.setHours(9, 0, 0, 0); // Default 9 AM
                const endDate = new Date(day); endDate.setHours(10, 0, 0, 0); // Default 1 hour
                const eventId = `goal-habit-${goal.id}-${format(day, 'yyyy-MM-dd')}`;
                generatedEvents.push({
                    id: eventId, title: `[습관] ${goal.title}`, start: startDate, end: endDate,
                    connectedGoalId: goal.id, isHabitEvent: true, color: '#10b981', // Emerald
                    description: goal.memo
                });
            }
        });
        return generatedEvents;
    };

    const addHabit = (habit: Habit) => {
        setHabits(prev => [...prev, habit]);
        bg(() => insertRow('habits', habit));
        const newEvents = generateEventsFromHabit(habit);
        if (newEvents.length > 0) setEvents(prev => [...prev, ...newEvents]);
    };

    const updateHabit = (updatedHabit: Habit) => {
        setHabits(prev => prev.map(h => h.id === updatedHabit.id ? updatedHabit : h));
        bg(() => dbUpdate('habits', updatedHabit.id, updatedHabit));
        const shouldExistEvents = generateEventsFromHabit(updatedHabit);
        const existingHabitEvents = events.filter(e => e.habitId === updatedHabit.id);
        const existingEventIds = new Set(existingHabitEvents.map(e => e.id));
        const newEventsToAdd = shouldExistEvents.filter(e => !existingEventIds.has(e.id));
        const shouldExistIds = new Set(shouldExistEvents.map(e => e.id));
        const eventsToKeep = events.filter(e => {
            if (e.habitId !== updatedHabit.id) return true;
            return shouldExistIds.has(e.id);
        });
        setEvents([...eventsToKeep, ...newEventsToAdd]);
    };

    const deleteHabit = (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
        bg(() => dbDelete('habits', id));
        setEvents(prev => prev.filter(e => e.habitId !== id));
    };

    // Events (useCallback으로 안정된 함수 참조 유지 — 타이머 등 다른 state 변화에 영향 안 받음)
    const addEvent = useCallback((event: CalendarEvent) => { setEvents(prev => [...prev, event]); bg(() => insertRow('calendar_events', event)); }, [bg]);
    const updateEvent = useCallback((e: CalendarEvent) => { setEvents(prev => prev.map(x => x.id === e.id ? e : x)); bg(() => dbUpdate('calendar_events', e.id, e)); }, [bg]);
    const deleteEvent = useCallback((id: string) => { setEvents(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('calendar_events', id)); }, [bg]);

    // Journals
    const addJournal = (j: JournalEntry) => { setJournals(prev => [...prev, j]); bg(() => insertRow('journals', j)); };
    const updateJournal = (j: JournalEntry) => { setJournals(prev => prev.map(x => x.id === j.id ? j : x)); bg(() => dbUpdate('journals', j.id, j)); };
    const deleteJournal = (id: string) => { setJournals(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('journals', id)); };

    // Memos
    const addMemo = (m: Memo) => { setMemos(prev => [...prev, m]); bg(() => insertRow('memos', m)); };
    const updateMemo = (m: Memo) => { setMemos(prev => prev.map(x => x.id === m.id ? m : x)); bg(() => dbUpdate('memos', m.id, m)); };
    const deleteMemo = (id: string) => { setMemos(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('memos', id)); };

    // People
    const addPerson = (p: Person) => { setPeople(prev => [...prev, p]); bg(() => insertRow('people', p)); };
    const updatePerson = (p: Person) => { setPeople(prev => prev.map(x => x.id === p.id ? p : x)); bg(() => dbUpdate('people', p.id, p)); };
    const deletePerson = (id: string) => { setPeople(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('people', id)); };

    // Scraps
    const addScrap = (s: Scrap) => { setScraps(prev => [...prev, s]); bg(() => insertRow('scraps', s)); };
    const updateScrap = (s: Scrap) => { setScraps(prev => prev.map(x => x.id === s.id ? s : x)); bg(() => dbUpdate('scraps', s.id, s)); };
    const deleteScrap = (id: string) => { setScraps(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('scraps', id)); };

    // Language Entries
    const addLanguageEntry = (e: LanguageEntry) => { setLanguageEntries(prev => [...prev, e]); bg(() => insertRow('language_entries', e)); };
    const updateLanguageEntry = (e: LanguageEntry) => { setLanguageEntries(prev => prev.map(x => x.id === e.id ? e : x)); bg(() => dbUpdate('language_entries', e.id, e)); };
    const deleteLanguageEntry = (id: string) => { setLanguageEntries(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('language_entries', id)); };

    // Language Resources
    const addLanguageResource = (r: LanguageResource) => { setLanguageResources(prev => [...prev, r]); bg(() => insertRow('language_resources', r)); };
    const updateLanguageResource = (r: LanguageResource) => { setLanguageResources(prev => prev.map(x => x.id === r.id ? r : x)); bg(() => dbUpdate('language_resources', r.id, r)); };
    const deleteLanguageResource = (id: string) => { setLanguageResources(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('language_resources', id)); };

    // Books
    const addBook = (b: Book) => { setBooks(prev => [...prev, b]); bg(() => insertRow('books', b)); };
    const updateBook = (b: Book) => { setBooks(prev => prev.map(x => x.id === b.id ? b : x)); bg(() => dbUpdate('books', b.id, b)); };
    const deleteBook = (id: string) => { setBooks(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('books', id)); };

    // Exercise Sessions
    const addExerciseSession = (s: ExerciseSession) => { setExerciseSessions(prev => [...prev, s]); bg(() => insertRow('exercise_sessions', s)); };
    const updateExerciseSession = (s: ExerciseSession) => { setExerciseSessions(prev => prev.map(x => x.id === s.id ? s : x)); bg(() => dbUpdate('exercise_sessions', s.id, s)); };
    const deleteExerciseSession = (id: string) => { setExerciseSessions(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('exercise_sessions', id)); };

    // Diet Entries
    const addDietEntry = (e: DietEntry) => { setDietEntries(prev => [...prev, e]); bg(() => insertRow('diet_entries', e)); };
    const updateDietEntry = (e: DietEntry) => { setDietEntries(prev => prev.map(x => x.id === e.id ? e : x)); bg(() => dbUpdate('diet_entries', e.id, e)); };
    const deleteDietEntry = (id: string) => { setDietEntries(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('diet_entries', id)); };

    // InBody Entries
    const addInBodyEntry = (e: InBodyEntry) => { setInBodyEntries(prev => [...prev, e]); bg(() => insertRow('inbody_entries', e)); };
    const updateInBodyEntry = (e: InBodyEntry) => { setInBodyEntries(prev => prev.map(x => x.id === e.id ? e : x)); bg(() => dbUpdate('inbody_entries', e.id, e)); };
    const deleteInBodyEntry = (id: string) => { setInBodyEntries(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('inbody_entries', id)); };

    // Hobby Entries
    const addHobbyEntry = (e: HobbyEntry) => { setHobbyEntries(prev => [...prev, e]); bg(() => insertRow('hobby_entries', e)); };
    const updateHobbyEntry = (e: HobbyEntry) => { setHobbyEntries(prev => prev.map(x => x.id === e.id ? e : x)); bg(() => dbUpdate('hobby_entries', e.id, e)); };
    const deleteHobbyEntry = (id: string) => { setHobbyEntries(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('hobby_entries', id)); };

    // Hobbies
    const addHobby = (h: Hobby) => { setHobbies(prev => [...prev, h]); bg(() => insertRow('hobbies', h)); };
    const updateHobby = (h: Hobby) => { setHobbies(prev => prev.map(x => x.id === h.id ? h : x)); bg(() => dbUpdate('hobbies', h.id, h)); };
    const deleteHobby = (id: string) => { setHobbies(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('hobbies', id)); };

    // Hobby Posts
    const addHobbyPost = (p: HobbyPost) => { setHobbyPosts(prev => [...prev, p]); bg(() => insertRow('hobby_posts', p)); };
    const updateHobbyPost = (p: HobbyPost) => { setHobbyPosts(prev => prev.map(x => x.id === p.id ? p : x)); bg(() => dbUpdate('hobby_posts', p.id, p)); };
    const deleteHobbyPost = (id: string) => { setHobbyPosts(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('hobby_posts', id)); };

    // Project Wiki
    const addWikiPage = (p: WikiPage) => { setWikiPages(prev => [...prev, p]); bg(() => insertRow('wiki_pages', p)); };
    const updateWikiPage = (p: WikiPage) => { setWikiPages(prev => prev.map(x => x.id === p.id ? p : x)); bg(() => dbUpdate('wiki_pages', p.id, p)); };
    const deleteWikiPage = (id: string) => { setWikiPages(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('wiki_pages', id)); };

    // Project Resources
    const addProjectResource = (r: ProjectResource) => { setProjectResources(prev => [...prev, r]); bg(() => insertRow('project_resources', r)); };
    const updateProjectResource = (r: ProjectResource) => { setProjectResources(prev => prev.map(x => x.id === r.id ? r : x)); bg(() => dbUpdate('project_resources', r.id, r)); };
    const deleteProjectResource = (id: string) => { setProjectResources(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('project_resources', id)); };

    // Project Risks
    const addProjectRisk = (r: ProjectRisk) => { setProjectRisks(prev => [...prev, r]); bg(() => insertRow('project_risks', r)); };
    const updateProjectRisk = (r: ProjectRisk) => { setProjectRisks(prev => prev.map(x => x.id === r.id ? r : x)); bg(() => dbUpdate('project_risks', r.id, r)); };
    const deleteProjectRisk = (id: string) => { setProjectRisks(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('project_risks', id)); };

    // Finance: Transactions (with asset balance sync)
    const addTransaction = (transaction: Transaction) => {
        setTransactions(prev => [...prev, transaction]);
        bg(() => insertRow('transactions', transaction));

        const { type, assetId, targetAssetId, amount, cardId } = transaction;
        let newAssets = [...assets];
        if (assetId) {
            newAssets = newAssets.map(asset => {
                if (asset.id === assetId) {
                    if (type === 'expense') return { ...asset, balance: asset.balance - amount };
                    if (type === 'income') return { ...asset, balance: asset.balance + amount };
                    if (['transfer', 'investment', 'saving', 'repayment', 'card_bill'].includes(type)) return { ...asset, balance: asset.balance - amount };
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
    };

    const updateTransaction = (updatedTransaction: Transaction) => {
        setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
        bg(() => dbUpdate('transactions', updatedTransaction.id, updatedTransaction));

        const oldTransaction = transactions.find(t => t.id === updatedTransaction.id);
        if (oldTransaction) {
            let newAssets = [...assets];
            // Revert old
            const { type: oldType, assetId: oldAssetId, targetAssetId: oldTargetAssetId, amount: oldAmount, cardId: oldCardId } = oldTransaction;
            if (oldAssetId) {
                newAssets = newAssets.map(asset => {
                    if (asset.id === oldAssetId) {
                        if (oldType === 'expense') return { ...asset, balance: asset.balance + oldAmount };
                        if (oldType === 'income') return { ...asset, balance: asset.balance - oldAmount };
                        if (['transfer', 'investment', 'saving', 'repayment', 'card_bill'].includes(oldType)) return { ...asset, balance: asset.balance + oldAmount };
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
            // Apply new
            const { type, assetId, targetAssetId, amount, cardId } = updatedTransaction;
            if (assetId) {
                newAssets = newAssets.map(asset => {
                    if (asset.id === assetId) {
                        if (type === 'expense') return { ...asset, balance: asset.balance - amount };
                        if (type === 'income') return { ...asset, balance: asset.balance + amount };
                        if (['transfer', 'investment', 'saving', 'repayment', 'card_bill'].includes(type)) return { ...asset, balance: asset.balance - amount };
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
        setTransactions(prev => prev.filter(t => t.id !== id));
        bg(() => dbDelete('transactions', id));

        if (tx) {
            const { type, assetId, targetAssetId, amount, cardId } = tx;
            let newAssets = [...assets];
            if (assetId) {
                newAssets = newAssets.map(asset => {
                    if (asset.id === assetId) {
                        if (type === 'expense') return { ...asset, balance: asset.balance + amount };
                        if (type === 'income') return { ...asset, balance: asset.balance - amount };
                        if (['transfer', 'investment', 'saving', 'repayment', 'card_bill'].includes(type)) return { ...asset, balance: asset.balance + amount };
                    }
                    return asset;
                });
            }
            if (targetAssetId && ['transfer', 'investment', 'saving', 'repayment'].includes(type)) {
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

    // Assets
    const addAsset = (a: Asset) => { setAssets(prev => [...prev, a]); bg(() => insertRow('assets', a)); };
    const updateAsset = (a: Asset) => { setAssets(prev => prev.map(x => x.id === a.id ? a : x)); bg(() => dbUpdate('assets', a.id, a)); };
    const deleteAsset = (id: string) => { setAssets(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('assets', id)); };

    // Certificates
    const addCertificate = (c: Certificate) => { setCertificates(prev => [...prev, c]); bg(() => insertRow('certificates', c)); };
    const updateCertificate = (c: Certificate) => { setCertificates(prev => prev.map(x => x.id === c.id ? c : x)); bg(() => dbUpdate('certificates', c.id, c)); };
    const deleteCertificate = (id: string) => { setCertificates(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('certificates', id)); };

    // Portfolios
    const addPortfolio = (p: PortfolioItem) => { setPortfolios(prev => [...prev, p]); bg(() => insertRow('portfolios', p)); };
    const updatePortfolio = (p: PortfolioItem) => { setPortfolios(prev => prev.map(x => x.id === p.id ? p : x)); bg(() => dbUpdate('portfolios', p.id, p)); };
    const deletePortfolio = (id: string) => { setPortfolios(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('portfolios', id)); };

    // User Profile (singleton)
    const updateUserProfile = (profile: UserProfile) => {
        setUserProfile(profile);
        bg(() => upsertSingleton('user_profiles', profile));
    };

    // Education
    const addEducation = (edu: Education) => { setEducations(prev => [...prev, edu]); bg(() => insertRow('educations', edu)); };
    const updateEducation = (edu: Education) => { setEducations(prev => prev.map(x => x.id === edu.id ? edu : x)); bg(() => dbUpdate('educations', edu.id, edu)); };
    const deleteEducation = (id: string) => { setEducations(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('educations', id)); };

    // Careers
    const addCareer = (c: Career) => { setCareers(prev => [...prev, c]); bg(() => insertRow('careers', c)); };
    const updateCareer = (c: Career) => { setCareers(prev => prev.map(x => x.id === c.id ? c : x)); bg(() => dbUpdate('careers', c.id, c)); };
    const deleteCareer = (id: string) => { setCareers(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('careers', id)); };

    // Activities
    const addActivity = (a: Activity) => { setActivities(prev => [...prev, a]); bg(() => insertRow('activities', a)); };
    const updateActivity = (a: Activity) => { setActivities(prev => prev.map(x => x.id === a.id ? a : x)); bg(() => dbUpdate('activities', a.id, a)); };
    const deleteActivity = (id: string) => { setActivities(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('activities', id)); };

    // Real Estate Scraps
    const addRealEstateScrap = (s: RealEstateScrap) => { setRealEstateScraps(prev => [...prev, s]); bg(() => insertRow('real_estate_scraps', s)); };
    const updateRealEstateScrap = (s: RealEstateScrap) => { setRealEstateScraps(prev => prev.map(x => x.id === s.id ? s : x)); bg(() => dbUpdate('real_estate_scraps', s.id, s)); };
    const deleteRealEstateScrap = (id: string) => { setRealEstateScraps(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('real_estate_scraps', id)); };

    // Stock Analyses
    const addStockAnalysis = (s: StockAnalysis) => { setStockAnalyses(prev => [...prev, s]); bg(() => insertRow('stock_analyses', s)); };
    const updateStockAnalysis = (s: StockAnalysis) => { setStockAnalyses(prev => prev.map(x => x.id === s.id ? s : x)); bg(() => dbUpdate('stock_analyses', s.id, s)); };
    const deleteStockAnalysis = (id: string) => { setStockAnalyses(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('stock_analyses', id)); };

    // Portfolio Holdings
    const addPortfolioHolding = (h: PortfolioHolding) => { setPortfolioHoldings(prev => [...prev, h]); bg(() => insertRow('portfolio_holdings', h)); };
    const updatePortfolioHolding = (h: PortfolioHolding) => { setPortfolioHoldings(prev => prev.map(x => x.id === h.id ? h : x)); bg(() => dbUpdate('portfolio_holdings', h.id, h)); };
    const deletePortfolioHolding = (id: string) => { setPortfolioHoldings(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('portfolio_holdings', id)); };

    // Work Logs
    const addWorkLog = (l: WorkLog) => { setWorkLogs(prev => [...prev, l]); bg(() => insertRow('work_logs', l)); };
    const updateWorkLog = (l: WorkLog) => { setWorkLogs(prev => prev.map(x => x.id === l.id ? l : x)); bg(() => dbUpdate('work_logs', l.id, l)); };
    const deleteWorkLog = (id: string) => { setWorkLogs(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('work_logs', id)); };

    // Exercise Routines
    const addExerciseRoutine = (r: ExerciseRoutine) => { setExerciseRoutines(prev => [...prev, r]); bg(() => insertRow('exercise_routines', r)); };
    const updateExerciseRoutine = (r: ExerciseRoutine) => { setExerciseRoutines(prev => prev.map(x => x.id === r.id ? r : x)); bg(() => dbUpdate('exercise_routines', r.id, r)); };
    const deleteExerciseRoutine = (id: string) => { setExerciseRoutines(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('exercise_routines', id)); };

    // Finance Goals
    const addFinanceGoal = (g: FinanceGoal) => { setFinanceGoals(prev => [...prev, g]); bg(() => insertRow('finance_goals', g)); };
    const updateFinanceGoal = (g: FinanceGoal) => { setFinanceGoals(prev => prev.map(x => x.id === g.id ? g : x)); bg(() => dbUpdate('finance_goals', g.id, g)); };
    const deleteFinanceGoal = (id: string) => { setFinanceGoals(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('finance_goals', id)); };

    // Custom Foods
    const addCustomFood = (f: CustomFood) => { setCustomFoods(prev => [...prev, f]); bg(() => insertRow('custom_foods', f)); };
    const deleteCustomFood = (id: string) => { setCustomFoods(prev => prev.filter(x => x.id !== id)); bg(() => dbDelete('custom_foods', id)); };

    // Monthly Budgets
    const updateMonthlyBudget = (budget: MonthlyBudget) => {
        const exists = monthlyBudgets.find(b => b.id === budget.id);
        if (exists) {
            setMonthlyBudgets(prev => prev.map(b => b.id === budget.id ? budget : b));
            bg(() => dbUpdate('monthly_budgets', budget.id, budget));
        } else {
            setMonthlyBudgets(prev => [...prev, budget]);
            bg(() => insertRow('monthly_budgets', budget));
        }
    };

    // Settings singletons — persist to user_settings table
    const setHomeShortcutsAndSync = useCallback((shortcuts: string[]) => {
        setHomeShortcuts(shortcuts);
        bg(() => upsertSingleton('user_settings', { homeShortcuts: shortcuts, globalMemo, bodyCompositionGoal }));
    }, [globalMemo, bodyCompositionGoal, bg]);

    const setBodyCompositionGoalAndSync = useCallback((goal: BodyCompositionGoal) => {
        setBodyCompositionGoal(goal);
        bg(() => upsertSingleton('user_settings', { homeShortcuts, globalMemo, bodyCompositionGoal: goal }));
    }, [homeShortcuts, globalMemo, bg]);

    const setGlobalMemoAndSync = useCallback((memo: string) => {
        setGlobalMemo(memo);
        bg(() => upsertSingleton('user_settings', { homeShortcuts, bodyCompositionGoal, globalMemo: memo }));
    }, [homeShortcuts, bodyCompositionGoal, bg]);

    // Force sync (no-op now — data is always persisted directly)
    const forceSync = async () => {
        // Data is already persisted per-operation. This is kept for interface compatibility.
        toast.success('데이터가 동기화되었습니다.');
    };

    // ============================================
    // Unified Alarm System
    // ============================================

    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        const ADVANCE_MINUTES = 10;

        // localStorage 기반 중복 방지 — 페이지 새로고침 후에도 당일 알람 재발동 없음
        const getAlarmKey = (event: CalendarEvent) =>
            `event-alerted-${event.id}-${format(new Date(event.start), 'yyyy-MM-dd')}`;

        const checkAlarms = () => {
            const now = new Date();
            events.forEach(event => {
                if (!event.start) return;
                const start = new Date(event.start);

                // 오늘 일정만 처리
                if (!isSameDay(start, now)) return;

                const minutesToStart = differenceInMinutes(start, now);
                // 이미 시작된 일정은 건너뜀
                if (minutesToStart < 0) return;

                const prep = event.prepTime || 0;
                const travel = event.travelTime || 0;
                // prep/travel이 있으면 그만큼 앞당기되, 최소 10분 전 보장
                const advanceMinutes = Math.max(prep + travel, ADVANCE_MINUTES);

                if (minutesToStart > advanceMinutes) return;

                // 이미 알람 발동된 이벤트는 건너뜀
                const alarmKey = getAlarmKey(event);
                if (localStorage.getItem(alarmKey)) return;

                const prepTravelParts: string[] = [];
                if (prep > 0) prepTravelParts.push(`준비 ${prep}분`);
                if (travel > 0) prepTravelParts.push(`이동 ${travel}분`);
                const prepTravelStr = prepTravelParts.length > 0
                    ? ` (${prepTravelParts.join(', ')})`
                    : '';
                const message = `${format(start, 'HH:mm')} 시작 ${advanceMinutes}분 전${prepTravelStr}입니다.`;

                if (Notification.permission === 'granted') {
                    new Notification(`[일정 알림] ${event.title}`, { body: message });
                }

                if (event.priority === 'high') {
                    toast.error(`⏰ 중요 일정 알림`, {
                        description: `'${event.title}' — ${message}`,
                        duration: 8000,
                        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' }
                    });
                } else {
                    toast.info(`📅 일정 알림`, {
                        description: `${event.title} — ${message}`,
                        duration: 6000,
                    });
                }

                localStorage.setItem(alarmKey, '1');
            });
        };

        const interval = setInterval(checkAlarms, 30000); // 30초마다 체크
        checkAlarms(); // 마운트 즉시 1회 실행
        return () => clearInterval(interval);
    }, [events]);

    return (
        <DataContext.Provider value={{
            tasks, setTasks, addTask, updateTask, deleteTask,
            projects, setProjects, addProject, updateProject, deleteProject,
            archiveDocuments, setArchiveDocuments, addDocument, updateDocument, deleteDocument,
            goals, setGoals, addGoal, updateGoal, deleteGoal,
            habits, setHabits, addHabit, updateHabit, deleteHabit,
            events, setEvents, addEvent, updateEvent, deleteEvent,
            journals, setJournals, addJournal, updateJournal, deleteJournal,
            memos, setMemos, addMemo, updateMemo, deleteMemo,
            people, setPeople, addPerson, updatePerson, deletePerson,
            scraps, setScraps, addScrap, updateScrap, deleteScrap,
            selectedWorkProjectId, setSelectedWorkProjectId,
            activeTaskId,
            taskTimer,
            toggleTaskTimer,
            customFieldDefinitions,
            addCustomFieldDefinition,
            updateCustomFieldDefinition,
            deleteCustomFieldDefinition,
            // Project Mgmt 2.0 Exports
            wikiPages, addWikiPage, updateWikiPage, deleteWikiPage,
            projectResources, addProjectResource, updateProjectResource, deleteProjectResource,
            projectRisks, addProjectRisk, updateProjectRisk, deleteProjectRisk,
            languageEntries, setLanguageEntries,
            addLanguageEntry, updateLanguageEntry, deleteLanguageEntry,
            languageResources, setLanguageResources,
            addLanguageResource, updateLanguageResource, deleteLanguageResource,
            books, setBooks, addBook, updateBook, deleteBook,
            exerciseSessions, setExerciseSessions,
            addExerciseSession, updateExerciseSession, deleteExerciseSession,
            dietEntries, setDietEntries, addDietEntry, updateDietEntry, deleteDietEntry,
            inBodyEntries, setInBodyEntries, addInBodyEntry, updateInBodyEntry, deleteInBodyEntry,
            hobbies, setHobbies, addHobby, updateHobby, deleteHobby,
            hobbyPosts, setHobbyPosts, addHobbyPost, updateHobbyPost, deleteHobbyPost,
            hobbyEntries, setHobbyEntries, addHobbyEntry, updateHobbyEntry, deleteHobbyEntry,
            transactions, setTransactions, addTransaction, updateTransaction, deleteTransaction,
            assets, setAssets, addAsset, updateAsset, deleteAsset,
            certificates, addCertificate, updateCertificate, deleteCertificate,
            portfolios, addPortfolio, updatePortfolio, deletePortfolio,
            realEstateScraps, setRealEstateScraps, addRealEstateScrap, updateRealEstateScrap, deleteRealEstateScrap,
            stockAnalyses, setStockAnalyses, addStockAnalysis, updateStockAnalysis, deleteStockAnalysis,
            portfolioHoldings, setPortfolioHoldings, addPortfolioHolding, updatePortfolioHolding, deletePortfolioHolding,
            workLogs, setWorkLogs, addWorkLog, updateWorkLog, deleteWorkLog,
            exerciseRoutines, setExerciseRoutines, addExerciseRoutine, updateExerciseRoutine, deleteExerciseRoutine,
            financeGoals, setFinanceGoals, addFinanceGoal, updateFinanceGoal, deleteFinanceGoal,
            monthlyBudgets, setMonthlyBudgets, updateMonthlyBudget,
            userProfile, updateUserProfile,
            educations, addEducation, updateEducation, deleteEducation,
            careers, setCareers, addCareer, updateCareer, deleteCareer,
            activities, setActivities, addActivity, updateActivity, deleteActivity,
            isSyncing,
            forceSync,
            bodyCompositionGoal,
            setBodyCompositionGoal: setBodyCompositionGoalAndSync,
            homeShortcuts,
            setHomeShortcuts: setHomeShortcutsAndSync,
            customFoods, setCustomFoods, addCustomFood, deleteCustomFood,
            customExercises,
            addCustomExercise: (ex: ExerciseDefinition) => { setCustomExercises(prev => [...prev, ex]); bg(() => insertRow('custom_exercises', ex)); },
            deleteCustomExercise: (id: string) => { setCustomExercises(prev => prev.filter(e => e.id !== id)); bg(() => dbDelete('custom_exercises', id)); },
            globalMemo,
            setGlobalMemo: setGlobalMemoAndSync,
        }}>
            {isAccountWithdrawn ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6 bg-card border rounded-lg shadow-lg text-center space-y-4">
                        <div className="flex justify-center text-destructive">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                        </div>
                        <h2 className="text-xl font-bold">계정이 비활성화되었습니다</h2>
                        <p className="text-muted-foreground">
                            회원님의 계정은 현재 <b>탈퇴 대기(철회 가능)</b> 상태입니다.<br />
                            데이터는 30일 후 완전히 삭제됩니다.
                        </p>
                        <div className="flex gap-2 justify-center pt-2">
                            <button
                                onClick={() => { signOut(); }}
                                className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-accent"
                            >
                                로그아웃
                            </button>
                            <button
                                onClick={restoreAccount}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                계정 복구하기
                            </button>
                        </div>
                    </div>
                </div>
            ) : children}
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
