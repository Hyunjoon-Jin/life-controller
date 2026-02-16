'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function usePullToRefresh() {
    const router = useRouter();
    const [startY, setStartY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            if (window.scrollY === 0) {
                setStartY(e.touches[0].clientY);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            const y = e.touches[0].clientY;
            if (startY > 0 && y > startY + 150 && window.scrollY === 0 && !refreshing) {
                setRefreshing(true);
                router.refresh();
                setTimeout(() => setRefreshing(false), 1000);
            }
        };

        const handleTouchEnd = () => {
            setStartY(0);
        };

        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [startY, refreshing, router]);

    return refreshing;
}
