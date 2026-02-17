import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from 'cheerio';

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

            case 'summarize_url': {
                const { url } = payload;
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('Failed to fetch URL');
                    const html = await response.text();
                    const $ = cheerio.load(html);

                    // Remove scripts, styles, and other unnecessary elements
                    $('script, style, iframe, nav, footer, header, aside').remove();
                    const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 10000); // Limit text length

                    const prompt = `
                    Analyze the following article content:
                    ${text}

                    1. Summarize the key points in Korean (3 bullet points).
                    2. Extract 3 relevant Korean tags.

                    Output JSON ONLY:
                    { "summary": "...", "tags": ["tag1", "tag2", "tag3"] }
                    `;
                    const result = await model.generateContent(prompt);
                    const jsonText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                    return NextResponse.json(JSON.parse(jsonText));
                } catch (error) {
                    console.error("URL Summarization Error:", error);
                    return NextResponse.json({ summary: "URL을 불러오거나 요약하는 데 실패했습니다.", tags: [] });
                }
            }

            case 'analyze_book_note': {
                const { note, title } = payload;
                const prompt = `
                Analyze the following book note${title ? ` for the book "${title}"` : ''}:
                "${note}"

                Output JSON ONLY (Korean):
                { 
                    "summary": "One sentence summary", 
                    "insights": ["Insight 1", "Insight 2", "Insight 3"], 
                    "actionItems": ["Action 1", "Action 2"] 
                }
                `;
                const result = await model.generateContent(prompt);
                const jsonText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                return NextResponse.json(JSON.parse(jsonText));
            }

            case 'generate_study_plan': {
                const { goal, type } = payload;
                const prompt = `
                Create a 4-week study plan for ${type === 'certificate' ? 'Certificate' : 'Language'} goal: "${goal}".
                
                Output JSON ONLY (Korean):
                {
                    "weeklyPlan": [
                        { "week": 1, "topic": "...", "details": "..." },
                        { "week": 2, "topic": "...", "details": "..." },
                        { "week": 3, "topic": "...", "details": "..." },
                        { "week": 4, "topic": "...", "details": "..." }
                    ]
                }
                `;
                const result = await model.generateContent(prompt);
                const jsonText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                return NextResponse.json(JSON.parse(jsonText));
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Gemini API Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
