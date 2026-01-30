'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { X, Eye, EyeOff, LogIn, QrCode, Smartphone, SmartphoneNfc } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [keepLogin, setKeepLogin] = useState(true);
    const [ipSecurity, setIpSecurity] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (res?.error) {
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

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f6f7] p-4 text-[#333]">
            {/* Logo Area (Optional, skipping for now based on request focusing on form) */}

            <div className="w-full max-w-[460px]">
                {/* Naver Style Container */}
                <div className="bg-white border border-[#dadada] rounded-lg shadow-sm overflow-hidden">
                    <Tabs defaultValue="id" className="w-full">
                        <TabsList className="w-full grid grid-cols-3 h-[50px] p-0 bg-white border-b border-[#e5e5e5]">
                            <TabsTrigger
                                value="id"
                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#03c75a] data-[state=active]:text-[#03c75a] data-[state=active]:font-bold data-[state=active]:shadow-none text-base text-[#777]"
                            >
                                <span className="flex items-center gap-2">ID/전화번호</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="disposable"
                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#03c75a] data-[state=active]:text-[#03c75a] data-[state=active]:font-bold data-[state=active]:shadow-none text-base text-[#777]"
                            >
                                <span className="flex items-center gap-1"><span className="text-xs border border-[#ccc] rounded px-1 text-[#999] font-normal mr-1">[1]</span> 일회용 번호</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="qr"
                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#03c75a] data-[state=active]:text-[#03c75a] data-[state=active]:font-bold data-[state=active]:shadow-none text-base text-[#777]"
                            >
                                <span className="flex items-center gap-2"><QrCode className="w-4 h-4" /> QR코드</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="id" className="p-6 pt-8 m-0 focus-visible:outline-none">
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="border border-[#dadada] rounded-lg bg-white overflow-hidden focus-within:border-[#03c75a] focus-within:shadow-[0_0_0_1px_#03c75a] transition-all">
                                    <div className="relative flex items-center border-b border-[#dadada]">
                                        <Input
                                            id="email"
                                            type="text"
                                            required
                                            placeholder="아이디 또는 전화번호"
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
                        </TabsContent>

                        <TabsContent value="disposable" className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center space-y-4 focus-visible:outline-none">
                            <SmartphoneNfc className="w-16 h-16 text-[#ccc]" />
                            <div className="text-[#888]">
                                <p className="font-bold text-lg mb-1">일회용 번호 로그인</p>
                                <p className="text-sm">네이버 앱의 설정 &gt; 로그인 아이디 관리에서<br />생성된 일회용 번호를 입력해주세요.</p>
                            </div>
                            <Button variant="outline" className="mt-4">번호 입력하기</Button>
                        </TabsContent>

                        <TabsContent value="qr" className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center space-y-4 focus-visible:outline-none">
                            <QrCode className="w-20 h-20 text-[#ccc]" />
                            <div className="text-[#888]">
                                <p className="font-bold text-lg mb-1">QR코드 로그인</p>
                                <p className="text-sm">PC화면에 보이는 QR코드를<br />네이버 앱으로 촬영해주세요.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="flex items-center justify-center gap-4 mt-6 text-sm text-[#888]">
                    <Link href="#" className="hover:underline">비밀번호 찾기</Link>
                    <span className="h-3 w-[1px] bg-[#dadada]"></span>
                    <Link href="#" className="hover:underline">아이디 찾기</Link>
                    <span className="h-3 w-[1px] bg-[#dadada]"></span>
                    <Link href="/register" className="hover:underline">회원가입</Link>
                </div>

                <div className="mt-8 text-center text-xs text-[#8e8e8e] font-sans">
                    <span className="font-bold">NAVER Corp.</span>
                </div>
            </div>
        </div>
    );
}
