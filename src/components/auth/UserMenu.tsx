'use client';

import { useAuth } from "@/components/auth/SessionProvider";
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
import { User, LogOut, Settings, CreditCard } from 'lucide-react';
import { useData } from "@/context/DataProvider";
import { useEffect } from "react";
import { ProfileModal } from "./ProfileModal";
import { SettingsModal } from "./SettingsModal";

export function UserMenu() {
    const { user, signOut } = useAuth();
    const { userProfile, updateUserProfile } = useData();

    // Sync auth user data with local UserProfile
    useEffect(() => {
        if (user) {
            const metadata = user.user_metadata;
            const newName = metadata?.name || userProfile.name;
            const newEmail = user.email || userProfile.email;

            if (newName !== userProfile.name || newEmail !== userProfile.email) {
                updateUserProfile({
                    ...userProfile,
                    name: newName,
                    email: newEmail,
                });
            }
        }
    }, [user, userProfile, updateUserProfile]);

    if (!user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 ring-1 ring-slate-100">
                        <AvatarImage src={userProfile.photo || ''} alt={userProfile.name || ''} />
                        <AvatarFallback>
                            {userProfile.name?.[0] || user.email?.[0] || <User className="w-4 h-4" />}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userProfile.name || user.user_metadata?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
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
                <SettingsModal>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>설정</span>
                    </DropdownMenuItem>
                </SettingsModal>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
