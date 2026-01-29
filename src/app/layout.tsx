import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { cn } from '@/lib/utils';
import { DataProvider } from '@/context/DataProvider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { Toaster } from 'sonner';
import { ServiceWorkerUnregister } from '@/components/ServiceWorkerUnregister';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${nanum.variable} font-sans antialiased bg-background text-foreground`} suppressHydrationWarning>
        <ServiceWorkerUnregister />
        <SessionProvider>
          <DataProvider>
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
        </SessionProvider>
      </body>
    </html>
  );
}

