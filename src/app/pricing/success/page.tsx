'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function PricingSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    // Params from Toss
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    // Params passed from our frontend
    const planId = searchParams.get('planId');
    const billingCycle = searchParams.get('billingCycle');

    useEffect(() => {
        if (!paymentKey || !orderId || !amount || !planId) {
            setStatus('error');
            return;
        }

        const confirm = async () => {
            try {
                const response = await fetch('/api/payments/confirm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentKey,
                        orderId,
                        amount: Number(amount),
                        planId,
                        billingCycle
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Payment confirmation failed');
                }

                setStatus('success');
                toast.success("결제가 성공적으로 완료되었습니다!");
            } catch (error: any) {
                console.error("Confirmation Error", error);
                toast.error(error.message || "결제 승인 중 오류가 발생했습니다.");
                router.push(`/pricing/fail?message=${encodeURIComponent(error.message)}`);
            }
        };

        confirm();
    }, [paymentKey, orderId, amount, planId, billingCycle, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <h2 className="text-xl font-bold text-slate-900">결제 승인 중입니다...</h2>
                <p className="text-slate-500 mt-2">잠시만 기다려주세요.</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center border border-gray-100">
                    <h2 className="text-xl font-bold text-red-600 mb-2">오류 발생</h2>
                    <p className="text-slate-600 mb-6">필수 결제 정보다 누락되었습니다.</p>
                    <Button onClick={() => router.push('/pricing')}>돌아가기</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center border border-gray-100">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">결제 완료!</h1>
                <p className="text-slate-500 mb-8">
                    구독이 성공적으로 시작되었습니다.<br />
                    이제 모든 기능을 자유롭게 이용해보세요.
                </p>

                <div className="flex gap-3">
                    <Button
                        onClick={() => router.push('/')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        대시보드로 이동
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function PricingSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PricingSuccessContent />
        </Suspense>
    );
}
