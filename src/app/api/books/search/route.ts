import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const store = searchParams.get('store') || 'yes24'; // yes24, kyobo, aladin

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        let results = [];

        if (store === 'yes24') {
            const searchUrl = `http://www.yes24.com/Product/Search?domain=ALL&query=${encodeURIComponent(query)}`;
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                }
            });

            if (!response.ok) throw new Error('Yes24 fetch failed');
            const html = await response.text();
            const $ = cheerio.load(html);

            // Yes24 Parsing logic using Cheerio
            $('#yesSchList .itemUnit').each((_, element) => {
                if (results.length >= 20) return false;

                const $el = $(element);
                const titleEl = $el.find('a.gd_name');
                const link = 'http://www.yes24.com' + titleEl.attr('href');
                const title = titleEl.text().trim();

                // Image - handle lazy loading
                let coverUrl = $el.find('img').attr('data-original');
                if (!coverUrl) coverUrl = $el.find('img').attr('src');

                // Author
                const author = $el.find('.authPub.info_auth').text().trim().replace(/\s+/g, ' ');

                if (title && link) {
                    results.push({ title, author, coverUrl, link, store: 'yes24' });
                }
            });

        } else if (store === 'kyobo') {
            // Kyobo API strategy
            const apiUrl = `https://search.kyobobook.co.kr/api/search/search?keyword=${encodeURIComponent(query)}&gbCode=TOT&target=total`;
            const response = await fetch(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Referer': 'https://search.kyobobook.co.kr/'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data?.prodList) {
                    results = data.data.prodList.map((item: any) => ({
                        title: item.prodNm,
                        author: item.chrcName,
                        coverUrl: `https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/${item.cmdtCode}.jpg`,
                        link: item.linkUrl || `https://product.kyobobook.co.kr/detail/${item.cmdtCode}`,
                        store: 'kyobo'
                    }));
                }
            }
        } else if (store === 'aladin') {
            const searchUrl = `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=All&SearchWord=${encodeURIComponent(query)}`;
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) throw new Error('Aladin fetch failed');
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.ss_book_box').each((_, element) => {
                if (results.length >= 20) return false;

                const $el = $(element);
                const titleEl = $el.find('a.bo3');
                const title = titleEl.text().trim();
                const link = titleEl.attr('href');

                const coverUrl = $el.find('img.i_cover').attr('src');

                // Author logic for Aladin is tricky, usually in specific li
                // Try finding text after title or inside .book_info
                // Aladin often puts author in a specialized list, let's try a loose text match next to title
                const author = $el.find('.book_info').first().text().split('|')[0] || 'Unknown';

                if (title && link) {
                    results.push({ title, author, coverUrl, link, store: 'aladin' });
                }
            });
        }

        return NextResponse.json({ results });

    } catch (error) {
        console.error('Search scrape error:', error);
        return NextResponse.json({ error: 'Failed to search books' }, { status: 500 });
    }
}
