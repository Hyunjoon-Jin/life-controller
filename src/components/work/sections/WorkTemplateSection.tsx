'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout, Search, Plus, Copy, Star, Filter, Trash2, Edit2, FileText, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { generateId } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface WorkTemplate {
    id: string;
    title: string;
    category: string;
    tags: string[];
    content: string;
    starred: boolean;
    createdAt: string;
}

const STORAGE_KEY = 'work-templates';
const DEFAULT_TEMPLATES: WorkTemplate[] = [
    {
        id: 'default-1',
        title: '신규 프로젝트 시작 패키지',
        category: 'Project',
        tags: ['Planning', 'Setup'],
        content: `# 프로젝트명: [프로젝트명]\n\n## 1. 프로젝트 개요\n- **목적:**\n- **기간:**\n- **담당자:**\n\n## 2. 범위 정의\n- [ ] 핵심 기능 목록\n- [ ] 비범위 항목\n\n## 3. 마일스톤\n| 단계 | 기간 | 산출물 |\n|------|------|--------|\n| 기획 | 1주 | 기획서 |\n| 개발 | 4주 | 릴리즈 |\n| 테스트 | 1주 | 보고서 |\n\n## 4. 리스크 관리\n- 리스크 1:\n- 대응 방안:`,
        starred: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'default-2',
        title: '주간 업무 보고서 템플릿',
        category: 'Report',
        tags: ['Weekly', 'Review'],
        content: `# 주간 업무 보고서\n\n**보고 기간:** __월 __일 ~ __월 __일\n**작성자:**\n\n## 금주 수행 업무\n1.\n2.\n3.\n\n## 주요 성과\n-\n\n## 이슈 및 해결\n| 이슈 | 상태 | 해결방안 |\n|------|------|----------|\n| | | |\n\n## 차주 계획\n1.\n2.`,
        starred: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'default-3',
        title: '회의록 양식',
        category: 'Meeting',
        tags: ['Minutes', 'Record'],
        content: `# 회의록\n\n**일시:**\n**장소:**\n**참석자:**\n**작성자:**\n\n## 안건\n1.\n\n## 논의 내용\n-\n\n## 결정 사항\n- [ ]\n\n## Action Items\n| 담당자 | 업무 | 기한 |\n|--------|------|------|\n| | | |`,
        starred: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'default-4',
        title: '스프린트 회고 양식',
        category: 'Agile',
        tags: ['Retrospective', 'Scrum'],
        content: `# 스프린트 회고\n\n**스프린트:** #__\n**기간:** __월 __일 ~ __월 __일\n\n## 🟢 잘한 점 (Keep)\n-\n\n## 🟡 개선할 점 (Problem)\n-\n\n## 🔵 시도할 것 (Try)\n-\n\n## 액션 아이템\n- [ ]`,
        starred: true,
        createdAt: new Date().toISOString(),
    },
];

function loadTemplates(): WorkTemplate[] {
    if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch { /* ignore */ }
    return DEFAULT_TEMPLATES;
}

function saveTemplates(templates: WorkTemplate[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function WorkTemplateSection() {
    const [search, setSearch] = useState('');
    const [templates, setTemplates] = useState<WorkTemplate[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<WorkTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<WorkTemplate | null>(null);
    const [copiedContent, setCopiedContent] = useState<string | null>(null);

    // Form state
    const [formTitle, setFormTitle] = useState('');
    const [formCategory, setFormCategory] = useState('');
    const [formTags, setFormTags] = useState('');
    const [formContent, setFormContent] = useState('');

    useEffect(() => {
        setTemplates(loadTemplates());
    }, []);

    const persist = useCallback((updated: WorkTemplate[]) => {
        setTemplates(updated);
        saveTemplates(updated);
    }, []);

    const filteredTemplates = templates.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    const resetForm = () => {
        setFormTitle('');
        setFormCategory('');
        setFormTags('');
        setFormContent('');
        setEditingTemplate(null);
    };

    const openCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const openEdit = (template: WorkTemplate) => {
        setEditingTemplate(template);
        setFormTitle(template.title);
        setFormCategory(template.category);
        setFormTags(template.tags.join(', '));
        setFormContent(template.content);
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!formTitle.trim() || !formContent.trim()) {
            toast.error('제목과 내용을 입력해주세요.');
            return;
        }

        const tags = formTags.split(',').map(t => t.trim()).filter(Boolean);

        if (editingTemplate) {
            const updated = templates.map(t =>
                t.id === editingTemplate.id
                    ? { ...t, title: formTitle, category: formCategory || 'General', tags, content: formContent }
                    : t
            );
            persist(updated);
            toast.success('템플릿이 수정되었습니다.');
        } else {
            const newTemplate: WorkTemplate = {
                id: generateId(),
                title: formTitle,
                category: formCategory || 'General',
                tags,
                content: formContent,
                starred: false,
                createdAt: new Date().toISOString(),
            };
            persist([newTemplate, ...templates]);
            toast.success('새 템플릿이 생성되었습니다!');
        }

        setIsDialogOpen(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        const updated = templates.filter(t => t.id !== id);
        persist(updated);
        toast.success('템플릿이 삭제되었습니다.');
        setPreviewTemplate(null);
    };

    const handleToggleStar = (id: string) => {
        const updated = templates.map(t =>
            t.id === id ? { ...t, starred: !t.starred } : t
        );
        persist(updated);
    };

    const handleApplyTemplate = async (template: WorkTemplate) => {
        try {
            await navigator.clipboard.writeText(template.content);
            setCopiedContent(template.id);
            toast.success(`"${template.title}" 내용이 클립보드에 복사되었습니다. 원하는 곳에 붙여넣기 하세요!`);
            setTimeout(() => setCopiedContent(null), 2000);
        } catch {
            toast.info('템플릿을 열어서 내용을 확인해보세요.');
            setPreviewTemplate(template);
        }
    };

    const starredTemplates = filteredTemplates.filter(t => t.starred);
    const otherTemplates = filteredTemplates.filter(t => !t.starred);
    const sortedTemplates = [...starredTemplates, ...otherTemplates];

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="템플릿 이름, 카테고리, 태그 검색"
                        className="pl-10 h-10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={openCreate}>
                    <Plus className="w-4 h-4 mr-2" /> 새 템플릿 만들기
                </Button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTemplates.map(template => (
                    <Card key={template.id} className="group hover:ring-2 hover:ring-primary/20 transition-all border-slate-100 flex flex-col">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded">
                                    {template.category}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400"
                                    onClick={() => handleToggleStar(template.id)}
                                >
                                    <Star className={cn("w-4 h-4", template.starred && "fill-yellow-400 text-yellow-400")} />
                                </Button>
                            </div>
                            <CardTitle className="text-base font-bold mt-2 group-hover:text-primary transition-colors">
                                {template.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {template.tags.map(tag => (
                                    <span key={tag} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">#{tag}</span>
                                ))}
                            </div>
                            {/* Preview snippet */}
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                                {template.content.replace(/[#*\-\[\]|]/g, '').substring(0, 80)}...
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(template)}>
                                        <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => handleDelete(template.id)}>
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPreviewTemplate(template)}>
                                        <FileText className="w-3 h-3" />
                                    </Button>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 text-xs font-bold"
                                    onClick={() => handleApplyTemplate(template)}
                                >
                                    {copiedContent === template.id ? (
                                        <><Check className="w-3 h-3 mr-2 text-green-500" /> 복사됨!</>
                                    ) : (
                                        <><Copy className="w-3 h-3 mr-2" /> 템플릿 적용</>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Add New Template Card */}
                <Card
                    className="border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group min-h-[200px]"
                    onClick={openCreate}
                >
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform text-slate-400 group-hover:text-primary">
                        <Plus className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-sm">나만의 템플릿 등록</div>
                    <p className="text-xs text-muted-foreground mt-1">자주 쓰는 업무 방식을 저장하세요</p>
                </Card>
            </div>

            {filteredTemplates.length === 0 && search && (
                <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">검색 결과가 없습니다</p>
                    <p className="text-xs mt-1">다른 키워드로 검색하거나 새 템플릿을 만들어보세요.</p>
                </div>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? '템플릿 수정' : '새 템플릿 만들기'}</DialogTitle>
                        <DialogDescription>
                            {editingTemplate ? '템플릿 정보를 수정합니다.' : '자주 사용하는 문서 양식을 템플릿으로 저장하세요.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="templateTitle">제목</Label>
                            <Input
                                id="templateTitle"
                                placeholder="예: 주간 업무 보고서"
                                value={formTitle}
                                onChange={e => setFormTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="templateCategory">카테고리</Label>
                                <Input
                                    id="templateCategory"
                                    placeholder="예: Report, Meeting"
                                    value={formCategory}
                                    onChange={e => setFormCategory(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="templateTags">태그 (쉼표로 구분)</Label>
                                <Input
                                    id="templateTags"
                                    placeholder="예: Weekly, Review"
                                    value={formTags}
                                    onChange={e => setFormTags(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="templateContent">템플릿 내용</Label>
                            <Textarea
                                id="templateContent"
                                placeholder="문서 양식 내용을 입력하세요. 마크다운 형식을 지원합니다."
                                className="min-h-[300px] font-mono text-sm"
                                value={formContent}
                                onChange={e => setFormContent(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                            취소
                        </Button>
                        <Button onClick={handleSave}>
                            {editingTemplate ? '수정 완료' : '저장'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    {previewTemplate && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    {previewTemplate.title}
                                </DialogTitle>
                                <DialogDescription>
                                    {previewTemplate.category} · {previewTemplate.tags.map(t => `#${t}`).join(' ')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <pre className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-4 rounded-lg border max-h-[50vh] overflow-y-auto leading-relaxed">
                                    {previewTemplate.content}
                                </pre>
                            </div>
                            <DialogFooter className="flex gap-2">
                                <Button variant="outline" onClick={() => openEdit(previewTemplate)}>
                                    <Edit2 className="w-4 h-4 mr-2" /> 수정
                                </Button>
                                <Button onClick={() => handleApplyTemplate(previewTemplate)}>
                                    <Copy className="w-4 h-4 mr-2" /> 클립보드에 복사
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
