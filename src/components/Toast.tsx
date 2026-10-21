import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastProps {
  toast: ToastMessage | null;
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

const COLORS: Record<ToastTone, string> = {
  success: '#34d399',
  error: '#f87171',
  info: '#38bdf8',
};

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  const Icon = ICONS[toast.tone];
  const color = COLORS[toast.tone];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-12 z-[70] flex justify-center px-4">
      <div
        key={toast.id}
        role="status"
        aria-live="polite"
        className="animate-toastIn flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium shadow-2xl backdrop-blur-md"
        style={{
          background: 'var(--panel-bg)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
          boxShadow: '0 18px 40px -18px rgba(0,0,0,0.65)',
        }}
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color }} />
        <span className="truncate">{toast.message}</span>
      </div>
    </div>
  );
};
