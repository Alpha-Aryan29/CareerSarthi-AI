import React from 'react';
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

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px',
      padding: '20px',
      marginTop: '12px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text)' }}>
          {trade ? (lang === 'hi' ? trade.name_hi : trade.name_en) : 'Trade'}
        </h4>
      </div>

      {/* Figures */}
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

      {/* Label Badge */}
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
            State-level data
          </div>
        )}
      </div>

      {/* Source Info */}
      <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div><strong>{t('card_source')}:</strong> {outcome.source_name} ({outcome.source_year})</div>
        {outcome.sample_size && (
          <div>
            <strong>{t('card_sample')}:</strong> {outcome.sample_size}
            {outcome.sample_size < 100 && (
              <span style={{ color: 'var(--color-warning)', marginLeft: '8px', fontWeight: 600 }}>
                (Small sample, treat with care)
              </span>
            )}
          </div>
        )}
        <div style={{ color: 'var(--color-label-pilot)', marginTop: '4px' }}>{t('card_pilot_warning')}</div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ListenButton text={`${t('card_pilot_warning')}. ${t('card_source')}: ${outcome.source_name}.`} />
      </div>
    </div>
  );
};

export default OutcomeDataCard;
