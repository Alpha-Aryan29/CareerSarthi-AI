import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Activity, ArrowRight, Bot, GaugeCircle, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { getResistanceIndex, getSessionConcernCounts, getSessionDistrictInsights, getStatusCounts, readCounsellingSessions, readEscalations } from '../../lib/escalations';

const concernColors = [
  'var(--sector-leaf)',
  'var(--sector-sky)',
  'var(--sector-marigold)',
  'var(--sector-terracotta)',
  'var(--color-text-muted)',
];

const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const cases = readEscalations();
  const sessions = readCounsellingSessions();

  const statusCounts = getStatusCounts(cases);
  const districtInsights = getSessionDistrictInsights(sessions);
  const concernChartData = getSessionConcernCounts(sessions);

  const sentimentBefore = sessions.flatMap((item) => item.sentimentBefore === null ? [] : [item.sentimentBefore]);
  const sentimentAfter = sessions.flatMap((item) => item.sentimentAfter === null ? [] : [item.sentimentAfter]);
  const avgBefore = sentimentBefore.length ? Number((sentimentBefore.reduce((sum, value) => sum + value, 0) / sentimentBefore.length).toFixed(1)) : null;
  const avgAfter = sentimentAfter.length ? Number((sentimentAfter.reduce((sum, value) => sum + value, 0) / sentimentAfter.length).toFixed(1)) : null;
  const resolutionRate = sessions.length ? Math.round((sessions.filter((item) => item.resolved).length / sessions.length) * 100) : 0;
  const activeEscalations = statusCounts.open + statusCounts.claimed + statusCounts.scheduled + statusCounts.inCall;
  const resistanceIndex = getResistanceIndex(sessions);
  const primaryDistrict = [...districtInsights].sort((a, b) => b.cases - a.cases)[0];
  const primaryConcern = [...concernChartData].sort((a, b) => b.value - a.value)[0]?.name || 'other';
  const primaryTrade = [...new Set(sessions.map((session) => session.trade))]
    .map((trade) => ({ trade, count: sessions.filter((session) => session.trade === trade).length }))
    .sort((a, b) => b.count - a.count)[0]?.trade || 'Not selected';
  const filterParams = (extra: Record<string, string> = {}) => {
    const params = new URLSearchParams({
      district: primaryDistrict?.district || 'all',
      trade: primaryTrade,
      concern: primaryConcern,
      ...extra,
    });
    return `/counsellor?${params.toString()}`;
  };

  const demoData = sessions.some((session) => session.demo);

  const gaugeStyle = {
    background: `conic-gradient(var(--sector-leaf) 0 ${Math.min(100, resistanceIndex)}%, var(--color-border) ${Math.min(100, resistanceIndex)}% 100%)`,
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
      title: `${primaryConcern} · ${primaryDistrict?.district || 'All districts'}`,
      detail: `${sessions.filter((item) => item.concern === primaryConcern && item.district === primaryDistrict?.district).length} recorded sessions share this concern and district.`,
      action: filterParams(),
    },
    {
      title: `${primaryTrade} · ${primaryDistrict?.district || 'All districts'}`,
      detail: `Review the recorded counselling sessions for ${primaryTrade} in this district.`,
      action: filterParams(),
    },
    {
      title: 'Active human follow-up',
      detail: `${activeEscalations} escalation cases are not yet resolved or unreachable.`,
      action: filterParams({ status: 'open' }),
    },
  ];

  const kpis = [
    { label: 'Families Counselled', value: String(sessions.length), icon: Users, accent: 'teal', action: filterParams() },
    { label: 'Active Escalations', value: String(activeEscalations), icon: Activity, accent: 'amber', action: filterParams({ status: 'open' }) },
    { label: 'Avg Sentiment Before / After', value: `${avgBefore ?? '—'} / ${avgAfter ?? '—'}`, icon: TrendingUp, accent: 'blue', action: filterParams() },
    { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: ShieldCheck, accent: 'green', action: filterParams({ status: 'resolved' }) },
    { label: 'Resistance Index', value: `${resistanceIndex}`, icon: GaugeCircle, accent: 'red', action: filterParams() },
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
      {demoData && <div className="demo-data-label">{t('demo_data')}</div>}

      <div className="kpi-grid dashboard-kpi-grid">
        {kpis.map(({ label, value, icon: Icon, accent, action }) => (
          <button key={label} type="button" title={label === 'Resistance Index' ? t('dashboard_resistance_formula') : undefined} className="metric-card" style={{ borderTop: `4px solid var(--${accent}-500)` }} onClick={() => navigate(action)}>
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
          <button type="button" className="text-button" onClick={() => navigate(filterParams({ concern: 'safety' }))}>Safety concern</button>
        </div>

        {concernChartData.length ? <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={concernChartData} margin={{ top: 10, right: 12, left: 0, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
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
        </div> : <div className="dashboard-widget-empty">{t('dashboard_empty_widget')}</div>}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>District Concern Grid</h2>
          <button type="button" className="text-button" onClick={() => navigate(filterParams({ status: 'open' }))}>Open cases</button>
        </div>

        {districtInsights.length ? <div className="district-concern-grid">
          {districtInsights.map((district) => (
            <button
              key={district.district}
              type="button"
              className="district-concern-card"
              onClick={() => navigate(filterParams({ district: district.district, trade: district.dominantTrade, concern: district.dominantConcern }))}
            >
              <div className="district-concern-head">
                <div>
                  <strong>{district.district}</strong>
                  <span>{district.cases} sessions</span>
                </div>
                <span className={`table-tag ${district.resistance > 70 ? 'high' : district.resistance > 50 ? 'medium' : 'low'}`}>
                  {district.resistance > 70 ? 'High' : district.resistance > 50 ? 'Medium' : 'Low'}
                </span>
              </div>
              <div className="district-concern-primary">Primary concern: <strong>{district.dominantConcern}</strong></div>
              <div className="district-concern-metrics">
                <span><small>Cases</small><strong>{district.cases}</strong></span>
                <span><small>Before</small><strong>{district.avgBefore ?? '—'}</strong></span>
                <span><small>After</small><strong>{district.avgAfter ?? '—'}</strong></span>
                <span><small>Resistance</small><strong>{district.resistance}</strong></span>
              </div>
            </button>
          ))}
        </div> : <div className="dashboard-widget-empty">{t('dashboard_empty_widget')}</div>}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Resistance by District</h2>
          <button type="button" className="text-button" onClick={() => navigate(filterParams({ district: primaryDistrict?.district || 'all', trade: primaryDistrict?.dominantTrade || primaryTrade, concern: primaryDistrict?.dominantConcern || primaryConcern }))}>{primaryDistrict?.district || 'District view'}</button>
        </div>
        {districtChartData.length ? <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={districtChartData} margin={{ top: 10, right: 12, left: 0, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="district" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="resistance" radius={[8, 8, 0, 0]}>
                {districtChartData.map((entry) => (
                  <Cell key={entry.district} fill={entry.resistance > 70 ? 'var(--sector-terracotta)' : entry.resistance > 45 ? 'var(--sector-marigold)' : 'var(--sector-leaf)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div> : <div className="dashboard-widget-empty">{t('dashboard_empty_widget')}</div>}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Resistance Index</h2>
          <button type="button" title={t('dashboard_resistance_formula')} className="text-button" onClick={() => navigate(filterParams())}>View cases · formula ℹ</button>
        </div>
        {sessions.length ? (
          <div className="gauge-wrap">
            <div className="gauge-ring" style={gaugeStyle}>
              <div className="gauge-inner">
                <div className="gauge-value">{resistanceIndex}</div>
                <div className="gauge-label">/100</div>
              </div>
            </div>
            <div className="gauge-copy">
              <strong>What this means</strong>
              <p>Resistance combines escalation frequency and post-counselling sentiment. This is a demo indicator, not a validated prediction.</p>
            </div>
          </div>
        ) : <div className="dashboard-widget-empty">{t('dashboard_empty_widget')}</div>}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Recommendations</h2>
        </div>
        {sessions.length ? (
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
        ) : <div className="dashboard-widget-empty">{t('dashboard_empty_widget')}</div>}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Sentiment Before vs After</h2>
          <button type="button" className="text-button" onClick={() => navigate(filterParams({ status: 'claimed' }))}>Track follow-up</button>
        </div>
        {sentimentChartData.length ? <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sentimentChartData} margin={{ top: 10, right: 12, left: 0, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="district" tickLine={false} axisLine={false} />
              <YAxis domain={[1, 5]} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="before" fill="var(--sector-terracotta)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="after" fill="var(--sector-leaf)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div> : <div className="dashboard-widget-empty">{t('dashboard_empty_widget')}</div>}
      </section>
    </div>
  );
};

export default DashboardView;
