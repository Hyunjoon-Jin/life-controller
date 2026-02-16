'use client';

import Script from 'next/script';

type Props = {
    pId: string;
};

export function GoogleAdSense({ pId }: Props) {
    // Hardcode ID to ensure it works even if env var is missing in production
    const adsenseId = pId || "ca-pub-8704292092201678";

    if (!adsenseId) {
        return null;
    }

    return (
        <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
