import React from 'react';
import type { PathwayStep } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import ListenButton from './ui/ListenButton';
import { ArrowDown } from 'lucide-react';

interface Props {
  steps: PathwayStep[];
}

const CareerLadder: React.FC<Props> = ({ steps }) => {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text)' }}>{t('card_see_path')}</h4>
        <ListenButton text={t('card_see_path')} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div style={{
              display: 'flex',
              gap: '16px',
              padding: '12px',
              backgroundColor: 'var(--color-background)',
              borderRadius: '12px'
            }}>
              <div style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-contrast)',
                borderRadius: '8px',
                padding: '4px 8px',
                fontWeight: 'bold',
                height: 'fit-content'
              }}>
                NSQF {step.nsqf_level}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>
                  {lang === 'hi' ? step.title_hi : step.title_en}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                  {lang === 'hi' ? step.description_hi : step.description_en}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ArrowDown size={24} color="var(--color-border)" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CareerLadder;
