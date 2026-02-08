'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Goal } from '@/lib/types';

interface GoalProgressChartProps {
    goals: Goal[];
}

export default function GoalProgressChart({ goals }: GoalProgressChartProps) {
    // Filter only top-level goals or goals with progress
    const data = goals.map(goal => ({
        name: goal.title,
        progress: goal.progress,
        category: goal.category,
    }));

    if (data.length === 0) {
        return <div className="text-center text-muted-foreground py-8">데이터가 부족합니다.</div>;
    }

    const getBarColor = (progress: number) => {
        if (progress === 100) return '#10b981'; // emerald-500
        if (progress >= 70) return '#3b82f6'; // blue-500
        if (progress >= 30) return '#f59e0b'; // amber-500
        return '#ef4444'; // red-500
    };

    return (
        <div className="w-full h-[250px] bg-card/50 rounded-xl border border-border/50 p-4 shadow-sm animate-in fade-in zoom-in-95 duration-500">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 pl-2">목표 달성 현황</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1000}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.progress)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
