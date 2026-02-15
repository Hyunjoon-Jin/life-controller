"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// Removed ScrollArea import
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    LayoutTemplate, Search, Download, Heart, Star, User,
    FileText, FileCheck, FileSignature, FileSpreadsheet,
    Plus, Trash2, Copy, ExternalLink, ThumbsUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentTemplate } from '@/types';
import { toast } from 'sonner';

// Mock Data for Community Hub - Korean Translation
const MOCK_STORE_TEMPLATES: DocumentTemplate[] = [
    {
        id: 'store-1',
        title: '주간 업무 보고서 (WBR)',
        category: 'report',
        description: 'KPI, 성과, 이슈 및 리스크를 중심으로 한 표준 주간 업무 보고 양식입니다.',
        content: '# 주간 업무 보고서 (WBR)\n\n## 1. 요약 (Executive Summary)\n\n## 2. 핵심 지표 (KPIs)\n\n## 3. 주요 성과\n\n## 4. 이슈 및 리스크\n\n## 5. 차주 계획',
        author: '기획팀',
        downloads: 1250,
        likes: 342,
        isOfficial: true,
        createdAt: new Date('2024-01-15')
    },
    {
        id: 'store-2',
        title: '표준 프로젝트 제안서',
        category: 'proposal',
        description: '예산, 일정, 리소스 계획을 포함한 포괄적인 프로젝트 제안서 템플릿입니다.',
        content: '# 프로젝트 제안서\n\n## 배경 및 목적\n\n## 목표\n\n## 범위 (Scope)\n\n## 일정 계획 (Timeline)\n\n## 예산 (Budget)\n\n## 필요 리소스',
        author: 'PMO',
        downloads: 890,
        likes: 215,
        isOfficial: true,
        createdAt: new Date('2024-02-10')
    },
    {
        id: 'store-3',
        title: '회의록 (Agile)',
        category: 'minutes',
        description: '액션 아이템과 결정 사항을 효율적으로 기록할 수 있는 회의록 양식입니다.',
        content: '# 회의록\n\n**일시:** \n**참석자:** \n\n## 아젠다\n\n## 논의 내용\n\n## 결정 사항\n\n## 액션 아이템\n- [ ] 할 일 1 (@담당자)\n- [ ] 할 일 2 (@담당자)',
        author: '애자일 코치',
        downloads: 560,
        likes: 120,
        isOfficial: false,
        createdAt: new Date('2024-03-05')
    },
    {
        id: 'store-4',
        title: '자문 용역 계약서',
        category: 'contract',
        description: '표준 자문 용역 계약서 양식입니다.',
        content: '# 자문 용역 계약서\n\n본 계약은...',
        author: '법무팀',
        downloads: 340,
        likes: 85,
        isOfficial: true,
        createdAt: new Date('2024-01-20')
    },
    {
        id: 'store-5',
        title: '일일 스크럼 노트',
        category: 'report',
        description: '매일의 진행 상황을 공유하기 위한 간단한 양식입니다.',
        content: '# 일일 스크럼\n\n- 어제 한 일:\n- 오늘 할 일:\n- 방해 요소 (Blockers):',
        author: '개발팀',
        downloads: 2100,
        likes: 560,
        isOfficial: false,
        createdAt: new Date('2024-04-01')
    }
];

export function WorkTemplateSection() {
    // Local state for "My Templates" (In a real app, this would persist)
    const [myTemplates, setMyTemplates] = useState<DocumentTemplate[]>([
        MOCK_STORE_TEMPLATES[0], // Pre-installed
        MOCK_STORE_TEMPLATES[2]  // Pre-installed
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('hub'); // Default to Hub to show off the store
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Filter Logic
    const filteredStoreTemplates = MOCK_STORE_TEMPLATES.filter(loading => {
        const matchesSearch = loading.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loading.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? loading.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    const handleDownload = (template: DocumentTemplate) => {
        if (myTemplates.find(t => t.id === template.id)) {
            toast.error("이미 다운로드한 템플릿입니다.");
            return;
        }
        setMyTemplates(prev => [...prev, { ...template, id: `my-${Date.now()}` }]); // New ID for local copy
        toast.success("템플릿이 보관함에 추가되었습니다.");
    };

    const handleDelete = (id: string) => {
        setMyTemplates(prev => prev.filter(t => t.id !== id));
        toast.success("템플릿이 삭제되었습니다.");
    };

    const getIconByCategory = (category: string) => {
        switch (category) {
            case 'report': return FileText;
            case 'contract': return FileSignature;
            case 'minutes': return FileCheck;
            case 'proposal': return FileSpreadsheet;
            default: return LayoutTemplate;
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <LayoutTemplate className="w-6 h-6 text-primary" /> 문서 템플릿 허브 (Template Hub)
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        전 세계 사용자들이 공유한 업무용 템플릿을 탐색하고 내 보관함에 저장하세요.
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col overflow-hidden">
                <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0 space-x-6 shrink-0">
                    <TabsTrigger
                        value="hub"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm"
                    >
                        커뮤니티 허브
                    </TabsTrigger>
                    <TabsTrigger
                        value="my"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm"
                    >
                        내 템플릿 ({myTemplates.length})
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden mt-6 relative">
                    {/* COMMUNITY HUB */}
                    <TabsContent value="hub" className="h-full flex flex-col m-0 space-y-4 absolute inset-0">
                        {/* Search & Filter */}
                        <div className="flex gap-4 items-center shrink-0">
                            <div className="relative flex-1 max-w-lg">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="템플릿 검색 (예: 회의록, 제안서...)"
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                {['all', 'report', 'proposal', 'minutes', 'contract'].map(cat => (
                                    <Button
                                        key={cat}
                                        variant={selectedCategory === (cat === 'all' ? null : cat) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCategory(cat === 'all' ? null : cat)}
                                        className="capitalize"
                                    >
                                        {cat === 'all' ? '전체' :
                                            cat === 'report' ? '보고서' :
                                                cat === 'proposal' ? '제안서' :
                                                    cat === 'minutes' ? '회의록' : '계약서'}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Store Grid - Replaced ScrollArea with div */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredStoreTemplates.map(template => {
                                    const Icon = getIconByCategory(template.category);
                                    return (
                                        <Card key={template.id} className="group hover:shadow-lg transition-all border-slate-200">
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge variant={template.isOfficial ? "default" : "secondary"} className="text-xs">
                                                        {template.isOfficial ? "공식" : "커뮤니티"}
                                                    </Badge>
                                                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                                                        <Heart className="w-3 h-3 fill-red-100 text-red-500" /> {template.likes}
                                                    </div>
                                                </div>
                                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                                    <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="truncate">{template.title}</span>
                                                </CardTitle>
                                                <CardDescription className="text-xs line-clamp-2 min-h-[2.5em]">
                                                    {template.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                                    <User className="w-3 h-3" /> {template.author}
                                                    <span className="mx-1">•</span>
                                                    <Download className="w-3 h-3" /> {template.downloads.toLocaleString()}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="p-3 bg-slate-50 border-t flex justify-end">
                                                <Button size="sm" className="w-full gap-2" onClick={() => handleDownload(template)}>
                                                    <Download className="w-4 h-4" /> 다운로드
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </TabsContent>

                    {/* MY TEMPLATES */}
                    <TabsContent value="my" className="h-full m-0 absolute inset-0">
                        {/* Replaced ScrollArea with div */}
                        <div className="h-full overflow-y-auto custom-scrollbar pr-2 pb-10">
                            {myTemplates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground border-2 border-dashed rounded-xl">
                                    <LayoutTemplate className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-lg font-medium">보관함이 비어있습니다</p>
                                    <p className="text-sm">커뮤니티 허브에서 유용한 템플릿을 찾아보세요.</p>
                                    <Button variant="link" onClick={() => setActiveTab('hub')}>허브로 이동</Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myTemplates.map(template => {
                                        const Icon = getIconByCategory(template.category);
                                        return (
                                            <Card key={template.id} className="group hover:border-primary/50 transition-all">
                                                <CardHeader className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <Badge variant="outline">{template.category}</Badge>
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => handleDelete(template.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <CardTitle className="text-lg mt-2 flex items-center gap-2">
                                                        <Icon className="w-5 h-5 text-primary" />
                                                        {template.title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0">
                                                    <div className="bg-slate-50 p-3 rounded-md text-xs text-slate-600 font-mono whitespace-pre-wrap line-clamp-4 h-[80px]">
                                                        {template.content.slice(0, 150)}...
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="p-3 flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => {
                                                        navigator.clipboard.writeText(template.content).then(() => {
                                                            toast.success(`"${template.title}" 템플릿이 클립보드에 복사되었습니다.`);
                                                        }).catch(() => {
                                                            toast.info('내용을 복사할 수 없습니다. 수동으로 복사해주세요.');
                                                        });
                                                    }}>
                                                        <Copy className="w-3.5 h-3.5" /> 사용하기
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
