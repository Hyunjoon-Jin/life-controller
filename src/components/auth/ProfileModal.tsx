'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth/SessionProvider';
import { toast } from 'sonner';
import { useData } from '@/context/DataProvider';
import { UserProfile } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

export function ProfileModal({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { userProfile, updateUserProfile } = useData();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<UserProfile>(userProfile);

    // Sync state when modal opens or userProfile changes
    useEffect(() => {
        if (open) {
            setFormData(userProfile);
        }
    }, [open, userProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSocialChange = (index: number, field: 'platform' | 'url', value: string) => {
        const newLinks = [...(formData.socialLinks || [])];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFormData(prev => ({ ...prev, socialLinks: newLinks }));
    };

    const addSocialLink = () => {
        setFormData(prev => ({
            ...prev,
            socialLinks: [...(prev.socialLinks || []), { platform: 'website', url: '' }]
        }));
    };

    const removeSocialLink = (index: number) => {
        const newLinks = [...(formData.socialLinks || [])];
        newLinks.splice(index, 1);
        setFormData(prev => ({ ...prev, socialLinks: newLinks }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await updateUserProfile({
                ...formData,
                id: formData.id || user?.email || 'user',
                email: user?.email || formData.email,
            });
            toast.success('프로필이 저장되었습니다.');
            setOpen(false);
        } catch (error) {
            toast.error('저장 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>프로필 수정</DialogTitle>
                    <DialogDescription>
                        이력서와 포트폴리오에 표시될 나의 정보를 관리합니다.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-6 py-4">

                    {/* 1. 기본 정보 */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2 border-b pb-2">
                            기본 정보
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">이름 (한글)</Label>
                                <Input id="name" value={formData.name} onChange={handleChange} placeholder="홍길동" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="englishName">이름 (영문)</Label>
                                <Input id="englishName" value={formData.englishName || ''} onChange={handleChange} placeholder="Gildong Hong" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="jobTitle">직무 / 타이틀</Label>
                            <Input id="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="Frontend Developer" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">이메일</Label>
                                <Input id="email" value={formData.email} disabled className="bg-muted" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">연락처</Label>
                                <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="010-1234-5678" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">주소/거주지</Label>
                            <Input id="address" value={formData.address || ''} onChange={handleChange} placeholder="서울시 강남구" />
                        </div>
                    </div>

                    {/* 2. 자기소개 */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2 border-b pb-2">
                            자기소개
                        </h3>
                        <div className="grid gap-2">
                            <Label htmlFor="bio">간단 소개 (Markdown 지원)</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="나를 표현하는 한 마디 또는 짧은 소개글을 입력하세요."
                                className="h-24 resize-none"
                            />
                        </div>
                    </div>

                    {/* 3. 소셜 링크 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="font-semibold text-sm text-muted-foreground">소셜 & 링크</h3>
                            <Button type="button" variant="ghost" size="sm" onClick={addSocialLink} className="h-6 gap-1 text-xs">
                                <Plus className="w-3 h-3" /> 추가
                            </Button>
                        </div>

                        {formData.socialLinks && formData.socialLinks.length > 0 ? (
                            <div className="space-y-3">
                                {formData.socialLinks.map((link, index) => (
                                    <div key={index} className="flex gap-2 items-start">
                                        <div className="w-1/3">
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={link.platform}
                                                onChange={(e) => handleSocialChange(index, 'platform', e.target.value)}
                                            >
                                                <option value="website">Website</option>
                                                <option value="github">GitHub</option>
                                                <option value="linkedin">LinkedIn</option>
                                                <option value="instagram">Instagram</option>
                                                <option value="facebook">Facebook</option>
                                                <option value="blog">Blog</option>
                                                <option value="custom">기타</option>
                                            </select>
                                        </div>
                                        <Input
                                            value={link.url}
                                            onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                                            placeholder="https://"
                                            className="flex-1"
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(index)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-sm text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                                추가된 링크가 없습니다.
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>취소</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? '저장 중...' : '변경사항 저장'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
