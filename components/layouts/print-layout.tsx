'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PrintLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  reportTitle: string;
  athleteName: string;
}

export function PrintLayout({
  children,
  reportTitle,
  athleteName,
  className,
  ...props
}: PrintLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-white text-black p-8 font-sans antialiased space-y-6',
        className
      )}
      id="print-layout-container"
      {...props}
    >
      {/* Printable Header Row */}
      <header className="border-b-2 border-black pb-4 flex items-end justify-between select-none">
        <div className="space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">
            Track.Studio Performance Report
          </div>
          <h1 className="text-xl font-bold uppercase tracking-tight">{reportTitle}</h1>
        </div>
        
        <div className="text-right text-[10px] font-mono uppercase space-y-0.5 text-gray-600">
          <div>Athlete: <b>{athleteName}</b></div>
          <div>Printed: <b>{new Date().toLocaleDateString()}</b></div>
          <div>Security: <b>Internal Confid.</b></div>
        </div>
      </header>

      {/* Core Report Content Port */}
      <main className="space-y-6 print:space-y-6">
        {children}
      </main>

      {/* Printable Page Footer */}
      <footer className="border-t border-gray-300 pt-4 flex items-center justify-between text-[8px] font-mono text-gray-500 uppercase tracking-widest select-none">
        <span>Generated via Track.Studio Ingestion Shell • Secure PDF Output</span>
        <span>Page 1 of 1</span>
      </footer>
    </div>
  );
}
