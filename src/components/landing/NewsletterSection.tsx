'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function NewsletterSection({ mode }: { mode: 'life' | 'work' }) {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSubscribed(true);
            toast.success('성공적으로 구독되었습니다!');
            setEmail('');
        }, 1500);
    };

    return (
        <section className="py-24 px-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className={cn(
                "absolute inset-0 opacity-50 pointer-events-none transition-colors duration-1000",
                mode === 'life' ? "bg-gradient-to-b from-blue-50 to-white" : "bg-gradient-to-b from-slate-900 to-slate-950"
            )} />

            <div className="container mx-auto max-w-4xl relative z-10">
                <div className={cn(
                    "rounded-[48px] p-8 md:p-16 text-center shadow-2xl overflow-hidden relative",
                    mode === 'life' ? "bg-white border border-slate-100" : "bg-slate-900 border border-white/10"
                )}>
                    {/* Glow Effect */}
                    <div className={cn(
                        "absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] blur-3xl opacity-30 pointer-events-none",
                        mode === 'life' ? "bg-blue-200" : "bg-blue-600"
                    )} />

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                            성장을 위한 팁을 <br />
                            <span className="text-blue-600">가장 먼저</span> 받아보세요
                        </h2>
                        <p className={cn(
                            "text-lg mb-10 max-w-xl mx-auto",
                            mode === 'life' ? "text-slate-500" : "text-slate-400"
                        )}>
                            매주 월요일 아침, 생산성 향상을 위한 아티클과 업데이트 소식을 전해드립니다. (스팸은 절대 보내지 않아요!)
                        </p>

                        {!isSubscribed ? (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="이메일 주소를 입력해주세요"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={cn(
                                        "flex-1 h-14 px-6 rounded-full outline-none ring-2 ring-transparent transition-all",
                                        mode === 'life'
                                            ? "bg-slate-50 text-slate-900 focus:ring-blue-500 placeholder:text-slate-400"
                                            : "bg-white/5 text-white focus:ring-blue-500 placeholder:text-slate-500"
                                    )}
                                    required
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className={cn(
                                        "h-14 px-8 rounded-full text-lg font-bold shadow-lg transition-transform active:scale-95",
                                        mode === 'life' ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white text-slate-900 hover:bg-slate-100"
                                    )}
                                >
                                    {isLoading ? '신청 중...' : (
                                        <>구독하기 <Send className="ml-2 w-4 h-4" /></>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-bold"
                            >
                                <CheckCircle2 className="w-6 h-6" />
                                구독해주셔서 감사합니다! 좋은 소식으로 찾아뵐게요.
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
