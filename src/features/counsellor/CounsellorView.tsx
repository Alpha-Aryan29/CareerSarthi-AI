import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';

interface EscalationCase {
  id: string;
  phone: string;
  time: string;
  status: string;
  timestamp: string;
}

const CounsellorView: React.FC = () => {
  const [cases, setCases] = useState<EscalationCase[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('escalations') || '[]');
    setCases(stored.reverse());
  }, []);

  const claimCase = (id: string) => {
    const updated = cases.map(c => c.id === id ? { ...c, status: 'claimed' } : c);
    setCases(updated);
    localStorage.setItem('escalations', JSON.stringify(updated.reverse()));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ marginBottom: '32px' }}>Staff View: Callback Queue</h1>
      
      {cases.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No open requests.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cases.map(c => (
            <div key={c.id} style={{ 
              backgroundColor: 'var(--color-surface)', 
              padding: '24px', 
              borderRadius: '12px', 
              border: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ marginBottom: '8px' }}>Phone: {c.status === 'claimed' ? c.phone : '**********'}</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>Preferred time: {c.time}</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Requested at: {new Date(c.timestamp).toLocaleString()}</p>
                
                <div style={{ marginTop: '12px' }}>
                  <span style={{ 
                    backgroundColor: c.status === 'claimed' ? '#FEF3C7' : '#F0FDF4', 
                    color: c.status === 'claimed' ? 'var(--color-warning)' : 'var(--color-success)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    {c.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {c.status === 'open' && (
                <Button style={{ width: '120px', height: '48px' }} onClick={() => claimCase(c.id)}>
                  Claim
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CounsellorView;
