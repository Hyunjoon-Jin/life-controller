import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Palette, Plus, Trash2, Calendar as CalendarIcon, Tag, Star, Music, Gamepad2, Utensils, Dumbbell, MoreHorizontal, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { HobbyEntry } from '@/types';

export function HobbyLog() {
    const { hobbyEntries, addHobbyEntry, deleteHobbyEntry } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        activity: '',
        category: 'other',
        duration: '',
        content: '',
        satisfaction: 3,
        link: '',
        tags: ''
    });

    const handleSave = () => {
        if (!formData.activity) return;

        addHobbyEntry({
            id: generateId(),
            date: new Date(),
            activity: formData.activity,
            category: formData.category,
            duration: parseInt(formData.duration) || 0,
            content: formData.content,
            satisfaction: formData.satisfaction,
            link: formData.link,
            tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
        });

        setIsDialogOpen(false);
        setFormData({ activity: '', category: 'other', duration: '', content: '', satisfaction: 3, link: '', tags: '' });
    };

    const getCategoryIcon = (category?: string) => {
        switch (category) {
            case 'music': return <Music className="w-4 h-4" />;
            case 'art': return <Palette className="w-4 h-4" />;
            case 'game': return <Gamepad2 className="w-4 h-4" />;
            case 'cooking': return <Utensils className="w-4 h-4" />;
            case 'sport': return <Dumbbell className="w-4 h-4" />;
            default: return <Palette className="w-4 h-4" />;
        }
    };

    const getCategoryLabel = (category?: string) => {
        switch (category) {
            case 'music': return '음악';
            case 'art': return '미술/창작';
            case 'game': return '게임';
            case 'cooking': return '요리';
            case 'sport': return '운동/액티비티';
            default: return '기타';
        }
    };

    const sortedEntries = hobbyEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Palette className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">취미 생활</h2>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> 활동 기록하기
                </Button>
            </div>

            {/* List */}
            {sortedEntries.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    <Palette className="w-16 h-16 mb-4" />
                    <p>나만의 즐거운 시간을 기록해보세요.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedEntries.map(entry => (
                        <Card key={entry.id} className="hover:shadow-md transition-shadow flex flex-col">
                            <CardContent className="p-4 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                                            {getCategoryIcon(entry.category)}
                                            {getCategoryLabel(entry.category)}
                                        </span>
                                        {entry.satisfaction && (
                                            <div className="flex text-yellow-500">
                                                {Array.from({ length: entry.satisfaction }).map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 fill-current" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(entry.date), 'MM.dd')}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-primary mb-1">{entry.activity}</h3>

                                <p className="text-sm text-foreground/80 mb-4 whitespace-pre-wrap flex-1 line-clamp-3">
                                    {entry.content}
                                </p>

                                <div className="mt-auto space-y-2">
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground items-center justify-between border-t pt-2">
                                        <div className="flex items-center gap-3">
                                            {entry.duration && entry.duration > 0 && (
                                                <span>⏱️ {entry.duration}분</span>
                                            )}
                                            {entry.link && (
                                                <a href={entry.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                                    <ExternalLink className="w-3 h-3" /> 링크
                                                </a>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-500 -mr-2" onClick={() => deleteHobbyEntry(entry.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>

                                    {entry.tags && entry.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {entry.tags.map(tag => (
                                                <span key={tag} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-md text-secondary-foreground">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>취미 활동 추가</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>카테고리</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="other">기타</option>
                                    <option value="music">음악</option>
                                    <option value="art">미술/창작</option>
                                    <option value="game">게임</option>
                                    <option value="cooking">요리</option>
                                    <option value="sport">운동/액티비티</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label>만족도 (1-5)</Label>
                                <div className="flex items-center gap-1 h-10">
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <button
                                            key={score}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, satisfaction: score })}
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                                formData.satisfaction >= score ? "text-yellow-500 hover:bg-yellow-50" : "text-gray-300 hover:text-yellow-300"
                                            )}
                                        >
                                            <Star className={cn("w-6 h-6", formData.satisfaction >= score && "fill-current")} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>활동명</Label>
                            <Input
                                placeholder="예: 피아노 연습, 수채화 그리기"
                                value={formData.activity}
                                onChange={e => setFormData({ ...formData, activity: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>시간 (분)</Label>
                            <Input
                                type="number"
                                placeholder="30"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>관련 링크 (선택)</Label>
                            <Input
                                placeholder="https://youtube.com/..."
                                value={formData.link}
                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>내용 / 감상</Label>
                            <textarea
                                className="w-full bg-background border rounded-md p-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="오늘의 활동은 어땠나요?"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>태그 (쉼표로 구분)</Label>
                            <Input
                                placeholder="쇼팽, 풍경화, 힐링"
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} disabled={!formData.activity}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
