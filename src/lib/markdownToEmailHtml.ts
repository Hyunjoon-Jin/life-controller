/**
 * 마크다운 → 이메일 클라이언트(Gmail/Outlook) 호환 HTML 변환기
 * - 인라인 style만 사용 (class 속성은 이메일에서 무시됨)
 * - Gmail, Outlook, Apple Mail 붙여넣기 테스트 기준 설계
 */

export function markdownToEmailHtml(markdown: string): string {
    let html = markdown;

    // 1. 표(Table) — 멀티라인 패턴이므로 가장 먼저 처리
    html = convertTables(html);

    // 2. 제목
    html = html.replace(/^### (.+)$/gm,
        '<h3 style="font-size:15px;font-weight:700;margin:14px 0 6px;color:#1a1a1a;">$1</h3>');
    html = html.replace(/^## (.+)$/gm,
        '<h2 style="font-size:17px;font-weight:700;margin:18px 0 8px;color:#1a1a1a;">$1</h2>');
    html = html.replace(/^# (.+)$/gm,
        '<h1 style="font-size:20px;font-weight:800;margin:22px 0 10px;color:#1a1a1a;">$1</h1>');

    // 3. 수평선
    html = html.replace(/^---$/gm,
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:14px 0;">');

    // 4. 굵게 / 기울임 (순서 중요: ** 먼저)
    html = html.replace(/\*\*(.+?)\*\*/g,
        '<strong style="font-weight:700;">$1</strong>');
    html = html.replace(/\*(.+?)\*/g,
        '<em style="font-style:italic;">$1</em>');

    // 5. 목록 (연속 - 행을 ul로 묶음)
    html = convertLists(html);

    // 6. 번호 목록 (연속 숫자. 행을 ol로 묶음)
    html = convertOrderedLists(html);

    // 7. 인라인 코드
    html = html.replace(/`(.+?)`/g,
        '<code style="background:#f4f4f5;border-radius:3px;padding:1px 4px;font-family:monospace;font-size:13px;">$1</code>');

    // 8. 단락 처리: 빈줄(\n\n)을 기준으로 블록 분리
    //    각 블록이 이미 HTML 태그로 시작하면 그대로, 아니면 <p>로 래핑
    const blocks = html.split(/\n{2,}/);
    html = blocks.map(block => {
        const trimmed = block.trim();
        if (!trimmed) return '';
        // HTML 블록 태그로 시작하면 그대로
        if (/^<(h[1-6]|p|ul|ol|table|hr|div|blockquote)/i.test(trimmed)) return trimmed;
        // 단일 \n → <br>
        return `<p style="margin:0 0 10px;line-height:1.7;color:#1a1a1a;">${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).filter(Boolean).join('\n');

    return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.7;max-width:640px;">${html}</div>`;
}

function convertTables(text: string): string {
    // 마크다운 표 패턴: 헤더행 | 구분행(---) | 데이터 행들
    return text.replace(
        /(\|.+\|\n\|[-:| ]+\|\n(?:\|.+\|\n?)*)/gm,
        (tableBlock) => {
            const rows = tableBlock.trim().split('\n');
            if (rows.length < 2) return tableBlock;

            const parseRow = (row: string) =>
                row.split('|').map(c => c.trim()).filter(Boolean);

            const headerCells = parseRow(rows[0]);
            const dataRows = rows.slice(2);

            const thead = headerCells.map(c =>
                `<th style="border:1px solid #d1d5db;padding:8px 12px;background:#f9fafb;font-weight:700;text-align:left;font-size:13px;">${c}</th>`
            ).join('');

            const tbody = dataRows.map(row => {
                const cells = parseRow(row);
                return `<tr>${cells.map((c, i) =>
                    `<td style="border:1px solid #e5e7eb;padding:7px 12px;font-size:13px;${i === 0 ? 'font-weight:600;' : ''}">${c}</td>`
                ).join('')}</tr>`;
            }).join('\n');

            return `<table style="border-collapse:collapse;width:100%;margin:12px 0;"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
        }
    );
}

function convertLists(text: string): string {
    // 연속된 "- " 항목 블록을 <ul>로 래핑
    return text.replace(
        /((?:^- .+$\n?)+)/gm,
        (block) => {
            const items = block.trim().split('\n').map(line =>
                `<li style="margin:3px 0;line-height:1.6;">${line.replace(/^- /, '')}</li>`
            ).join('');
            return `<ul style="margin:8px 0;padding-left:22px;">${items}</ul>\n`;
        }
    );
}

function convertOrderedLists(text: string): string {
    // 연속된 "N. " 항목 블록을 <ol>로 래핑
    return text.replace(
        /((?:^\d+\. .+$\n?)+)/gm,
        (block) => {
            const items = block.trim().split('\n').map(line =>
                `<li style="margin:3px 0;line-height:1.6;">${line.replace(/^\d+\. /, '')}</li>`
            ).join('');
            return `<ol style="margin:8px 0;padding-left:22px;">${items}</ol>\n`;
        }
    );
}

/** HTML + plain text 동시 복사 (Gmail/Outlook 붙여넣기 서식 유지) */
export async function copyAsEmailHtml(markdown: string): Promise<boolean> {
    const htmlString = markdownToEmailHtml(markdown);

    try {
        if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
            const htmlBlob = new Blob([htmlString], { type: 'text/html' });
            const textBlob = new Blob([markdown], { type: 'text/plain' });
            await navigator.clipboard.write([
                new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob }),
            ]);
            return true;
        }
    } catch { /* fallback 시도 */ }

    // Fallback: hidden contenteditable + execCommand (Firefox, iOS 등)
    try {
        const el = document.createElement('div');
        el.setAttribute('contenteditable', 'true');
        el.innerHTML = htmlString;
        el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        document.body.appendChild(el);
        el.focus();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        selection?.removeAllRanges();
        selection?.addRange(range);
        const ok = document.execCommand('copy');
        selection?.removeAllRanges();
        document.body.removeChild(el);
        return ok;
    } catch {
        return false;
    }
}
