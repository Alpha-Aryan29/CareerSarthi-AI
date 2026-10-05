import React, { useState } from 'react';
import type { OutcomeRecord, Trade } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import ListenButton from './ui/ListenButton';
import { FlaskConical } from 'lucide-react';

interface Props {
  outcome: OutcomeRecord;
  trade?: Trade;
}

const formatINR = (val: number | null) => {
  if (!val) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const OutcomeDataCard: React.FC<Props> = ({ outcome, trade }) => {
  const { lang, t } = useLanguage();
  const [showTrustSheet, setShowTrustSheet] = useState(false);

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px',
      padding: '20px',
      marginTop: '12px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text)' }}>
          {trade ? (lang === 'hi' ? trade.name_hi : trade.name_en) : t('card_trade')}
        </h4>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
        {outcome.earnings_median_inr && (
          <div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{t('card_earnings')}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)' }}>
              {formatINR(outcome.earnings_p25_inr)} - {formatINR(outcome.earnings_p75_inr)}
            </div>
          </div>
        )}
        {outcome.placement_rate_pct && (
          <div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{t('card_placement')}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)' }}>
              {outcome.placement_rate_pct}%
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          backgroundColor: '#FEF3C7', color: 'var(--color-label-pilot)',
          padding: '4px 12px', borderRadius: '999px', fontSize: '14px', fontWeight: 600
        }}>
          <FlaskConical size={16} />
          {t('card_pilot_label')}
        </div>

        {outcome.scope === 'state' && (
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            backgroundColor: '#E0E7FF', color: 'var(--color-label-benchmark)',
            padding: '4px 12px', borderRadius: '999px', fontSize: '14px', fontWeight: 600
          }}>
            {t('card_state_data')}
          </div>
        )}
      </div>

      <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div><strong>{t('card_source')}:</strong> {outcome.source_name} ({outcome.source_year})</div>
        {outcome.sample_size && (
          <div>
            <strong>{t('card_sample')}:</strong> {outcome.sample_size}
            {outcome.sample_size < 100 && (
              <span style={{ color: 'var(--color-warning)', marginLeft: '8px', fontWeight: 600 }}>
                {t('card_small_sample')}
              </span>
            )}
          </div>
        )}
        <div style={{ color: 'var(--color-label-pilot)', marginTop: '4px' }}>{t('card_pilot_warning')}</div>
      </div>

      {showTrustSheet && (
        <div style={{ marginBottom: '16px', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '12px', backgroundColor: '#F9FAFB' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>{t('card_trust_question')}</div>
          <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            {t('card_trust_explanation')}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={() => setShowTrustSheet((prev) => !prev)}
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: '999px', padding: '8px 12px', cursor: 'pointer', fontWeight: 600 }}
        >
          {t('card_trust_question')}
        </button>
        <ListenButton text={`${t('card_pilot_warning')}. ${t('card_source')}: ${outcome.source_name}.`} />
      </div>
    </div>
  );
};

export default OutcomeDataCard;
