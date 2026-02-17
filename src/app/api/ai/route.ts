import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: NextRequest) {
    if (!API_KEY) {
        return NextResponse.json({ error: "Gemini API Key is missing on server" }, { status: 500 });
    }

    try {
        const { action, payload } = await req.json();

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        switch (action) {
            case 'briefing': {
                const { name, tasks, projects, events, today } = payload;
                const prompt = `
                You are a professional executive secretary. It is currently morning.
                User Name: ${name}
                Today's Date: ${today}

                [Events]
                ${events.join('\n')}
                [Tasks]
                ${tasks.join('\n')}
                [Projects]
                ${projects.join('\n')}

                Generate a Markdown briefing in Korean (encourage, professional, under 200 words).
                `;
                const result = await model.generateContent(prompt);
                return NextResponse.json({ text: result.response.text() });
            }

            case 'suggest': {
                const { title, remarks, projectList } = payload;
                const prompt = `
                Analyze task "${title}" - "${remarks}" with available projects:
                ${projectList}
                Output JSON ONLY:
                { "priority": "high"|"medium"|"low", "tags": [], "category": "work"|..., "estimatedTime": number, "projectId": "string" }
                `;
                const result = await model.generateContent(prompt);
                const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                return NextResponse.json(JSON.parse(text));
            }

            case 'summarize': {
                const { minutes } = payload;
                const prompt = `
                Summarize meeting minutes and extract action items in Korean.
                Output JSON ONLY: { "summary": "...", "actionItems": [] }
                Minutes: ${minutes}
                `;
                const result = await model.generateContent(prompt);
                const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                return NextResponse.json(JSON.parse(text));
            }

            case 'schedule': {
                const { tasks, events, todayStr } = payload;
                const prompt = `
                Suggest time slots for tasks today considering busy events.
                Tasks: ${tasks}
                Events: ${events}
                Output JSON ONLY (List): [ { "taskId": "...", "start": "ISO", "end": "ISO", "reason": "..." } ]
                `;
                const result = await model.generateContent(prompt);
                const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                return NextResponse.json(JSON.parse(text));
            }

            case 'insight': {
                const { projectTitle, projectDesc, tasks } = payload;
                const prompt = `
                Analyze project "${projectTitle}" (${projectDesc}) and tasks: ${tasks}.
                Suggest 3 next steps in Korean.
                `;
                const result = await model.generateContent(prompt);
                return NextResponse.json({ text: result.response.text() });
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Gemini API Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
