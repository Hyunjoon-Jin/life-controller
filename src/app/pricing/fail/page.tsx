'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

function PricingFailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const message = searchParams.get('message') || '결제 진행 중 오류가 발생했습니다.';
    const code = searchParams.get('code');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center border border-gray-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">결제 실패</h1>
                <p className="text-slate-500 mb-8 break-keep">
                    {message}
                    {code && <span className="block text-xs mt-2 text-slate-400">(코드: {code})</span>}
                </p>

                <div className="flex gap-3">
                    <Button
                        onClick={() => router.push('/pricing')}
                        variant="outline"
                        className="flex-1"
                    >
                        다시 시도
                    </Button>
                    <Button
                        onClick={() => router.push('/')}
                        className="flex-1"
                    >
                        홈으로
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function PricingFailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PricingFailContent />
        </Suspense>
    );
}
