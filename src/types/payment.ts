export type PlanTier = 'basic' | 'pro' | 'team';
export type BillingCycle = 'monthly' | 'yearly';
export type PaymentStatus = 'DONE' | 'CANCELED' | 'ABORTED' | 'WAITING_FOR_DEPOSIT' | 'PARTIAL_CANCELED';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete';

export interface Plan {
    id: PlanTier;
    name: string;
    description: string;
    price: {
        monthly: number;
        yearly: number;
    };
    features: string[];
    isPopular?: boolean;
}

export interface Subscription {
    id: string; // UUID
    userId: string; // UUID
    planId: PlanTier;
    status: SubscriptionStatus;
    billingCycle: BillingCycle;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    canceledAt?: Date;
    paymentKey?: string; // Toss Payment Key for recurring billing
    customerKey?: string; // Toss Customer Key
}

export interface PaymentTransaction {
    id: string; // UUID
    orderId: string;
    paymentKey: string;
    amount: number;
    status: PaymentStatus;
    method: string; // 'CARD', 'VIRTUAL_ACCOUNT', etc.
    requestedAt: Date;
    approvedAt?: Date;
    receiptUrl?: string; // Toss Receipt URL
    userId: string;
}

export const PLANS: Plan[] = [
    {
        id: 'basic',
        name: 'Basic',
        description: '개인 생산성 관리를 위한 기본 기능',
        price: {
            monthly: 0,
            yearly: 0,
        },
        features: [
            '일정 및 할일 관리',
            '기본 습관 추적 (3개)',
            '목표 설정 (1개)',
            '기본 대시보드'
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        description: '더 많은 성취를 원하는 분들을 위해',
        price: {
            monthly: 5900,
            yearly: 59000, // 2 months free
        },
        features: [
            'Basic의 모든 기능',
            '무제한 습관 및 목표',
            '고급 통계 및 리포트',
            'AI 회고 및 제안',
            '구글 캘린더 양방향 동기화'
        ],
        isPopular: true,
    },
    {
        id: 'team',
        name: 'Team',
        description: '팀 협업과 프로젝트 관리를 위해',
        price: {
            monthly: 12900,
            yearly: 129000,
        },
        features: [
            'Pro의 모든 기능',
            '팀 프로젝트 워크스페이스',
            '팀원 일정 공유',
            '간트 차트 및 리소스 관리',
            '우선 순위 기술 지원'
        ]
    }
];
