'use client';

import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Search, Phone, Mail, Link2, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function WorkPeopleSection() {
    const { people } = useData();
    const [search, setSearch] = useState('');

    const filteredPeople = people.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.company?.toLowerCase().includes(search.toLowerCase()) ||
        p.role?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="이름, 회사, 직함으로 검색"
                        className="pl-10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Button>
                    <Users className="w-4 h-4 mr-2" /> 새 연락처 추가
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPeople.map(person => (
                    <Card key={person.id} className="hover:shadow-md transition-shadow border-slate-100">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12 border">
                                        <AvatarImage src={person.avatar} />
                                        <AvatarFallback>{person.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold">{person.name}</div>
                                        <div className="text-xs text-muted-foreground">{person.role} @ {person.company || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {person.phone && (
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => window.open(`tel:${person.phone}`)}>
                                            <Phone className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                    {person.email && (
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => window.open(`mailto:${person.email}`)}>
                                            <Mail className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-slate-50 rounded-lg">
                                    <Link2 className="w-3 h-3" />
                                    최근 상호작용: 3일 전
                                </div>
                                <Button variant="outline" className="w-full h-8 text-xs">
                                    상세 프로필 보기
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredPeople.length === 0 && (
                    <div className="col-span-full py-20 text-center text-muted-foreground bg-slate-50 rounded-2xl border-2 border-dashed">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>검색 결과가 없거나 등록된 인맥이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
