'use client';

import * as React from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, 'id'>) => void;
  toasts: ToastMessage[];
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(({ title, description, type = 'info' }: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-lg border shadow-lg bg-card text-card-foreground pointer-events-auto flex flex-col gap-1 transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              t.type === 'success' ? 'border-status-success/40 bg-status-success/5' :
              t.type === 'error' ? 'border-status-danger/40 bg-status-danger/5' :
              t.type === 'warning' ? 'border-status-warning/40 bg-status-warning/5' :
              'border-border'
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <span className="text-xs font-bold leading-none">{t.title}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="text-[10px] uppercase font-mono tracking-wider font-bold opacity-60 hover:opacity-100 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            {t.description && (
              <p className="text-[11px] text-muted-foreground leading-normal">{t.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
