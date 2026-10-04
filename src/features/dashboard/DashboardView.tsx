import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardData from '../../data/dashboard_demo.json';

const concernKeys = ['earning_potential', 'job_security', 'social_status', 'safety', 'cost'];

const resistanceWeights = {
  earning_potential: 0.2,
  job_security: 0.25,
  social_status: 0.15,
  safety: 0.3,
  cost: 0.1,
};

const demoRecords = [
  {
    state: 'Maharashtra',
    district: 'Mumbai',
    trade: 'Electrician',
    concerns: { earning_potential: 42, job_security: 28, social_status: 35, safety: 15, cost: 22 },
    before: 2.1,
    after: 3.8,
    escalations: 6,
  },
  {
    state: 'Maharashtra',
    district: 'Gadchiroli',
    trade: 'Electrician',
    concerns: { earning_potential: 38, job_security: 31, social_status: 40, safety: 48, cost: 18 },
    before: 1.8,
    after: 2.9,
    escalations: 9,
  },
  {
    state: 'Rajasthan',
    district: 'Jaipur',
    trade: 'COPA',
    concerns: { earning_potential: 35, job_security: 25, social_status: 30, safety: 18, cost: 24 },
    before: 2.3,
    after: 3.7,
    escalations: 5,
  },
  {
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    trade: 'Fitter',
    concerns: { earning_potential: 39, job_security: 27, social_status: 34, safety: 22, cost: 28 },
    before: 2.4,
    after: 3.5,
    escalations: 4,
  },
];

const DashboardView: React.FC = () => {
  const [selectedState, setSelectedState] = useState('All states');
  const [selectedDistrict, setSelectedDistrict] = useState('All districts');
  const [selectedTrade, setSelectedTrade] = useState('All trades');

  const states = ['All states', ...Array.from(new Set(demoRecords.map((record) => record.state)))];
  const districts = ['All districts', ...Array.from(new Set(demoRecords.filter((record) => selectedState === 'All states' || record.state === selectedState).map((record) => record.district)))];
  const trades = ['All trades', ...Array.from(new Set(demoRecords.map((record) => record.trade)))];

  const filteredRecords = useMemo(() => {
    return demoRecords.filter((record) => {
      const stateMatch = selectedState === 'All states' || record.state === selectedState;
      const districtMatch = selectedDistrict === 'All districts' || record.district === selectedDistrict;
      const tradeMatch = selectedTrade === 'All trades' || record.trade === selectedTrade;
      return stateMatch && districtMatch && tradeMatch;
    });
  }, [selectedState, selectedDistrict, selectedTrade]);

  const chartData = filteredRecords.length > 0 ? filteredRecords.map((record) => ({
    district: record.district,
    ...record.concerns,
  })) : dashboardData.concerns_by_district;

  const totalEscalations = filteredRecords.reduce((sum, record) => sum + record.escalations, 0);
  const avgBefore = filteredRecords.length > 0 ? filteredRecords.reduce((sum, record) => sum + record.before, 0) / filteredRecords.length : 0;
  const avgAfter = filteredRecords.length > 0 ? filteredRecords.reduce((sum, record) => sum + record.after, 0) / filteredRecords.length : 0;

  const highestConcern = useMemo(() => {
    if (filteredRecords.length === 0) return null;
    const districtTotals = filteredRecords.map((record) => ({
      district: record.district,
      total: Object.values(record.concerns).reduce((sum, value) => sum + value, 0),
      highestKey: Object.entries(record.concerns).sort((a, b) => b[1] - a[1])[0][0],
    }));
    return districtTotals.sort((a, b) => b.total - a.total)[0];
  }, [filteredRecords]);

  const resistanceIndex = useMemo(() => {
    if (filteredRecords.length === 0) return 0;
    const totals = filteredRecords.reduce((acc, record) => {
      concernKeys.forEach((key) => {
        acc[key] = (acc[key] || 0) + (record.concerns[key as keyof typeof record.concerns] || 0);
      });
      return acc;
    }, {} as Record<string, number>);

    const totalConcern = Object.values(totals).reduce((sum, val) => sum + val, 0) || 1;
    const weightedConcernShare = Object.entries(totals).reduce((sum, [key, value]) => sum + ((value / totalConcern) * (resistanceWeights[key as keyof typeof resistanceWeights] || 0)), 0);
    const negativeSentimentShare = (1 - (avgAfter / 5)) * 100;
    const escalationRate = (totalEscalations / Math.max(filteredRecords.length, 1)) * 10;
    return Math.min(100, Math.round((weightedConcernShare * 100) + negativeSentimentShare + escalationRate));
  }, [filteredRecords, totalEscalations, avgAfter]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '12px 16px', borderRadius: '10px', fontWeight: 700, marginBottom: '24px' }}>
        Demo data
      </div>

      <h1 style={{ marginBottom: '24px' }}>Admin Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>State</label>
          <select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict('All districts'); }} style={{ width: '100%', height: '46px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            {states.map((state) => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>District</label>
          <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} style={{ width: '100%', height: '46px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            {districts.map((district) => <option key={district} value={district}>{district}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Trade</label>
          <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} style={{ width: '100%', height: '46px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            {trades.map((trade) => <option key={trade} value={trade}>{trade}</option>)}
          </select>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          Not enough data for the selected filters.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Escalation count</div>
              <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>{totalEscalations}</div>
            </div>
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Avg before</div>
              <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>{avgBefore.toFixed(1)}</div>
            </div>
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Avg after</div>
              <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>{avgAfter.toFixed(1)}</div>
            </div>
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Resistance Index</div>
              <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>{resistanceIndex}</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
            <h2 style={{ marginBottom: '16px' }}>Concerns by Category</h2>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="district" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {concernKeys.map((key, index) => (
                    <Bar key={key} dataKey={key} name={key.replace('_', ' ')} fill={['#0F766E', '#B45309', '#1D4ED8', '#B91C1C', '#6B7280'][index]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <h2 style={{ marginBottom: '16px' }}>District concern grid</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {filteredRecords.map((record) => (
                  <div key={`${record.state}-${record.district}`} style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px', backgroundColor: '#F9FAFB' }}>
                    <div style={{ fontWeight: 700, marginBottom: '8px' }}>{record.district}</div>
                    {Object.entries(record.concerns).map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span>{key.replace('_', ' ')}</span>
                        <span style={{ color: '#0F172A', fontWeight: 600 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <h2 style={{ marginBottom: '16px' }}>Resistance Index formula</h2>
              <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                Weighted concern share + negative sentiment share + escalation rate, using weights: <strong>{JSON.stringify(resistanceWeights)}</strong>.
              </div>
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '10px' }}>
                <div style={{ fontWeight: 700, marginBottom: '8px' }}>Recommendations</div>
                {highestConcern ? (
                  <div>
                    Safety concerns are highest in <strong>{highestConcern.district}</strong>. Focus on safety messaging, travel support, and counselor follow-up.
                  </div>
                ) : (
                  <div>Not enough data.</div>
                )}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <h2 style={{ marginBottom: '24px' }}>Sentiment before vs after</h2>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredRecords.map((record) => ({ district: record.district, before: record.before, after: record.after }))} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="district" />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="before" name="Before" fill="#D6D3D1" />
                  <Bar dataKey="after" name="After" fill="#15803D" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardView;
