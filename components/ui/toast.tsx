'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
}

interface ToastContextType {
  toast: (options: Omit<ToastItem, 'id'>) => void;
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((options: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item = { ...options, id };
    setToasts((prev) => [...prev, item]);

    // Automatically dismiss after 4 seconds
    setTimeout(() => {
      dismiss(id);
    }, 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle className="h-5 w-5 text-status-success shrink-0" />,
              error: <AlertCircle className="h-5 w-5 text-status-danger shrink-0" />,
              info: <Info className="h-5 w-5 text-status-info shrink-0" />,
              warning: <AlertTriangle className="h-5 w-5 text-status-warning shrink-0" />,
            };

            const colors = {
              success: 'border-status-success/30 bg-status-success/5 text-foreground',
              error: 'border-status-danger/30 bg-status-danger/5 text-foreground',
              info: 'border-status-info/30 bg-status-info/5 text-foreground',
              warning: 'border-status-warning/30 bg-status-warning/5 text-foreground',
            };

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-card p-4 shadow-lg overflow-hidden',
                  colors[t.type || 'info']
                )}
              >
                {icons[t.type || 'info']}
                <div className="flex-1 space-y-1">
                  <h4 className="text-xs font-semibold leading-none">{t.title}</h4>
                  {t.description && (
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
