'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export function ProfileModal({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Placeholder functions for now - will connect to API later
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // TODO: Implement user update API
        setTimeout(() => {
            toast.success('프로필이 업데이트되었습니다.');
            setIsLoading(false);
            setOpen(false);
        }, 1000);
    };

    if (!session?.user) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>내 프로필</DialogTitle>
                    <DialogDescription>
                        계정 정보를 확인하고 수정할 수 있습니다.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            이메일
                        </Label>
                        <Input
                            id="email"
                            value={session.user.email || ''}
                            disabled
                            className="col-span-3 bg-muted"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            이름
                        </Label>
                        <Input
                            id="name"
                            defaultValue={session.user.name || ''}
                            className="col-span-3"
                        />
                    </div>
                    {/* Phone field support needs schema update first, hidden for now */}
                </DialogFooter>
                <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? '저장 중...' : '변경사항 저장'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
        </Dialog >
    );
}
