import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from 'cheerio';

const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: NextRequest) {
    if (!API_KEY) {
        return NextResponse.json({ error: "Gemini API Key is missing on server" }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { action, payload } = body;

        if (!API_KEY) {
            console.error("[API/AI] Error: Missing API Key");
            return NextResponse.json({ error: "Gemini API Key is missing on server" }, { status: 500 });
        }

        console.log(`[DEBUG] Using Key starting with: ${API_KEY.substring(0, 5)}...`);

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
                    const response = await fetch(url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        }
                    });
                    if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
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
                } catch (error: any) {
                    console.error("URL Summarization Error:", error);
                    return NextResponse.json({
                        summary: `요약 실패: ${error.message || "알 수 없는 오류"}`,
                        tags: ["에러"]
                    });
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

            case 'analyze_investment_url': {
                const { url: investUrl, symbol: investSymbol, name: investName } = payload;
                try {
                    const response = await fetch(investUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        }
                    });
                    if (!response.ok) throw new Error(`URL 접근 실패: ${response.status}`);
                    const html = await response.text();
                    const $ = cheerio.load(html);
                    $('script, style, iframe, nav, footer, header, aside').remove();
                    const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 12000);

                    const prompt = `당신은 전문 투자 애널리스트입니다. 다음 기사/리포트를 분석하여 투자 의견을 JSON으로 반환하세요.
${investSymbol ? `종목 심볼: ${investSymbol}` : ''}
${investName ? `종목명: ${investName}` : ''}

기사 내용:
${text}

다음 JSON 형식으로만 반환하세요 (코드블록 없이):
{
  "symbol": "티커심볼 (기사에서 추출, 없으면 입력값 사용)",
  "name": "종목명 (기사에서 추출, 없으면 입력값 사용)",
  "rating": "buy 또는 hold 또는 sell",
  "targetPrice": 목표주가 숫자 또는 null,
  "sentiment": "bullish 또는 neutral 또는 bearish",
  "riskLevel": "low 또는 medium 또는 high",
  "keyPoints": ["핵심 포인트 1 (한국어)", "핵심 포인트 2", "핵심 포인트 3"],
  "tags": ["태그1", "태그2", "태그3"],
  "analysis": "3-4문단의 전문적인 한국어 투자 분석문. 종목 개요 및 현재 시장 상황, 투자 의견 근거 및 핵심 포인트, 주요 리스크 요인, 결론 및 투자 전략을 포함하세요."
}`;
                    const result = await model.generateContent(prompt);
                    const jsonText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                    return NextResponse.json(JSON.parse(jsonText));
                } catch (error: any) {
                    console.error('[AI] analyze_investment_url error:', error);
                    return NextResponse.json({ error: `분석 실패: ${error.message}` }, { status: 500 });
                }
            }

            case 'write_investment_analysis': {
                const { symbol: wSymbol, name: wName, rating: wRating, targetPrice: wTargetPrice, notes, stockData } = payload;
                const ratingKorean = wRating === 'buy' ? '매수' : wRating === 'sell' ? '매도' : '중립';
                const stockInfo = stockData
                    ? `현재가: ${stockData.currentPrice} ${stockData.currency}, 전일대비: ${stockData.changePercent?.toFixed(2)}%, 52주 고가: ${stockData.week52High}, 52주 저가: ${stockData.week52Low}`
                    : '';

                const prompt = `당신은 전문 투자 애널리스트입니다. 다음 종목에 대한 전문적인 한국어 투자 분석문을 작성해주세요.

종목 심볼: ${wSymbol}
종목명: ${wName}
투자의견: ${ratingKorean} (${wRating})
${wTargetPrice ? `목표주가: ${wTargetPrice} USD` : ''}
${stockInfo ? `실시간 데이터: ${stockInfo}` : ''}
${notes ? `사용자 메모: ${notes}` : ''}

4문단의 전문적인 분석문을 한국어로 작성해주세요:
1문단: 종목 개요 및 현재 시장 상황
2문단: 투자의견 근거 및 핵심 투자 포인트
3문단: 주요 리스크 요인 및 주의사항
4문단: 결론 및 투자 전략 제안

마크다운 포맷을 사용하고, 분석문만 반환하세요.`;

                const result = await model.generateContent(prompt);
                return NextResponse.json({ text: result.response.text() });
            }

            case 'analyze_portfolio': {
                const { holdings, analyses } = payload;

                const holdingsSummary = (holdings || []).length > 0
                    ? holdings.map((h: any) =>
                        `${h.name}(${h.symbol}): ${h.quantity}주 @ 평균단가 ${h.avgBuyPrice}${h.currency}${h.currentPrice ? `, 현재가 ${h.currentPrice}` : ''}`
                    ).join('\n')
                    : '보유 종목 없음';

                const analysesSummary = (analyses || []).length > 0
                    ? analyses.map((a: any) =>
                        `${a.name}(${a.symbol}): ${a.rating}, 목표가 ${a.targetPrice || '미설정'}${a.sentiment ? `, 심리 ${a.sentiment}` : ''}`
                    ).join('\n')
                    : '분석 기록 없음';

                const prompt = `당신은 포트폴리오 매니저입니다. 다음 포트폴리오를 분석하고 한국어로 투자 인사이트를 제공하세요.

[보유 종목]
${holdingsSummary}

[분석 기록]
${analysesSummary}

다음 JSON 형식으로만 반환하세요 (코드블록 없이):
{
  "overallSentiment": "bullish 또는 neutral 또는 bearish",
  "diversificationScore": 1~10 사이 정수 (분산 투자 점수),
  "riskLevel": "conservative 또는 moderate 또는 aggressive",
  "strengths": ["포트폴리오 강점 1 (한국어)", "강점 2"],
  "risks": ["주요 리스크 1 (한국어)", "리스크 2"],
  "recommendations": ["추천 액션 1 (한국어)", "추천 액션 2", "추천 액션 3"],
  "summary": "포트폴리오 전반적 평가를 2-3문장으로 작성 (한국어)"
}`;

                const result = await model.generateContent(prompt);
                const jsonText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                return NextResponse.json(JSON.parse(jsonText));
            }

            case 'polish_email': {
                const { to, subject, body, tone, purpose, language } = payload;

                const toneMap: Record<string, string> = {
                    formal: '매우 공식적이고 격식 있는',
                    professional: '전문적이고 비즈니스에 적합한',
                    friendly: '친근하고 따뜻한',
                    assertive: '자신감 있고 단호한',
                    concise: '간결하고 핵심만 전달하는',
                };
                const purposeMap: Record<string, string> = {
                    report: '업무 보고',
                    request: '요청',
                    decline: '거절/사양',
                    proposal: '제안',
                    announcement: '공지/안내',
                    thanks: '감사',
                    apology: '사과',
                    general: '일반',
                };

                const toneDesc = toneMap[tone] || '전문적인';
                const purposeDesc = purposeMap[purpose] || '일반';
                const lang = language === 'english' ? 'English' : '한국어';

                const prompt = `당신은 전문 비즈니스 커뮤니케이션 전문가입니다.
다음 메일 원문을 "${toneDesc}" 톤으로, "${purposeDesc}" 목적에 맞게, ${lang}로 자연스럽게 다듬어 주세요.
문법 교정, 표현 개선, 구조 최적화를 포함하며, 원문의 핵심 내용과 의도는 반드시 유지하세요.

수신자: ${to || '(미입력)'}
제목: ${subject || '(미입력)'}
원문 내용:
${body}

다음 JSON 형식으로만 반환하세요 (코드블록 없이):
{
  "subject": "다듬어진 제목",
  "body": "다듬어진 메일 본문 (줄바꿈은 \\n 사용)",
  "improvements": ["개선 포인트 1", "개선 포인트 2", "개선 포인트 3"],
  "tone_summary": "적용된 톤과 스타일 설명 (1문장)"
}`;

                const result = await model.generateContent(prompt);
                const jsonText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                return NextResponse.json(JSON.parse(jsonText));
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("AI API Error:", error);
        const keyPrefix = API_KEY ? API_KEY.substring(0, 5) : "NONE";
        return NextResponse.json({ error: `[Key: ${keyPrefix}...] ${error.message || "Internal Server Error"}` }, { status: 500 });
    }
}
