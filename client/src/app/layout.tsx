import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import './globals.css';

const font = DM_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Document AI',
  description: 'Document AI using RAG and Ollama',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
