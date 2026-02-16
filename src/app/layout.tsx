import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

import { DataProvider } from '@/context/DataProvider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AuthProvider } from '@/components/auth/SessionProvider';
import { Toaster } from 'sonner';
import { ServiceWorkerUnregister } from '@/components/ServiceWorkerUnregister';
import { GlobalErrorBoundary } from '@/components/ui/global-error-boundary';

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
};

import { SessionReset } from '@/components/auth/SessionReset';
import { PullToRefreshHandler } from "@/components/layout/PullToRefreshHandler";
import { HelpFAB } from "@/components/layout/HelpFAB";
import { WelcomeOnboarding } from "@/components/guide/WelcomeOnboarding";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Asta+Sans:wght@300..800&family=Gowun+Batang&display=swap" rel="stylesheet" />
      </head>
      <body className={`${nanum.variable} font-sans antialiased bg-background text-foreground tracking-tight`} suppressHydrationWarning>
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
