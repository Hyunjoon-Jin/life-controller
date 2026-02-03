export type Priority = 'high' | 'medium' | 'low';

export type Task = {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: Date;
    projectId?: string;
    priority: Priority;
    subTasks?: Task[];
    type?: string;        // New: Task Type (e.g. Work, Study)
    remarks?: string;     // New: Remarks/Notes
    deadline?: Date;      // New: Deadline
    // Fields for Gantt
    startDate?: Date;
    endDate?: Date;       // Can use valid deadline or this field
    dependencies?: string[]; // IDs of prerequisite tasks
    progress?: number;
    connectedGoalId?: string; // New: Linked Goal
    source?: 'timeline' | 'daily'; // New: To separate Daily vs Timeline tasks
};

export type ProjectStatus = 'preparation' | 'active' | 'completed' | 'hold';

// New OKR Types
export type KeyResult = {
    id: string;
    title: string;
    targetValue: number;
    currentValue: number;
    unit: string; // e.g., '%', 'users', 'krw'
    weight?: number; // Importance
};

export type Objective = {
    id: string;
    title: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    progress: number;
    keyResults: KeyResult[];
    status: 'on-track' | 'at-risk' | 'off-track' | 'completed';
};

export type Stakeholder = {
    id: string;
    name: string;
    role: string; // e.g., 'Designer', 'Client', 'Frontend Dev'
    contact?: string; // Email or Phone
    organization?: string; // Company / Dept
    notes?: string;
};

export type ProjectResource = {
    id: string;
    title: string;
    type: 'link' | 'file' | 'image' | 'figma' | 'github' | 'drive' | 'notion';
    url: string;
    description?: string;
    tags?: string[];
    createdAt: Date;
};

export type AutomationRule = {
    id: string;
    name: string;
    trigger: string; // e.g. 'task_completed', 'task_created_p1'
    action: string; // e.g. 'archive_task', 'set_due_today'
    isActive: boolean;
};

export type Project = {
    id: string;
    title: string;
    color: string;
    // New Fields for Advanced Management
    status?: ProjectStatus;
    manager?: string; // PM Name or ID
    members?: string[]; // List of names or IDs
    budget?: {
        total: number;
        spent: number;
    };
    startDate?: Date;
    endDate?: Date;
    parentId?: string; // For Hierarchy
    description?: string;
    progress?: number; // 0-100
    myRole?: string; // New: User's Role in this project
    okrs?: Objective[]; // New: OKR Integration
    stakeholders?: Stakeholder[]; // New: Team/Stakeholder Management
    resources?: ProjectResource[]; // New: Resource Library
    automationRules?: AutomationRule[]; // New: Automation
};

export type ArchiveDocument = {
    id: string;
    projectId: string;
    title: string;
    type: 'markdown' | 'link' | 'file';
    content: string; // Markdown text or URL
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
};

export type PlanType = 'long-term' | 'short-term' | 'habit' | 'project';
export type GoalCategory = 'financial' | 'health' | 'career' | 'growth' | 'language' | 'hobby' | 'other';

export type Goal = {
    id: string;
    title: string;
    progress: number;
    planType?: PlanType;
    category?: GoalCategory;
    deadline?: Date;
    memo?: string;
    subGoals?: Goal[];
};

export type Habit = {
    id: string;
    title: string;
    streak: number;
    completedDates: string[]; // ISO Date strings
    time?: string; // HH:mm
    endTime?: string; // HH:mm
    days?: number[]; // 0(Sun) - 6(Sat)
    startDate?: Date;
    endDate?: Date;
    skippedDates?: string[]; // ISO Date strings (specific recurrences to skip)
};

export type EventType = 'work' | 'personal' | 'study' | 'hobby' | 'health' | 'finance' | 'social' | 'travel' | 'meal' | 'vacation' | 'other';
export type EventPriority = 'high' | 'medium' | 'low';

export type JournalEntry = {
    id: string;
    date: Date;
    content: string;
    mood: string; // Emoji character
    images: string[]; // Base64 strings
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
};

export type CalendarEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    description?: string;
    color?: string;
    type?: EventType;
    priority?: EventPriority;
    isMeeting?: boolean;
    isAppointment?: boolean;
    isWorkLog?: boolean;  // New: Work Log Flag
    workDetails?: {       // New: Work Details
        status: string;   // e.g. 근무, 재택, 반차
        hours: string;    // e.g. 09:00 - 18:00 or 8h
    };
    connectedProjectId?: string; // New: Linked Project
    connectedGoalId?: string;    // New: Linked Goal
};

export type Memo = {
    id: string;
    title?: string;       // New: Memo Title
    content: string;
    color: string; // 'yellow', 'blue', 'pink', 'green', 'purple'
    tags?: string[];      // New: Tags
    attachments?: string[]; // New: Base64 images/videos
    createdAt: Date;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
};

export type RelationshipType = 'family' | 'friend' | 'work' | 'other';

export type Person = {
    id: string;
    name: string;
    relationship: RelationshipType;
    contact: string;
    email?: string;
    company?: string;      // New
    department?: string;   // New
    jobTitle?: string;     // New
    birthdate?: Date;
    notes?: string;
    tags?: string[];
    businessCardImage?: string; // Base64
    school?: string;       // New: Education
    major?: string;        // New: Major
    isMe?: boolean;        // New: Identify as Self
};

export type CalendarViewType = 'month' | 'week' | 'day';

export type Scrap = {
    id: string;
    title: string;
    url: string;
    memo?: string;
    image?: string; // OG Image URL
    tags?: string[]; // New: Tags
    createdAt: Date;
};

export type LanguageEntry = {
    id: string;
    language: string; // New: e.g. 'English', 'Japanese'
    date: Date;
    studyTime: number; // Minutes
    vocabulary: { word: string; meaning: string }[];
    memo?: string;
};

export type BookStatus = 'toread' | 'reading' | 'completed';

export interface Book {
    id: string;
    title: string;
    author: string;
    totalPages: number;
    currentPage: number;
    status: BookStatus;
    startDate?: Date;
    endDate?: Date;
    coverUrl?: string;
    link?: string;
    rating?: number; // 1-5
    review?: string;
    quotes?: { page: number; content: string }[];
    category?: string;
};

export type ExerciseCategory = 'weight' | 'cardio' | 'sport' | 'fitness';

export type ExerciseSession = {
    id: string;
    date: Date;
    type: string; // e.g., 'Weight', 'Cardio', 'Yoga'
    category?: ExerciseCategory; // New: Category classification
    duration: number; // Minutes
    // Specialized Fields
    distance?: number; // km (for Cardio)
    pace?: string;     // min/km (for Cardio)
    result?: string;   // Win/Loss/Score (for Sport - Text)
    score?: number;    // Numeric Score (for Bowling, Golf, Archery)
    count?: number;    // Count/Laps (for Swimming, Rope Jump)
    targetPart?: string; // Target Muscle (for Weight)

    sets?: { // For Weightr;
        id: string;
        setNumber: number;
        weight: number;
        reps: number;
        completed: boolean;
    }[];
    intensity?: 'low' | 'medium' | 'high';
    memo?: string;
};

export type DietItem = {
    id: string;
    name: string;
    calories: number;
    macros: {
        carbs: number;
        protein: number;
        fat: number;
    };
};

export type DietEntry = {
    id: string;
    date: Date;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    items: DietItem[]; // Changed from single menu
    // Flattened totals for easier access
    totalCalories: number;
    totalMacros: {
        carbs: number;
        protein: number;
        fat: number;
    };
    image?: string; // Base64 or URL
    memo?: string;
};

export type InBodyEntry = {
    id: string;
    date: Date;
    weight: number;          // kg
    skeletalMuscleMass: number; // kg
    bodyFatMass: number;     // kg
    bodyFatPercent?: number;  // %
    bmi?: number;
    memo?: string;
};

export type HobbyEntry = {
    id: string;
    date: Date;
    activity: string;
    duration?: number; // Minutes
    content?: string;
    image?: string; // Base64
    tags?: string[];
    // New Fields
    category?: string; // e.g., 'music', 'art', 'sport', 'game', 'cooking', 'other'
    satisfaction?: number; // 1-5
    link?: string; // URL
};

export type Transaction = {
    id: string;
    date: Date;
    type: 'income' | 'expense' | 'transfer';
    category: string; // e.g., Food, Transport, Salary
    amount: number;
    description: string;
    assetId?: string; // Linked account
    tags?: string[]; // New: Tags
};

export type Asset = {
    id: string;
    name: string;
    type: 'bank' | 'cash' | 'stock' | 'real_estate' | 'crypto' | 'loan' | 'credit_card';
    balance: number;
    currency: string;
    color?: string; // For chart
    // New Fields
    accountNumber?: string;
    interestRate?: number; // %
    memo?: string;
};

export type Certificate = {
    id: string;
    name: string;
    issuer: string; // 발급 기관
    date: Date; // 취득일
    expiryDate?: Date; // 만료일
    score?: string; // 점수/등급 (e.g. 900, Level 6, 1급)
    status: 'studying' | 'acquired' | 'expired';
    memo?: string;
};

export type PortfolioItem = {
    id: string;
    title: string;
    period: string; // e.g. "2023.01 - 2023.06"
    role?: string;
    description: string; // 상세 설명
    techStack?: string[]; // 사용 기술
    links?: { label: string; url: string }[]; // 관련 링크 (GitHub, Demo)
    images?: string[]; // 스크린샷 (Base64)
    thumbnail?: string; // 썸네일
};

export type UserProfile = {
    id: string;
    name: string;
    englishName?: string;
    jobTitle: string; // e.g. "Frontend Developer"
    email: string;
    phone: string;
    address?: string; // location
    bio: string; // Markdown supported
    photo?: string; // Base64
    socialLinks?: { platform: string; url: string }[];
};

export type Education = {
    id: string;
    school: string;
    degree: string;
    major: string; // 전공
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean; // 재학 중
    gpa?: string; // 학점
    description?: string;
};

export type Career = {
    id: string;
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean; // 재직 중
    description?: string; // 상세 업무
    team?: string; // 소속 팀
    techStack?: string[];
};
