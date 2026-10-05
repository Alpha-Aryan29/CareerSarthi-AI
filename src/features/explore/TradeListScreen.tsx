import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import tradesData from '../../data/trades.json';
import outcomeRecordsData from '../../data/outcome_records.json';
import locationsData from '../../data/locations.json';
import type { OutcomeRecord, PathwayStep, Trade } from '../../types';
import pathwayStepsData from '../../data/pathway_steps.json';
import {
  Activity,
  BriefcaseBusiness,
  Calculator,
  ChevronRight,
  Cpu,
  GitCompare,
  GraduationCap,
  HeartPulse,
  Search,
  Wrench,
  Zap,
} from 'lucide-react';

const SECTOR_STYLES = {
  Electrical: { icon: Zap, tone: 'electrical', label: 'sector_electrical' },
  Mechanical: { icon: Wrench, tone: 'mechanical', label: 'sector_mechanical' },
  IT: { icon: Cpu, tone: 'technology', label: 'sector_it' },
  Healthcare: { icon: HeartPulse, tone: 'healthcare', label: 'sector_healthcare' },
  Construction: { icon: Wrench, tone: 'construction', label: 'sector_construction' },
} as const;

const getOutcome = (tradeId: string, locationId: string | null): OutcomeRecord | undefined => {
  if (!locationId) return undefined;
  const direct = outcomeRecordsData.find(
    (item) => item.trade_id === tradeId && item.location_id === locationId && item.scope !== 'provider'
  );
  if (direct) return direct as OutcomeRecord;

  const district = locationsData.find((item) => item.id === locationId);
  return district?.parent_id
    ? outcomeRecordsData.find(
        (item) => item.trade_id === tradeId && item.location_id === district.parent_id && item.scope === 'state'
      ) as OutcomeRecord | undefined
    : undefined;
};

const formatINR = (value: number | null | undefined) =>
  value == null ? '—' : `₹${value.toLocaleString('en-IN')}`;

const TradeListScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { locationDistrictId, setLocation } = useSession();
  const trades = tradesData as Trade[];
  const sectors = ['All Sectors', ...Array.from(new Set(trades.map((trade) => trade.sector)))];
  const districts = locationsData.filter((item) => item.level === 'district');
  const activeLocation = locationDistrictId || 'loc-mh-mumbai';
  const maxLocalSalary = Math.max(
    1,
    ...trades.map((trade) => getOutcome(trade.id, activeLocation)?.earnings_p75_inr || 0)
  );
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All Sectors');

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(lang === 'hi' ? 'hi-IN' : 'en-IN');
    return trades.filter((trade) => {
      const name = lang === 'hi' ? trade.name_hi : trade.name_en;
      const description = lang === 'hi' ? trade.description_hi : trade.description_en;
      return (
        trade.is_active &&
        (sector === 'All Sectors' || trade.sector === sector) &&
        (!query || name.toLocaleLowerCase().includes(query) || description.toLocaleLowerCase().includes(query))
      );
    });
  }, [lang, search, sector, trades]);

  return (
    <div className="page-shell explore-shell screen-padding">
      <header className="explore-heading">
        <div>
          <div className="eyebrow">{t('home_eyebrow')}</div>
          <h1>{t('explore_title')}</h1>
          <p>{t('home_recommendations_desc')}</p>
        </div>
        <div className="explore-heading-mark"><BriefcaseBusiness size={24} /></div>
      </header>

      <label className="explore-city-selector">
        <span>{t('explore_city_label')}</span>
        <select
          value={activeLocation}
          onChange={(event) => {
            const district = districts.find((item) => item.id === event.target.value);
            if (district?.parent_id) setLocation(district.parent_id, district.id);
          }}
        >
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {lang === 'hi' ? district.name_hi : district.name_en}
            </option>
          ))}
        </select>
      </label>

      <div className="explore-tools">
        <label className="explore-search">
          <Search size={19} aria-hidden="true" />
          <span className="visually-hidden">{t('explore_search')}</span>
          <input
            type="search"
            placeholder={t('explore_search')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label={t('explore_clear_search')}>×</button>
          )}
        </label>

        <div className="explore-quick-actions">
          <button type="button" onClick={() => navigate('/compare-trades')}>
            <GitCompare size={17} /> {t('explore_compare')}
          </button>
          <button type="button" onClick={() => navigate('/earnings-calculator')}>
            <Calculator size={17} /> {t('explore_calculator')}
          </button>
        </div>
      </div>

      <div className="explore-filter-row">
        <div className="explore-filter-label">{t('explore_all_sectors')}</div>
        <div className="explore-sector-filters" role="group" aria-label={t('explore_all_sectors')}>
          {sectors.map((item) => {
            const style = SECTOR_STYLES[item as keyof typeof SECTOR_STYLES];
            return (
              <button
                type="button"
                key={item}
                className={`explore-filter-chip ${style?.tone || ''} ${sector === item ? 'active' : ''}`}
                aria-pressed={sector === item}
                onClick={() => setSector(item)}
              >
                {style && <style.icon size={15} />}
                {style ? t(style.label) : t('explore_all_sectors')}
              </button>
            );
          })}
        </div>
      </div>

      <div className="explore-results-heading">
        <span>{t('explore_results_count').replace('{count}', String(filtered.length))}</span>
        <span className="explore-location-indicator">
          <Activity size={15} />
          {lang === 'hi'
            ? districts.find((item) => item.id === activeLocation)?.name_hi
            : districts.find((item) => item.id === activeLocation)?.name_en}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="explore-empty-state">
          <Search size={25} />
          <strong>{t('explore_no_results')}</strong>
          <button type="button" className="secondary-button" onClick={() => { setSearch(''); setSector('All Sectors'); }}>
            {t('explore_clear_filters')}
          </button>
        </div>
      ) : (
        <div className="explore-career-grid">
          {filtered.map((trade) => {
            const style = SECTOR_STYLES[trade.sector as keyof typeof SECTOR_STYLES] || { icon: GraduationCap, tone: 'technology', label: '' as const };
            const Icon = style.icon;
            const outcome = getOutcome(trade.id, activeLocation);
            const pathwaySteps = pathwayStepsData.filter((step) => step.trade_id === trade.id) as PathwayStep[];

            return (
              <article className={`explore-career-card ${style.tone}`} key={trade.id}>
                <button
                  type="button"
                  className="explore-career-main"
                  onClick={() => navigate(`/trade/${trade.id}`)}
                  aria-label={`${lang === 'hi' ? trade.name_hi : trade.name_en}: ${t('explore_pathway')}`}
                >
                  <div className={`explore-career-icon ${style.tone}`}><Icon size={22} /></div>
                  <span className="explore-sector-label">{style.label ? t(style.label) : trade.sector}</span>
                  <h2>{lang === 'hi' ? trade.name_hi : trade.name_en}</h2>
                  <p>{lang === 'hi' ? trade.description_hi : trade.description_en}</p>
                  <div className="explore-entry-level">
                    <GraduationCap size={16} />
                    {t('explore_entry_level')}: NSQF {trade.entry_nsqf_level}
                  </div>
                  <div className="explore-career-ladder" aria-label={`${t('explore_pathway')}: ${pathwaySteps.map((step) => `NSQF ${step.nsqf_level}`).join(' → ') || `NSQF ${trade.entry_nsqf_level}`}`}>
                    {pathwaySteps.length
                      ? pathwaySteps.map((step, index) => (
                        <span key={step.id} className={index === 0 ? 'current' : ''}>NSQF {step.nsqf_level}</span>
                      ))
                      : <span className="current">NSQF {trade.entry_nsqf_level}</span>}
                  </div>
                  <div className="explore-card-metrics">
                    <div>
                      <span>{t('explore_salary_range')}</span>
                      <strong>{outcome ? `${formatINR(outcome.earnings_p25_inr)}–${formatINR(outcome.earnings_p75_inr)}` : '—'}</strong>
                      <span className="explore-salary-track" aria-hidden="true">
                        {outcome?.earnings_p25_inr != null && outcome.earnings_p75_inr != null && (
                          <i style={{
                            left: `${(outcome.earnings_p25_inr / maxLocalSalary) * 100}%`,
                            width: `${Math.max(2, ((outcome.earnings_p75_inr - outcome.earnings_p25_inr) / maxLocalSalary) * 100)}%`,
                          }} />
                        )}
                      </span>
                    </div>
                    <div>
                      <span>{t('explore_placement')}</span>
                      <strong>{outcome?.placement_rate_pct == null ? '—' : `${outcome.placement_rate_pct}%`}</strong>
                    </div>
                    <div className="explore-source-label">
                      {outcome
                        ? `${t('card_source')}: ${outcome.source_name} · ${outcome.source_year}`
                        : t('explore_no_local_source')}
                    </div>
                  </div>
                  <div className="explore-pilot-label">{t('explore_pilot_note')}</div>
                </button>
                <button
                  type="button"
                  className="explore-card-link"
                  onClick={() => navigate(`/trade/${trade.id}`)}
                >
                  {t('explore_pathway')} <ChevronRight size={17} />
                </button>
              </article>
            );
          })}
        </div>
      )}

      <section className="explore-skills-note">
        <GraduationCap size={20} />
        <span>{t('explore_skills_note')}</span>
      </section>
    </div>
  );
};

export default TradeListScreen;
