"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Copy, Trash2, FileText, Zap, LayoutTemplate } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataProvider';

type Template = {
    id: string;
    title: string;
    category: 'project' | 'task' | 'email';
    content: string; // JSON or Text
    tags: string[];
};

export function WorkTemplateSection() {
    // Mock Data for now, could be in DataProvider later
    const [templates, setTemplates] = useState<Template[]>([
        { id: '1', title: 'Standard Project Setup', category: 'project', content: 'Phase 1: Planning\nPhase 2: Design\nPhase 3: Dev', tags: ['Standard'] },
        { id: '2', title: 'Daily Report Format', category: 'email', content: '- Accomplished:\n- Issues:\n- Plan:', tags: ['Report'] },
    ]);

    const [isAdding, setIsAdding] = useState(false);
    const [newTemplate, setNewTemplate] = useState<Partial<Template>>({});

    const handleAdd = () => {
        if (!newTemplate.title) return;
        setTemplates([...templates, {
            id: Date.now().toString(),
            title: newTemplate.title!,
            category: (newTemplate.category as any) || 'task',
            content: newTemplate.content || '',
            tags: []
        }]);
        setIsAdding(false);
        setNewTemplate({});
    };

    const handleDelete = (id: string) => {
        setTemplates(templates.filter(t => t.id !== id));
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <LayoutTemplate className="w-6 h-6 text-primary" /> 템플릿 관리 (Templates)
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        반복되는 업무를 위한 프로젝트, 태스크, 문서 템플릿을 관리하세요.
                    </p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
                    <Plus className="w-4 h-4" /> 템플릿 추가
                </Button>
            </div>

            {isAdding && (
                <Card className="bg-slate-50 border-dashed">
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                placeholder="템플릿 제목"
                                value={newTemplate.title || ''}
                                onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })}
                            />
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={newTemplate.category || 'task'}
                                onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                            >
                                <option value="project">프로젝트 템플릿</option>
                                <option value="task">태스크 구조</option>
                                <option value="email">문서/이메일 서식</option>
                            </select>
                        </div>
                        <Textarea
                            placeholder="템플릿 내용..."
                            className="min-h-[100px]"
                            value={newTemplate.content || ''}
                            onChange={e => setNewTemplate({ ...newTemplate, content: e.target.value })}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsAdding(false)}>취소</Button>
                            <Button onClick={handleAdd}>저장</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 flex-1 content-start">
                <Card className="hover:border-primary/50 cursor-pointer transition-colors border-dashed flex items-center justify-center p-6 text-muted-foreground bg-slate-50/50" onClick={() => setIsAdding(true)}>
                    <div className="text-center">
                        <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <span>새 템플릿 만들기</span>
                    </div>
                </Card>
                {templates.map(template => (
                    <Card key={template.id} className="group hover:shadow-md transition-all relative">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="secondary" className="mb-2">{template.category === 'project' ? '프로젝트' : (template.category === 'email' ? '문서' : '태스크')}</Badge>
                                    <CardTitle className="text-lg">{template.title}</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 p-3 rounded-md text-xs text-slate-600 font-mono whitespace-pre-wrap line-clamp-4">
                                {template.content}
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button variant="outline" size="sm" className="w-full gap-2">
                                    <Copy className="w-3.5 h-3.5" /> 사용하기 (복사)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
