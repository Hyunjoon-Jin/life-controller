'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { X, Eye, EyeOff, Loader2, ArrowRight, Github, Mail, Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
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
    const [capsLockActive, setCapsLockActive] = useState(false);

    // Recovery States
    const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoveryTab, setRecoveryTab] = useState<'password' | 'id'>('password');

    // Controls for shake animation
    const controls = useAnimation();

    // Check for verification success
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('verified') === 'true') {
                window.history.replaceState({}, '', '/login');
                setTimeout(() => toast.success('이메일 인증이 완료되었습니다! 로그인해주세요.'), 500);
            }
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.getModifierState('CapsLock')) {
            setCapsLockActive(true);
        } else {
            setCapsLockActive(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) {
                console.error('[Login Error Detail]', error);
                throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
            }

            toast.success('로그인 성공! 대시보드로 이동합니다.');
            router.push('/');
            router.refresh();
        } catch (error) {
            // Trigger Shake Animation
            controls.start({
                x: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.5 }
            });

            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('로그인 중 오류가 발생했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (recoveryTab === 'password') {
            try {
                const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
                    redirectTo: `${window.location.origin}/login`,
                });
                if (error) throw error;
                toast.success('비밀번호 재설정 링크를 보냈습니다.', {
                    description: `전송된 이메일: ${recoveryEmail}`
                });
                setIsRecoveryOpen(false);
            } catch (error: any) {
                toast.error(error.message || '이메일 전송 실패');
            }
        } else {
            // Find ID Simulation
            toast.info('등록된 이메일로 아이디가 전송되었습니다.', { description: recoveryEmail });
            setIsRecoveryOpen(false);
        }
        setRecoveryEmail('');
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) throw error;
            // Note: No toast needed here as it redirects immediately
        } catch (error: any) {
            toast.error(error.message || '구글 로그인 중 오류가 발생했습니다.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Left Side - Brand & Visuals (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-slate-900 text-white overflow-hidden">
                {/* Visual Effects */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-slate-900 to-slate-900 pointer-events-none" />
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

                {/* Floating Elements Animation */}
                <div className="absolute inset-0 opacity-20">
                    <motion.div
                        animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-500 rounded-full blur-2xl"
                    />
                    <motion.div
                        animate={{ y: [0, 20, 0], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-purple-500 rounded-full blur-2xl"
                    />
                </div>

                <div className="relative z-10">
                    <Link href="/">
                        <div className="flex items-center gap-2 text-white/90 hover:text-white transition-colors cursor-pointer">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                            <span className="font-bold tracking-tight">J들의 놀이터</span>
                        </div>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-5xl font-black leading-tight mb-6">
                            당신의 하루를 <br />
                            <span className="text-blue-500">작품처럼</span> 설계하세요.
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            일정, 목표, 자산, 건강까지.<br />
                            흩어진 삶의 조각들을 하나의 시스템으로 통합 관리합니다.
                        </p>

                        <div className="flex gap-4">
                            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-medium">
                                ✨ 스마트 스케줄러
                            </div>
                            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-medium">
                                📈 OKR 목표 관리
                            </div>
                            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-medium">
                                💰 통합 자산 대시보드
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="relative z-10 text-xs text-slate-500">
                    © 2026 J들의 놀이터. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                {/* Mobile Background Gradient */}
                <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-50 to-transparent lg:hidden pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-8 relative z-10"
                >
                    <div className="text-center lg:text-left">
                        <Link href="/" className="lg:hidden inline-block mb-8">
                            <Logo variant="full" className="scale-90" />
                        </Link>
                        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            다시 오신 것을 환영합니다 👋
                        </h2>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            계정에 로그인하여 성장을 이어가세요.
                        </p>
                    </div>

                    <motion.form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        animate={controls}
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">이메일</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="h-12 bg-white dark:bg-slate-900/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">비밀번호</Label>
                                    <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
                                        <DialogTrigger asChild>
                                            <button
                                                type="button"
                                                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline tabindex-[-1]"
                                                onClick={() => setRecoveryTab('password')}
                                            >
                                                비밀번호를 잊으셨나요?
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>계정 찾기</DialogTitle>
                                                <DialogDescription>
                                                    이메일을 입력하시면 {recoveryTab === 'password' ? '비밀번호 재설정 링크' : '아이디'}를 보내드립니다.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setRecoveryTab('password')}
                                                    className={cn(
                                                        "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                                        recoveryTab === 'password' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                                                    )}
                                                >
                                                    비밀번호 찾기
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setRecoveryTab('id')}
                                                    className={cn(
                                                        "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                                        recoveryTab === 'id' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                                                    )}
                                                >
                                                    아이디 찾기
                                                </button>
                                            </div>
                                            <form onSubmit={handleRecovery} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>이메일 주소</Label>
                                                    <Input
                                                        type="email"
                                                        placeholder="가입하신 이메일을 입력하세요"
                                                        value={recoveryEmail}
                                                        onChange={(e) => setRecoveryEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                                    {recoveryTab === 'password' ? '재설정 링크 보내기' : '아이디 확인하기'}
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="비밀번호를 입력하세요"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        onKeyDown={handleKeyDown}
                                        required
                                        className={cn(
                                            "h-12 bg-white dark:bg-slate-900/50 pr-10",
                                            capsLockActive && "border-yellow-400 focus-visible:ring-yellow-400"
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>

                                    {/* CapsLock Warning Tooltip */}
                                    <AnimatePresence>
                                        {capsLockActive && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute left-0 -bottom-8 flex items-center gap-1.5 text-xs text-yellow-600 font-medium bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-md border border-yellow-200 dark:border-yellow-700"
                                            >
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                CapsLock이 켜져 있습니다.
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="keepLogin"
                                checked={keepLogin}
                                onCheckedChange={(c) => setKeepLogin(!!c)}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <Label htmlFor="keepLogin" className="text-sm text-slate-600 font-normal cursor-pointer">
                                로그인 상태 유지
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>로그인 <ArrowRight className="ml-2 w-4 h-4" /></>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-50 dark:bg-slate-950 px-2 text-slate-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="h-11 hover:bg-white hover:border-slate-300 dark:hover:bg-slate-900 transition-all"
                            >
                                <span className="mr-2">G</span> Google
                            </Button>
                            <Button variant="outline" type="button" className="h-11 hover:bg-white hover:border-slate-300 dark:hover:bg-slate-900 transition-all">
                                <Github className="mr-2 w-4 h-4" /> GitHub
                            </Button>
                        </div>
                    </motion.form>

                    <div className="text-center text-sm">
                        <span className="text-slate-500">아직 계정이 없으신가요? </span>
                        <Link href="/register" className="font-bold text-blue-600 hover:underline hover:text-blue-700 ml-1">
                            회원가입하기
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
