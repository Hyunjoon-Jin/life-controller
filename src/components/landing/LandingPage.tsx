'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { Lightbulb, Calendar, Target, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header / Nav */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Logo variant="full" className="scale-90" />
                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                                로그인
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                                무료로 시작하기
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none" />

                <div className="container mx-auto text-center max-w-4xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                        하루를 <span className="text-blue-600">완벽하게</span>,<br />
                        성장을 <span className="text-blue-600">체계적으로</span>.
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        일정 관리부터 목표 달성, 습관 형성까지.<br className="hidden md:block" />
                        당신의 모든 성장을 지원하는 올인원 라이프 컨트롤러입니다.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register">
                            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200">
                                지금 무료로 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-200 text-slate-700 hover:bg-slate-50">
                                로그인하기
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">왜 Life Controller인가요?</h2>
                        <p className="text-slate-500">단순한 플래너를 넘어, 삶을 변화시키는 도구들을 제공합니다.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">스마트한 일정 관리</h3>
                            <p className="text-slate-500 leading-relaxed">
                                할 일(To-Do)과 일정(Schedule)을 한 곳에서.<br />
                                드래그 앤 드롭으로 손쉽게 계획을 세우세요.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">목표 달성 시스템</h3>
                            <p className="text-slate-500 leading-relaxed">
                                큰 목표를 세우고, 작은 행동으로 쪼개어<br />
                                OKR 방식으로 체계적인 성장을 돕습니다.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">습관 및 데이터 분석</h3>
                            <p className="text-slate-500 leading-relaxed">
                                매일의 습관을 추적하고, 시각화된 데이터로<br />
                                나의 성장 그래프를 확인하세요.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 text-center">
                    <Logo variant="icon" className="w-8 h-8 mx-auto mb-4 opacity-50 grayscale" />
                    <p className="text-sm text-slate-400">
                        © {new Date().getFullYear()} Life Controller. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
