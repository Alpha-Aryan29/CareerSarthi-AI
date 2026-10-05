import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCheck, CircleAlert, HeadphonesIcon, UserRound } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useLanguage } from '../../hooks/useLanguage';
import concernData from '../../data/concern_categories.json';
import { concernOptions, getCaseFilters, getStatusCounts, readCounsellingSessions, readEscalations, writeCounsellingSession, writeEscalations, type EscalationCase } from '../../lib/escalations';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'high', label: 'High Priority' },
  { key: 'claimed', label: 'Claimed' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'unreachable', label: 'Unreachable' },
];

const concernCodeByValue: Record<string, string> = {
  'earning potential': 'earning_potential',
  'job security': 'job_security',
  'social status': 'social_status',
  'growth/further education': 'growth_further_education',
  'distance/travel': 'distance_travel',
  'only for failures': 'only_for_failures',
};

const CounsellorView: React.FC = () => {
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cases, setCases] = useState<EscalationCase[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    district: 'all',
    trade: 'all',
    concern: 'all',
    caseId: '',
  });

  useEffect(() => {
    const nextCases = readEscalations();
    setCases(nextCases);
  }, []);

  useEffect(() => {
    const nextFilters = {
      status: searchParams.get('status') || 'all',
      priority: searchParams.get('priority')
        ? `${searchParams.get('priority')!.charAt(0).toUpperCase()}${searchParams.get('priority')!.slice(1).toLowerCase()}`
        : 'all',
      district: searchParams.get('district') || 'all',
      trade: searchParams.get('trade') || 'all',
      concern: searchParams.get('concern') || 'all',
      caseId: searchParams.get('case') || '',
    };

    setFilters(nextFilters);

    if (searchParams.get('priority')?.toLowerCase() === 'high') {
      setActiveTab('high');
    } else if (searchParams.get('status')) {
      setActiveTab(searchParams.get('status') || 'all');
    } else {
      setActiveTab('all');
    }
  }, [searchParams]);

  const statusCounts = getStatusCounts(cases);
  const visibleCases = useMemo(() => getCaseFilters(cases, filters), [cases, filters]);

  const updateCase = (id: string, updates: Partial<EscalationCase>) => {
    const now = new Date().toISOString();
    const current = cases.find((item) => item.id === id);
    const next = cases.map((item) => (item.id === id ? {
      ...item,
      ...updates,
      updatedAt: now,
      ...(updates.status === 'claimed' ? { claimedAt: now } : {}),
    } : item));
    setCases(next);
    writeEscalations(next);
    if (current) {
      const linkedSession = readCounsellingSessions().find((session) => session.id === (current.sessionId || current.id));
      writeCounsellingSession({
        id: current.sessionId || current.id,
        concern: current.concern,
        trade: current.trade,
        district: current.district,
        sentimentBefore: linkedSession ? linkedSession.sentimentBefore : current.sentimentBefore,
        sentimentAfter: linkedSession ? linkedSession.sentimentAfter : current.sentimentAfter,
        escalated: true,
        resolved: (updates.status || current.status) === 'resolved',
        createdAt: current.timestamp,
        demo: false,
      });
    }
  };

  const sankey = [
    { label: 'Open Cases', value: statusCounts.open, icon: HeadphonesIcon },
    { label: 'High Priority', value: statusCounts.highPriority, icon: CircleAlert },
    { label: 'Claimed', value: statusCounts.claimed, icon: UserRound },
    { label: 'Scheduled Callbacks', value: statusCounts.scheduled, icon: HeadphonesIcon },
    { label: 'Resolved', value: statusCounts.resolved, icon: CheckCheck },
  ];

  const applyFilter = (field: string, value: string) => {
    const next = { ...filters, [field]: value };
    setFilters(next);

    const params = new URLSearchParams();
    if (next.status && next.status !== 'all') params.set('status', next.status);
    if (next.priority && next.priority !== 'all') params.set('priority', next.priority);
    if (next.district && next.district !== 'all') params.set('district', next.district);
    if (next.trade && next.trade !== 'all') params.set('trade', next.trade);
    if (next.concern && next.concern !== 'all') params.set('concern', next.concern);
    setSearchParams(params);
  };

  const clearFilters = () => {
    const defaults = { status: 'all', priority: 'all', district: 'all', trade: 'all', concern: 'all', caseId: '' };
    setFilters(defaults);
    setSearchParams({});
  };

  return (
    <div className="page-shell counsellor-shell">
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Counsellor workspace</div>
          <h1>Case queue</h1>
        </div>
        <div className="trust-pill">Sourced information + human guidance</div>
      </div>

      <div className="kpi-grid compact-grid">
        {sankey.map(({ label, value, icon: Icon }) => (
          <div key={label} className="metric-card mini-card">
            <div className="metric-topline">
              <div className="metric-icon teal"><Icon size={18} /></div>
              <span className="metric-label">{label}</span>
            </div>
            <div className="metric-value">{value}</div>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Case filters</h2>
          <button type="button" className="text-button" onClick={clearFilters}>Reset</button>
        </div>

        <div className="filter-grid">
          <select value={filters.priority} onChange={(e) => applyFilter('priority', e.target.value)}>
            <option value="all">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select value={filters.district} onChange={(e) => applyFilter('district', e.target.value)}>
            <option value="all">All districts</option>
            {[...new Set(cases.map((item) => item.district))].sort().map((district) => <option key={district}>{district}</option>)}
          </select>
          <select value={filters.trade} onChange={(e) => applyFilter('trade', e.target.value)}>
            <option value="all">All trades</option>
            {[...new Set(cases.map((item) => item.trade))].sort().map((trade) => <option key={trade}>{trade}</option>)}
          </select>
          <select value={filters.concern} onChange={(e) => applyFilter('concern', e.target.value)}>
            <option value="all">All concerns</option>
            {concernOptions.map((concern) => {
              const code = concernCodeByValue[concern] || concern;
              const label = concernData.find((item) => item.code === code);
              return <option key={concern} value={concern}>{label ? (lang === 'hi' ? label.label_hi : label.label_en) : concern}</option>;
            })}
          </select>
          <select value={filters.status} onChange={(e) => applyFilter('status', e.target.value)}>
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="claimed">Claimed</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_call">In Call</option>
            <option value="resolved">Resolved</option>
            <option value="unreachable">Unreachable</option>
          </select>
        </div>

        <div className="tab-row">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                className={`tab-button ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key === 'all') {
                    setFilters((prev) => ({ ...prev, status: 'all', priority: 'all', caseId: '' }));
                    setSearchParams({});
                    return;
                  }

                  if (tab.key === 'high') {
                    applyFilter('priority', 'High');
                    return;
                  }

                  applyFilter('status', tab.key);
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="case-list">
        {visibleCases.length === 0 ? (
          <div className="empty-state">No matching cases for this filter set.</div>
        ) : (
          visibleCases.map((caseItem) => (
            <article key={caseItem.id} className="case-card">
              <div className="case-top-row">
                <div>
                  <div className="case-priority">{caseItem.priority} priority</div>
                  <h3>{caseItem.name ? caseItem.name : 'Family callback'} <span>• {caseItem.claimedAt || ['claimed', 'scheduled', 'in_call', 'resolved'].includes(caseItem.status) ? caseItem.phone : 'Phone visible after case is claimed'}</span></h3>
                </div>
                <span className={`status-pill ${caseItem.status}`}>{caseItem.status.replace('_', ' ')}</span>
              </div>

              <ol className="case-status-flow" aria-label="Callback status">
                {[
                  { status: 'open', label: 'Request received' },
                  { status: 'claimed', label: 'Assigned' },
                  { status: 'scheduled', label: 'Scheduled' },
                  { status: 'resolved', label: 'Completed' },
                ].map((stage, index) => {
                  const currentIndex = caseItem.status === 'in_call'
                    ? 2
                    : caseItem.status === 'unreachable'
                      ? 1
                      : ['open', 'claimed', 'scheduled', 'resolved'].indexOf(caseItem.status);

                  return (
                    <li className={index <= currentIndex ? 'complete' : ''} key={stage.status}>
                      <span>{index < currentIndex ? <CheckCheck size={13} /> : index + 1}</span>
                      <small>{stage.label}</small>
                    </li>
                  );
                })}
              </ol>

              <div className="case-meta-grid">
                <div><span>State</span><strong>{caseItem.state}</strong></div>
                <div><span>District</span><strong>{caseItem.district}</strong></div>
                <div><span>Trade</span><strong>{caseItem.trade}</strong></div>
                <div><span>Concern</span><strong>{caseItem.concern}</strong></div>
                <div><span>Callback time</span><strong>{caseItem.time}</strong></div>
                <div><span>Requested</span><strong>{new Date(caseItem.timestamp).toLocaleDateString()}</strong></div>
              </div>

              <div className="case-detail-box">
                <div className="case-detail-label">Trigger reason</div>
                <div>{caseItem.triggerReason}</div>
              </div>

              <div className="case-detail-box">
                <div className="case-detail-label">Summary</div>
                <div>{caseItem.summary}</div>
              </div>

              <div className="case-actions">
                {caseItem.status === 'open' && (
                  <Button fullWidth={false} onClick={() => updateCase(caseItem.id, { status: 'claimed' })}>Claim case</Button>
                )}
                {caseItem.status === 'claimed' && (
                  <>
                    <Button fullWidth={false} variant="secondary" onClick={() => updateCase(caseItem.id, { status: 'scheduled' })}>Schedule callback</Button>
                    <Button fullWidth={false} variant="secondary" onClick={() => updateCase(caseItem.id, { status: 'in_call' })}>Start call</Button>
                    <Button fullWidth={false} variant="secondary" onClick={() => updateCase(caseItem.id, { status: 'resolved' })}>Mark resolved</Button>
                    <Button fullWidth={false} variant="danger" onClick={() => updateCase(caseItem.id, { status: 'unreachable' })}>Mark unreachable</Button>
                  </>
                )}
                {caseItem.status === 'scheduled' && (
                  <>
                    <Button fullWidth={false} variant="secondary" onClick={() => updateCase(caseItem.id, { status: 'in_call' })}>Start scheduled call</Button>
                    <Button fullWidth={false} variant="danger" onClick={() => updateCase(caseItem.id, { status: 'unreachable' })}>Mark unreachable</Button>
                  </>
                )}
                {caseItem.status === 'in_call' && (
                  <>
                    <Button fullWidth={false} variant="secondary" onClick={() => updateCase(caseItem.id, { status: 'resolved' })}>Resolve</Button>
                    <Button fullWidth={false} variant="danger" onClick={() => updateCase(caseItem.id, { status: 'unreachable' })}>Unreachable</Button>
                  </>
                )}
                {(caseItem.status === 'resolved' || caseItem.status === 'unreachable') && (
                  <Button fullWidth={false} variant="secondary" onClick={() => updateCase(caseItem.id, { status: 'open' })}>Reopen</Button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default CounsellorView;
