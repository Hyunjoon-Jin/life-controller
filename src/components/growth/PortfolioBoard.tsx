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
import { Briefcase, GraduationCap, User, Plus, Trash2, Edit2, Link as LinkIcon, Calendar, ExternalLink, Mail, Phone, MapPin, Linkedin, Github, Trophy, Languages, Award, Building2, Search, Paperclip, X, FileText, File, Loader2, Image as ImageIcon, Presentation as FilePieChart } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PortfolioItem, UserProfile, Education, Career, Activity, CareerProject } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { searchSchools, SchoolInfo } from '@/lib/schoolApi';

export function PortfolioBoard() {
    const {
        userProfile, updateUserProfile,
        educations, addEducation, updateEducation, deleteEducation,
        careers, addCareer, updateCareer, deleteCareer,
        portfolios, addPortfolio, updatePortfolio, deletePortfolio,
        activities, addActivity, updateActivity, deleteActivity, // New
        certificates, // Read-only view
        languageEntries, addLanguageEntry, deleteLanguageEntry // Updated
    } = useData();

    const [modal, setModal] = useState<{ type: 'profile' | 'education' | 'career' | 'project' | 'activity' | 'language', id?: string } | null>(null);

    // --- Profile Modal State ---
    const [profileForm, setProfileForm] = useState<UserProfile>(userProfile);

    // --- Education Modal State ---
    const [eduForm, setEduForm] = useState<Partial<Education>>({});
    const [schoolSearch, setSchoolSearch] = useState('');

    // --- Career Modal State ---
    const [careerForm, setCareerForm] = useState<Partial<Career>>({});

    // --- Project Modal State ---
    const [projectForm, setProjectForm] = useState<Partial<PortfolioItem>>({});
    const [projectTechStack, setProjectTechStack] = useState('');

    // --- Activity Modal State ---
    const [activityForm, setActivityForm] = useState<Partial<Activity>>({});

    // --- Language Modal State ---
    const [languageForm, setLanguageForm] = useState<{ language: string; testName: string; score: string; date: Date }>({
        language: 'English', testName: '', score: '', date: new Date()
    });

    // --- Search & Upload State ---
    const [schoolResults, setSchoolResults] = useState<SchoolInfo[]>([]);
    const [isSearching, setIsSearching] = useState(false);

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
        } else if (type === 'language') {
            if (id) {
                const lang = languageEntries.find(l => l.id === id);
                if (lang) {
                    setLanguageForm({
                        language: lang.language,
                        testName: lang.testName || '',
                        score: lang.score || '',
                        date: lang.date
                    });
                }
            } else {
                setLanguageForm({ language: 'English', testName: '', score: '', date: new Date() });
            }
        }
    };

    const handleSchoolSearch = async () => {
        if (!schoolSearch.trim()) return;
        setIsSearching(true);
        try {
            const results = await searchSchools(schoolSearch);
            setSchoolResults(results);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'project' | 'activity' | 'education' | 'career') => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif'];
            const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                alert(`${file.name}은(는) 지원되지 않는 형식입니다. (이미지, PDF, PPT 가능)`);
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name}의 크기가 너무 큽니다. 5MB 이하의 파일을 업로드해 주세요.`);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const newFileData = { name: file.name, url: base64String };

                if (target === 'project') setProjectForm(prev => ({ ...prev, files: [...(prev.files || []), newFileData] }));
                if (target === 'activity') setActivityForm(prev => ({ ...prev, files: [...(prev.files || []), newFileData] }));
                if (target === 'education') setEduForm(prev => ({ ...prev, files: [...(prev.files || []), newFileData] }));
                if (target === 'career') setCareerForm(prev => ({ ...prev, files: [...(prev.files || []), newFileData] }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeFile = (idx: number, target: 'project' | 'activity' | 'education' | 'career') => {
        if (target === 'project') setProjectForm(prev => ({ ...prev, files: (prev.files || []).filter((_, i) => i !== idx) }));
        if (target === 'activity') setActivityForm(prev => ({ ...prev, files: (prev.files || []).filter((_, i) => i !== idx) }));
        if (target === 'education') setEduForm(prev => ({ ...prev, files: (prev.files || []).filter((_, i) => i !== idx) }));
        if (target === 'career') setCareerForm(prev => ({ ...prev, files: (prev.files || []).filter((_, i) => i !== idx) }));
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) return <ImageIcon className="w-4 h-4 text-blue-500" />;
        if (ext === '.pdf') return <FileText className="w-4 h-4 text-red-500" />;
        if (['.ppt', '.pptx'].includes(ext)) return <FilePieChart className="w-4 h-4 text-orange-500" />;
        return <File className="w-4 h-4 text-slate-400" />;
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

    const handleSaveLanguage = () => {
        if (!languageForm.testName || !languageForm.score) return;

        const entry = {
            id: modal?.id || generateId(),
            language: languageForm.language,
            date: new Date(languageForm.date),
            studyTime: 0,
            vocabulary: [],
            testName: languageForm.testName,
            score: languageForm.score,
            memo: `${languageForm.testName} Score: ${languageForm.score}`
        };

        if (modal?.id) {
            deleteLanguageEntry(modal.id);
            addLanguageEntry(entry);
        } else {
            addLanguageEntry(entry);
        }
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

                        {/* Languages */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                    <Languages className="w-5 h-5 text-primary" /> 어학
                                </h2>
                                <Button size="sm" variant="ghost" onClick={() => openModal('language')}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {/* Test Scores */}
                                {languageEntries.filter(l => l.score).length > 0 && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {languageEntries.filter(l => l.score).map(lang => (
                                            <div key={lang.id} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center group relative hover:shadow-md transition-all">
                                                <div>
                                                    <div className="font-bold text-slate-800">{lang.testName}</div>
                                                    <div className="text-xs text-slate-500 font-medium">
                                                        {lang.language} · {format(new Date(lang.date), 'yyyy.MM.dd')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black text-blue-600 bg-blue-50 px-2 rounded-md">{lang.score}</span>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openModal('language', lang.id)}>
                                                            <Edit2 className="w-3 h-3 text-slate-400" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-red-500" onClick={() => deleteLanguageEntry(lang.id)}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Daily Logs Preview (Recent 3) */}
                                {languageEntries.filter(l => !l.score).length > 0 && (
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <div className="text-xs font-bold text-slate-500 mb-2 uppercase">최근 학습 기록</div>
                                        <div className="space-y-2">
                                            {languageEntries.filter(l => !l.score).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).map(lang => (
                                                <div key={lang.id} className="flex justify-between items-center text-sm">
                                                    <span className="font-semibold text-slate-700">{lang.language}</span>
                                                    <span className="text-xs text-slate-400">
                                                        {format(new Date(lang.date), 'MM.dd')} · {lang.studyTime}분
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {languageEntries.length === 0 && (
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
                        <div className="space-y-2 text-left">
                            <Label>학교명</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="학교명을 입력하세요"
                                        value={schoolSearch}
                                        onChange={e => {
                                            setSchoolSearch(e.target.value);
                                            setEduForm({ ...eduForm, school: e.target.value });
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSchoolSearch();
                                            }
                                        }}
                                    />
                                    {isSearching && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-slate-400" />}
                                </div>
                                <Button variant="outline" size="icon" title="학교 검색" onClick={handleSchoolSearch} disabled={isSearching}>
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>

                            {schoolResults.length > 0 && (
                                <div className="mt-2 border rounded-md max-h-40 overflow-y-auto bg-white shadow-sm absolute z-20 w-[calc(100%-48px)]">
                                    {schoolResults.map((s, idx) => (
                                        <div
                                            key={idx}
                                            className="p-2 hover:bg-slate-50 cursor-pointer text-sm flex justify-between items-center border-b last:border-0"
                                            onClick={() => {
                                                setEduForm({ ...eduForm, school: s.schoolName });
                                                setSchoolSearch(s.schoolName);
                                                setSchoolResults([]);
                                            }}
                                        >
                                            <div>
                                                <div className="font-medium text-slate-900">{s.schoolName}</div>
                                                <div className="text-xs text-slate-500">{s.address}</div>
                                            </div>
                                            <div className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                                {s.region}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="학위 (예: 학사, 석사)" value={eduForm.degree || ''} onChange={e => setEduForm({ ...eduForm, degree: e.target.value })} />
                            <Input placeholder="전공" value={eduForm.major || ''} onChange={e => setEduForm({ ...eduForm, major: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>입학일</Label>
                                <Input type="date" value={eduForm.startDate ? format(new Date(eduForm.startDate), ko ? 'yyyy-MM-dd' : 'yyyy-MM-dd') : ''} onChange={e => setEduForm({ ...eduForm, startDate: new Date(e.target.value) })} />
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
                        <div className="space-y-2 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-slate-500" />
                                    첨부 파일 (졸업증명서, 성적증명서 등)
                                </Label>
                                <Button
                                    size="sm" variant="outline" className="h-7 text-xs"
                                    onClick={() => document.getElementById('education-file-upload')?.click()}
                                >
                                    <Plus className="w-3 h-3 mr-1" /> 추가
                                </Button>
                                <input
                                    id="education-file-upload" type="file" className="hidden" multiple
                                    accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                                    onChange={(e) => handleFileUpload(e, 'education')}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {(eduForm.files || []).map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-md border border-slate-100 group">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {getFileIcon(file.name)}
                                            <span className="text-xs truncate text-slate-600">{file.name}</span>
                                        </div>
                                        <Button
                                            size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                                            onClick={() => removeFile(idx, 'education')}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
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

                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-slate-500" />
                                    첨부 파일 (증빙자료, 포트폴리오 등)
                                </Label>
                                <Button
                                    size="sm" variant="outline" className="h-7 text-xs"
                                    onClick={() => document.getElementById('career-file-upload')?.click()}
                                >
                                    <Plus className="w-3 h-3 mr-1" /> 추가
                                </Button>
                                <input
                                    id="career-file-upload" type="file" className="hidden" multiple
                                    accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                                    onChange={(e) => handleFileUpload(e, 'career')}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {(careerForm.files || []).map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-md border border-slate-100 group">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {getFileIcon(file.name)}
                                            <span className="text-xs truncate text-slate-600">{file.name}</span>
                                        </div>
                                        <Button
                                            size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                                            onClick={() => removeFile(idx, 'career')}
                                        >
                                            <X className="w-3 h-3" />
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

            {/* Project Modal */}
            <Dialog open={modal?.type === 'project'} onOpenChange={(open) => !open && setModal(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>프로젝트 추가/수정</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="grid gap-2">
                            <Label>프로젝트명</Label>
                            <Input value={projectForm.title || ''} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>기간</Label>
                                <Input placeholder="예: 2023.01 - 2023.06" value={projectForm.period || ''} onChange={e => setProjectForm({ ...projectForm, period: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>역할</Label>
                                <Input placeholder="예: 프론트엔드 개발" value={projectForm.role || ''} onChange={e => setProjectForm({ ...projectForm, role: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>사용 기술 (쉼표로 구분)</Label>
                            <Input placeholder="React, TypeScript, TailwindCSS" value={projectTechStack} onChange={e => setProjectTechStack(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>설명</Label>
                            <Textarea className="h-24" value={projectForm.description || ''} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />
                        </div>

                        <div className="space-y-2 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-slate-500" />
                                    첨부 파일 (이미지, PDF, PPT)
                                </Label>
                                <Button
                                    size="sm" variant="outline" className="h-7 text-xs"
                                    onClick={() => document.getElementById('project-file-upload')?.click()}
                                >
                                    <Plus className="w-3 h-3 mr-1" /> 추가
                                </Button>
                                <input
                                    id="project-file-upload" type="file" className="hidden" multiple
                                    accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                                    onChange={(e) => handleFileUpload(e, 'project')}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {(projectForm.files || []).map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-md border border-slate-100 group">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {getFileIcon(file.name)}
                                            <span className="text-xs truncate text-slate-600">{file.name}</span>
                                        </div>
                                        <Button
                                            size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                                            onClick={() => removeFile(idx, 'project')}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveProject}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Activity Modal */}
            <Dialog open={modal?.type === 'activity'} onOpenChange={(open) => !open && setModal(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>대외활동 추가/수정</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
                                <Label className="flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-slate-500" />
                                    첨부 파일 (이미지, PDF, PPT)
                                </Label>
                                <Button
                                    size="sm" variant="outline" className="h-7 text-xs"
                                    onClick={() => document.getElementById('activity-file-upload-input-final')?.click()}
                                >
                                    <Plus className="w-3 h-3 mr-1" /> 추가
                                </Button>
                                <input
                                    id="activity-file-upload-input-final" type="file" className="hidden" multiple
                                    accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                                    onChange={(e) => handleFileUpload(e, 'activity')}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {(activityForm.files || []).map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-md border border-slate-100 group">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {getFileIcon(file.name)}
                                            <span className="text-xs truncate text-slate-600">{file.name}</span>
                                        </div>
                                        <Button
                                            size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                                            onClick={() => removeFile(idx, 'activity')}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveActivity}>저장</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Language Modal */}
            <Dialog open={modal?.type === 'language'} onOpenChange={(val) => !val && setModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{modal?.id ? '어학 점수 수정' : '어학 점수 추가'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>언어</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={languageForm.language}
                                onChange={e => setLanguageForm({ ...languageForm, language: e.target.value })}
                            >
                                <option value="English">영어</option>
                                <option value="Japanese">일본어</option>
                                <option value="Chinese">중국어</option>
                                <option value="Spanish">스페인어</option>
                                <option value="German">독일어</option>
                                <option value="French">프랑스어</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label>시험명</Label>
                            <Input
                                placeholder="예: TOEIC, JLPT N1, OPIc"
                                value={languageForm.testName}
                                onChange={e => setLanguageForm({ ...languageForm, testName: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>점수 / 등급</Label>
                            <Input
                                placeholder="예: 950, IH, 180점"
                                value={languageForm.score}
                                onChange={e => setLanguageForm({ ...languageForm, score: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>취득일</Label>
                            <Input
                                type="date"
                                value={isValid(new Date(languageForm.date)) ? format(new Date(languageForm.date), 'yyyy-MM-dd') : ''}
                                onChange={e => setLanguageForm({ ...languageForm, date: new Date(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveLanguage} disabled={!languageForm.testName || !languageForm.score}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
