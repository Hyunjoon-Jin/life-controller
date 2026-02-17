import { Task, Project, CalendarEvent } from "@/types";

/**
 * Gemini AI 통합 라이브러리 (v3.0 - 서버측 프록시 방식)
 * 이제 클라이언트에서 API 키를 직접 관리하지 않고, 내부 API Route(/api/ai)를 호출합니다.
 */

async function callAIApi(action: string, payload: any) {
    try {
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'AI API 요청 실패');
        }

        return await response.json();
    } catch (error) {
        console.error(`AI API [${action}] Error:`, error);
        throw error;
    }
}

export async function generateMorningBriefing(
    name: string,
    tasks: Task[],
    projects: Project[],
    events: CalendarEvent[]
): Promise<string> {
    try {
        const today = new Date().toISOString().split('T')[0];
        const payload = {
            name,
            today,
            events: events.map(e => `- ${e.title} (${new Date(e.start).toLocaleTimeString()})`),
            tasks: tasks.filter(t => !t.completed).map(t => `- [${t.priority}] ${t.title}`),
            projects: projects.filter(p => p.status === 'active').map(p => `- ${p.title}`)
        };

        const result = await callAIApi('briefing', payload);
        return result.text;
    } catch (error) {
        return "브리핑을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    }
}

export async function suggestTaskDetails(
    title: string,
    remarks: string,
    projects: Project[]
): Promise<{ priority: 'high' | 'medium' | 'low', tags: string[], category: string, estimatedTime?: number, projectId?: string }> {
    try {
        const payload = {
            title,
            remarks,
            projectList: projects.map(p => `- ${p.title} (ID: ${p.id})`).join('\n')
        };
        return await callAIApi('suggest', payload);
    } catch (error) {
        return { priority: 'medium', tags: [], category: 'work' };
    }
}

export async function summarizeMeeting(minutes: string): Promise<{ summary: string, actionItems: string[] }> {
    try {
        return await callAIApi('summarize', { minutes });
    } catch (error) {
        return { summary: "요약 생성 중 오류가 발생했습니다.", actionItems: [] };
    }
}

export async function recommendSmartSchedule(tasks: Task[], events: CalendarEvent[]): Promise<{ taskId: string, start: string, end: string, reason: string }[]> {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const payload = {
            tasks: JSON.stringify(tasks.filter(t => !t.completed && t.estimatedTime).map(t => ({ id: t.id, title: t.title, priority: t.priority, duration: t.estimatedTime }))),
            events: JSON.stringify(events.filter(e => new Date(e.start).toISOString().startsWith(todayStr)).map(e => ({ title: e.title, start: e.start, end: e.end }))),
            todayStr
        };
        return await callAIApi('schedule', payload);
    } catch (error) {
        return [];
    }
}

export async function suggestNextProjectTasks(project: Project, tasks: Task[]): Promise<string> {
    try {
        const payload = {
            projectTitle: project.title,
            projectDesc: project.description,
            tasks: JSON.stringify(tasks.map(t => ({ title: t.title, completed: t.completed })))
        };
        const result = await callAIApi('insight', payload);
        return result.text;
    } catch (error) {
        return "분석 중 오류가 발생했습니다.";
    }
}
