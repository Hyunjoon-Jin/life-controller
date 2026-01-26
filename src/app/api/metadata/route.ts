import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; DailyScheduler/1.0; +http://localhost:3000)'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch URL');
        }

        const html = await response.text();

        // Simple Regex to extract metadata
        const getMetaContent = (prop: string) => {
            const regex = new RegExp(`<meta property="${prop}" content="([^"]+)"`, 'i');
            const match = html.match(regex);
            if (match) return match[1];

            // Try name attribute too
            const regexName = new RegExp(`<meta name="${prop}" content="([^"]+)"`, 'i');
            const matchName = html.match(regexName);
            return matchName ? matchName[1] : null;
        };

        const getTitle = () => {
            const ogTitle = getMetaContent('og:title');
            if (ogTitle) return ogTitle;

            const titleRegex = /<title>([^<]+)<\/title>/i;
            const match = html.match(titleRegex);
            return match ? match[1] : '';
        };

        const getImage = () => {
            return getMetaContent('og:image');
        };

        const title = getTitle();
        const image = getImage();

        // Decoding HTML entities might be needed but for now return raw
        return NextResponse.json({ title, image });

    } catch (error) {
        console.error('Metadata fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
    }
}
