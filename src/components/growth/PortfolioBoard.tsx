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
import {
    Briefcase, GraduationCap, User, Plus, Trash2, Edit2,
    Link as LinkIcon, Calendar, ExternalLink, Mail, Phone,
    MapPin, Linkedin, Github, Trophy, Languages, Award,
    Building2, Search, Paperclip, X, FileText, File,
    Loader2, Image as ImageIcon, Presentation as FilePieChart,
    Terminal, Fingerprint, ShieldCheck, Cpu, Database, Binary,
    Activity as ActivityIcon, Sparkles, Orbit, Zap, LayoutGrid, BookOpen
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PortfolioItem, UserProfile, Education, Career, Activity, CareerProject } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { searchSchools, SchoolInfo } from '@/lib/schoolApi';
import { motion, AnimatePresence } from 'framer-motion';

export function PortfolioBoard() {
    const {
        userProfile, updateUserProfile,
        educations, addEducation, updateEducation, deleteEducation,
        careers, addCareer, updateCareer, deleteCareer,
        portfolios, addPortfolio, updatePortfolio, deletePortfolio,
        activities, addActivity, updateActivity, deleteActivity,
        certificates,
        languageEntries, addLanguageEntry, deleteLanguageEntry
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

    const openModal = (type: 'profile' | 'education' | 'career' | 'project' | 'activity' | 'language', id?: string) => {
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
        if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) return <ImageIcon className="w-4 h-4 text-cyan-400" />;
        if (ext === '.pdf') return <FileText className="w-4 h-4 text-rose-400" />;
        if (['.ppt', '.pptx'].includes(ext)) return <FilePieChart className="w-4 h-4 text-amber-400" />;
        return <File className="w-4 h-4 text-white/20" />;
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
            description: eduForm.description,
            files: eduForm.files
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
            team: careerForm.team,
            files: careerForm.files
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
            links: projectForm.links || [],
            files: projectForm.files
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
        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-12">
                {/* Identity Matrix (Profile Section) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-premium rounded-[48px] border border-white/5 bg-white/[0.01] p-10 flex flex-col xl:flex-row gap-12 items-start relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                        <Orbit className="w-64 h-64 text-white" strokeWidth={1} />
                    </div>

                    <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 opacity-50" />
                        <Avatar className="w-48 h-48 border-[6px] border-white/10 shadow-[0_20px_50px_-10px_rgba(99,102,241,0.3)] relative z-10">
                            <AvatarImage src={userProfile.photo} className="object-cover" />
                            <AvatarFallback className="bg-white/5 text-6xl text-white/20">
                                <User className="w-20 h-20" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-3xl bg-indigo-500 flex items-center justify-center shadow-2xl z-20 border-4 border-slate-950">
                            <Fingerprint className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className="flex-1 space-y-8 relative z-10 w-full">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">{userProfile.name}</h1>
                                <Button
                                    size="icon" variant="ghost"
                                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white/20 hover:text-white border border-white/5"
                                    onClick={() => openModal('profile')}
                                >
                                    <Edit2 className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-black text-indigo-400 tracking-widest uppercase italic">{userProfile.jobTitle}</span>
                                <div className="h-4 w-px bg-white/10" />
                                <span className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase">SYSTEM OPERATOR ID: #001</span>
                            </div>
                        </div>

                        <div className="glass-premium bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                            <p className="text-sm font-bold text-white/60 leading-relaxed whitespace-pre-wrap italic">
                                <Terminal className="w-4 h-4 inline mr-2 text-indigo-500" />
                                {userProfile.bio}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { icon: Mail, label: 'ENCRYPTED CHANNEL', value: userProfile.email },
                                { icon: Phone, label: 'DIRECT SECURE LINK', value: userProfile.phone },
                                { icon: MapPin, label: 'GEOGRAPHIC NODE', value: userProfile.address || 'UNDEFINED' },
                            ].map((info, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center gap-2 text-[8px] font-black text-white/10 tracking-[0.3em] uppercase">
                                        <info.icon className="w-3 h-3 text-indigo-500" /> {info.label}
                                    </div>
                                    <div className="text-[11px] font-black text-white tracking-widest uppercase truncate">{info.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Intelligence Column (Sidebar) */}
                    <div className="lg:col-span-4 space-y-12">
                        {/* Education Matrix */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase flex items-center gap-3 italic">
                                    <GraduationCap className="w-4 h-4 text-indigo-400" /> ACADEMIC MATRIX
                                </h2>
                                <button onClick={() => openModal('education')} className="text-indigo-400 hover:text-white transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {educations.map(edu => (
                                    <Card key={edu.id} className="glass-premium border border-white/5 bg-white/[0.01] rounded-[32px] p-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                            <button onClick={() => openModal('education', edu.id)} className="w-8 h-8 rounded-lg bg-white/5 text-white/20 hover:text-white flex items-center justify-center"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => deleteEducation(edu.id)} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-md font-black text-white tracking-wider uppercase truncate pr-16">{edu.school}</h3>
                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{edu.major} · {edu.degree}</p>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-white/20 tracking-widest uppercase">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(edu.startDate), 'yyyy.MM')} — {edu.isCurrent ? 'ACTIVE' : (edu.endDate ? format(new Date(edu.endDate), 'yyyy.MM') : 'GRADUATED')}
                                            </div>
                                            {edu.files && edu.files.length > 0 && (
                                                <div className="flex gap-1">
                                                    <Paperclip className="w-3 h-3 text-white/20" />
                                                    <span className="text-[8px] font-black text-white/40">{edu.files.length} VERIFIED</span>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* Language Processor */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase flex items-center gap-3 italic">
                                    <Languages className="w-4 h-4 text-cyan-400" /> LINGUAL PROCESSOR
                                </h2>
                                <button onClick={() => openModal('language')} className="text-cyan-400 hover:text-white transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {languageEntries.filter(l => l.score).map(lang => (
                                    <Card key={lang.id} className="glass-premium border border-white/5 bg-white/[0.01] rounded-[32px] p-6 group hover:bg-white/[0.03] transition-all flex justify-between items-center">
                                        <div className="space-y-1">
                                            <h3 className="text-md font-black text-white tracking-widest uppercase">{lang.testName}</h3>
                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">{lang.language} · {format(new Date(lang.date), 'yyyy.MM.dd')}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl font-black text-cyan-400 tracking-tighter shadow-[0_0_20px_rgba(34,211,238,0.2)] bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20">{lang.score}</div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => openModal('language', lang.id)} className="text-white/20 hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => deleteLanguageEntry(lang.id)} className="text-rose-500 hover:text-rose-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* Credential Vault Preview */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase flex items-center gap-3 italic">
                                    <Award className="w-4 h-4 text-emerald-400" /> CREDENTIAL VAULT
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {certificates.map(cert => (
                                    <div key={cert.id} className="glass-premium bg-emerald-500/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                                        <span className="text-[9px] font-black text-white truncate uppercase tracking-widest">{cert.name}</span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[8px] font-bold text-emerald-500/60 uppercase">{cert.issuer}</span>
                                            {cert.score && <span className="text-[8px] font-black text-emerald-400">{cert.score}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Experience Column (Main) */}
                    <div className="lg:col-span-8 space-y-16">
                        {/* Career Timeline */}
                        <section className="space-y-8">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-[12px] font-black text-white/30 tracking-[0.5em] uppercase flex items-center gap-4 italic">
                                    <Cpu className="w-5 h-5 text-indigo-500" /> EXPERIENCE INFRASTRUCTURE
                                </h2>
                                <Button onClick={() => openModal('career')} variant="ghost" className="h-10 px-4 rounded-xl bg-indigo-500/10 text-indigo-400 text-[9px] font-black tracking-widest uppercase border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all">
                                    <Plus className="w-4 h-4 mr-2" /> REPLICATE ENTRY
                                </Button>
                            </div>

                            <div className="relative border-l-2 border-white/5 ml-6 space-y-10 pl-10 py-4">
                                {careers
                                    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                                    .map((career, idx) => (
                                        <motion.div
                                            key={career.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="relative group"
                                        >
                                            <div className="absolute -left-[51px] top-6 w-5 h-5 rounded-full border-4 border-slate-950 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-20" />
                                            <div className="absolute -left-[51px] top-6 w-5 h-5 rounded-full bg-indigo-500 animate-ping opacity-20" />

                                            <Card className="glass-premium rounded-[40px] border border-white/5 bg-white/[0.01] p-10 group-hover:bg-white/[0.03] transition-all relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                                    <Binary className="w-32 h-32 text-indigo-500" />
                                                </div>

                                                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                                    <div className="space-y-1">
                                                        <h3 className="text-2xl font-black text-white tracking-widest uppercase leading-none">{career.position}</h3>
                                                        <div className="text-indigo-400 font-black tracking-[0.3em] uppercase italic text-sm">{career.company}</div>
                                                    </div>
                                                    <div className="shrink-0">
                                                        <span className="text-[10px] font-black text-white/40 bg-white/5 border border-white/5 px-4 py-2 rounded-xl tracking-widest uppercase">
                                                            {format(new Date(career.startDate), 'yyyy.MM')} — {career.isCurrent ? 'ACTIVE SESS.' : (career.endDate ? format(new Date(career.endDate), 'yyyy.MM') : 'TERMINATED')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="glass-premium bg-white/[0.02] border border-white/5 rounded-3xl p-6 mb-8">
                                                    <p className="text-sm font-bold text-white/50 leading-relaxed whitespace-pre-wrap uppercase tracking-wider">
                                                        {career.description}
                                                    </p>
                                                </div>

                                                {career.techStack && career.techStack.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {career.techStack.map(tech => (
                                                            <span key={tech} className="text-[9px] font-black text-indigo-400/60 bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10 tracking-widest uppercase">
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <button onClick={() => openModal('career', career.id)} className="w-12 h-12 rounded-2xl bg-white/5 text-white/20 hover:text-white border border-white/5 flex items-center justify-center backdrop-blur-xl">
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => deleteCareer(career.id)} className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/10 flex items-center justify-center backdrop-blur-xl">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))}
                            </div>
                        </section>

                        {/* Project Grid */}
                        <section className="space-y-8 pb-20">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-[12px] font-black text-white/30 tracking-[0.5em] uppercase flex items-center gap-4 italic">
                                    <Trophy className="w-5 h-5 text-amber-500" /> ARTIFACT PORTFOLIO
                                </h2>
                                <Button onClick={() => openModal('project')} variant="ghost" className="h-10 px-4 rounded-xl bg-amber-500/10 text-amber-400 text-[9px] font-black tracking-widest uppercase border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all">
                                    <Plus className="w-4 h-4 mr-2" /> INITIALIZE ARTIFACT
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                                {portfolios.map((proj, idx) => (
                                    <motion.div
                                        key={proj.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card className="group glass-premium rounded-[40px] border border-white/5 bg-white/[0.01] p-8 hover:bg-white/[0.03] transition-all relative overflow-hidden h-full flex flex-col">
                                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                                <Database className="w-24 h-24 text-amber-400" strokeWidth={1} />
                                            </div>

                                            <div className="flex justify-between items-start mb-6">
                                                <h3 className="text-xl font-black text-white tracking-widest uppercase leading-tight truncate pr-6">{proj.title}</h3>
                                                <div className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg shrink-0">
                                                    {proj.period}
                                                </div>
                                            </div>

                                            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                                                <Zap className="w-3 h-3 text-amber-500" /> {proj.role || 'CORE OPERATOR'}
                                            </div>

                                            <div className="glass-premium bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-8 flex-1">
                                                <p className="text-[11px] font-bold text-white/40 leading-relaxed uppercase tracking-widest italic line-clamp-4">
                                                    {proj.description}
                                                </p>
                                            </div>

                                            <div className="space-y-6 mt-auto">
                                                <div className="flex flex-wrap gap-2">
                                                    {proj.techStack?.map(tech => (
                                                        <span key={tech} className="text-[8px] font-black text-white/20 bg-white/5 px-2 py-1 rounded-md border border-white/5 tracking-tighter uppercase">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>

                                                {proj.links && proj.links.length > 0 && (
                                                    <div className="flex gap-4 pt-4 border-t border-white/5">
                                                        {proj.links.map((link, idx) => (
                                                            <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[9px] font-black text-cyan-400 hover:text-white transition-colors tracking-widest uppercase">
                                                                <ExternalLink className="w-3 h-3" /> {link.label || 'DATALINK'}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => openModal('project', proj.id)} className="w-10 h-10 rounded-xl bg-white/5 text-white/20 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/5"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => deletePortfolio(proj.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center backdrop-blur-md border border-rose-500/5"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Cybernetic Modals */}
            {/* Profile Modal */}
            <Dialog open={modal?.type === 'profile'} onOpenChange={(open) => !open && setModal(null)}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-3xl">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">RECALIBRATE IDENTITY</DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">UPDATING SYSTEM OPERATOR CORE PARAMETERS</p>
                    </DialogHeader>
                    <div className="p-10 pt-4 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">OPERATOR NAME</Label>
                                <Input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="h-14 font-black text-xl border-white/5 bg-white/5 rounded-2xl text-white" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">DESIGNATED JOB TITLE</Label>
                                <Input value={profileForm.jobTitle} onChange={e => setProfileForm({ ...profileForm, jobTitle: e.target.value })} className="h-14 font-black text-lg border-white/5 bg-white/5 rounded-2xl text-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">SECURE LINK (PHONE)</Label>
                                <Input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="h-12 bg-white/5 border-white/5 rounded-2xl text-white" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">ENCRYPTED CHANNEL (EMAIL)</Label>
                                <Input value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="h-12 bg-white/5 border-white/5 rounded-2xl text-white" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">IDENTITY AVATAR URL</Label>
                            <Input value={profileForm.photo || ''} onChange={e => setProfileForm({ ...profileForm, photo: e.target.value })} className="h-12 bg-white/5 border-white/5 rounded-2xl text-white" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">OPERATOR LOG (BIO)</Label>
                            <Textarea
                                className="min-h-[120px] bg-white/5 border-white/5 rounded-3xl p-6 text-[11px] font-bold text-white/60 leading-relaxed italic placeholder:text-white/10 resize-none"
                                value={profileForm.bio}
                                onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-10 pt-4 bg-white/[0.02] border-t border-white/5">
                        <Button variant="ghost" onClick={() => setModal(null)} className="h-16 px-8 rounded-2xl text-[10px] font-black text-white/20 hover:text-white hover:bg-white/5 uppercase tracking-widest">ABORT</Button>
                        <Button onClick={handleSaveProfile} className="flex-1 h-16 rounded-3xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm tracking-[0.2em] shadow-2xl transition-all uppercase">COMMIT CHANGES</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Abstract Modals (Education, Career, Project, Activity, Language) would follow a similar pattern */}
            {/* Education Modal */}
            <Dialog open={modal?.type === 'education'} onOpenChange={(open) => !open && setModal(null)}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-2xl">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">INDEX ACADEMIC NODE</DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">CALIBRATING EDUCATIONAL PARAMETERS IN CORE MATRIX</p>
                    </DialogHeader>
                    <div className="p-10 pt-4 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">SCHOOL IDENTIFIER</Label>
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="SEARCH ARCHIVES..."
                                        value={schoolSearch}
                                        onChange={e => {
                                            setSchoolSearch(e.target.value);
                                            setEduForm({ ...eduForm, school: e.target.value });
                                        }}
                                        className="h-14 pl-12 font-black text-lg border-white/5 bg-white/5 rounded-2xl text-white"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-400" />}
                                </div>
                                <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5" onClick={handleSchoolSearch} disabled={isSearching}>
                                    <Zap className="w-5 h-5 text-indigo-400" />
                                </Button>
                            </div>
                            {schoolResults.length > 0 && (
                                <div className="mt-2 glass-premium border border-white/10 rounded-2xl max-h-40 overflow-y-auto bg-slate-900 shadow-2xl absolute z-50 w-[calc(100%-80px)]">
                                    {schoolResults.map((s, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 hover:bg-white/5 cursor-pointer text-xs flex justify-between items-center border-b border-white/5 last:border-0"
                                            onClick={() => {
                                                setEduForm({ ...eduForm, school: s.schoolName });
                                                setSchoolSearch(s.schoolName);
                                                setSchoolResults([]);
                                            }}
                                        >
                                            <div>
                                                <div className="font-black text-white uppercase tracking-widest">{s.schoolName}</div>
                                                <div className="text-[8px] text-white/40 uppercase tracking-tighter">{s.address}</div>
                                            </div>
                                            <div className="text-[8px] bg-white/5 px-2 py-1 rounded text-white/60 font-black uppercase tracking-widest">
                                                {s.region}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">DEGREE TYPE</Label>
                                <Input placeholder="EX: BACHELOR, MASTER" value={eduForm.degree || ''} onChange={e => setEduForm({ ...eduForm, degree: e.target.value })} className="h-12 bg-white/5 border-white/5 rounded-2xl text-white uppercase font-black" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">SPECIFIC MAJOR</Label>
                                <Input placeholder="EX: COMPUTER SCIENCE" value={eduForm.major || ''} onChange={e => setEduForm({ ...eduForm, major: e.target.value })} className="h-12 bg-white/5 border-white/5 rounded-2xl text-white uppercase font-black" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">START CHRONO</Label>
                                <Input type="date" value={eduForm.startDate ? format(new Date(eduForm.startDate), 'yyyy-MM-dd') : ''} onChange={e => setEduForm({ ...eduForm, startDate: new Date(e.target.value) })} className="h-12 bg-white/5 border-white/5 rounded-2xl text-white" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">END CHRONO (PROJECTED)</Label>
                                <Input
                                    type="date"
                                    value={eduForm.endDate ? format(new Date(eduForm.endDate), 'yyyy-MM-dd') : ''}
                                    onChange={e => setEduForm({ ...eduForm, endDate: new Date(e.target.value) })}
                                    disabled={eduForm.isCurrent}
                                    className="h-12 bg-white/5 border-white/5 rounded-2xl text-white"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                            <input
                                type="checkbox" id="eduCurrent"
                                className="w-6 h-6 rounded-lg bg-white/10 border-white/10 accent-indigo-500"
                                checked={eduForm.isCurrent || false}
                                onChange={e => setEduForm({ ...eduForm, isCurrent: e.target.checked, endDate: e.target.checked ? undefined : eduForm.endDate })}
                            />
                            <Label htmlFor="eduCurrent" className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">CURRENTLY ACTIVE IN THIS NODE</Label>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <Paperclip className="w-4 h-4" /> VERIFIED ARTIFACTS
                                </Label>
                                <button className="text-[9px] font-black text-white/20 hover:text-white tracking-widest uppercase flex items-center gap-2 transition-colors" onClick={() => document.getElementById('edu-file-up')?.click()}>
                                    <Plus className="w-3 h-3" /> ATTACH DATA
                                </button>
                                <input id="edu-file-up" type="file" className="hidden" multiple accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.gif" onChange={(e) => handleFileUpload(e, 'education')} />
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {(eduForm.files || []).map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            {getFileIcon(file.name)}
                                            <span className="text-[10px] font-black text-white/60 truncate uppercase">{file.name}</span>
                                        </div>
                                        <button className="text-rose-500 hover:text-white transition-colors" onClick={() => removeFile(idx, 'education')}><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-10 pt-4 bg-white/[0.02] border-t border-white/5">
                        <Button variant="ghost" onClick={() => setModal(null)} className="h-16 px-8 rounded-2xl text-[10px] font-black text-white/20 hover:text-white hover:bg-white/5 uppercase tracking-widest">ABORT</Button>
                        <Button onClick={handleSaveEducation} className="flex-1 h-16 rounded-3xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm tracking-[0.2em] shadow-2xl transition-all uppercase">COMMIT NODE</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Career Modal (Concise version) */}
            <Dialog open={modal?.type === 'career'} onOpenChange={(val) => !val && setModal(null)}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-3xl h-[85vh] flex flex-col">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">REPLICATE EXPERIENCE</DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">UPDATING CAREER INFRASTRUCTURE PARAMETERS</p>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-10 pt-4 space-y-10 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">ENTITY (COMPANY)</Label>
                                <Input value={careerForm.company || ''} onChange={e => setCareerForm({ ...careerForm, company: e.target.value })} className="h-14 font-black text-xl border-white/5 bg-white/5 rounded-2xl text-white uppercase" placeholder="EX: STARK INDUSTRIES" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">DESIGNATED POSITION</Label>
                                <Input value={careerForm.position || ''} onChange={e => setCareerForm({ ...careerForm, position: e.target.value })} className="h-14 font-black text-lg border-white/5 bg-white/5 rounded-2xl text-white uppercase" placeholder="EX: SENIOR ARCHITECT" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">INITIALIZATION DATE</Label>
                                <Input type="date" value={careerForm.startDate ? format(new Date(careerForm.startDate), 'yyyy-MM-dd') : ''} onChange={e => setCareerForm({ ...careerForm, startDate: new Date(e.target.value) })} className="h-12 bg-white/5 border-white/5 rounded-2xl text-white font-black uppercase" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">TERMINATION DATE</Label>
                                <Input
                                    type="date"
                                    value={careerForm.endDate ? format(new Date(careerForm.endDate), 'yyyy-MM-dd') : ''}
                                    onChange={e => setCareerForm({ ...careerForm, endDate: new Date(e.target.value) })}
                                    disabled={careerForm.isCurrent}
                                    className="h-12 bg-white/5 border-white/5 rounded-2xl text-white"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                            <input type="checkbox" id="carCurrent" checked={careerForm.isCurrent || false} onChange={e => setCareerForm({ ...careerForm, isCurrent: e.target.checked, endDate: e.target.checked ? undefined : careerForm.endDate })} className="w-6 h-6 accent-indigo-500" />
                            <Label htmlFor="carCurrent" className="text-[10px] font-black text-white/60 uppercase tracking-widest italic">ACTIVE SESSION (CURRENTLY EMPLOYED)</Label>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">INFRASTRUCTURE LOG (SUMMARY)</Label>
                            <Textarea
                                className="min-h-[150px] bg-white/5 border-white/5 rounded-3xl p-6 text-[11px] font-bold text-white/60 leading-relaxed uppercase tracking-wider italic placeholder:text-white/10"
                                value={careerForm.description || ''}
                                onChange={e => setCareerForm({ ...careerForm, description: e.target.value })}
                                placeholder="ENTER MAJOR OPERATIONAL DATA..."
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-10 pt-4 bg-white/[0.02] border-t border-white/5">
                        <Button variant="ghost" onClick={() => setModal(null)} className="h-16 px-8 rounded-2xl text-[10px] font-black text-white/20 hover:text-white hover:bg-white/5 uppercase tracking-widest">ABORT</Button>
                        <Button onClick={handleSaveCareer} className="flex-1 h-16 rounded-3xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm tracking-[0.2em] shadow-2xl transition-all uppercase">COMMIT EXPERIENCE</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Project Modal */}
            <Dialog open={modal?.type === 'project'} onOpenChange={(val) => !val && setModal(null)}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-2xl">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">INITIALIZE ARTIFACT</DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">TRANSMITTING PROJECT ARTIFACT DATA TO CORE ARCHIVE</p>
                    </DialogHeader>
                    <div className="p-10 pt-4 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">ARTIFACT IDENTIFIER</Label>
                            <Input value={projectForm.title || ''} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} className="h-14 font-black text-xl border-white/5 bg-white/5 rounded-2xl text-white uppercase" placeholder="EX: PROJECT HYPERSPACE" />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">TEMPORAL RADIUS</Label>
                                <Input placeholder="EX: 2023.01 - 2023.12" value={projectForm.period || ''} onChange={e => setProjectForm({ ...projectForm, period: e.target.value })} className="h-12 bg-white/5 border-white/5 rounded-2xl text-white font-black uppercase" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">DESIGNATED ROLE</Label>
                                <Input placeholder="EX: LEAD ARCHITECT" value={projectForm.role || ''} onChange={e => setProjectForm({ ...projectForm, role: e.target.value })} className="h-12 bg-white/5 border-white/5 rounded-2xl text-white font-black uppercase" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">CORE TECHNOLOGIES (CSV)</Label>
                            <Input placeholder="AWS, NODE.JS, REACT" value={projectTechStack} onChange={e => setProjectTechStack(e.target.value)} className="h-12 bg-white/5 border-white/5 rounded-2xl text-white font-black uppercase" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">ARTIFACT SPECIFICATIONS (LOG)</Label>
                            <Textarea className="min-h-[120px] bg-white/5 border-white/5 rounded-3xl p-6 text-[11px] font-bold text-white/60 leading-relaxed uppercase tracking-wider italic placeholder:text-white/10" value={projectForm.description || ''} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter className="p-10 pt-4 bg-white/[0.02] border-t border-white/5">
                        <Button variant="ghost" onClick={() => setModal(null)} className="h-16 px-8 rounded-2xl text-[10px] font-black text-white/20 hover:text-white hover:bg-white/5 uppercase tracking-widest">ABORT</Button>
                        <Button onClick={handleSaveProject} className="flex-1 h-16 rounded-3xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm tracking-[0.2em] shadow-2xl transition-all uppercase">COMMIT ARTIFACT</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Language Modal */}
            <Dialog open={modal?.type === 'language'} onOpenChange={(val) => !val && setModal(null)}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-xl">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">INDEX LINGUAL SCORE</DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">UPDATING PHONETIC AND SYNTACTIC PERFORMANCE</p>
                    </DialogHeader>
                    <div className="p-10 pt-4 space-y-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">LINGUAL SECTOR</Label>
                            <select
                                className="flex h-12 w-full rounded-2xl border border-white/5 bg-white/5 px-4 font-black uppercase text-[10px] tracking-widest text-white outline-none focus:ring-2 focus:ring-cyan-500/20"
                                value={languageForm.language}
                                onChange={e => setLanguageForm({ ...languageForm, language: e.target.value })}
                            >
                                <option value="English" className="bg-slate-900">ENGLISH</option>
                                <option value="Japanese" className="bg-slate-900">JAPANESE</option>
                                <option value="Chinese" className="bg-slate-900">CHINESE</option>
                                <option value="Spanish" className="bg-slate-900">SPANISH</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">SPECIFIC ASSESSMENT (TEST)</Label>
                            <Input placeholder="EX: TOEIC, OPIc, JLPT" value={languageForm.testName} onChange={e => setLanguageForm({ ...languageForm, testName: e.target.value })} className="h-12 bg-white/5 border-white/5 rounded-2xl text-white font-black uppercase" />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">PERFORMANCE SCORE</Label>
                                <Input placeholder="EX: 990, IH, N1" value={languageForm.score} onChange={e => setLanguageForm({ ...languageForm, score: e.target.value })} className="h-12 bg-white/5 border-white/5 rounded-2xl text-white font-black uppercase" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">ACQUISITION DATE</Label>
                                <Input type="date" value={isValid(new Date(languageForm.date)) ? format(new Date(languageForm.date), 'yyyy-MM-dd') : ''} onChange={e => setLanguageForm({ ...languageForm, date: new Date(e.target.value) })} className="h-12 bg-white/5 border-white/5 rounded-2xl text-white font-black" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-10 pt-4 bg-white/[0.02] border-t border-white/5">
                        <Button variant="ghost" onClick={() => setModal(null)} className="h-16 px-8 rounded-2xl text-[10px] font-black text-white/20 hover:text-white hover:bg-white/5 uppercase tracking-widest">ABORT</Button>
                        <Button onClick={handleSaveLanguage} className="flex-1 h-16 rounded-3xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-sm tracking-[0.2em] shadow-2xl transition-all uppercase">COMMIT SCORE</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'video': return <PlayCircle className="w-4 h-4" />;
        case 'article': return <BookOpen className="w-4 h-4" />;
        case 'lecture': return <MonitorPlay className="w-4 h-4" />;
        default: return <ExternalLink className="w-4 h-4" />;
    }
};

import { PlayCircle, MonitorPlay } from 'lucide-react';
