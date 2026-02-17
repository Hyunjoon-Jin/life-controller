'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { Search, Briefcase, Calendar, Plus, Moon, Sun, Monitor, Laptop, Settings, CheckSquare } from 'lucide-react';
import { useData } from '@/context/DataProvider';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Project } from '@/types';

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const { projects, setSelectedWorkProjectId } = useData();
    const router = useRouter();
    const { setTheme } = useTheme();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="p-0 border-none shadow-2xl bg-transparent max-w-[640px] overflow-hidden">
                <Command className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-4">
                        <Search className="w-5 h-5 text-slate-400 mr-2" />
                        <Command.Input
                            className="flex-1 h-14 bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-base"
                            placeholder="명령어 검색 또는 프로젝트 이동... (Cmd+K)"
                        />
                    </div>

                    <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
                        <Command.Empty className="py-6 text-center text-sm text-slate-500">
                            검색 결과가 없습니다.
                        </Command.Empty>

                        <Command.Group heading="빠른 이동" className="text-xs font-medium text-slate-400 px-2 py-1.5 mb-1 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg">
                            <Command.Item
                                onSelect={() => runCommand(() => setSelectedWorkProjectId(null))}
                                className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-900/30 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer transition-colors"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>오늘의 대시보드</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="프로젝트" className="text-xs font-medium text-slate-400 px-2 py-1.5 mt-2 mb-1 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg">
                            {projects.map((project) => (
                                <Command.Item
                                    key={project.id}
                                    onSelect={() => runCommand(() => setSelectedWorkProjectId(project.id))}
                                    className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-900/30 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer transition-colors"
                                >
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                                    <span>{project.title}</span>
                                </Command.Item>
                            ))}
                            <Command.Item
                                onSelect={() => runCommand(() => { /* Open Create Dialog logic needed here, potentially passing a global state or callback if possible, or just navigating */ })}
                                className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-900/30 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>새 프로젝트 만들기...</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="테마 설정" className="text-xs font-medium text-slate-400 px-2 py-1.5 mt-2 mb-1 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg">
                            <Command.Item
                                onSelect={() => runCommand(() => setTheme("light"))}
                                className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-900/30 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer transition-colors"
                            >
                                <Sun className="w-4 h-4" />
                                <span>라이트 모드</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => setTheme("dark"))}
                                className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-900/30 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer transition-colors"
                            >
                                <Moon className="w-4 h-4" />
                                <span>다크 모드</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => setTheme("system"))}
                                className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-900/30 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer transition-colors"
                            >
                                <Laptop className="w-4 h-4" />
                                <span>시스템 설정</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
