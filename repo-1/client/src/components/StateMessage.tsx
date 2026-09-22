import type { ReactNode } from 'react';

interface StateMessageProps {
  tone?: 'info' | 'error';
  children: ReactNode;
}

export default function StateMessage({ tone = 'info', children }: StateMessageProps) {
  const styles = tone === 'error' ? 'border-danger bg-danger/5 text-danger' : 'border-slate-200 bg-white text-muted';

  return (
    <p
      role={tone === 'error' ? 'alert' : undefined}
      className={`rounded-3xl border-4 p-6 text-center text-lg font-bold ${styles}`}
    >
      {children}
    </p>
  );
}
