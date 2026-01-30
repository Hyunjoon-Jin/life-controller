'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { X, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
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
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            toast.success('회원가입 성공! 로그인해주세요.');
            router.push('/login'); // Redirect to login
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const clearField = (field: keyof typeof formData) => {
        setFormData(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f6f7] p-4 text-[#333]">
            <div className="w-full max-w-[460px] space-y-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-[#03c75a] tracking-tighter">NAVER</h1>
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
