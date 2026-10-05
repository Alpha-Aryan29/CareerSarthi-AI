import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Check,
  Compass,
  GraduationCap,
  Headphones,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import tradesData from '../../data/trades.json';
import outcomeRecordsData from '../../data/outcome_records.json';
import locationsData from '../../data/locations.json';
import concernData from '../../data/concern_categories.json';
import type { OutcomeRecord, Trade } from '../../types';

const INTEREST_TO_TRADE: Record<string, string[]> = {
  electrical: ['trade-001'],
  mechanical: ['trade-002'],
  computers: ['trade-003'],
  healthcare: ['trade-004'],
  beauty_wellness: [],
};

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const {
    learnerEducationId,
    learnerInterestIds,
    parentConcernIds,
    locationDistrictId,
  } = useSession();
  const isHindi = lang === 'hi';
  const trades = tradesData as Trade[];
  const concerns = concernData.filter((concern) => concern.code !== 'other');

  const learnerProfileComplete = Boolean(learnerEducationId && learnerInterestIds.length);
  const completedSteps = [learnerProfileComplete, Boolean(locationDistrictId), Boolean(parentConcernIds.length)].filter(Boolean).length;
  const progress = Math.round((completedSteps / 3) * 100);

  const recommendedTrades = useMemo(() => {
    const tradeIds = new Set(learnerInterestIds.flatMap((interest) => INTEREST_TO_TRADE[interest] || []));
    return trades.filter((trade) => tradeIds.has(trade.id) && trade.is_active);
  }, [learnerInterestIds, trades]);

  const outcomesByTrade = useMemo(() => {
    const location = locationsData.find((item) => item.id === locationDistrictId);
    return new Map<string, OutcomeRecord>(
      recommendedTrades.flatMap((trade) => {
        const localOutcome = locationDistrictId
          ? outcomeRecordsData.find(
              (item) =>
                item.trade_id === trade.id &&
                item.location_id === locationDistrictId &&
                item.scope !== 'provider'
            )
          : undefined;
        const fallbackOutcome = localOutcome || (location?.parent_id
          ? outcomeRecordsData.find(
              (item) =>
                item.trade_id === trade.id &&
                item.location_id === location.parent_id &&
                item.scope === 'state'
            )
          : undefined);

        return fallbackOutcome ? [[trade.id, fallbackOutcome as OutcomeRecord]] : [];
      })
    );
  }, [locationDistrictId, recommendedTrades]);

  const actions = [
    { number: '01', title: t('home_action_profile'), description: t('home_action_profile_desc'), href: '/language', icon: Users, accent: 'teal' },
    { number: '02', title: t('home_action_explore'), description: t('home_action_explore_desc'), href: '/explore', icon: Compass, accent: 'blue' },
    { number: '03', title: t('home_action_chat'), description: t('home_action_chat_desc'), href: '/chat', icon: Headphones, accent: 'amber' },
  ];

  const roadmap = [
    { label: t('home_roadmap_profile'), href: '/profile-learner', icon: Users, done: learnerProfileComplete },
    { label: t('home_roadmap_assessment'), href: '/profile-parent', icon: MessageCircle, done: parentConcernIds.length > 0 },
    { label: t('home_roadmap_guidance'), href: '/explore', icon: BookOpenCheck, done: false },
    { label: t('home_roadmap_compare'), href: '/compare-trades', icon: ChartNoAxesCombined, done: false },
    { label: t('home_roadmap_human'), href: '/escalation', icon: Headphones, done: false },
  ];

  return (
    <div className="page-shell family-home">
      <header className="home-welcome">
        <div className="home-welcome-copy">
          <div className="eyebrow">{t('home_eyebrow')}</div>
          <h1>{t('home_title')}</h1>
          <p>{t('home_description')}</p>
          <div className="home-trustline">
            <span><ShieldCheck size={15} /> {t('nav_sourced_guidance')}</span>
            <span><MapPin size={15} /> {locationDistrictId ? t('notification_city_ready') : t('explore_location_unset')}</span>
          </div>
        </div>
        <div className="home-welcome-art" aria-hidden="true">
          <div className="home-art-orbit" />
          <div className="home-art-path">
            <span className="home-art-person"><Users size={25} /></span>
            <span className="home-art-arrow"><ChartNoAxesCombined size={30} /></span>
          </div>
          <span className="home-art-spark home-art-spark-one" />
          <span className="home-art-spark home-art-spark-two" />
        </div>
        <button type="button" className="home-start-button" onClick={() => navigate('/language')}>
          {t('home_start')} <ArrowRight size={17} />
        </button>
      </header>

      <section className="home-progress-panel" aria-labelledby="home-progress-title">
        <div className="home-progress-copy">
          <div className="home-section-kicker">{t('home_progress')}</div>
          <h2 id="home-progress-title">{progress}%</h2>
          <p>{t('home_progress_desc')}</p>
        </div>
        <div className="home-progress-details">
          <div className="home-progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="home-progress-items">
            <button type="button" onClick={() => navigate('/profile-learner')} className={learnerProfileComplete ? 'complete' : ''}>
              <span>{learnerProfileComplete ? <Check size={14} /> : '1'}</span>{t('home_progress_profile')}
            </button>
            <button type="button" onClick={() => navigate('/location')} className={locationDistrictId ? 'complete' : ''}>
              <span>{locationDistrictId ? <Check size={14} /> : '2'}</span>{t('home_progress_location')}
            </button>
            <button type="button" onClick={() => navigate('/profile-parent')} className={parentConcernIds.length ? 'complete' : ''}>
              <span>{parentConcernIds.length ? <Check size={14} /> : '3'}</span>{t('home_progress_concerns')}
            </button>
          </div>
        </div>
      </section>

      <section className="home-content-section" aria-labelledby="home-recommendations-title">
        <div className="home-section-heading">
          <div>
            <div className="eyebrow">{t('explore_title')}</div>
            <h2 id="home-recommendations-title">{t('home_recommendations')}</h2>
            <p>{t('home_recommendations_desc')}</p>
          </div>
          <button type="button" className="text-button home-view-all" onClick={() => navigate('/explore')}>
            {t('explore_title')} <ArrowRight size={15} />
          </button>
        </div>

        {recommendedTrades.length === 0 ? (
          <div className="home-recommendation-empty">
            <GraduationCap size={24} />
            <p>{t('home_empty_recommendations')}</p>
            <button type="button" className="secondary-button" onClick={() => navigate('/profile-learner')}>
              {t('home_action_profile')} <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="home-career-grid">
            {recommendedTrades.slice(0, 3).map((trade) => {
              const outcome = outcomesByTrade.get(trade.id);
              return (
                <button
                  key={trade.id}
                  type="button"
                  className="home-career-card"
                  onClick={() => navigate(`/trade/${trade.id}`)}
                >
                  <div className="home-career-icon"><BriefcaseBusiness size={19} /></div>
                  <div className="home-career-title">
                    <span>{trade.sector}</span>
                    <strong>{isHindi ? trade.name_hi : trade.name_en}</strong>
                  </div>
                  <p>{isHindi ? trade.description_hi : trade.description_en}</p>
                  <div className="home-career-metrics">
                    <span>
                      <small>{t('explore_entry_level')}</small>
                      <strong>NSQF {trade.entry_nsqf_level}</strong>
                    </span>
                    {outcome ? (
                      <>
                        <span>
                          <small>{t('explore_salary_range')}</small>
                          <strong>₹{outcome.earnings_p25_inr?.toLocaleString('en-IN')}–₹{outcome.earnings_p75_inr?.toLocaleString('en-IN')}</strong>
                        </span>
                        <span>
                          <small>{t('explore_placement')}</small>
                          <strong>{outcome.placement_rate_pct}%</strong>
                        </span>
                      </>
                    ) : (
                      <span className="home-career-no-data">{t('explore_location_unset')}</span>
                    )}
                  </div>
                  <div className="home-career-link">{t('explore_pathway')} <ArrowRight size={15} /></div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="home-two-column">
        <section className="home-concerns-panel" aria-labelledby="home-concerns-title">
          <div className="home-section-kicker">{t('summary_parent_concerns')}</div>
          <h2 id="home-concerns-title">{t('home_concerns')}</h2>
          <p>{t('home_concerns_desc')}</p>
          <div className="home-concern-chips">
            {concerns.map((concern) => (
              <button
                type="button"
                key={concern.code}
                onClick={() => navigate('/chat', { state: { prompt: isHindi ? concern.label_hi : concern.label_en } })}
              >
                {isHindi ? concern.label_hi : concern.label_en}
              </button>
            ))}
          </div>
          <button type="button" className="text-button" onClick={() => navigate('/profile-parent')}>
            {t('home_action_profile')} <ArrowRight size={15} />
          </button>
        </section>

        <section className="home-roadmap-panel" aria-labelledby="home-roadmap-title">
          <div className="home-section-kicker">{t('home_roadmap')}</div>
          <h2 id="home-roadmap-title">{t('home_roadmap')}</h2>
          <p>{t('home_roadmap_desc')}</p>
          <ol className="home-roadmap-list">
            {roadmap.map(({ label, href, icon: Icon, done }, index) => (
              <li key={label}>
                <button type="button" onClick={() => navigate(href)}>
                  <span className={`home-roadmap-step ${done ? 'done' : ''}`}><Icon size={16} /></span>
                  <span>{label}</span>
                  <span className="home-roadmap-index">{done ? <Check size={15} /> : `0${index + 1}`}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="home-source-note">
        <ShieldCheck size={21} />
        <div>
          <strong>{t('home_sources_title')}</strong>
          <p>{t('home_sources_desc')}</p>
        </div>
      </section>

      <section className="home-help-row">
        <div className="home-help-mark"><Headphones size={19} /></div>
        <div>
          <strong>{t('chat_person_title')}</strong>
          <p>{t('chat_person_desc')}</p>
        </div>
        <button type="button" className="text-button" onClick={() => navigate('/escalation')}>
          {t('btn_talk_person')} <ArrowRight size={15} />
        </button>
      </section>

      <div className="home-quick-actions">
        {actions.map(({ number, title, description, href, icon: Icon, accent }) => (
          <button key={number} type="button" className="home-step" onClick={() => navigate(href)}>
            <div className="home-step-topline">
              <span className="home-step-number">{number}</span>
              <span className={`home-step-icon ${accent}`}><Icon size={19} /></span>
            </div>
            <strong>{title}</strong>
            <span className="home-step-description">{description}</span>
            <span className="home-step-link">{t('home_open')} <ArrowRight size={15} /></span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;
