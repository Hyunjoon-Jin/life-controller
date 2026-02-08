import { useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
    Task, Project, Goal, Habit, CalendarEvent, JournalEntry, Memo, Person, Scrap,
    LanguageEntry, Book, ExerciseSession, DietEntry, InBodyEntry, HobbyEntry,
    Transaction, Asset, Certificate, PortfolioItem, ArchiveDocument,
    UserProfile, Education, Career, BodyCompositionGoal, LanguageResource,
    Hobby, HobbyPost, Activity, RealEstateScrap, StockAnalysis, WorkLog, ExerciseRoutine,
    FinanceGoal, CustomFood, MonthlyBudget, ExerciseDefinition
} from '@/types';

type AppState = {
    tasks: Task[];
    projects: Project[];
    goals: Goal[];
    habits: Habit[];
    events: CalendarEvent[];
    journals: JournalEntry[];
    memos: Memo[];
    people: Person[];
    scraps: Scrap[];
    // ... add all other types
    languageEntries: LanguageEntry[];
    books: Book[];
    exerciseSessions: ExerciseSession[];
    dietEntries: DietEntry[];
    inBodyEntries: InBodyEntry[];
    hobbyEntries: HobbyEntry[];
    transactions: Transaction[];
    assets: Asset[];
    certificates: Certificate[];
    portfolios: PortfolioItem[];
    archiveDocuments: ArchiveDocument[];
    userProfile: UserProfile;
    educations: Education[];
    careers: Career[];
    bodyCompositionGoal?: BodyCompositionGoal;
    languageResources: LanguageResource[];
    hobbies: Hobby[];
    hobbyPosts: HobbyPost[];
    homeShortcuts: string[];
    activities: Activity[]; // New
    realEstateScraps: RealEstateScrap[];
    stockAnalyses: StockAnalysis[];
    workLogs: WorkLog[];
    exerciseRoutines: ExerciseRoutine[];
    financeGoals: FinanceGoal[];
    customFoods: CustomFood[];
    monthlyBudgets: MonthlyBudget[];
    customExercises: ExerciseDefinition[]; // Added
};

export function useCloudSync() {
    const { data: session } = useSession();
    const [isSyncing, setIsSyncing] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const saveData = useCallback(async (data: AppState) => {
        if (!session?.user) return;

        setIsSyncing(true);

        // Debounce
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch('/api/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data }),
                });

                if (!res.ok) throw new Error('Failed to sync');

                // console.log('Synced successfully');
            } catch (error) {
                console.error('Sync error:', error);
                toast.error('이 저장 실패 (네트워크 확인)');
            } finally {
                setIsSyncing(false);
            }
        }, 2000); // 2 second debounce
    }, [session?.user?.email]);

    const loadData = useCallback(async () => {
        if (!session?.user) return null;

        try {
            const res = await fetch('/api/sync');
            if (res.status === 404) return null; // No data yet
            if (!res.ok) throw new Error('Failed to load');

            const json = await res.json();
            return json.data as AppState;
        } catch (error) {
            console.error('Load error:', error);
            // toast.error('데이터 불러오기 실패');
            return null;
        }
    }, [session?.user?.email]);

    return { saveData, loadData, isSyncing };
}
