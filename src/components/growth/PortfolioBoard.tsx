'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, GraduationCap, User, Plus, Trash2, Edit2, Link as LinkIcon, Calendar, ExternalLink, Mail, Phone, MapPin, Linkedin, Github, Trophy, Languages, Award, Building2, Search, Paperclip, X } from 'lucide-react';
import { format } from 'date-fns';
import { PortfolioItem, UserProfile, Education, Career, Activity, CareerProject } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function PortfolioBoard() {
    const {
        userProfile, updateUserProfile,
        educations, addEducation, updateEducation, deleteEducation,
        careers, addCareer, updateCareer, deleteCareer,
        portfolios, addPortfolio, updatePortfolio, deletePortfolio,
        activities, addActivity, updateActivity, deleteActivity, // New
        certificates, // Read-only view
        languageEntries // Read-only view
    } = useData();

    const [modal, setModal] = useState<{ type: 'profile' | 'education' | 'career' | 'project' | 'activity', id?: string } | null>(null);

    // --- Profile Modal State ---
    const [profileForm, setProfileForm] = useState<UserProfile>(userProfile);

    // --- Education Modal State ---
    const [eduForm, setEduForm] = useState<Partial<Education>>({});
    const [schoolSearch, setSchoolSearch] = useState(''); // New

    // --- Career Modal State ---
    const [careerForm, setCareerForm] = useState<Partial<Career>>({});

    // --- Project Modal State ---
    const [projectForm, setProjectForm] = useState<Partial<PortfolioItem>>({});
    const [projectTechStack, setProjectTechStack] = useState('');

    // --- Activity Modal State ---
    const [activityForm, setActivityForm] = useState<Partial<Activity>>({});

    const openModal = (type: 'profile' | 'education' | 'career' | 'project' | 'activity', id?: string) => {
        setModal({ type, id });
        if (type === 'profile') {
            setProfileForm(userProfile);
        } else if (type === 'education') {
            if (id) {
                const edu = educations.find(e => e.id === id);
                if (edu) {
                    setEduForm(edu);
                    setSchoolSearch(edu.school);
                }
            } else {
                setEduForm({ school: '', degree: '', major: '', startDate: new Date(), isCurrent: false });
                setSchoolSearch('');
            }
        } else if (type === 'career') {
            if (id) {
                const car = careers.find(c => c.id === id);
                if (car) setCareerForm(car);
            } else {
                setCareerForm({ company: '', position: '', startDate: new Date(), isCurrent: false, techStack: [], projects: [], files: [] });
            }
        } else if (type === 'project') {
            if (id) {
                const proj = portfolios.find(p => p.id === id);
                if (proj) {
                    setProjectForm(proj);
                    setProjectTechStack(proj.techStack?.join(', ') || '');
                }
            } else {
                setProjectForm({ title: '', period: '', description: '', techStack: [], links: [] });
                setProjectTechStack('');
            }
        } else if (type === 'activity') {
            if (id) {
                const act = activities.find(a => a.id === id);
                if (act) setActivityForm(act);
            } else {
                setActivityForm({ type: 'other', title: '', organization: '', startDate: new Date(), description: '' });
            }
        }
    };

    const handleSaveProfile = () => {
        updateUserProfile(profileForm);
        setModal(null);
    };

    const handleSaveEducation = () => {
        if (!eduForm.school || !eduForm.degree) return;
        const edu: Education = {
            id: eduForm.id || generateId(),
            school: eduForm.school!,
            degree: eduForm.degree!,
            major: eduForm.major || '',
            startDate: eduForm.startDate || new Date(),
            endDate: eduForm.endDate,
            isCurrent: eduForm.isCurrent || false,
            gpa: eduForm.gpa,
            description: eduForm.description
        };
        if (eduForm.id) updateEducation(edu); else addEducation(edu);
        setModal(null);
    };

    const handleSaveCareer = () => {
        if (!careerForm.company || !careerForm.position) return;
        const car: Career = {
            id: careerForm.id || generateId(),
            company: careerForm.company!,
            position: careerForm.position!,
            startDate: careerForm.startDate || new Date(),
            endDate: careerForm.endDate,
            isCurrent: careerForm.isCurrent || false,
            description: careerForm.description,
            techStack: careerForm.techStack,
            team: careerForm.team
        };
        if (careerForm.id) updateCareer(car); else addCareer(car);
        setModal(null);
    };

    const handleSaveProject = () => {
        if (!projectForm.title) return;
        const proj: PortfolioItem = {
            id: projectForm.id || generateId(),
            title: projectForm.title!,
            period: projectForm.period || '',
            role: projectForm.role,
            description: projectForm.description || '',
            techStack: projectTechStack.split(',').map(t => t.trim()).filter(Boolean),
            links: projectForm.links || []
        };
        if (projectForm.id) updatePortfolio(proj); else addPortfolio(proj);
        setModal(null);
    };

    const handleSaveActivity = () => {
        if (!activityForm.title) return;
        const act: Activity = {
            id: activityForm.id || generateId(),
            type: activityForm.type || 'other',
            title: activityForm.title!,
            organization: activityForm.organization,
            startDate: activityForm.startDate || new Date(),
            endDate: activityForm.endDate,
            description: activityForm.description || '',
            role: activityForm.role,
            files: activityForm.files || []
        };
        if (activityForm.id) updateActivity(act); else addActivity(act);
        setModal(null);
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-slate-50/50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header / Profile Section */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start relative group">
                    {/* Edit Profile Button */}
                    <Button
                        size="icon" variant="ghost"
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openModal('profile')}
                    >
                        <Edit2 className="w-4 h-4 text-slate-400" />
                    </Button>

                    <div className="flex-shrink-0">
                        <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                            <AvatarImage src={userProfile.photo} />
                            <AvatarFallback className="text-4xl bg-slate-200 text-slate-400">
                                <User />
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{userProfile.name}</h1>
                            <p className="text-xl text-primary font-medium">{userProfile.jobTitle}</p>
                        </div>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {userProfile.bio}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" /> {userProfile.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" /> {userProfile.phone}
                            </div>
                            {userProfile.address && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> {userProfile.address}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Education, Certifications, Languages, Skills */}
                    <div className="space-y-8">
                        {/* Education */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                    <GraduationCap className="w-5 h-5 text-primary" /> 학력
                                </h2>
                                <Button size="sm" variant="ghost" onClick={() => openModal('education')}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {educations.map(edu => (
                                    <Card key={edu.id} className="group relative hover:shadow-md transition-all border-l-4 border-l-slate-300">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{edu.school}</h3>
                                                    <p className="text-sm text-slate-600">{edu.major} {edu.degree}</p>
                                                </div>
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openModal('education', edu.id)}>
                                                        <Edit2 className="w-3 h-3" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-red-500" onClick={() => deleteEducation(edu.id)}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(edu.startDate), 'yyyy.MM')} - {edu.isCurrent ? '재학 중' : (edu.endDate ? format(new Date(edu.endDate), 'yyyy.MM') : '')}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* Languages (Read-only from LanguageLog) */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                    <Languages className="w-5 h-5 text-primary" /> 어학
                                </h2>
                            </div>
                            <div className="flex flex-col gap-2">
                                {languageEntries.length > 0 ? (
                                    languageEntries.map(lang => (
                                        <div key={lang.id} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <span className="font-semibold text-slate-700">{lang.language}</span>
                                            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                                {format(new Date(lang.date), 'yyyy.MM.dd')} 기록
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-xl text-center">
                                        기록된 어학 정보가 없습니다.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Certificates (Read-only from CertificateManager) */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                    <Award className="w-5 h-5 text-primary" /> 자격증
                                </h2>
                            </div>
                            <div className="flex flex-col gap-2">
                                {certificates.map(cert => (
                                    <div key={cert.id} className="bg-white p-3 rounded-xl border border-slate-100">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-bold text-slate-800">{cert.name}</span>
                                            {cert.score && <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{cert.score}</span>}
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>{cert.issuer}</span>
                                            <span>{cert.status === 'acquired' ? '취득' : '준비중'}</span>
                                        </div>
                                    </div>
                                ))}
                                {certificates.length === 0 && (
                                    <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-xl text-center">
                                        기록된 자격증이 없습니다.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Career, Projects */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Career */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                    <Briefcase className="w-5 h-5 text-primary" /> 경력
                                </h2>
                                <Button size="sm" variant="ghost" onClick={() => openModal('career')}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-8 py-2">
                                {careers
                                    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                                    .map(career => (
                                        <div key={career.id} className="relative group">
                                            <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white bg-primary shadow-sm" />

                                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900">{career.position}</h3>
                                                        <div className="text-primary font-medium">{career.company}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                                            {format(new Date(career.startDate), 'yyyy.MM')} - {career.isCurrent ? '현재' : (career.endDate ? format(new Date(career.endDate), 'yyyy.MM') : '')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-slate-600 text-sm whitespace-pre-wrap mb-4">
                                                    {career.description}
                                                </p>

                                                {career.techStack && career.techStack.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {career.techStack.map(tech => (
                                                            <span key={tech} className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded-md border border-slate-100">
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex gap-1 bg-white/80 backdrop-blur-sm rounded-md p-1">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openModal('career', career.id)}>
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500" onClick={() => deleteCareer(career.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </section>

                        {/* Projects */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                    <Trophy className="w-5 h-5 text-primary" /> 프로젝트
                                </h2>
                                <Button size="sm" variant="ghost" onClick={() => openModal('project')}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {portfolios.map(proj => (
                                    <div key={proj.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-slate-900">{proj.title}</h3>
                                            <span className="text-xs text-slate-400 font-medium border border-slate-200 px-2 py-1 rounded-full">
                                                {proj.period}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium text-primary mb-3">
                                            {proj.role}
                                        </div>
                                        <p className="text-slate-600 text-sm whitespace-pre-wrap mb-4">
                                            {proj.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {proj.techStack?.map(tech => (
                                                <span key={tech} className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>

                                        {proj.links && proj.links.length > 0 && (
                                            <div className="flex gap-3">
                                                {proj.links.map((link, idx) => (
                                                    <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                                        <ExternalLink className="w-3 h-3" /> {link.label || 'Link'}
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex gap-1 bg-white/80 backdrop-blur-sm rounded-md p-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openModal('project', proj.id)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500" onClick={() => deletePortfolio(proj.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Activities */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                    <Building2 className="w-5 h-5 text-primary" /> 대외활동 및 기타
                                </h2>
                                <Button size="sm" variant="ghost" onClick={() => openModal('activity')}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {activities.map(act => (
                                    <div key={act.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">{act.title}</h3>
                                                <div className="text-sm text-slate-500 font-medium">{act.organization}</div>
                                            </div>
                                            <span className={cn(
                                                "text-xs font-bold px-2 py-1 rounded-full border",
                                                act.type === 'award' ? "text-purple-600 bg-purple-50 border-purple-200" :
                                                    act.type === 'club' ? "text-blue-600 bg-blue-50 border-blue-200" :
                                                        "text-slate-600 bg-slate-50 border-slate-200"
                                            )}>
                                                {act.type === 'award' ? '수상이력' : (act.type === 'club' ? '동아리' : (act.type === 'volunteering' ? '봉사활동' : '기타'))}
                                            </span>
                                        </div>

                                        <div className="text-sm text-slate-400 mb-3 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {format(new Date(act.startDate), 'yyyy.MM')} - {act.endDate ? format(new Date(act.endDate), 'yyyy.MM') : '진행 중'}
                                        </div>

                                        <p className="text-slate-600 text-sm whitespace-pre-wrap">
                                            {act.description}
                                        </p>

                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex gap-1 bg-white/80 backdrop-blur-sm rounded-md p-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openModal('activity', act.id)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500" onClick={() => deleteActivity(act.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Profile Edit Modal */}
            <Dialog open={modal?.type === 'profile'} onOpenChange={(open) => !open && setModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>프로필 수정</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>이름</Label>
                            <Input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>직함 (Job Title)</Label>
                            <Input value={profileForm.jobTitle} onChange={e => setProfileForm({ ...profileForm, jobTitle: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>연락처</Label>
                            <Input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>이메일</Label>
                            <Input value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>주소</Label>
                            <Input value={profileForm.address || ''} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>소개글</Label>
                            <Textarea
                                className="h-24"
                                value={profileForm.bio}
                                onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveProfile}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Abstract Modals for other sections would be similar - Implementing concise versions */}
            {/* Education Modal */}
            <Dialog open={modal?.type === 'education'} onOpenChange={(open) => !open && setModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>학력 추가/수정</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>학교명</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="학교명을 입력하세요"
                                    value={schoolSearch}
                                    onChange={e => {
                                        setSchoolSearch(e.target.value);
                                        setEduForm({ ...eduForm, school: e.target.value });
                                    }}
                                />
                                <Button variant="outline" size="icon" title="학교 검색">
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="학위 (예: 학사, 석사)" value={eduForm.degree || ''} onChange={e => setEduForm({ ...eduForm, degree: e.target.value })} />
                            <Input placeholder="전공" value={eduForm.major || ''} onChange={e => setEduForm({ ...eduForm, major: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>입학일</Label>
                                <Input type="date" value={eduForm.startDate ? format(new Date(eduForm.startDate), 'yyyy-MM-dd') : ''} onChange={e => setEduForm({ ...eduForm, startDate: new Date(e.target.value) })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>졸업일 (예정)</Label>
                                <Input
                                    type="date"
                                    value={eduForm.endDate ? format(new Date(eduForm.endDate), 'yyyy-MM-dd') : ''}
                                    onChange={e => setEduForm({ ...eduForm, endDate: new Date(e.target.value) })}
                                    disabled={eduForm.isCurrent}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox" id="eduCurrent"
                                checked={eduForm.isCurrent || false}
                                onChange={e => setEduForm({ ...eduForm, isCurrent: e.target.checked, endDate: e.target.checked ? undefined : eduForm.endDate })}
                            />
                            <Label htmlFor="eduCurrent">재학 중</Label>
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveEducation}>저장</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Career Modal */}
            <Dialog open={modal?.type === 'career'} onOpenChange={(open) => !open && setModal(null)}>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle>경력 추가/수정</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Basic Info */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase">기본 정보</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="회사명" value={careerForm.company || ''} onChange={e => setCareerForm({ ...careerForm, company: e.target.value })} />
                                <Input placeholder="직위/직책" value={careerForm.position || ''} onChange={e => setCareerForm({ ...careerForm, position: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>입사일</Label>
                                    <Input type="date" value={careerForm.startDate ? format(new Date(careerForm.startDate), 'yyyy-MM-dd') : ''} onChange={e => setCareerForm({ ...careerForm, startDate: new Date(e.target.value) })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>퇴사일</Label>
                                    <Input
                                        type="date"
                                        value={careerForm.endDate ? format(new Date(careerForm.endDate), 'yyyy-MM-dd') : ''}
                                        onChange={e => setCareerForm({ ...careerForm, endDate: new Date(e.target.value) })}
                                        disabled={careerForm.isCurrent}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox" id="carCurrent"
                                    checked={careerForm.isCurrent || false}
                                    onChange={e => setCareerForm({ ...careerForm, isCurrent: e.target.checked, endDate: e.target.checked ? undefined : careerForm.endDate })}
                                />
                                <Label htmlFor="carCurrent">재직 중</Label>
                            </div>
                            <Textarea placeholder="주요 업무 내용 (Summary)" value={careerForm.description || ''} onChange={e => setCareerForm({ ...careerForm, description: e.target.value })} />
                        </section>

                        {/* Projects (Simple List Implementation) */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-500 uppercase">주요 프로젝트</h3>
                                <Button size="sm" variant="outline" onClick={() => {
                                    const newProj: CareerProject = { title: '새 프로젝트', description: '' };
                                    setCareerForm({ ...careerForm, projects: [...(careerForm.projects || []), newProj] });
                                }}>
                                    <Plus className="w-3 h-3 mr-1" /> 프로젝트 추가
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {(careerForm.projects || []).map((proj, idx) => (
                                    <div key={idx} className="border rounded-lg p-4 space-y-3 bg-slate-50 relative group">
                                        <Button
                                            size="icon" variant="ghost" className="h-6 w-6 absolute top-2 right-2 text-slate-400 hover:text-red-500"
                                            onClick={() => {
                                                const newProjs = [...(careerForm.projects || [])];
                                                newProjs.splice(idx, 1);
                                                setCareerForm({ ...careerForm, projects: newProjs });
                                            }}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>

                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                placeholder="프로젝트명"
                                                value={proj.title}
                                                onChange={e => {
                                                    const newProjs = [...(careerForm.projects || [])];
                                                    newProjs[idx].title = e.target.value;
                                                    setCareerForm({ ...careerForm, projects: newProjs });
                                                }}
                                                className="bg-white"
                                            />
                                            <Input
                                                placeholder="역할 (Role)"
                                                value={proj.role || ''}
                                                onChange={e => {
                                                    const newProjs = [...(careerForm.projects || [])];
                                                    newProjs[idx].role = e.target.value;
                                                    setCareerForm({ ...careerForm, projects: newProjs });
                                                }}
                                                className="bg-white"
                                            />
                                        </div>
                                        <Textarea
                                            placeholder="성과 및 상세 설명"
                                            value={proj.description}
                                            onChange={e => {
                                                const newProjs = [...(careerForm.projects || [])];
                                                newProjs[idx].description = e.target.value;
                                                setCareerForm({ ...careerForm, projects: newProjs });
                                            }}
                                            className="bg-white text-sm"
                                        />

                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                placeholder="기간 (예: 2023.01 - 2023.06)"
                                                value={proj.period || ''}
                                                onChange={e => {
                                                    const newProjs = [...(careerForm.projects || [])];
                                                    newProjs[idx].period = e.target.value;
                                                    setCareerForm({ ...careerForm, projects: newProjs });
                                                }}
                                                className="bg-white text-xs h-8"
                                            />
                                            <Input
                                                placeholder="사용 기술 (Tech Stack)"
                                                value={proj.techStack?.join(', ') || ''}
                                                onChange={e => {
                                                    const newProjs = [...(careerForm.projects || [])];
                                                    newProjs[idx].techStack = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                    setCareerForm({ ...careerForm, projects: newProjs });
                                                }}
                                                className="bg-white text-xs h-8"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Files / Attachments */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-500 uppercase">증빙 자료 / 첨부 파일</h3>
                                <Button size="sm" variant="outline" onClick={() => {
                                    const newFile = { name: '', url: '' };
                                    setCareerForm({ ...careerForm, files: [...(careerForm.files || []), newFile] });
                                }}>
                                    <Paperclip className="w-3 h-3 mr-1" /> 파일 추가
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {(careerForm.files || []).map((file, idx) => (
                                    <div key={idx} className="flex gap-2 items-center text-sm">
                                        <Input
                                            placeholder="파일명 (예: 경력증명서)"
                                            value={file.name}
                                            onChange={e => {
                                                const newFiles = [...(careerForm.files || [])];
                                                newFiles[idx].name = e.target.value;
                                                setCareerForm({ ...careerForm, files: newFiles });
                                            }}
                                            className="flex-1"
                                        />
                                        <Input
                                            placeholder="URL (Link)"
                                            value={file.url}
                                            onChange={e => {
                                                const newFiles = [...(careerForm.files || [])];
                                                newFiles[idx].url = e.target.value;
                                                setCareerForm({ ...careerForm, files: newFiles });
                                            }}
                                            className="flex-[2]"
                                        />
                                        <Button
                                            size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500"
                                            onClick={() => {
                                                const newFiles = [...(careerForm.files || [])];
                                                newFiles.splice(idx, 1);
                                                setCareerForm({ ...careerForm, files: newFiles });
                                            }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                    <DialogFooter className="p-6 border-t bg-white">
                        <Button onClick={handleSaveCareer}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Activity Modal */}
            <Dialog open={modal?.type === 'activity'} onOpenChange={(open) => !open && setModal(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>대외활동 추가/수정</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>활동 구분</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={activityForm.type}
                                onChange={e => setActivityForm({ ...activityForm, type: e.target.value as any })}
                            >
                                <option value="club">동아리/학회</option>
                                <option value="award">공모전/수상</option>
                                <option value="volunteering">봉사활동</option>
                                <option value="external">대외활동</option>
                                <option value="overseas">해외연수</option>
                                <option value="other">기타</option>
                            </select>
                        </div>
                        <Input placeholder="활동명" value={activityForm.title || ''} onChange={e => setActivityForm({ ...activityForm, title: e.target.value })} />
                        <Input placeholder="기관/주최" value={activityForm.organization || ''} onChange={e => setActivityForm({ ...activityForm, organization: e.target.value })} />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>시작일</Label>
                                <Input type="date" value={activityForm.startDate ? format(new Date(activityForm.startDate), 'yyyy-MM-dd') : ''} onChange={e => setActivityForm({ ...activityForm, startDate: new Date(e.target.value) })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>종료일 (선택)</Label>
                                <Input type="date" value={activityForm.endDate ? format(new Date(activityForm.endDate), 'yyyy-MM-dd') : ''} onChange={e => setActivityForm({ ...activityForm, endDate: new Date(e.target.value) })} />
                            </div>
                        </div>

                        <Textarea placeholder="설명" value={activityForm.description || ''} onChange={e => setActivityForm({ ...activityForm, description: e.target.value })} />

                        <div className="space-y-2 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <Label>증빙 자료 / 관련 링크</Label>
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                                    const newFile = { name: '', url: '' };
                                    setActivityForm({ ...activityForm, files: [...(activityForm.files || []), newFile] });
                                }}>
                                    <Plus className="w-3 h-3 mr-1" /> 추가
                                </Button>
                            </div>
                            {(activityForm.files || []).map((file, idx) => (
                                <div key={idx} className="flex gap-2 items-center text-sm">
                                    <Input
                                        placeholder="이름"
                                        value={file.name}
                                        onChange={e => {
                                            const newFiles = [...(activityForm.files || [])];
                                            newFiles[idx].name = e.target.value;
                                            setActivityForm({ ...activityForm, files: newFiles });
                                        }}
                                        className="h-8 flex-1"
                                    />
                                    <Input
                                        placeholder="URL"
                                        value={file.url}
                                        onChange={e => {
                                            const newFiles = [...(activityForm.files || [])];
                                            newFiles[idx].url = e.target.value;
                                            setActivityForm({ ...activityForm, files: newFiles });
                                        }}
                                        className="h-8 flex-[2]"
                                    />
                                    <Button
                                        size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500"
                                        onClick={() => {
                                            const newFiles = [...(activityForm.files || [])];
                                            newFiles.splice(idx, 1);
                                            setActivityForm({ ...activityForm, files: newFiles });
                                        }}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>


                    </div>
                    <DialogFooter><Button onClick={handleSaveActivity}>저장</Button></DialogFooter>
                </DialogContent >
            </Dialog >

            {/* Project Modal */}
            <Dialog open={modal?.type === 'project'} onOpenChange={(open) => !open && setModal(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>프로젝트 추가/수정</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input placeholder="프로젝트 명" value={projectForm.title || ''} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="역할" value={projectForm.role || ''} onChange={e => setProjectForm({ ...projectForm, role: e.target.value })} />
                            <Input placeholder="기간" value={projectForm.period || ''} onChange={e => setProjectForm({ ...projectForm, period: e.target.value })} />
                        </div>
                        <Textarea placeholder="설명" value={projectForm.description || ''} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />
                        <Input placeholder="기술 스택 (콤마 구분)" value={projectTechStack} onChange={e => setProjectTechStack(e.target.value)} />
                    </div>
                    <DialogFooter><Button onClick={handleSaveProject}>저장</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
