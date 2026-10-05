import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import Button from '../../components/ui/Button';
import OutcomeDataCard from '../../components/OutcomeDataCard';
import CareerLadder from '../../components/CareerLadder';
import tradesData from '../../data/trades.json';
import pathwayStepsData from '../../data/pathway_steps.json';
import outcomeRecordsData from '../../data/outcome_records.json';
import providersData from '../../data/providers.json';
import locationsData from '../../data/locations.json';
import type { OutcomeRecord, Trade } from '../../types';

const getOutcomeForLocation = (tradeId: string, locationId: string): OutcomeRecord | undefined => {
  const districtRecord = outcomeRecordsData.find(
    (record) => record.trade_id === tradeId && record.location_id === locationId && record.scope !== 'provider'
  );

  if (districtRecord) {
    return districtRecord as OutcomeRecord;
  }

  const location = locationsData.find((item) => item.id === locationId);
  const parentStateId = location?.parent_id ?? null;

  if (parentStateId) {
    return outcomeRecordsData.find(
      (record) => record.trade_id === tradeId && record.location_id === parentStateId && record.scope === 'state'
    ) as OutcomeRecord | undefined;
  }

  return undefined;
};

const TradeDetailScreen: React.FC = () => {
  const { tradeId } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { locationDistrictId } = useSession();

  const trade = useMemo(
    () => (tradesData as Trade[]).find((item) => item.id === tradeId),
    [tradeId]
  );

  const activeLocationId = locationDistrictId || 'loc-mh-mumbai';
  const activeOutcome = trade ? getOutcomeForLocation(trade.id, activeLocationId) : undefined;
  const steps = trade
    ? (pathwayStepsData as any[])
        .filter((step) => step.trade_id === trade.id)
        .sort((a, b) => a.step_order - b.step_order)
    : [];

  const providers = trade
    ? providersData.filter(
        (provider) => provider.location_id === activeLocationId && provider.trades_offered.includes(trade.id)
      )
    : [];

  if (!trade) {
    return (
      <div className="screen-padding">
        <h2>{t('trade_not_found')}</h2>
        <Button onClick={() => navigate('/explore')}>{t('btn_back_to_explore')}</Button>
      </div>
    );
  }

  return (
    <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: '999px', padding: '8px 12px', cursor: 'pointer' }}
        >
          ← {t('btn_back')}
        </button>
        <Button onClick={() => navigate('/compare-trades')} style={{ width: 'auto', minWidth: '180px', height: '44px', fontSize: '16px' }}>
          {t('trade_compare')}
        </Button>
      </div>

      <div>
        <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{t('trade_label')}</div>
        <h1 style={{ margin: 0, fontSize: '28px' }}>{lang === 'hi' ? trade.name_hi : trade.name_en}</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '10px', lineHeight: 1.6 }}>
          {lang === 'hi' ? trade.description_hi : trade.description_en}
        </p>
      </div>

      {activeOutcome && <OutcomeDataCard outcome={activeOutcome} trade={trade} />}

      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 12px' }}>{t('trade_nsqf_heading')}</h3>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
          {t('trade_nsqf_body')}
        </p>
      </div>

      <CareerLadder steps={steps} />

      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 12px' }}>{t('trade_providers_heading')}</h3>
        {providers.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{t('trade_no_providers')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {providers.map((provider) => {
              const providerOutcome = outcomeRecordsData.find(
                (record) =>
                  record.provider_id === provider.id &&
                  record.trade_id === trade.id &&
                  record.location_id === activeLocationId
              ) as OutcomeRecord | undefined;

              return (
                <div key={provider.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontWeight: 700 }}>{lang === 'hi' ? provider.name_hi : provider.name_en}</div>
                  {providerOutcome ? (
                    <div style={{ marginTop: '6px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                      {t('trade_provider_placement')}: {providerOutcome.placement_rate_pct}% · {t('trade_provider_earnings')}: ₹{providerOutcome.earnings_median_inr?.toLocaleString('en-IN')}
                    </div>
                  ) : (
                    <div style={{ marginTop: '6px', color: 'var(--color-text-muted)', fontSize: '14px' }}>{t('trade_outcome_unavailable')}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeDetailScreen;
