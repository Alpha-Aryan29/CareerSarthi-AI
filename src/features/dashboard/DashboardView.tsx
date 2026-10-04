import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardData from '../../data/dashboard_demo.json';
import { useLanguage } from '../../hooks/useLanguage';

const DashboardView: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ 
        backgroundColor: '#FEF3C7', 
        color: 'var(--color-warning)', 
        padding: '12px', 
        borderRadius: '8px', 
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: '32px'
      }}>
        {t('dashboard_demo_banner')}
      </div>

      <h1 style={{ marginBottom: '32px' }}>Admin Dashboard</h1>

      <div style={{ 
        backgroundColor: 'var(--color-surface)', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid var(--color-border)',
        marginBottom: '32px'
      }}>
        <h2 style={{ marginBottom: '24px' }}>Concerns by District</h2>
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.concerns_by_district} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="district" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="earning_potential" name="Earning Potential" fill="#0F766E" />
              <Bar dataKey="job_security" name="Job Security" fill="#B45309" />
              <Bar dataKey="social_status" name="Social Status" fill="#1D4ED8" />
              <Bar dataKey="safety" name="Safety" fill="#B91C1C" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'var(--color-surface)', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid var(--color-border)' 
      }}>
        <h2 style={{ marginBottom: '24px' }}>Sentiment Shift (Before vs After)</h2>
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.sentiment_before_after} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="district" />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="before" name="Before Session" fill="#D6D3D1" />
              <Bar dataKey="after" name="After Session" fill="#15803D" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
