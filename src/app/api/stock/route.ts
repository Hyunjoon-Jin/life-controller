import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // KRX:005930 → 005930.KS (Yahoo Finance 형식)
    let ySymbol = symbol;
    if (symbol.startsWith('KRX:')) {
        ySymbol = symbol.replace('KRX:', '') + '.KS';
    }

    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySymbol)}?range=1d&interval=1d`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            next: { revalidate: 60 }, // 1분 캐시
        });

        if (!response.ok) {
            throw new Error(`Yahoo Finance API error: ${response.status}`);
        }

        const data = await response.json();
        const result = data?.chart?.result?.[0];
        const meta = result?.meta;

        if (!meta) {
            throw new Error('No data returned from Yahoo Finance');
        }

        const currentPrice = meta.regularMarketPrice;
        const previousClose = meta.previousClose || meta.chartPreviousClose;
        const changePercent = previousClose && currentPrice
            ? ((currentPrice - previousClose) / previousClose) * 100
            : null;

        return NextResponse.json({
            symbol: meta.symbol,
            currentPrice,
            previousClose,
            changePercent,
            week52High: meta.fiftyTwoWeekHigh,
            week52Low: meta.fiftyTwoWeekLow,
            currency: meta.currency,
            marketState: meta.marketState,
        });
    } catch (error: any) {
        console.error('[API/Stock] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
