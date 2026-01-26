import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status}`);
        }

        const html = await response.text();

        // Helper to extract meta content
        const getMetaContent = (prop: string) => {
            const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
            const match = html.match(regex);
            return match ? match[1] : null;
        };

        // Try standard OG tags first
        let title = getMetaContent('og:title');
        let image = getMetaContent('og:image');
        let author = getMetaContent('og:author') || getMetaContent('author') || getMetaContent('book:author');

        // Fallback for Title (Title tag)
        if (!title) {
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            title = titleMatch ? titleMatch[1] : '';
        }

        // Clean up title (remove site name often appended like " - Yes24")
        if (title) {
            title = title.split(' - ')[0].split(' | ')[0];
        }

        // Specific handling for Yes24/Kyobo if generic fails or to improve accuracy
        // Kyobo typically uses 'author' meta. Yes24 sometimes bury it.
        // If author is missing, try to find it in common classes (risky with regex, but worth a try if meta fails)
        if (!author && (url.includes('yes24') || url.includes('kyobobook'))) {
            // Very rough regex for common structures, low confidence fallback
            const authorMatch = html.match(/<meta[^>]+name="author"[^>]+content="([^"]+)"/i);
            if (authorMatch) author = authorMatch[1];
        }

        return NextResponse.json({
            title: title || '',
            author: author || '',
            coverUrl: image || ''
        });

    } catch (error) {
        console.error('Scrape error:', error);
        return NextResponse.json({ error: 'Failed to scrape metadata' }, { status: 500 });
    }
}
