'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import {
    Task, Project, Goal, Habit, CalendarEvent, JournalEntry, Memo, Person, Scrap,
    LanguageEntry, Book, ExerciseSession, DietEntry, InBodyEntry, HobbyEntry,
    Transaction, Asset, Certificate, PortfolioItem, ArchiveDocument,
    UserProfile, Education, Career, BodyCompositionGoal, LanguageResource,
    Hobby, HobbyPost // New Hobby Types
} from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { differenceInMinutes, isSameDay } from 'date-fns';

interface DataContextType {
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
    addCareer: (career: Career) => void;
    updateCareer: (career: Career) => void;
    deleteCareer: (id: string) => void;
    // Sync
    isSyncing: boolean;
    forceSync: () => Promise<void>;

    // New: Body Composition Goal
    bodyCompositionGoal?: BodyCompositionGoal;
    setBodyCompositionGoal: (goal: BodyCompositionGoal) => void;
}


const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', [
        { id: '1', title: 'Design Database Schema', completed: false, priority: 'high', projectId: '2' },
        { id: '2', title: 'Buy Groceries', completed: true, priority: 'low', projectId: '1' },
    ]);
    const [projects, setProjects] = useLocalStorage<Project[]>('projects', [
        { id: '1', title: 'Personal Life', color: '#3b82f6', status: 'active', manager: 'Me', budget: { total: 0, spent: 0 }, startDate: new Date(), progress: 0 },
        { id: '2', title: 'Work Project', color: '#10b981', status: 'active', manager: 'Manager', budget: { total: 1000000, spent: 250000 }, startDate: new Date(), progress: 25 }
    ]);
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

    // Body Composition Goal State
    const [bodyCompositionGoal, setBodyCompositionGoal] = useLocalStorage<BodyCompositionGoal>('bodyCompositionGoal', {
        targetDate: new Date()
    });

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

                    // Hobby Revamp
                    if (data.hobbies) setHobbies(data.hobbies);
                    if (data.hobbyPosts) setHobbyPosts(data.hobbyPosts);
                    if (data.transactions) setTransactions(data.transactions);
                    if (data.assets) setAssets(data.assets);
                    if (data.certificates) setCertificates(data.certificates);
                    if (data.portfolios) setPortfolios(data.portfolios);
                    if (data.archiveDocuments) setArchiveDocuments(data.archiveDocuments);
                    if (data.educations) setEducations(data.educations);
                    if (data.careers) setCareers(data.careers);
                    if (data.bodyCompositionGoal) setBodyCompositionGoal(data.bodyCompositionGoal);
                }
                setIsLoadedFromCloud(true);
            });
        }
    }, [session?.user?.email, loadData]);

    // 2. Save data to cloud on change
    useEffect(() => {
        if (session?.user && isLoadedFromCloud) {
            saveData({
                tasks, projects, goals, habits, events, journals, memos, people, scraps,
                languageEntries, languageResources, books, exerciseSessions, dietEntries, inBodyEntries, hobbyEntries,
                hobbies, hobbyPosts,
                transactions, assets, certificates, portfolios, archiveDocuments,
                userProfile, educations, careers, bodyCompositionGoal
            });
        }
    }, [
        session?.user, isLoadedFromCloud, saveData,
        tasks, projects, goals, habits, events, journals, memos, people, scraps,
        languageEntries, languageResources, books, exerciseSessions, dietEntries, inBodyEntries, hobbyEntries,
        hobbies, hobbyPosts,
        transactions, assets, certificates, portfolios, archiveDocuments,
        userProfile, educations, careers, bodyCompositionGoal
    ]);

    const forceSync = async () => {
        if (session?.user) {
            await saveData({
                tasks, projects, goals, habits, events, journals, memos, people, scraps,
                languageEntries, languageResources, books, exerciseSessions, dietEntries, inBodyEntries, hobbyEntries,
                hobbies, hobbyPosts,
                transactions, assets, certificates, portfolios, archiveDocuments,
                userProfile, educations, careers, bodyCompositionGoal
            });
        }
    };

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

    const addHabit = (habit: Habit) => setHabits([...habits, habit]);
    const updateHabit = (updatedHabit: Habit) => setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
    const deleteHabit = (id: string) => setHabits(habits.filter(h => h.id !== id));

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

    const addExerciseSession = (session: ExerciseSession) => setExerciseSessions([...exerciseSessions, session]);
    const updateExerciseSession = (updatedSession: ExerciseSession) => setExerciseSessions(exerciseSessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    const deleteExerciseSession = (id: string) => setExerciseSessions(exerciseSessions.filter(s => s.id !== id));

    const addDietEntry = (entry: DietEntry) => setDietEntries([...dietEntries, entry]);
    const updateDietEntry = (updatedEntry: DietEntry) => setDietEntries(dietEntries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    const deleteDietEntry = (id: string) => setDietEntries(dietEntries.filter(e => e.id !== id));

    const addInBodyEntry = (entry: InBodyEntry) => setInBodyEntries([...inBodyEntries, entry]);
    const updateInBodyEntry = (updatedEntry: InBodyEntry) => setInBodyEntries(inBodyEntries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    const deleteInBodyEntry = (id: string) => setInBodyEntries(inBodyEntries.filter(e => e.id !== id));

    const addHobbyEntry = (entry: HobbyEntry) => setHobbyEntries([...hobbyEntries, entry]);
    const updateHobbyEntry = (updatedEntry: HobbyEntry) => setHobbyEntries(hobbyEntries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    const deleteHobbyEntry = (id: string) => setHobbyEntries(hobbyEntries.filter(e => e.id !== id));

    // New Hobby Functions
    const addHobby = (hobby: Hobby) => setHobbies([...hobbies, hobby]);
    const updateHobby = (updatedHobby: Hobby) => setHobbies(hobbies.map(h => h.id === updatedHobby.id ? updatedHobby : h));
    const deleteHobby = (id: string) => {
        setHobbies(hobbies.filter(h => h.id !== id));
        // Also delete posts? Maybe, or keep them orphaned? Let's keep them logic simple for now.
        // Or filter posts that belong to this hobby? user might want to keep data. 
        // Let's just delete the hobby container for now.
    };

    const addHobbyPost = (post: HobbyPost) => setHobbyPosts([...hobbyPosts, post]);
    const updateHobbyPost = (updatedPost: HobbyPost) => setHobbyPosts(hobbyPosts.map(p => p.id === updatedPost.id ? updatedPost : p));
    const deleteHobbyPost = (id: string) => setHobbyPosts(hobbyPosts.filter(p => p.id !== id));

    const addTransaction = (transaction: Transaction) => setTransactions([...transactions, transaction]);
    const updateTransaction = (updatedTransaction: Transaction) => setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    const deleteTransaction = (id: string) => setTransactions(transactions.filter(t => t.id !== id));

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

    // Alarm State
    const alertedEventIdsRef = React.useRef<Set<string>>(new Set());

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
            userProfile,
            updateUserProfile,
            educations,
            addEducation,
            updateEducation,
            deleteEducation,
            careers,
            addCareer,
            updateCareer,
            deleteCareer,
            isSyncing,
            forceSync,
            bodyCompositionGoal,
            setBodyCompositionGoal
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
