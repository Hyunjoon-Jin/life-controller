'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { X, Eye, EyeOff, Mail } from 'lucide-react';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

            if (error) {
                throw new Error(error.message);
            }

            // Check if session exists (means email confirmation is disabled or auto-confirmed)
            if (data.session) {
                toast.success('회원가입이 완료되었습니다.');
                router.push('/');
                return;
            }

            // If no session, it means email confirmation is required
            toast.success('인증 메일이 발송되었습니다.');
            setIsSubmitted(true);

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const clearField = (field: keyof typeof formData) => {
        setFormData(prev => ({ ...prev, [field]: '' }));
    };

    if (isSubmitted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f5f6f7] p-4 text-[#333]">
                <div className="w-full max-w-[460px] bg-white border border-[#dadada] rounded-lg shadow-sm p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-[#03c75a]/10 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-[#03c75a]" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-slate-800">이메일을 확인해주세요!</h2>
                    <p className="text-[#666] mb-8 leading-relaxed text-lg">
                        <span className="font-bold text-[#333]">{formData.email}</span>으로<br />
                        인증 메일을 발송했습니다.<br />
                        메일 내 링크를 클릭하면 가입이 완료됩니다.
                    </p>
                    <div className="space-y-3">
                        <Link href="/login" className="block w-full">
                            <Button className="w-full h-[50px] bg-[#03c75a] hover:bg-[#02b351] text-white text-lg font-bold">
                                로그인 하러 가기
                            </Button>
                        </Link>
                        <p className="text-sm text-[#999] mt-6">
                            메일이 오지 않았나요? 스팸함을 확인해보시거나,<br />
                            잠시 후 다시 시도해주시기 바랍니다.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f6f7] p-4 text-[#333]">
            <div className="w-full max-w-[460px] space-y-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-widest uppercase">Life Controller</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ID / Email */}
                    <div className="space-y-1">
                        <Label htmlFor="email" className="font-bold text-sm">아이디</Label>
                        <div className="relative flex items-center">
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-[48px] px-4 border border-[#dadada] focus-visible:border-[#03c75a] focus-visible:ring-0 focus-visible:shadow-[0_0_0_1px_#03c75a] transition-all bg-white"
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
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <Label htmlFor="password" className="font-bold text-sm">비밀번호</Label>
                        <div className="relative flex items-center">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="h-[48px] px-4 border border-[#dadada] focus-visible:border-[#03c75a] focus-visible:ring-0 focus-visible:shadow-[0_0_0_1px_#03c75a] transition-all bg-white"
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

                    {/* Name */}
                    <div className="space-y-1">
                        <Label htmlFor="name" className="font-bold text-sm">이름</Label>
                        <div className="relative flex items-center">
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-[48px] px-4 border border-[#dadada] focus-visible:border-[#03c75a] focus-visible:ring-0 focus-visible:shadow-[0_0_0_1px_#03c75a] transition-all bg-white"
                            />
                            {formData.name && (
                                <button
                                    type="button"
                                    onClick={() => clearField('name')}
                                    className="absolute right-3 text-[#999] hover:text-[#777]"
                                >
                                    <X className="w-5 h-5 bg-[#ccc] text-white rounded-full p-1" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                        <Label htmlFor="phone" className="font-bold text-sm">휴대전화</Label>
                        <div className="relative flex items-center">
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="전화번호 입력"
                                className="h-[48px] px-4 border border-[#dadada] focus-visible:border-[#03c75a] focus-visible:ring-0 focus-visible:shadow-[0_0_0_1px_#03c75a] transition-all bg-white"
                            />
                            {formData.phone && (
                                <button
                                    type="button"
                                    onClick={() => clearField('phone')}
                                    className="absolute right-3 text-[#999] hover:text-[#777]"
                                >
                                    <X className="w-5 h-5 bg-[#ccc] text-white rounded-full p-1" />
                                </button>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-[50px] bg-[#03c75a] hover:bg-[#02b351] text-white text-lg font-bold rounded-md mt-6 shadow-sm"
                        disabled={isLoading}
                    >
                        {isLoading ? '가입 중...' : '가입하기'}
                    </Button>
                </form>

                <div className="text-center text-sm text-[#888] mt-4">
                    <Link href="/login" className="hover:underline">로그인 페이지로 돌아가기</Link>
                </div>
            </div>
        </div>
    );
}
