import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', color: 'var(--color-text-muted)' }}>
    <Loader2 size={32} className="lucide-spin" style={{ animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    <p style={{ marginTop: '16px' }}>{text}</p>
  </div>
);

export const EmptyState: React.FC<{ title: string; message: string; icon?: React.ReactNode }> = ({ title, message, icon }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', textAlign: 'center' }}>
    {icon && <div style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>{icon}</div>}
    <h3 style={{ marginBottom: '8px' }}>{title}</h3>
    <p style={{ color: 'var(--color-text-muted)' }}>{message}</p>
  </div>
);

export const ErrorState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', textAlign: 'center' }}>
    <h3 style={{ marginBottom: '8px', color: 'var(--color-error)' }}>Something went wrong</h3>
    <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>We couldn't load this data.</p>
    {onRetry && (
      <button onClick={onRetry} style={{ padding: '8px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px' }}>
        Try Again
      </button>
    )}
  </div>
);
