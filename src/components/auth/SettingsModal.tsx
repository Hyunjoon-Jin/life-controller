'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Trash2, Info, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/context/DataProvider';
import { useAuth } from '@/components/auth/SessionProvider';
import { createClient } from '@/lib/supabase';

export function SettingsModal({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const { updateUserProfile, userProfile } = useData();
    const { signOut, user } = useAuth();
    const supabase = createClient();

    const handleResetData = () => {
        if (confirm('정말로 로컬 캐시를 초기화하시겠습니까? (서버 데이터는 유지됩니다)')) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
            toast.success('캐시가 초기화되었습니다.');
        }
    };

    const handleDeleteAccount = async () => {
        console.log('handleDeleteAccount called', userProfile);
        if (!userProfile?.id) {
            console.error('No userProfile.id found');
            toast.error('사용자 정보를 불러오지 못했습니다.');
            return;
        }

        const confirm1 = confirm('정말로 탈퇴하시겠습니까? 탈퇴 후 30일간은 데이터를 복구할 수 있으며, 그 이후에는 영구 삭제됩니다.');
        if (!confirm1) return;

        const confirm2 = prompt('탈퇴를 원하시면 "탈퇴"라고 입력해주세요.');
        if (confirm2 !== '탈퇴') {
            toast.error('입력값이 일치하지 않습니다.');
            return;
        }

        try {
            console.log('Attempting to update status to withdrawn...');
            // Soft Delete: Update status to 'withdrawn'
            await updateUserProfile({
                ...userProfile,
                status: 'withdrawn',
                deletedAt: new Date(),
            });
            console.log('updateUserProfile called.');
            toast.success('계정 탈퇴 요청이 처리되었습니다.');
            setIsOpen(false);
            signOut();
        } catch (error) {
            console.error('Delete account error:', error);
            toast.error('오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>설정</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Theme Setting */}
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="theme-mode">다크 모드</Label>
                            <span className="text-xs text-muted-foreground">어두운 화면 테마를 사용합니다.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4 text-slate-500" />
                            <Switch
                                id="theme-mode"
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            />
                            <Moon className="h-4 w-4 text-slate-500" />
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="space-y-3">
                        <Label className="text-base">데이터 관리</Label>
                        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/20">
                            <h4 className="font-bold text-red-700 dark:text-red-400 text-sm mb-1 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> 모든 데이터 초기화
                            </h4>
                            <p className="text-xs text-red-600/80 dark:text-red-400/80 mb-3">
                                로컬 캐시를 삭제하고 새로고침합니다. (서버 데이터는 유지됨)
                            </p>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleResetData}
                                className="w-full text-xs"
                            >
                                캐시 초기화
                            </Button>
                        </div>
                    </div>

                    {/* Delete Account */}
                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/20 mt-4">
                        <h4 className="font-bold text-red-700 dark:text-red-400 text-sm mb-1 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> 회원 탈퇴
                        </h4>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80 mb-3">
                            탈퇴 시 30일간 유예 기간을 가지며, 이후 데이터는 영구 삭제됩니다.
                        </p>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteAccount}
                            className="w-full text-xs bg-red-600 hover:bg-red-700 text-white"
                        >
                            계정 탈퇴하기
                        </Button>
                    </div>


                    {/* Account Linking */}
                    <div className="space-y-3 pb-4 border-b">
                        <Label className="text-base">계정 연동</Label>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                fill="#4285F4"
                                            />
                                            <path
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                fill="#34A853"
                                            />
                                            <path
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                fill="#FBBC05"
                                            />
                                            <path
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                fill="#EA4335"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">Google 계정</div>
                                        <div className="text-xs text-muted-foreground">
                                            {
                                                user?.app_metadata?.providers?.includes('google')
                                                    ? '연동되었습니다.'
                                                    : '연동되지 않았습니다.'
                                            }
                                        </div>
                                    </div>
                                </div>
                                {user?.app_metadata?.providers?.includes('google') ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled
                                        className="text-xs bg-green-50 text-green-600 border-green-200"
                                    >
                                        연동됨
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            const { error } = await supabase.auth.linkIdentity({
                                                provider: 'google',
                                                options: {
                                                    redirectTo: `${window.location.origin}/auth/callback`
                                                }
                                            });
                                            if (error) toast.error(error.message);
                                        }}
                                        className="text-xs hover:bg-slate-100"
                                    >
                                        연동하기
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* App Info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                        <div className="flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            <span>버전 정보</span>
                        </div>
                        <span className="font-mono">v1.2.0</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}
