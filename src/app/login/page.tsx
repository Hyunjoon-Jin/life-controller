'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { X, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [keepLogin, setKeepLogin] = useState(true);
    const [ipSecurity, setIpSecurity] = useState(true);

    // Recovery States
    const [isFindPwOpen, setIsFindPwOpen] = useState(false);
    const [isFindIdOpen, setIsFindIdOpen] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) {
                console.error('[Login Error Detail]', error);
                throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
            }

            toast.success('로그인 성공!');
            router.push('/');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const clearField = (field: 'email' | 'password') => {
        setFormData(prev => ({ ...prev, [field]: '' }));
    };

    const handleFindPw = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
                redirectTo: `${window.location.origin}/login`,
            });
            if (error) throw error;
            toast.success('비밀번호 재설정 링크를 보냈습니다.', {
                description: `전송된 이메일: ${recoveryEmail}`
            });
        } catch (error: any) {
            toast.error(error.message || '이메일 전송에 실패했습니다.');
        }
        setIsFindPwOpen(false);
        setRecoveryEmail('');
    };

    const handleFindId = (e: React.FormEvent) => {
        e.preventDefault();
        toast.info('등록된 이메일로 아이디가 전송되었습니다.', {
            description: recoveryEmail
        });
        setIsFindIdOpen(false);
        setRecoveryEmail('');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f6f7] p-4 text-[#333]">
            <div className="w-full max-w-[460px]">
                <div className="bg-white border border-[#dadada] rounded-lg shadow-sm overflow-hidden p-6 pt-8">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="border border-[#dadada] rounded-lg bg-white overflow-hidden focus-within:border-[#03c75a] focus-within:shadow-[0_0_0_1px_#03c75a] transition-all">
                            <div className="relative flex items-center border-b border-[#dadada]">
                                <Input
                                    id="email"
                                    name="email"
                                    autoComplete="username"
                                    type="text"
                                    required
                                    placeholder="아이디 또는 이메일"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="border-0 focus-visible:ring-0 shadow-none h-[48px] px-4 text-base placeholder:text-[#aaa]"
                                />
                                {formData.email && (
                                    <button
                                        type="button"
                                        onClick={() => clearField('email')}
                                        className="absolute right-3 text-[#999] hover:text-[#777]"
                                    >
                                        <X className="w-5 h-5 bg-[#ccc] text-white rounded-full p-1" />
                                    </button>
                                )}
                            </div>
                            <div className="relative flex items-center">
                                <Input
                                    id="password"
                                    name="password"
                                    autoComplete="current-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="비밀번호"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="border-0 focus-visible:ring-0 shadow-none h-[48px] px-4 text-base placeholder:text-[#aaa]"
                                />
                                <div className="absolute right-3 flex items-center gap-2">
                                    {formData.password && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-[#999] hover:text-[#777]"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    )}
                                    {formData.password && (
                                        <button
                                            type="button"
                                            onClick={() => clearField('password')}
                                            className="text-[#999] hover:text-[#777]"
                                        >
                                            <X className="w-5 h-5 bg-[#ccc] text-white rounded-full p-1" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-1">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="keepLogin"
                                    checked={keepLogin}
                                    onCheckedChange={(c) => setKeepLogin(!!c)}
                                    className="data-[state=checked]:bg-[#03c75a] data-[state=checked]:border-[#03c75a] border-[#dadada] w-5 h-5 rounded-full"
                                />
                                <Label
                                    htmlFor="keepLogin"
                                    className="text-[#555] font-normal cursor-pointer select-none"
                                >
                                    로그인 상태 유지
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[#555]">IP보안</span>
                                <div className="flex items-center gap-1">
                                    <Switch
                                        id="ipSecurity"
                                        checked={ipSecurity}
                                        onCheckedChange={setIpSecurity}
                                        className="data-[state=checked]:bg-[#03c75a] h-5 w-9"
                                    />
                                    <span className={cn("text-sm font-bold", ipSecurity ? "text-[#03c75a]" : "text-[#999]")}>
                                        {ipSecurity ? "ON" : "OFF"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-[50px] bg-[#03c75a] hover:bg-[#02b351] text-white text-lg font-bold rounded-md mt-4 shadow-sm"
                            disabled={isLoading}
                        >
                            {isLoading ? '로그인 중...' : '로그인'}
                        </Button>
                    </form>
                </div>

                <div className="flex items-center justify-center gap-4 mt-6 text-sm text-[#888]">
                    <Dialog open={isFindPwOpen} onOpenChange={setIsFindPwOpen}>
                        <DialogTrigger asChild>
                            <button className="hover:underline">비밀번호 찾기</button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>비밀번호 찾기</DialogTitle>
                                <DialogDescription>
                                    가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleFindPw} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="recovery-email">이메일</Label>
                                    <Input
                                        id="recovery-email"
                                        name="recovery-email"
                                        autoComplete="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={recoveryEmail}
                                        onChange={(e) => setRecoveryEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="bg-[#03c75a] hover:bg-[#02b351]">링크 보내기</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <span className="h-3 w-[1px] bg-[#dadada]"></span>

                    <Dialog open={isFindIdOpen} onOpenChange={setIsFindIdOpen}>
                        <DialogTrigger asChild>
                            <button className="hover:underline">아이디 찾기</button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>아이디 찾기</DialogTitle>
                                <DialogDescription>
                                    가입한 이메일 주소를 입력하시면 아이디를 확인해드립니다.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleFindId} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="find-id-email">이메일</Label>
                                    <Input
                                        id="find-id-email"
                                        name="find-id-email"
                                        autoComplete="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={recoveryEmail}
                                        onChange={(e) => setRecoveryEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="bg-[#03c75a] hover:bg-[#02b351]">아이디 찾기</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <span className="h-3 w-[1px] bg-[#dadada]"></span>
                    <Link href="/register" className="hover:underline">회원가입</Link>
                </div>

                <div className="mt-8 text-center text-xs text-[#8e8e8e] font-serif tracking-widest uppercase">
                    <span className="font-bold">Life Controller</span>
                </div>
            </div>
        </div>
    );
}
