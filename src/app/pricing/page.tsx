import { PricingSection } from '@/components/payment/PricingSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Simple Header */}
            <div className="container mx-auto px-4 py-6">
                <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    홈으로 돌아가기
                </Link>
            </div>

            <PricingSection />
        </main>
    );
}
