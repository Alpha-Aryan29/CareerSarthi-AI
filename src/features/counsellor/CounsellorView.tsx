import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';

interface EscalationCase {
  id: string;
  phone: string;
  time: string;
  status: 'open' | 'claimed' | 'resolved' | 'unreachable';
  timestamp: string;
  priority: 'High' | 'Medium' | 'Low';
  triggerReason: string;
  summary: string;
  district?: string;
  state?: string;
  trade?: string;
}

const demoSeedCases: EscalationCase[] = [
  {
    id: 'seed-1',
    phone: '9876543210',
    time: 'Evening',
    status: 'open',
    timestamp: '2026-10-05T09:00:00.000Z',
    priority: 'High',
    triggerReason: 'Safety concern',
    summary: 'Parent is worried about travel distance and workshop safety before enrolling in Electrician training.',
    district: 'Gadchiroli',
    state: 'Maharashtra',
    trade: 'Electrician'
  },
  {
    id: 'seed-2',
    phone: '9123456780',
    time: 'Morning',
    status: 'claimed',
    timestamp: '2026-10-04T15:30:00.000Z',
    priority: 'Medium',
    triggerReason: 'Cost question',
    summary: 'Learner asked for a clearer comparison between course cost and likely earnings in the COPA pathway.',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    trade: 'COPA'
  },
  {
    id: 'seed-3',
    phone: '9988776655',
    time: 'Afternoon',
    status: 'resolved',
    timestamp: '2026-10-03T11:15:00.000Z',
    priority: 'Low',
    triggerReason: 'Further education route',
    summary: 'Family wanted to understand diploma and lateral degree paths after a skills course.',
    district: 'Jaipur',
    state: 'Rajasthan',
    trade: 'Fitter'
  }
];

const CounsellorView: React.FC = () => {
  const [cases, setCases] = useState<EscalationCase[]>([]);

  useEffect(() => {
    const storedRaw = localStorage.getItem('escalations');
    const stored: EscalationCase[] = storedRaw ? JSON.parse(storedRaw) : [];
    const combined = stored.length > 0 ? stored : demoSeedCases;
    setCases([...combined].reverse());
    if (!storedRaw) {
      localStorage.setItem('escalations', JSON.stringify(demoSeedCases));
    }
  }, []);

  const updateCase = (id: string, updates: Partial<EscalationCase>) => {
    const updated = cases.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setCases(updated.reverse());
    localStorage.setItem('escalations', JSON.stringify(updated.reverse()));
  };

  const claimCase = (id: string) => updateCase(id, { status: 'claimed' });
  const closeCase = (id: string, status: 'resolved' | 'unreachable') => updateCase(id, { status });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '12px 16px', borderRadius: '10px', fontWeight: 700, marginBottom: '20px' }}>
        Demo data
      </div>
      <h1 style={{ marginBottom: '24px' }}>Staff View: Callback Queue</h1>

      {cases.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No requests in the queue.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cases.map((caseItem) => (
            <div key={caseItem.id} style={{
              backgroundColor: 'var(--color-surface)',
              padding: '22px',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {caseItem.priority} priority
                  </div>
                  <h3 style={{ margin: '6px 0 0' }}>Phone: {caseItem.status === 'claimed' || caseItem.status === 'resolved' ? caseItem.phone : '**********'}</h3>
                </div>
                <span style={{
                  backgroundColor: caseItem.status === 'open' ? '#F0FDF4' : caseItem.status === 'claimed' ? '#FEF3C7' : caseItem.status === 'resolved' ? '#DBEAFE' : '#FEE2E2',
                  color: caseItem.status === 'open' ? '#065F46' : caseItem.status === 'claimed' ? '#92400E' : caseItem.status === 'resolved' ? '#1D4ED8' : '#991B1B',
                  padding: '6px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {caseItem.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                <div><strong>State:</strong> {caseItem.state || '—'}</div>
                <div><strong>District:</strong> {caseItem.district || '—'}</div>
                <div><strong>Trade:</strong> {caseItem.trade || '—'}</div>
                <div><strong>Time:</strong> {caseItem.time}</div>
              </div>

              <div>
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>Trigger reason</div>
                <div style={{ color: 'var(--color-text-muted)' }}>{caseItem.triggerReason}</div>
              </div>

              <div>
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>Case summary</div>
                <div style={{ color: 'var(--color-text-muted)' }}>{caseItem.summary}</div>
              </div>

              <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                Requested at: {new Date(caseItem.timestamp).toLocaleString()}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {caseItem.status === 'open' && (
                  <Button style={{ width: '120px', height: '40px', fontSize: '15px' }} onClick={() => claimCase(caseItem.id)}>
                    Claim case
                  </Button>
                )}
                {caseItem.status === 'claimed' && (
                  <>
                    <Button variant="secondary" style={{ width: '140px', height: '40px', fontSize: '15px' }} onClick={() => closeCase(caseItem.id, 'resolved')}>
                      Mark resolved
                    </Button>
                    <Button variant="danger" style={{ width: '150px', height: '40px', fontSize: '15px' }} onClick={() => closeCase(caseItem.id, 'unreachable')}>
                      Mark unreachable
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CounsellorView;
