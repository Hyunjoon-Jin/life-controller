'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataProvider';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { userProfile } = useData();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!userProfile?.id) return; // Wait for profile load

        if (userProfile.role !== 'admin') {
            alert('관리자 권한이 필요합니다.');
            router.replace('/');
        } else {
            setIsAuthorized(true);
        }
    }, [userProfile, router]);

    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <h1 className="text-3xl font-bold mb-8">🛠️ Admin Dashboard</h1>
            {children}
        </div>
    );
}
