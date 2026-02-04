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
    category?: string; // New: Task category (e.g. Work, Study)
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
    isArchived?: boolean; // New: Archive flag
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
    title?: string;
    content: string;
    color: string;
    tags?: string[];
    attachments?: string[];
    createdAt: Date;
    connectedProjectId?: string; // New: Linked Project
    connectedGoalId?: string;    // New: Linked Goal
    isFavorite?: boolean;        // New: Pin/Favorite
    width?: number;
    height?: number;
    x?: number;
    y?: number;
};

export type RelationshipType = 'family' | 'friend' | 'work' | 'other';

export type InteractionLog = {
    id: string;
    date: Date;
    type: 'call' | 'meeting' | 'email' | 'event' | 'other';
    content: string;
};

export type Person = {
    id: string;
    name: string;
    relationship: RelationshipType;
    contact: string;
    email?: string;
    company?: string;
    department?: string;
    jobTitle?: string;
    birthdate?: Date;
    notes?: string;
    tags?: string[];
    businessCardImage?: string;
    school?: string;
    major?: string;
    industry?: string;       // New: Industry category
    group?: string;          // New: Custom Grouping
    isMe?: boolean;
    interactions?: InteractionLog[]; // New: CRM Interaction Logs
    role?: string; // Alias for jobTitle
    phone?: string; // Alias for contact
    avatar?: string; // Alias for photo
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

export type ExerciseRoutine = {
    id: string;
    name: string;
    category: ExerciseCategory;
    items: {
        type: string;
        sets?: {
            weight: number;
            reps: number;
        }[];
        duration?: number;
        distance?: number;
    }[];
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
    height?: number;         // cm (New)
    weight: number;          // kg
    skeletalMuscleMass: number; // kg
    bodyFatMass: number;     // kg
    bodyFatPercent?: number;  // %
    bmi?: number;
    basalMetabolicRate?: number; // kcal (New)
    visceralFatLevel?: number; // Level (New)
    memo?: string;
};

// New Hobby System
export type Hobby = {
    id: string;
    title: string; // e.g., "Film Photography", "Baking"
    description?: string;
    coverImage?: string; // Base64 or URL
    startDate: Date;
    tags?: string[];
};

export type HobbyPost = {
    id: string;
    hobbyId: string;
    title: string;
    content: string; // Markdown support
    date: Date;
    images?: string[];
    tags?: string[];
    link?: string;
};

// Deprecated (Keep for data migration if needed, or remove if safe)
export type HobbyEntry = {
    id: string;
    date: Date;
    activity: string;
    duration?: number;
    content?: string;
    category?: string;
    satisfaction?: number;
    link?: string;
    tags?: string[];
};

export type BodyCompositionGoal = {
    targetWeight?: number;
    targetMuscle?: number;
    targetFatPercent?: number;
    targetDate: Date;
    startWeight?: number; // To calculate progress
    startDate?: Date; // To calculate daily adjustment
};

export type Transaction = {
    id: string;
    date: Date;
    type: 'income' | 'expense' | 'transfer' | 'investment' | 'saving' | 'repayment' | 'card_bill'; // Added repayment and card_bill
    category: string;
    amount: number;
    description: string;
    assetId?: string; // Linked account
    targetAssetId?: string; // For transfer/investment/saving target
    cardId?: string; // New: For tracking which card was used for expense
    tags?: string[];
};

export type Asset = {
    id: string;
    name: string;
    type: 'bank' | 'cash' | 'stock' | 'real_estate' | 'crypto' | 'loan' | 'credit_card';
    balance: number;
    currency: string;
    color?: string;
    accountNumber?: string;
    interestRate?: number;
    memo?: string;
    // New fields for Credit Card / Loan
    limit?: number; // For Credit Card
    billingDate?: number; // Billing cycle date
    repaymentDate?: Date; // For Loan
    linkedAssetId?: string; // Settlement account for Card
};

export type Certificate = {
    id: string;
    name: string;
    issuer: string;
    date: Date; // acquiredDate
    expiryDate?: Date;
    score?: string;
    credentialId?: string; // New: License Number
    fileUrl?: string; // New: Attachment
    status: 'studying' | 'acquired' | 'expired';
    memo?: string;
};

export type CareerProject = {
    title: string;
    description: string;
    role?: string;
    period?: string;
    techStack?: string[];
};

export type Career = {
    id: string;
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean;
    description?: string; // Detailed job description
    team?: string;
    techStack?: string[];
    projects?: CareerProject[]; // New: Detailed projects
    files?: { name: string; url: string }[]; // New: Proof/Portfolio files
};

// New Finance Tabs
export type RealEstateScrap = {
    id: string;
    title: string;
    location: string;
    price?: string;
    url: string;
    scrapedAt: Date;
    memo?: string;
    images?: string[];
};

export type StockAnalysis = {
    id: string;
    symbol: string;
    name: string;
    analysisDate: Date;
    rating: 'buy' | 'hold' | 'sell';
    targetPrice?: number;
    content: string; // Markdown analysis
    tags?: string[];
};

export type WorkLog = {
    id: string;
    date: Date;
    startTime: Date;
    endTime?: Date;
    breakTime?: number; // Minutes
    notes?: string;
};

export type ActivityType = 'club' | 'external' | 'award' | 'overseas' | 'volunteering' | 'other';

export type Activity = {
    id: string;
    type: ActivityType;
    title: string;
    organization?: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
    role?: string; // e.g. President, Member
    files?: { name: string; url: string }[];
};

export type PortfolioItem = {
    id: string;
    title: string;
    period: string;
    role?: string;
    description: string;
    techStack?: string[];
    links?: { label: string; url: string }[];
    images?: string[];
    thumbnail?: string;
};

export type UserProfile = {
    id: string;
    name: string;
    englishName?: string;
    jobTitle: string;
    email: string;
    phone: string;
    address?: string;
    bio: string;
    photo?: string;
    socialLinks?: { platform: string; url: string }[];
};

export type Education = {
    id: string;
    school: string;
    degree: string;
    major: string;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean; // Enrolled
    gpa?: string;
    description?: string;
    files?: { name: string; url: string }[]; // New: Transcript etc
};

export type LanguageResource = {
    id: string;
    title: string;
    type: 'video' | 'article' | 'lecture' | 'book' | 'other';
    url: string;
    thumbnail?: string;
    category: string;
    language: string;
    status: 'tostudy' | 'studying' | 'completed';
    isRecommended?: boolean;
    tags?: string[];
    createdAt: Date;
    memo?: string;
};
