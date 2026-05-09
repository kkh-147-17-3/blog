import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'kh.log',
  description: 'TRY · TEST · TIDY',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body data-mode="light" data-cat="none">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
