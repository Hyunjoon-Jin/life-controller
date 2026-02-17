/** AI Key Fallback Updated: 2026-02-17 16:30 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Task, Project, CalendarEvent } from "@/types";

// Initialize Gemini API
// WARN: In a real app, API calls should be done server-side to protect the key.
// But for this client-side demo/personal app, we might use it directly or via a Next.js API route.
// For now, we'll try to use it, but provide a fallback if no key.
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AQ.Ab8RN6JYkhVSq7PmbMe4bAkeIvF6XVilN0ACUrsv_gyRMgfh3A";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateMorningBriefing(
    name: string,
    tasks: Task[],
    projects: Project[],
    events: CalendarEvent[]
): Promise<string> {
    if (!API_KEY) {
        return `## 🤖 AI 브리핑 준비 중
(현재 Gemini API 키가 설정되지 않아 시뮬레이션 모드로 표시됩니다.)

**📅 오늘의 주요 일정**
오늘은 총 ${events.length}개의 일정이 잡혀 있습니다.

**✅ 우선순위 할 일**
우선적으로 처리해야 할 고우선순위 작업이 ${tasks.filter(t => t.priority === 'high' && !t.completed).length}개 있습니다.

**🚀 프로젝트 현황**
현재 진행 중인 프로젝트는 ${projects.filter(p => p.status === 'active').length}개입니다.

---
💡 **팁**: 실제 AI 정밀 분석을 받고 싶다면 \`.env.local\` 파일에 \`NEXT_PUBLIC_GEMINI_API_KEY\`를 추가해 주세요!`;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const today = new Date().toISOString().split('T')[0];

        const prompt = `
    You are a professional executive secretary. It is currently morning.
    User Name: ${name}
    Today's Date: ${today}

    Here is the data for today:
    
    [Events]
    ${events.map(e => `- ${e.title} (${new Date(e.start).toLocaleTimeString()} - ${new Date(e.end).toLocaleTimeString()})`).join('\n')}

    [Pending Tasks]
    ${tasks.filter(t => !t.completed).map(t => `- [${t.priority}] ${t.title} (Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No Date'})`).join('\n')}

    [Active Projects]
    ${projects.filter(p => p.status === 'active').map(p => `- ${p.title} (Status: ${p.status})`).join('\n')}

    Please generate a concise, encouraging, and professional morning briefing in Markdown format.
    Structure:
    1. Greeting & Mood Setter (1 line)
    2. Today's Focus (Top 3 things to do based on priority and schedule)
    3. Schedule Overview (Brief text summary)
    4. Project Insights (Any blockers or quick wins?)
    5. A short motivational closing.

    Keep it under 200 words. Use emojis sparingly but effectively.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Failed to generate briefing. Please check your network or API key.";
    }
}

export async function suggestTaskDetails(
    title: string,
    remarks: string,
    projects: Project[]
): Promise<{ priority: 'high' | 'medium' | 'low', tags: string[], category: string, estimatedTime?: number, projectId?: string }> {
    if (!API_KEY) {
        // Mock fallback
        return {
            priority: 'medium',
            tags: ['Auto-Tagged'],
            category: 'work',
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const projectList = projects.map(p => `- ${p.title} (ID: ${p.id})`).join('\n');

        const prompt = `
        Analyze the following task and suggest metadata.
        Task Title: "${title}"
        Task Remarks: "${remarks}"

        Available Projects:
        ${projectList}

        Output JSON ONLY:
        {
            "priority": "high" | "medium" | "low",
            "tags": ["tag1", "tag2"],
            "category": "work" | "study" | "personal" | "health" | "finance" | "other",
            "estimatedTime": number (minutes, optional, guess if implied),
            "projectId": "matching_project_id" (optional, ONLY if strongly strongly related)
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Cleanup markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Gemini Suggestion Error:", error);
        return {
            priority: 'medium',
            tags: [],
            category: 'work'
        };
    }
}
