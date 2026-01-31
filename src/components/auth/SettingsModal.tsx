'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Trash2, RotateCcw, Info, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsModal({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const handleResetData = () => {
        if (confirm('정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
            toast.success('데이터가 초기화되었습니다.');
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
                                로컬에 저장된 모든 일정, 기록, 설정을 삭제합니다.
                            </p>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleResetData}
                                className="w-full text-xs"
                            >
                                초기화 실행
                            </Button>
                        </div>
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
        </Dialog>
    );
}
