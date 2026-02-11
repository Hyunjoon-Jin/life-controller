'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Trash2, Info, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/context/DataProvider';
import { useAuth } from '@/components/auth/SessionProvider';

export function SettingsModal({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const { updateUserProfile, userProfile } = useData();
    const { signOut } = useAuth();

    const handleResetData = () => {
        if (confirm('정말로 로컬 캐시를 초기화하시겠습니까? (서버 데이터는 유지됩니다)')) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
            toast.success('캐시가 초기화되었습니다.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!userProfile?.id) return;

        const confirm1 = confirm('정말로 탈퇴하시겠습니까? 탈퇴 후 30일간은 데이터를 복구할 수 있으며, 그 이후에는 영구 삭제됩니다.');
        if (!confirm1) return;

        const confirm2 = prompt('탈퇴를 원하시면 "탈퇴"라고 입력해주세요.');
        if (confirm2 !== '탈퇴') {
            toast.error('입력값이 일치하지 않습니다.');
            return;
        }

        try {
            // Soft Delete: Update status to 'withdrawn'
            await updateUserProfile({
                ...userProfile,
                status: 'withdrawn',
                deletedAt: new Date(),
            });
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


                    {/* App Info */}
                    <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
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
