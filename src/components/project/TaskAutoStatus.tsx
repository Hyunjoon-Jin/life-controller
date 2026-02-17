import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap, Play, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useData } from '@/context/DataProvider';
import { toast } from 'sonner';

export function TaskAutoStatus() {
    // In a real implementation, we would store these rules in the DB.
    // For now, we'll just simulate the UI and basic logic controls.
    const [rules, setRules] = useState([
        { id: '1', name: '모든 하위 작업 완료 시 상위 작업 완료', enabled: true },
        { id: '2', name: '선행 작업 완료 시 후행 작업 "할 일"로 변경', enabled: false },
        { id: '3', name: '마감일 지난 "진행 중" 작업 "긴급"으로 변경', enabled: true },
    ]);

    const { tasks, updateTask } = useData();
    const [isRunning, setIsRunning] = useState(false);

    const toggleRule = (id: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    };

    const runAutomation = async () => {
        setIsRunning(true);
        try {
            let processedCount = 0;

            // Rule 1: Auto-complete parent
            if (rules.find(r => r.id === '1')?.enabled) {
                // Find parents with subtasks where all subtasks are complete but parent is not
                // Note: Current data model stores subtasks inside parent.
                // If subTasks field exists.
                tasks.forEach(task => {
                    if (task.subTasks && task.subTasks.length > 0 && !task.completed) {
                        const allSubsComplete = task.subTasks.every(st => st.completed);
                        if (allSubsComplete) {
                            updateTask({ ...task, completed: true, progress: 100, completedAt: new Date() });
                            processedCount++;
                        }
                    }
                });
            }

            // Rule 3: Overdue to High Priority
            if (rules.find(r => r.id === '3')?.enabled) {
                const now = new Date();
                tasks.forEach(task => {
                    if (!task.completed && task.endDate && new Date(task.endDate) < now && task.priority !== 'high') {
                        updateTask({ ...task, priority: 'high' });
                        processedCount++;
                    }
                });
            }

            toast.success(`자동화 실행 완료: ${processedCount}개 작업 업데이트됨`);
        } catch (e) {
            toast.error('자동화 실행 중 오류 발생');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    자동 상태 규칙 (Auto-Status)
                </CardTitle>
                <CardDescription>
                    반복적인 상태 변경 작업을 자동화합니다.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {rules.map(rule => (
                        <div key={rule.id} className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor={rule.id} className="font-medium cursor-pointer">
                                    {rule.name}
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    {rule.enabled ? '활성화됨' : '비활성화됨'}
                                </span>
                            </div>
                            <Switch
                                id={rule.id}
                                checked={rule.enabled}
                                onCheckedChange={() => toggleRule(rule.id)}
                            />
                        </div>
                    ))}
                </div>

                <Button
                    className="w-full"
                    onClick={runAutomation}
                    disabled={isRunning}
                >
                    {isRunning ? (
                        <>실행 중...</>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2" />
                            지금 실행하기
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
