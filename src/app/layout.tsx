import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { cn } from '@/lib/utils';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Chiron+Geon+GoRound+TC:wght@400;500;600;700&family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&display=swap" rel="stylesheet" />
      </head>
      <body className={`${nanum.variable} font-sans antialiased bg-background text-foreground tracking-tight`} suppressHydrationWarning>
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
                <Toaster position="top-center" richColors />
              </ThemeProvider>
            </DataProvider>
          </GlobalErrorBoundary>
        </AuthProvider>
      </body>
    </html >
  );
}

