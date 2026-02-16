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
import { X, Eye, EyeOff, Mail, Loader2, ArrowRight, CheckCircle2, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Prevent accidental exit
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (formData.email || formData.name || formData.phone) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [formData]);

    // Password Strength Logic (Simple)
    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return Math.min(score, 4); // 0-4
    };
    const strength = getPasswordStrength(formData.password);
    const strengthLabels = ['취약', '약함', '보통', '안전', '강력'];
    const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-emerald-500'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!agreedToTerms) {
            toast.error('서비스 이용약관에 동의해주세요.');
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        phone: formData.phone,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw new Error(error.message);

            // Success Effect
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2563eb', '#9333ea', '#3b82f6', '#ffffff']
            });

            if (data.session) {
                toast.success('회원가입이 완료되었습니다.');
                router.push('/');
                return;
            }

            toast.success('인증 메일이 발송되었습니다.');
            setIsSubmitted(true);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-10 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />

                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>

                    <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">메일함을 확인해주세요!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed text-lg">
                        <span className="font-bold text-slate-900 dark:text-white">{formData.email}</span>으로<br />
                        인증 메일을 발송했습니다.
                    </p>

                    <Link href="/login" className="block w-full">
                        <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl">
                            로그인 하러 가기
                        </Button>
                    </Link>

                    <p className="text-sm text-slate-400 mt-8">
                        메일이 오지 않았나요? 스팸함을 확인해보시거나,<br />
                        잠시 후 다시 시도해주시기 바랍니다.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Left Side - Brand & Visuals (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-blue-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/30 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

                <div className="relative z-10">
                    <Link href="/">
                        <div className="flex items-center gap-2 text-white/90 hover:text-white transition-colors cursor-pointer">
                            <Sparkles className="w-5 h-5" />
                            <span className="font-bold tracking-tight">Life Controller</span>
                        </div>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-sm font-bold">
                            <Sparkles className="w-4 h-4 fill-white" />
                            새로운 시작을 응원합니다!
                        </div>
                        <h1 className="text-5xl font-black leading-tight mb-8">
                            성공하는 사람들의<br />
                            <span className="text-blue-200">비밀 노트</span>를 가지세요.
                        </h1>
                        <ul className="space-y-4 text-lg text-blue-100">
                            {[
                                "나만의 맞춤형 성취 시스템",
                                "데이터로 증명하는 성장",
                                "매일 아침 동기부여 리포트"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-blue-300" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                <div className="relative z-10 text-xs text-blue-200/60">
                    © 2026 Life Controller. Join the elite productivity club.
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                {/* Mobile Background Gradient */}
                <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-100 to-transparent lg:hidden pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-6 relative z-10"
                >
                    <div className="text-center lg:text-left mb-8">
                        <Link href="/" className="lg:hidden inline-block mb-8">
                            <Logo variant="full" className="scale-90" />
                        </Link>
                        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            회원가입
                        </h2>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            간단한 정보 입력으로 즉시 사용 가능합니다.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center justify-between">
                                이메일
                                {formData.email.includes('@') && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                list="email-domains"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="h-12 bg-white dark:bg-slate-900/50"
                            />
                            {/* Email Autocomplete Datalist */}
                            <datalist id="email-domains">
                                <option value={formData.email.split('@')[0] + "@gmail.com"} />
                                <option value={formData.email.split('@')[0] + "@naver.com"} />
                                <option value={formData.email.split('@')[0] + "@kakao.com"} />
                                <option value={formData.email.split('@')[0] + "@icloud.com"} />
                                <option value={formData.email.split('@')[0] + "@outlook.com"} />
                            </datalist>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="password">비밀번호</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="8자 이상, 영문/숫자/특수문자 조합"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="h-12 bg-white dark:bg-slate-900/50 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Password Strength Meter */}
                            {formData.password && (
                                <div className="space-y-1.5">
                                    <div className="flex gap-1 h-1.5">
                                        {[0, 1, 2, 3].map((level) => (
                                            <div
                                                key={level}
                                                className={cn(
                                                    "flex-1 rounded-full transition-all duration-300",
                                                    strength > level ? strengthColors[strength] : "bg-slate-100 dark:bg-slate-800"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <p className={cn("text-xs font-medium text-right", strength === 0 ? "text-slate-400" : "text-blue-600")}>
                                        안전도: {strengthLabels[strength]}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">이름</Label>
                            <Input
                                id="name"
                                placeholder="실명을 입력해주세요"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-12 bg-white dark:bg-slate-900/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">휴대전화</Label>
                            <Input
                                id="phone"
                                placeholder="010-0000-0000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="h-12 bg-white dark:bg-slate-900/50"
                            />
                        </div>

                        {/* Terms of Service Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                            onClick={() => setAgreedToTerms(!agreedToTerms)}>
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="terms"
                                    checked={agreedToTerms}
                                    onCheckedChange={(c) => setAgreedToTerms(!!c)}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 w-5 h-5"
                                />
                                <div className="flex flex-col">
                                    <Label htmlFor="terms" className="text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                                        서비스 이용약관 동의
                                    </Label>
                                    <span className="text-xs text-slate-500">개인정보 처리방침 및 서비스 약관에 동의합니다.</span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 mt-4"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '가입 완료하기'}
                        </Button>
                    </form>

                    <div className="text-center text-sm pt-4">
                        <span className="text-slate-500">이미 계정이 있으신가요? </span>
                        <Link href="/login" className="font-bold text-blue-600 hover:underline hover:text-blue-700 ml-1">
                            로그인하기
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
