import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import Button from '../../components/ui/Button';
import concernData from '../../data/concern_categories.json';
import interestData from '../../data/interest_options.json';

const AgreementScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { parentConcernIds, learnerInterestIds } = useSession();

  const selectedConcerns = concernData.filter(c => parentConcernIds.includes(c.code));
  const selectedInterests = interestData.filter(i => learnerInterestIds.includes(i.code));

  return (
    <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ marginTop: '16px', marginBottom: '32px' }}>{t('summary_title')}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '16px', padding: '20px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '12px', color: 'var(--color-primary)' }}>{t('summary_learner_wants')}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {selectedInterests.length > 0 ? selectedInterests.map((item) => (
              <span key={item.code} style={{ backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '999px', padding: '6px 10px', fontSize: '14px' }}>
                {lang === 'hi' ? item.label_hi : item.label_en}
              </span>
            )) : <span style={{ color: 'var(--color-text-muted)' }}>No learner interests selected.</span>}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '16px', padding: '20px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '12px', color: 'var(--color-primary)' }}>{t('summary_parent_wants')}</h3>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedConcerns.length > 0 ? selectedConcerns.map(c => (
              <li key={c.code} style={{ fontSize: '16px' }}>{lang === 'hi' ? c.label_hi : c.label_en}</li>
            )) : <li style={{ color: 'var(--color-text-muted)' }}>No specific concerns selected.</li>}
          </ul>
        </div>
      </div>

      <Button onClick={() => navigate('/family-summary')} style={{ marginTop: 'auto' }}>
        View family summary
      </Button>
    </div>
  );
};

export default AgreementScreen;
