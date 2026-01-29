'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, CreditCard, Chrome } from 'lucide-react';
import { useData } from "@/context/DataProvider";
import { useEffect } from "react";
import { ProfileModal } from "./ProfileModal";

export function UserMenu() {
    const { data: session } = useSession();
    const { userProfile, updateUserProfile } = useData();

    // Sync session data with local UserProfile if logged in
    useEffect(() => {
        if (session?.user) {
            updateUserProfile({
                ...userProfile,
                name: session.user.name || userProfile.name,
                email: session.user.email || userProfile.email,
                photo: session.user.image || userProfile.photo,
            });
        }
    }, [session, updateUserProfile]); // Removed userProfile from dependency to avoid infinite loop if not careful, but strictly needed. optimized.

    if (!session) {
        return (
            <Button variant="outline" size="sm" onClick={() => signIn('google')} className="gap-2">
                <Chrome className="w-4 h-4" />
                Google 로그인
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 ring-1 ring-slate-100">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                        <AvatarFallback>
                            {session.user?.name?.[0] || <User className="w-4 h-4" />}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session.user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ProfileModal>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <User className="mr-2 h-4 w-4" />
                        <span>프로필</span>
                    </DropdownMenuItem>
                </ProfileModal>
                <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>결제 관리</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>설정</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                    // Force clear local storage and sign out
                    localStorage.removeItem('userProfile');
                    // Optionally clear other keys if needed, but userProfile is main culprit for display
                    signOut({ callbackUrl: '/login', redirect: true });
                }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
