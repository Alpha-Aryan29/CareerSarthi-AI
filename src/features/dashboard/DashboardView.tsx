import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Activity, ArrowRight, Bot, GaugeCircle, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { getConcernCounts, getDistrictInsightRows, getStatusCounts, readEscalations } from '../../lib/escalations';

const concernColors = ['#0F766E', '#1D4ED8', '#D97706', '#DC2626', '#6B7280'];

const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const cases = readEscalations();

  const statusCounts = getStatusCounts(cases);
  const districtInsights = getDistrictInsightRows(cases);
  const concernChartData = getConcernCounts(cases);

  const avgBefore = cases.length ? Number((cases.reduce((sum, item) => sum + item.sentimentBefore, 0) / cases.length).toFixed(1)) : 0;
  const avgAfter = cases.length ? Number((cases.reduce((sum, item) => sum + item.sentimentAfter, 0) / cases.length).toFixed(1)) : 0;
  const resolutionRate = cases.length ? Math.round((statusCounts.resolved / cases.length) * 100) : 0;
  const activeEscalations = statusCounts.open + statusCounts.claimed + statusCounts.inCall;

  const resistanceIndex = useMemo(() => {
    const highestDistrict = districtInsights.sort((a, b) => b.resistance - a.resistance)[0];
    return highestDistrict ? highestDistrict.resistance : 0;
  }, [districtInsights]);

  const gaugeStyle = {
    background: `conic-gradient(#0F766E 0 ${Math.min(100, resistanceIndex)}%, #E5E7EB ${Math.min(100, resistanceIndex)}% 100%)`,
  };

  const districtChartData = districtInsights.map((district) => ({
    district: district.district,
    resistance: district.resistance,
  }));

  const sentimentChartData = districtInsights.map((district) => ({
    district: district.district,
    before: district.avgBefore,
    after: district.avgAfter,
  }));

  const aiInsights = [
    {
      title: 'Safety watchlist',
      detail: 'Gadchiroli shows the highest resistance and the most safety-related concern. Focus on travel and workplace reassurance.',
      action: '/counsellor?district=Gadchiroli&concern=safety',
    },
    {
      title: 'Cost response',
      detail: 'Reinforce earnings baselines and affordability for families concerned about long-term return.',
      action: '/counsellor?concern=cost',
    },
    {
      title: 'High priority queue',
      detail: 'High priority escalations need prompt human follow-up within the next callback window.',
      action: '/counsellor?priority=high',
    },
  ];

  const kpis = [
    { label: 'Families Counselled', value: String(cases.length), icon: Users, accent: 'teal', action: '/counsellor?status=all' },
    { label: 'Active Escalations', value: String(activeEscalations), icon: Activity, accent: 'amber', action: '/counsellor?status=open' },
    { label: 'Avg Sentiment Before / After', value: `${avgBefore} / ${avgAfter}`, icon: TrendingUp, accent: 'blue', action: '/' },
    { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: ShieldCheck, accent: 'green', action: '/counsellor?status=resolved' },
    { label: 'Resistance Index', value: `${resistanceIndex}`, icon: GaugeCircle, accent: 'red', action: '/counsellor?district=Gadchiroli' },
  ];

  return (
    <div className="page-shell dashboard-shell">
      <div className="dashboard-heading">
        <div>
          <div className="eyebrow">Operations Overview</div>
          <h1>AI counselling platform</h1>
          <p>Escalations, family concerns, and counselling outcomes across the platform.</p>
        </div>
        <div className="trust-pill">AI-assisted, Human-supported</div>
      </div>

      <div className="kpi-grid dashboard-kpi-grid">
        {kpis.map(({ label, value, icon: Icon, accent, action }) => (
          <button key={label} type="button" className="metric-card" style={{ borderTop: `4px solid var(--${accent}-500)` }} onClick={() => navigate(action)}>
            <div className="metric-topline">
              <div className={`metric-icon ${accent}`}><Icon size={18} /></div>
              <span className="metric-label">{label}</span>
            </div>
            <div className="metric-value">{value}</div>
            <div className="metric-link">
              View details <ArrowRight size={16} />
            </div>
          </button>
        ))}
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Concerns by Category</h2>
          <button type="button" className="text-button" onClick={() => navigate('/counsellor?concern=safety')}>Safety concern</button>
        </div>

        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={concernChartData} margin={{ top: 10, right: 12, left: 0, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {concernChartData.map((entry, index) => (
                  <Cell key={entry.name} fill={concernColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>District Concern Grid</h2>
          <button type="button" className="text-button" onClick={() => navigate('/counsellor?status=open')}>Open cases</button>
        </div>

        <div className="district-concern-grid">
          {districtInsights.map((district) => (
            <button
              key={district.district}
              type="button"
              className="district-concern-card"
              onClick={() => navigate(`/counsellor?district=${encodeURIComponent(district.district)}`)}
            >
              <div className="district-concern-head">
                <div>
                  <strong>{district.district}</strong>
                  <span>{district.state}</span>
                </div>
                <span className={`table-tag ${district.resistance > 70 ? 'high' : district.resistance > 50 ? 'medium' : 'low'}`}>
                  {district.resistance > 70 ? 'High' : district.resistance > 50 ? 'Medium' : 'Low'}
                </span>
              </div>
              <div className="district-concern-primary">Primary concern: <strong>{district.dominantConcern}</strong></div>
              <div className="district-concern-metrics">
                <span><small>Cases</small><strong>{district.cases}</strong></span>
                <span><small>Before</small><strong>{district.avgBefore}</strong></span>
                <span><small>After</small><strong>{district.avgAfter}</strong></span>
                <span><small>Resistance</small><strong>{district.resistance}</strong></span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Resistance by District</h2>
          <button type="button" className="text-button" onClick={() => navigate('/counsellor?district=Gadchiroli')}>Gadchiroli view</button>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={districtChartData} margin={{ top: 10, right: 12, left: 0, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="district" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="resistance" fill="#0F766E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Resistance Index</h2>
          <button type="button" className="text-button" onClick={() => navigate('/counsellor?district=Gadchiroli')}>View cases</button>
        </div>
        <div className="gauge-wrap">
          <div className="gauge-ring" style={gaugeStyle}>
            <div className="gauge-inner">
              <div className="gauge-value">{resistanceIndex}</div>
              <div className="gauge-label">/100</div>
            </div>
          </div>
          <div className="gauge-copy">
            <strong>What this means</strong>
            <p>Higher scores show more family resistance due to cost, safety, income, or social trust concerns. The platform routes these families to a human counsellor for a faster callback.</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Recommendations</h2>
        </div>
        <div className="insight-stack">
          {aiInsights.map((insight) => (
            <button key={insight.title} type="button" className="insight-item" onClick={() => navigate(insight.action)}>
              <div className="insight-icon"><Bot size={16} /></div>
              <div>
                <div className="insight-title">{insight.title}</div>
                <div className="insight-detail">{insight.detail}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Sentiment Before vs After</h2>
          <button type="button" className="text-button" onClick={() => navigate('/counsellor?status=claimed')}>Track follow-up</button>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sentimentChartData} margin={{ top: 10, right: 12, left: 0, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="district" tickLine={false} axisLine={false} />
              <YAxis domain={[1, 5]} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="before" fill="#D6D3D1" radius={[8, 8, 0, 0]} />
              <Bar dataKey="after" fill="#15803D" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default DashboardView;
