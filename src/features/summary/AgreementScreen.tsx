import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import Button from '../../components/ui/Button';
import concernData from '../../data/concern_categories.json';

const AgreementScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { parentConcernIds } = useSession();

  // In a real app we'd compare learner interests with parent concerns to find overlap.
  // For the prototype, we just list the parent's concerns since learner interests and parent concerns 
  // are from different lists (interests vs concerns).
  
  const selectedConcerns = concernData.filter(c => parentConcernIds.includes(c.code));

  return (
    <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ marginTop: '16px', marginBottom: '32px' }}>{t('summary_title')}</h1>
      
      <div style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderRadius: '16px', 
        padding: '24px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--color-primary)' }}>{t('summary_parent_wants')}</h3>
        <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {selectedConcerns.length > 0 ? (
            selectedConcerns.map(c => (
              <li key={c.code} style={{ fontSize: '18px' }}>
                {lang === 'hi' ? c.label_hi : c.label_en}
              </li>
            ))
          ) : (
            <li style={{ color: 'var(--color-text-muted)' }}>No specific concerns selected.</li>
          )}
        </ul>
      </div>

      <Button onClick={() => navigate('/sentiment-start')} style={{ marginTop: 'auto' }}>
        {t('summary_btn_talk')}
      </Button>
    </div>
  );
};

export default AgreementScreen;
