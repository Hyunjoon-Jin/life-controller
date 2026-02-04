'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout, Search, Plus, Copy, CheckCircle2, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function WorkTemplateSection() {
    const [search, setSearch] = useState('');

    const templates = [
        { id: '1', title: '신규 프로젝트 시작 패키지', category: 'Project', tags: ['Planning', 'Setup'], uses: 124, rating: 4.8 },
        { id: '2', title: '주간 업무 보고서 템플릿', category: 'Report', tags: ['Weekly', 'Review'], uses: 56, rating: 4.5 },
        { id: '3', title: '기술 설계 브리프 (TDD)', category: 'Technical', tags: ['Backend', 'Design'], uses: 89, rating: 4.9 },
        { id: '4', title: '고객 온보딩 체크리스트', category: 'CS', tags: ['Client', 'Checklist'], uses: 32, rating: 4.2 },
        { id: '5', title: '스프린트 회고 양식', category: 'Agile', tags: ['Retrospective', 'Scrum'], uses: 210, rating: 5.0 },
    ];

    const filteredTemplates = templates.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="템플릿 이름, 카테고리 검색"
                        className="pl-10 h-10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> 필터</Button>
                    <Button><Plus className="w-4 h-4 mr-2" /> 새 템플릿 만들기</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                    <Card key={template.id} className="group hover:ring-2 hover:ring-primary/20 transition-all border-slate-100">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded">
                                    {template.category}
                                </span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                    <Star className="w-4 h-4" />
                                </Button>
                            </div>
                            <CardTitle className="text-base font-bold mt-2 group-hover:text-primary transition-colors">
                                {template.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {template.tags.map(tag => (
                                    <span key={tag} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">#{tag}</span>
                                ))}
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="text-[10px] text-muted-foreground">
                                    {template.uses.toLocaleString()}회 사용됨
                                </div>
                                <Button size="sm" variant="secondary" className="h-8 text-xs font-bold">
                                    <Copy className="w-3 h-3 mr-2" /> 템플릿 적용
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform text-slate-400 group-hover:text-primary">
                        <Plus className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-sm">나만의 템플릿 등록</div>
                    <p className="text-xs text-muted-foreground mt-1">자주 쓰는 업무 방식을 저장하세요</p>
                </Card>
            </div>
        </div>
    );
}
