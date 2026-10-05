import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Headphones, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import Button from '../../components/ui/Button';
import ListenButton from '../../components/ui/ListenButton';
import concernData from '../../data/concern_categories.json';
import locationsData from '../../data/locations.json';
import tradesData from '../../data/trades.json';
import type { ConcernType } from '../../lib/escalations';
import { createEscalation, readEscalations, type EscalationCase } from '../../lib/escalations';
import type { Trade } from '../../types';

const CONCERN_VALUES: Record<string, ConcernType> = {
  earning_potential: 'earning potential',
  job_security: 'job security',
  social_status: 'social status',
  growth_further_education: 'growth/further education',
  safety: 'safety',
  distance_travel: 'distance/travel',
  cost: 'cost',
  only_for_failures: 'only for failures',
  other: 'other',
};

const EscalationScreen: React.FC = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { lang, t } = useLanguage();
  const { locationStateId, locationDistrictId, learnerInterestIds, parentConcernIds } = useSession();
  const states = locationsData.filter((location) => location.level === 'state');
  const selectedDistrict = locationsData.find((location) => location.id === locationDistrictId);
  const trades = tradesData as Trade[];
  const prefill = routeLocation.state as { concern?: string; tradeId?: string; districtId?: string; sessionId?: string; summary?: string } | null;
  const requestedDistrict = locationsData.find((item) => item.id === prefill?.districtId);
  const requestedConcern = Object.entries(CONCERN_VALUES).find(([, value]) => value === prefill?.concern)?.[0] || prefill?.concern;
  const requestedCaseId = new URLSearchParams(routeLocation.search).get('case');
  const updatedCase = requestedCaseId ? readEscalations().find((item) => item.id === requestedCaseId) || null : null;
  const caseStatusLabelKeys: Record<EscalationCase['status'], Parameters<typeof t>[0]> = {
    open: 'case_status_open',
    claimed: 'case_status_claimed',
    scheduled: 'case_status_scheduled',
    in_call: 'case_status_in_call',
    resolved: 'case_status_resolved',
    unreachable: 'case_status_unreachable',
  };
  const initialStateId = requestedDistrict?.parent_id || locationStateId || selectedDistrict?.parent_id || 'loc-mh';
  const initialDistrictId =
    requestedDistrict?.id || locationDistrictId || locationsData.find((location) => location.parent_id === initialStateId)?.id || '';
  const initialTrade = trades.find((trade) => {
    const interestsByTrade: Record<string, string[]> = {
      'trade-001': ['electrical'],
      'trade-002': ['mechanical'],
      'trade-003': ['computers'],
      'trade-004': ['healthcare'],
    };
    return learnerInterestIds.some((interest) => interestsByTrade[trade.id]?.includes(interest));
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [stateId, setStateId] = useState(initialStateId);
  const [districtId, setDistrictId] = useState(initialDistrictId);
  const [tradeId, setTradeId] = useState(prefill?.tradeId || initialTrade?.id || trades[0]?.id || '');
  const [concern, setConcern] = useState(
    requestedConcern || Object.keys(CONCERN_VALUES).find((code) => parentConcernIds.includes(code)) || 'safety'
  );
  const [time, setTime] = useState('Evening');
  const [formError, setFormError] = useState('');
  const [request, setRequest] = useState<EscalationCase | null>(null);

  const selectedState = states.find((item) => item.id === stateId) || states[0];
  const districts = locationsData.filter((item) => item.level === 'district' && item.parent_id === selectedState?.id);
  const selectedDistrictId = districts.some((item) => item.id === districtId) ? districtId : districts[0]?.id || '';
  const selectedTrade = trades.find((trade) => trade.id === tradeId) || trades[0];
  const concernLabel = concernData.find((item) => item.code === concern);
  const concernValue = CONCERN_VALUES[concern] || 'safety';

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedPhone = phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      setFormError(t('callback_invalid_phone'));
      return;
    }
    try {
      const createdRequest = createEscalation({
        name,
        phone: normalizedPhone,
        state: selectedState?.name_en || 'Maharashtra',
        district: districts.find((item) => item.id === selectedDistrictId)?.name_en || 'Mumbai',
        trade: selectedTrade?.name_en || 'Electrician',
        concern: concernValue,
        time,
        sessionId: prefill?.sessionId,
        triggerReason: `${concernValue.charAt(0).toUpperCase()}${concernValue.slice(1)} concern`,
        summary: prefill?.summary || t('callback_request_summary')
          .replace('{name}', name || (lang === 'hi' ? 'परिवार के सदस्य' : 'Family member'))
          .replace('{trade}', selectedTrade ? (lang === 'hi' ? selectedTrade.name_hi : selectedTrade.name_en) : '')
          .replace('{concern}', concernLabel ? (lang === 'hi' ? concernLabel.label_hi : concernLabel.label_en) : concernValue),
        priority: concernValue === 'safety' || concernValue === 'earning potential' ? 'High' : 'Medium',
      });
      setRequest(createdRequest);
      setFormError('');
    } catch (error) {
      console.error('Unable to save callback request', error);
      setFormError(t('callback_save_error'));
    }
  };

  if (request || updatedCase) {
    const displayedCase = request || updatedCase!;
    const statusIndex = displayedCase.status === 'resolved'
      ? 3
      : displayedCase.status === 'scheduled' || displayedCase.status === 'in_call'
        ? 2
        : displayedCase.status === 'claimed' || displayedCase.status === 'unreachable'
          ? 1
          : 0;
    const requestStages = [
      { label: t('callback_status_open'), complete: statusIndex >= 0 },
      { label: t('callback_status_assigned'), complete: statusIndex >= 1 },
      { label: t('callback_status_scheduled'), complete: statusIndex >= 2 },
      { label: t('callback_status_completed'), complete: statusIndex >= 3 },
    ];

    return (
      <div className="escalation-confirmation screen-padding">
        <div className="escalation-confirmation-mark"><Check size={27} /></div>
        <div className="eyebrow">{t('callback_eyebrow')}</div>
        <h1>{updatedCase ? t(caseStatusLabelKeys[updatedCase.status]) : t('callback_request_received')}</h1>
        <p>{updatedCase ? t('callback_case_status_desc') : t('callback_next_steps')}</p>
        <div className="callback-status-flow" aria-label={t(caseStatusLabelKeys[displayedCase.status])}>
          {requestStages.map((stage, index) => (
            <div className={`callback-status-step ${stage.complete ? 'complete' : ''}`} key={stage.label}>
              <span>{stage.complete ? <Check size={15} /> : index + 1}</span>
              <strong>{stage.label}</strong>
            </div>
          ))}
        </div>
        <div className="escalation-request-summary">
          <ShieldCheck size={18} />
          <div>
            <strong>{t('callback_summary_title')}</strong>
            <p>{t('callback_reference')}: <strong>{displayedCase.id}</strong></p>
            <p>{displayedCase.summary}</p>
            <small>{t('callback_privacy_note')}</small>
          </div>
        </div>
        <Button onClick={() => navigate('/')}>{t('btn_back')}</Button>
      </div>
    );
  }

  return (
    <div className="page-shell escalation-shell screen-padding">
      <header className="escalation-heading">
        <div className="escalation-heading-icon"><Headphones size={23} /></div>
        <div>
          <div className="eyebrow">{t('callback_eyebrow')}</div>
          <h1>{t('escalation_title')}</h1>
          <p>{t('escalation_desc')}</p>
        </div>
      </header>

      <div className="escalation-intro">
        <div className="escalation-intro-mark"><ShieldCheck size={19} /></div>
        <div>
          <strong>{t('callback_summary_description')}</strong>
          <p>{t('callback_privacy_note')}</p>
        </div>
        <ListenButton text={t('escalation_desc')} />
      </div>

      <form className="escalation-form" onSubmit={handleSubmit}>
        <div className="escalation-form-heading">
          <div>
            <h2>{t('callback_title')}</h2>
            <p>{t('callback_summary_description')}</p>
          </div>
        </div>

        <div className="escalation-form-grid">
          <label>
            <span>{t('callback_name')}</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('callback_name')} autoComplete="name" />
          </label>
          <label>
            <span>{t('callback_phone')} *</span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => { setPhone(event.target.value); setFormError(''); }}
              placeholder={t('callback_phone_hint')}
              autoComplete="tel-national"
              inputMode="numeric"
              required
              aria-invalid={Boolean(formError)}
              aria-describedby={formError ? 'escalation-phone-error' : undefined}
            />
            {formError && <small className="form-error" id="escalation-phone-error">{formError}</small>}
          </label>
          <label>
            <span>{t('callback_state')}</span>
            <select value={selectedState?.id || ''} onChange={(event) => {
              const nextStateId = event.target.value;
              setStateId(nextStateId);
              const nextDistrict = locationsData.find((item) => item.level === 'district' && item.parent_id === nextStateId);
              setDistrictId(nextDistrict?.id || '');
            }}>
              {states.map((item) => <option key={item.id} value={item.id}>{lang === 'hi' ? item.name_hi : item.name_en}</option>)}
            </select>
          </label>
          <label>
            <span>{t('callback_district')}</span>
            <select value={selectedDistrictId} onChange={(event) => setDistrictId(event.target.value)}>
              {districts.map((item) => <option key={item.id} value={item.id}>{lang === 'hi' ? item.name_hi : item.name_en}</option>)}
            </select>
          </label>
          <label>
            <span>{t('callback_trade')}</span>
            <select value={selectedTrade?.id || ''} onChange={(event) => setTradeId(event.target.value)}>
              {trades.map((trade) => <option key={trade.id} value={trade.id}>{lang === 'hi' ? trade.name_hi : trade.name_en}</option>)}
            </select>
          </label>
          <label>
            <span>{t('callback_concern')}</span>
            <select value={concern} onChange={(event) => setConcern(event.target.value)}>
              {concernData.filter((item) => CONCERN_VALUES[item.code]).map((item) => (
                <option key={item.code} value={item.code}>{lang === 'hi' ? item.label_hi : item.label_en}</option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="escalation-time-select">
          <legend>{t('callback_time')}</legend>
          <div>
            {[
              { value: 'Morning', label: t('escalation_morning') },
              { value: 'Afternoon', label: t('escalation_afternoon') },
              { value: 'Evening', label: t('escalation_evening') },
            ].map((slot) => (
              <button
                key={slot.value}
                type="button"
                onClick={() => setTime(slot.value)}
                className={time === slot.value ? 'active' : ''}
                aria-pressed={time === slot.value}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="escalation-summary-preview">
          <div className="eyebrow">{t('callback_summary_title')}</div>
          <p>{selectedTrade ? (lang === 'hi' ? selectedTrade.name_hi : selectedTrade.name_en) : ''} · {concernLabel ? (lang === 'hi' ? concernLabel.label_hi : concernLabel.label_en) : ''} · {lang === 'hi' ? districts.find((item) => item.id === selectedDistrictId)?.name_hi : districts.find((item) => item.id === selectedDistrictId)?.name_en}</p>
        </div>

        <Button type="submit" disabled={!phone.trim()}>
          {t('callback_submit')} <ArrowRight size={18} />
        </Button>
      </form>
    </div>
  );
};

export default EscalationScreen;
