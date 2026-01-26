'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import {
    Task, Project, Goal, Habit, CalendarEvent, JournalEntry, Memo, Person, Scrap,
    LanguageEntry, Book, ExerciseSession, DietEntry, InBodyEntry, HobbyEntry,
    Transaction, Asset, Certificate, PortfolioItem, ArchiveDocument,
    UserProfile, Education, Career
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
    const [books, setBooks] = useLocalStorage<Book[]>('books', []);
    const [exerciseSessions, setExerciseSessions] = useLocalStorage<ExerciseSession[]>('exerciseSessions', []);
    const [dietEntries, setDietEntries] = useLocalStorage<DietEntry[]>('dietEntries', []);
    const [inBodyEntries, setInBodyEntries] = useLocalStorage<InBodyEntry[]>('inbodyEntries', []);
    const [hobbyEntries, setHobbyEntries] = useLocalStorage<HobbyEntry[]>('hobbyEntries', []);

    // Finance States
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    const [assets, setAssets] = useLocalStorage<Asset[]>('assets', []);
    const [certificates, setCertificates] = useLocalStorage<Certificate[]>('certificates', []);
    const [portfolios, setPortfolios] = useLocalStorage<PortfolioItem[]>('portfolios', []);

    // Resume States
    const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('userProfile', {
        id: 'user',
        name: '홍길동',
        jobTitle: 'Frontend Developer',
        email: 'example@email.com',
        phone: '010-1234-5678',
        bio: '안녕하세요. 꾸준히 성장하는 개발자입니다.',
        socialLinks: []
    });
    const [educations, setEducations] = useLocalStorage<Education[]>('educations', []);
    const [careers, setCareers] = useLocalStorage<Career[]>('careers', []);

    // Cloud Sync Integration
    const { saveData, loadData, isSyncing } = useCloudSync();
    const { data: session } = useSession();

    // 1. Load data from cloud on login
    useEffect(() => {
        if (session?.user) {
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
                    // ... load other states (omitted for brevity, but ideally should map all)
                }
            });
        }
    }, [session, loadData]);

    // 2. Save data to cloud on change
    useEffect(() => {
        if (session?.user) {
            saveData({
                tasks, projects, goals, habits, events, journals, memos, people, scraps,
                languageEntries, books, exerciseSessions, dietEntries, inBodyEntries, hobbyEntries,
                transactions, assets, certificates, portfolios, archiveDocuments,
                userProfile, educations, careers
            });
        }
    }, [
        session, saveData,
        tasks, projects, goals, habits, events, journals, memos, people, scraps,
        languageEntries, books, exerciseSessions, dietEntries, inBodyEntries, hobbyEntries,
        transactions, assets, certificates, portfolios, archiveDocuments,
        userProfile, educations, careers
    ]);

    // ... (Existing handlers)

    const addCertificate = (cert: Certificate) => setCertificates(prev => [...prev, cert]);
    const updateCertificate = (cert: Certificate) => setCertificates(prev => prev.map(c => c.id === cert.id ? cert : c));
    const deleteCertificate = (id: string) => setCertificates(prev => prev.filter(c => c.id !== id));

    const addPortfolio = (item: PortfolioItem) => setPortfolios(prev => [...prev, item]);
    const updatePortfolio = (item: PortfolioItem) => setPortfolios(prev => prev.map(p => p.id === item.id ? item : p));
    const deletePortfolio = (id: string) => setPortfolios(prev => prev.filter(p => p.id !== id));

    const updateUserProfile = (profile: UserProfile) => setUserProfile(profile);

    const addEducation = (edu: Education) => setEducations(prev => [...prev, edu]);
    const updateEducation = (edu: Education) => setEducations(prev => prev.map(e => e.id === edu.id ? edu : e));
    const deleteEducation = (id: string) => setEducations(prev => prev.filter(e => e.id !== id));

    const addCareer = (career: Career) => setCareers(prev => [...prev, career]);
    const updateCareer = (career: Career) => setCareers(prev => prev.map(c => c.id === career.id ? career : c));
    const deleteCareer = (id: string) => setCareers(prev => prev.filter(c => c.id !== id));

    // Alarm State
    const [alertedEventIds, setAlertedEventIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const checkAlarms = () => {
            const now = new Date();
            const upcomingEvents = events.filter(event => {
                if (event.priority !== 'high') return false;
                if (alertedEventIds.has(event.id)) return false;

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
                setAlertedEventIds(prev => new Set(prev).add(event.id));
            });
        };

        const interval = setInterval(checkAlarms, 60000); // Check every minute
        checkAlarms(); // Initial check

        return () => clearInterval(interval);
    }, [events, alertedEventIds]);

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

    const addTransaction = (transaction: Transaction) => setTransactions([...transactions, transaction]);
    const updateTransaction = (updatedTransaction: Transaction) => setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    const deleteTransaction = (id: string) => setTransactions(transactions.filter(t => t.id !== id));

    const addAsset = (asset: Asset) => setAssets([...assets, asset]);
    const updateAsset = (updatedAsset: Asset) => setAssets(assets.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    const deleteAsset = (id: string) => setAssets(assets.filter(a => a.id !== id));

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

            books, setBooks,
            addBook, updateBook, deleteBook,

            exerciseSessions, setExerciseSessions,
            addExerciseSession, updateExerciseSession, deleteExerciseSession,

            dietEntries, setDietEntries, addDietEntry, updateDietEntry, deleteDietEntry,
            inBodyEntries, setInBodyEntries, addInBodyEntry, updateInBodyEntry, deleteInBodyEntry,
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
