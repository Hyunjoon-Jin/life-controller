'use client';

import { useData } from '@/context/DataProvider';
import { FolderGit2, FileText, Clock, ChevronRight, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface RecentWorkspaceProps {
    onOpenProject: (id: string) => void;
}

export function RecentWorkspace({ onOpenProject }: RecentWorkspaceProps) {
    const { projects, memos, archiveDocuments } = useData();

    // Mock "Recent" by taking the updated projects or just first few for now as there's no lastAccessed field yet
    // In a real app, we would sort by lastAccessedAt
    const recentProjects = projects.slice(0, 3);

    // Recent Documents (from Archive)
    const recentDocs = archiveDocuments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Projects */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-500" />
                        최근 프로젝트
                    </h3>
                    <button className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                        전체보기 <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="space-y-3">
                    {recentProjects.map(project => (
                        <button
                            key={project.id}
                            onClick={() => onOpenProject(project.id)}
                            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors group"
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                                style={{ backgroundColor: project.color }}
                            >
                                <FolderGit2 className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold truncate group-hover:text-blue-600 transition-colors">
                                    {project.title}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-700",
                                        project.status === 'active' ? "text-green-600" : "text-gray-500"
                                    )}>
                                        {project.status === 'active' ? '진행중' : project.status}
                                    </span>
                                    <span>• 진행률 {project.progress || 0}%</span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                    {recentProjects.length === 0 && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            진행 중인 프로젝트가 없습니다.
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Documents/Resources */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-500" />
                        최근 문서
                    </h3>
                    <button className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                        더보기 <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="space-y-3">
                    {recentDocs.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0 text-orange-500">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold truncate group-hover:text-orange-600 transition-colors">
                                    {doc.title}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true, locale: ko })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {recentDocs.length === 0 && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            최근 문서가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
