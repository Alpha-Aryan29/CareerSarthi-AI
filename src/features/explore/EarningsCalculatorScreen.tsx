import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import tradesData from '../../data/trades.json';
import outcomeRecordsData from '../../data/outcome_records.json';
import locationsData from '../../data/locations.json';
import type { OutcomeRecord, Trade } from '../../types';

const getOutcomeForTradeAndLocation = (tradeId: string, locationId: string): OutcomeRecord | undefined => {
  const districtRecord = outcomeRecordsData.find(
    (record) => record.trade_id === tradeId && record.location_id === locationId && record.scope !== 'provider'
  );

  if (districtRecord) return districtRecord as OutcomeRecord;

  const location = locationsData.find((item) => item.id === locationId);
  const parentStateId = location?.parent_id ?? null;

  if (parentStateId) {
    return outcomeRecordsData.find(
      (record) => record.trade_id === tradeId && record.location_id === parentStateId && record.scope === 'state'
    ) as OutcomeRecord | undefined;
  }

  return undefined;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const EarningsCalculatorScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { locationDistrictId } = useSession();
  const trades = tradesData as Trade[];
  const activeLocation = locationDistrictId || 'loc-mh-mumbai';

  const [selectedTradeId, setSelectedTradeId] = useState<string>(trades[0]?.id ?? '');
  const [courseCost, setCourseCost] = useState<number>(20000);
  const [durationMonths, setDurationMonths] = useState<number>(24);
  const [startingPay, setStartingPay] = useState<number>(15000);

  const selectedTrade = useMemo(
    () => trades.find((trade) => trade.id === selectedTradeId) ?? trades[0],
    [selectedTradeId, trades]
  );

  const selectedOutcome = selectedTrade ? getOutcomeForTradeAndLocation(selectedTrade.id, activeLocation) : undefined;

  React.useEffect(() => {
    if (selectedOutcome?.earnings_median_inr) {
      setStartingPay(selectedOutcome.earnings_median_inr);
      setCourseCost(Math.max(5000, selectedOutcome.earnings_median_inr * 1.2));
    }
  }, [selectedOutcome]);

  const vocationalNet = Math.max(0, startingPay * 12 * 3 - courseCost);
  const generalStudyNet = 180000 * 3;
  const difference = vocationalNet - generalStudyNet;

  return (
    <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button type="button" onClick={() => navigate(-1)} style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: '999px', padding: '8px 12px', cursor: 'pointer' }}>
          ← {t('btn_back')}
        </button>
      </div>

      <h1 style={{ margin: 0 }}>{t('calc_title')}</h1>

      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '16px' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>{t('calc_trade_label')}</label>
        <select value={selectedTradeId} onChange={(e) => setSelectedTradeId(e.target.value)} style={{ width: '100%', height: '48px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          {trades.map((trade) => (
            <option key={trade.id} value={trade.id}>{lang === 'hi' ? trade.name_hi : trade.name_en}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>{t('calc_course_cost_input')}</label>
          <input type="number" value={courseCost} onChange={(e) => setCourseCost(Number(e.target.value) || 0)} style={{ width: '100%', height: '48px', borderRadius: '8px', border: '1px solid var(--color-border)', padding: '0 12px' }} />
        </div>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>{t('calc_duration_input')}</label>
          <input type="number" value={durationMonths} onChange={(e) => setDurationMonths(Number(e.target.value) || 0)} style={{ width: '100%', height: '48px', borderRadius: '8px', border: '1px solid var(--color-border)', padding: '0 12px' }} />
        </div>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>{t('calc_starting_pay_annual')}</label>
          <input type="number" value={startingPay} onChange={(e) => setStartingPay(Number(e.target.value) || 0)} style={{ width: '100%', height: '48px', borderRadius: '8px', border: '1px solid var(--color-border)', padding: '0 12px' }} />
        </div>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>{t('calc_general_annual_earnings')}</label>
          <input type="number" value={180000} disabled style={{ width: '100%', height: '48px', borderRadius: '8px', border: '1px solid var(--color-border)', padding: '0 12px', backgroundColor: '#F3F4F6' }} />
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ fontWeight: 700, marginBottom: '10px' }}>{t('calc_formula_shown')}</div>
        <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
          {t('calc_vocational_formula')}<br />
          {t('calc_general_formula')}<br />
          {t('calc_result_label')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{t('calc_vocational_route')}</div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>{formatCurrency(vocationalNet)}</div>
        </div>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{t('calc_general_route')}</div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>{formatCurrency(generalStudyNet)}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: '16px', padding: '18px', color: '#065F46', fontWeight: 600 }}>
        {t('calc_difference')}: {difference >= 0 ? '+' : ''}{formatCurrency(difference)} {t('calc_over_three_years')}
      </div>
    </div>
  );
};

export default EarningsCalculatorScreen;
