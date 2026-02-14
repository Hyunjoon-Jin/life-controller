'use client';

import { useState } from 'react';
import { PLANS, PlanTier, BillingCycle } from '@/types/payment';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { useAuth } from '@/components/auth/SessionProvider';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

export function PricingSection() {
    const { user } = useAuth();
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    const [loadingPlan, setLoadingPlan] = useState<PlanTier | null>(null);

    const handleSubscribe = async (planId: PlanTier) => {
        if (!user) {
            toast.error("로그인이 필요합니다.");
            return;
        }

        const plan = PLANS.find(p => p.id === planId);
        if (!plan) return;

        // 무료 플랜 처리 (Basic)
        if (plan.price.monthly === 0) {
            toast.info("무료 플랜은 별도의 결제 없이 이용 가능합니다.");
            return;
        }

        setLoadingPlan(planId);

        try {
            const tossPayments = await loadTossPayments(clientKey);

            const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
            const orderId = nanoid();
            const orderName = `${plan.name} ${billingCycle === 'monthly' ? '월간' : '연간'} 구독`;

            await tossPayments.requestPayment('카드', {
                amount: price,
                orderId: orderId,
                orderName: orderName,
                successUrl: `${window.location.origin}/pricing/success?planId=${planId}&billingCycle=${billingCycle}`,
                failUrl: `${window.location.origin}/pricing/fail`,
                customerName: user.user_metadata?.name || user.user_metadata?.full_name || '고객',
                customerEmail: user.email || undefined,
            });
        } catch (error: any) {
            console.error("Payment Error", error);
            if (error.code === 'USER_CANCEL') {
                // User canceled
            } else {
                toast.error("결제 요청 중 오류가 발생했습니다.");
            }
        } finally {
            setLoadingPlan(null);
        }
    }

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                        당신의 <span className="text-blue-600">성장</span>을 위한 최적의 플랜
                    </h2>
                    <p className="text-lg text-slate-600 mb-10">
                        단순한 기록을 넘어, 데이터를 통해 나를 발견하고 성장하세요.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={cn("text-sm font-medium transition-colors", billingCycle === 'monthly' ? "text-slate-900" : "text-slate-400")}>
                            월간 결제
                        </span>
                        <button
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-14 h-8 bg-slate-900 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                        >
                            <div className={cn(
                                "absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm",
                                billingCycle === 'yearly' ? "translate-x-6" : "translate-x-0"
                            )} />
                        </button>
                        <span className={cn("text-sm font-medium transition-colors", billingCycle === 'yearly' ? "text-slate-900" : "text-slate-400")}>
                            연간 결제 <span className="text-blue-600 text-xs font-bold ml-1">(2개월 무료)</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {PLANS.map((plan) => {
                        const isPopular = plan.isPopular;
                        const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;

                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    "relative rounded-3xl p-8 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white",
                                    isPopular
                                        ? "border-blue-200 shadow-lg ring-1 ring-blue-100"
                                        : "border-gray-200 shadow-sm"
                                )}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{plan.name}</h3>
                                    <p className="text-sm text-slate-500 min-h-[40px]">{plan.description}</p>
                                </div>

                                <div className="mb-8 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-slate-900">
                                        {price.toLocaleString()}원
                                    </span>
                                    <span className="text-slate-500 font-medium">
                                        /{billingCycle === 'monthly' ? '월' : '년'}
                                    </span>
                                </div>

                                <Button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={loadingPlan === plan.id}
                                    variant={isPopular ? 'default' : 'outline'}
                                    className={cn(
                                        "w-full h-12 rounded-xl text-base font-bold mb-8 transition-all",
                                        isPopular
                                            ? "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    {loadingPlan === plan.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "비즈니스 시작하기"
                                    )}
                                </Button>

                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Features</p>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                                    isPopular ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    <Check className="w-3 h-3 stroke-[3]" />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
