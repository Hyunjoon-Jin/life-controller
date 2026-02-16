'use client';

import { useData } from '@/context/DataProvider';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

function downloadFile(data: string, filename: string, mimeType: string) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

function toCSV(items: Record<string, unknown>[]): string {
    if (items.length === 0) return '';
    const headers = Object.keys(items[0]);
    const rows = items.map(item =>
        headers.map(h => {
            const val = item[h];
            const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
            return `"${str.replace(/"/g, '""')}"`;
        }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
}

export function DataExportButton() {
    const {
        tasks, projects, goals, habits, events, journals, memos, people, scraps,
        transactions,
    } = useData();

    const exportJSON = () => {
        const dateStr = new Date().toISOString().slice(0, 10);
        const exportData = {
            exportedAt: new Date().toISOString(),
            version: '1.0',
            data: {
                tasks,
                projects,
                goals,
                habits,
                events,
                journals,
                memos,
                people,
                scraps,
                transactions,
            }
        };
        downloadFile(
            JSON.stringify(exportData, null, 2),
            `life-controller-backup-${dateStr}.json`,
            'application/json'
        );
        toast.success('JSON 백업 파일이 다운로드되었습니다.');
    };

    const exportCSV = () => {
        const dateStr = new Date().toISOString().slice(0, 10);
        const sections: { name: string; data: Record<string, unknown>[] }[] = [
            { name: 'tasks', data: tasks as unknown as Record<string, unknown>[] },
            { name: 'events', data: events as unknown as Record<string, unknown>[] },
            { name: 'habits', data: habits as unknown as Record<string, unknown>[] },
            { name: 'goals', data: goals as unknown as Record<string, unknown>[] },
            { name: 'journals', data: journals as unknown as Record<string, unknown>[] },
            { name: 'transactions', data: transactions as unknown as Record<string, unknown>[] },
        ];

        sections.forEach(({ name, data }) => {
            if (data.length > 0) {
                downloadFile(
                    toCSV(data),
                    `life-controller-${name}-${dateStr}.csv`,
                    'text/csv'
                );
            }
        });
        toast.success('CSV 파일이 다운로드되었습니다.');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <Download className="w-3.5 h-3.5" />
                    내보내기
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={exportJSON} className="cursor-pointer gap-2">
                    <FileJson className="w-4 h-4 text-blue-500" />
                    <div>
                        <div className="font-medium">JSON 백업</div>
                        <div className="text-[10px] text-muted-foreground">전체 데이터 백업</div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportCSV} className="cursor-pointer gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-green-500" />
                    <div>
                        <div className="font-medium">CSV 내보내기</div>
                        <div className="text-[10px] text-muted-foreground">엑셀 호환 형식</div>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
