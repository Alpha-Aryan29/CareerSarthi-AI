import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import tradesData from '../../data/trades.json';
import outcomeRecordsData from '../../data/outcome_records.json';
import locationsData from '../../data/locations.json';
import type { OutcomeRecord, Trade } from '../../types';
import OutcomeDataCard from '../../components/OutcomeDataCard';

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

const CompareTradesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { locationDistrictId } = useSession();
  const trades = tradesData as Trade[];
  const activeLocation = locationDistrictId || 'loc-mh-mumbai';

  const [firstId, setFirstId] = useState<string>(trades[0]?.id ?? '');
  const [secondId, setSecondId] = useState<string>(trades[1]?.id ?? trades[0]?.id ?? '');

  const firstTrade = useMemo(() => trades.find((trade) => trade.id === firstId) ?? trades[0], [firstId, trades]);
  const secondTrade = useMemo(() => trades.find((trade) => trade.id === secondId) ?? trades[1] ?? trades[0], [secondId, trades]);

  const firstOutcome = firstTrade ? getOutcomeForTradeAndLocation(firstTrade.id, activeLocation) : undefined;
  const secondOutcome = secondTrade ? getOutcomeForTradeAndLocation(secondTrade.id, activeLocation) : undefined;

  const placementDelta =
    firstOutcome && secondOutcome ? (firstOutcome.placement_rate_pct ?? 0) - (secondOutcome.placement_rate_pct ?? 0) : 0;

  return (
    <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button type="button" onClick={() => navigate(-1)} style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: '999px', padding: '8px 12px', cursor: 'pointer' }}>
          ← {t('btn_back')}
        </button>
      </div>

      <h1 style={{ margin: 0 }}>{t('compare_title')}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>{t('compare_trade_one')}</label>
          <select value={firstId} onChange={(e) => setFirstId(e.target.value)} style={{ width: '100%', height: '48px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            {trades.map((trade) => (
              <option key={trade.id} value={trade.id}>{lang === 'hi' ? trade.name_hi : trade.name_en}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>{t('compare_trade_two')}</label>
          <select value={secondId} onChange={(e) => setSecondId(e.target.value)} style={{ width: '100%', height: '48px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            {trades.map((trade) => (
              <option key={trade.id} value={trade.id}>{lang === 'hi' ? trade.name_hi : trade.name_en}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{t('compare_placement_difference')}</div>
        <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px' }}>
          {firstOutcome && secondOutcome
            ? `${placementDelta >= 0 ? '+' : ''}${placementDelta.toFixed(1)} ${t('compare_percentage_points')}`
            : t('compare_no_data')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {firstOutcome && firstTrade ? <OutcomeDataCard outcome={firstOutcome} trade={firstTrade} /> : null}
        {secondOutcome && secondTrade ? <OutcomeDataCard outcome={secondOutcome} trade={secondTrade} /> : null}
      </div>
    </div>
  );
};

export default CompareTradesScreen;
