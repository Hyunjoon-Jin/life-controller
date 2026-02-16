'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/SessionProvider';

interface AdBannerProps {
    dataAdSlot: string;
    dataAdFormat?: 'auto' | 'fluid' | 'rectangle';
    dataFullWidthResponsive?: boolean;
    className?: string;
}

export function AdBanner({
    dataAdSlot,
    dataAdFormat = 'auto',
    dataFullWidthResponsive = true,
    className
}: AdBannerProps) {
    const { user } = useAuth();
    // Use local state to handle hydration mismatch if needed, 
    // but here we just want to return null/placeholder asap.

    // 1. Pro User Check: Return null immediately
    if ((user as any)?.plan === 'pro') {
        return null;
    }

    // 2. Development Mode: Show Placeholder
    if (process.env.NODE_ENV === 'development') {
        return (
            <div className={`bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500 rounded-lg p-4 ${className}`} style={{ minHeight: '250px' }}>
                Google AdSense<br />
                Slot: {dataAdSlot}<br />
                (Visible only in Production)
            </div>
        );
    }

    // 3. Production Mode: Render AdSense Ins Tag
    return (
        <div className={className}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}
                data-ad-slot={dataAdSlot}
                data-ad-format={dataAdFormat}
                data-full-width-responsive={dataFullWidthResponsive.toString()}
            />
            {/* Logic to push the ad */}
            <AdPush />
        </div>
    );
}

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

// Separate component for the effect to keep main component clean
function AdPush() {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense push error:', err);
        }
    }, []);

    return null;
}
