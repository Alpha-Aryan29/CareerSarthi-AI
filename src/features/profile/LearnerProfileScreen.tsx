import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import Button from '../../components/ui/Button';
import educationData from '../../data/education_levels.json';
import interestData from '../../data/interest_options.json';
import { Zap, Wrench, Monitor, HeartPulse, Sparkles } from 'lucide-react';

const icons: Record<string, React.ReactNode> = {
  zap: <Zap size={24} />,
  wrench: <Wrench size={24} />,
  monitor: <Monitor size={24} />,
  'heart-pulse': <HeartPulse size={24} />,
  sparkles: <Sparkles size={24} />
};

const LearnerProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { setLearnerProfile, mode } = useSession();

  const [step, setStep] = useState(1);
  const [edu, setEdu] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLearnerProfile(edu, age, interests);
      if (mode === 'both') {
        navigate('/profile-parent');
      } else {
        navigate('/sentiment-start');
      }
    }
  };

  const toggleInterest = (code: string) => {
    if (interests.includes(code)) {
      setInterests(interests.filter(i => i !== code));
    } else {
      setInterests([...interests, code]);
    }
  };

  const OptionCard: React.FC<{
    selected: boolean;
    onClick: () => void;
    label: string;
    icon?: React.ReactNode;
  }> = ({ selected, onClick, label, icon }) => (
    <div 
      onClick={onClick}
      style={{
        padding: '20px',
        borderRadius: '12px',
        border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        backgroundColor: selected ? '#F0FDF4' : 'var(--color-surface)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontWeight: selected ? 600 : 400,
      }}
    >
      {icon && <span style={{ color: selected ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>{icon}</span>}
      <span style={{ color: selected ? 'var(--color-primary)' : 'var(--color-text)' }}>{label}</span>
    </div>
  );

  return (
    <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>{t('profile_learner_title')} (Step {step} of 3)</p>
      
      <div style={{ flex: 1 }}>
        {step === 1 && (
          <>
            <h2 style={{ marginBottom: '24px' }}>{t('profile_education_title')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {educationData.map(e => (
                <OptionCard 
                  key={e.code}
                  selected={edu === e.code}
                  onClick={() => setEdu(e.code)}
                  label={lang === 'hi' ? e.label_hi : e.label_en}
                />
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ marginBottom: '24px' }}>{t('profile_age_title')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['15_17', '18_21', '22_25'].map(a => (
                <OptionCard 
                  key={a}
                  selected={age === a}
                  onClick={() => setAge(a)}
                  label={a.replace('_', ' - ')}
                />
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ marginBottom: '24px' }}>{t('profile_interest_title')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {interestData.map(i => (
                <OptionCard 
                  key={i.code}
                  selected={interests.includes(i.code)}
                  onClick={() => toggleInterest(i.code)}
                  label={lang === 'hi' ? i.label_hi : i.label_en}
                  icon={icons[i.icon]}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Button onClick={handleNext} style={{ marginTop: '32px' }}>
        {t('btn_continue')}
      </Button>
    </div>
  );
};

export default LearnerProfileScreen;
