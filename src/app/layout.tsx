import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Asta_Sans, Gowun_Batang } from 'next/font/google';
import './globals.css';

import { DataProvider } from '@/context/DataProvider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AuthProvider } from '@/components/auth/SessionProvider';
import { Toaster } from 'sonner';
import { ServiceWorkerUnregister } from '@/components/ServiceWorkerUnregister';
import { GlobalErrorBoundary } from '@/components/ui/global-error-boundary';

const asta = Asta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-asta',
  display: 'swap',
});

const gowun = Gowun_Batang({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-gowun',
  display: 'swap',
});

const nanum = localFont({
  src: [
    {
      path: './fonts/NanumSquareRoundL.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/NanumSquareRoundR.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/NanumSquareRoundB.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/NanumSquareRoundEB.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-nanum',
});

export const metadata: Metadata = {
  title: 'LIFE Controller',
  description: 'Comprehensive productivity platform',
  other: {
    'google-adsense-account': 'ca-pub-8704292092201678',
  },
};

import { SessionReset } from '@/components/auth/SessionReset';
import { PullToRefreshHandler } from "@/components/layout/PullToRefreshHandler";
import { HelpFAB } from "@/components/layout/HelpFAB";
import { WelcomeOnboarding } from "@/components/guide/WelcomeOnboarding";

import { GoogleAdSense } from '@/components/ads/GoogleAdSense';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${asta.variable} ${gowun.variable} ${nanum.variable} font-sans antialiased bg-background text-foreground tracking-tight`} suppressHydrationWarning>
        <GoogleAdSense pId={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID!} />
        <PullToRefreshHandler />
        <ServiceWorkerUnregister />

        <AuthProvider>
          <GlobalErrorBoundary>
            <DataProvider>
              <SessionReset />
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                themes={['light', 'dark', 'gray']}
                disableTransitionOnChange
              >
                {children}
                <HelpFAB />
                <WelcomeOnboarding />
                <Toaster position="top-center" richColors />
              </ThemeProvider>
            </DataProvider>
          </GlobalErrorBoundary>
        </AuthProvider>
      </body>
    </html >
  );
}
