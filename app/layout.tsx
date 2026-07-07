import React from 'react';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/lib/firebase/hooks/use-auth';
import { WorkspaceProvider } from '@/providers/workspace-provider';
import { WidgetProvider } from '@/components/widget/widget-context';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Track.Studio — Performance Ingestion Shell',
  description: 'Running Performance Analysis Platform Ingestion Console',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="font-sans antialiased h-full">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <WorkspaceProvider>
                <WidgetProvider>
                  {children}
                </WidgetProvider>
              </WorkspaceProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
