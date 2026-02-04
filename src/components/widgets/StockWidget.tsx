'use client';

import { useEffect, useRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

export const StockWidget = memo(function StockWidget() {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;
        if (container.current.childElementCount > 0) return;

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = `
        {
          "symbol": "KOSPI:KOSPI",
          "width": "100%",
          "height": "100%",
          "locale": "kr",
          "dateRange": "12M",
          "colorTheme": "light",
          "isTransparent": true,
          "autosize": true,
          "largeChartUrl": ""
        }`;
        container.current.appendChild(script);
    }, []);

    return (
        <div className="bg-white dark:bg-[#202022] rounded-[24px] p-5 shadow-sm min-h-[160px] flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-lg text-[#333D4B] dark:text-gray-200">시장 지표</h3>
                    <p className="text-[#8B95A1] text-sm">KOSPI 현재 흐름</p>
                </div>
                <div className="bg-red-50 p-2 rounded-full">
                    <TrendingUp className="w-5 h-5 text-red-500" />
                </div>
            </div>
            <div className="flex-1 overflow-hidden relative min-h-[100px]" ref={container}>
                {/* TradingView Widget Mount Point */}
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-right flex items-center justify-end gap-1">
                Powered by TradingView
            </div>
        </div>
    );
});
