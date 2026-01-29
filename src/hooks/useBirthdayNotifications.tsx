'use client';

import { useEffect, useRef } from 'react';
import { useData } from '@/context/DataProvider';
import { toast } from 'sonner';
import { Gift } from 'lucide-react';

export function useBirthdayNotifications() {
    const { people } = useData();
    const notifiedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const checkBirthdays = () => {
            const now = new Date();
            const currentHour = now.getHours();

            // Wait until 9 AM
            if (currentHour < 9) return;

            const todayMonth = now.getMonth();
            const todayDate = now.getDate();
            const dateString = now.toDateString(); // e.g. "Mon Jan 01 2024"

            // Check if we already notified for today globally (simple session/ref check)
            // Ideally we use localStorage to prevent spam on refresh, but per component mount is safer for now if user closes/reopens
            // Let's use localStorage for persistence across reloads today
            const notifiedKey = `birthday-notified-${dateString}`;
            const notifiedIds = JSON.parse(localStorage.getItem(notifiedKey) || '[]');

            people.forEach(person => {
                if (!person.birthdate) return;

                const birthDate = new Date(person.birthdate);
                if (birthDate.getMonth() === todayMonth && birthDate.getDate() === todayDate) {
                    if (!notifiedIds.includes(person.id)) {
                        // Trigger Notification
                        toast(`🎉 오늘은 ${person.name}님의 생일입니다!`, {
                            description: "축하 메시지를 보내보세요!",
                            icon: <Gift className="w-5 h-5 text-pink-500" />,
                            duration: 10000, // Show for 10 seconds
                            action: {
                                label: '연락하기',
                                onClick: () => window.location.href = `tel:${person.contact}`
                            }
                        });

                        // Mark as notified
                        notifiedIds.push(person.id);
                        localStorage.setItem(notifiedKey, JSON.stringify(notifiedIds));
                    }
                }
            });
        };

        // Check immediately on mount
        checkBirthdays();

        // And check every minute (to catch 9 AM transition if app is open)
        const interval = setInterval(checkBirthdays, 60000);

        return () => clearInterval(interval);
    }, [people]);
}
