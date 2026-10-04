import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import Button from '../../components/ui/Button';
import ListenButton from '../../components/ui/ListenButton';
import concernData from '../../data/concern_categories.json';
import incomeData from '../../data/income_brackets.json';
import { IndianRupee, ShieldCheck, Award, TrendingUp, HardHat, MapPin, Wallet, MessageCircleQuestion, PlusCircle } from 'lucide-react';

const icons: Record<string, React.ReactNode> = {
  'indian-rupee': <IndianRupee size={24} />,
  'shield-check': <ShieldCheck size={24} />,
  award: <Award size={24} />,
  'trending-up': <TrendingUp size={24} />,
  'hard-hat': <HardHat size={24} />,
  'map-pin': <MapPin size={24} />,
  wallet: <Wallet size={24} />,
  'message-circle-question': <MessageCircleQuestion size={24} />,
  'plus-circle': <PlusCircle size={24} />
};

const ParentProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { setParentProfile, mode } = useSession();

  const [step, setStep] = useState(1);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [income, setIncome] = useState<string>('');

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setParentProfile(concerns, income);
      if (mode === 'both') {
        navigate('/summary');
      } else {
        navigate('/sentiment-start');
      }
    }
  };

  const toggleConcern = (code: string) => {
    if (concerns.includes(code)) {
      setConcerns(concerns.filter(c => c !== code));
    } else {
      setConcerns([...concerns, code]);
    }
  };

  const OptionCard: React.FC<{
    selected: boolean;
    onClick: () => void;
    label: string;
    icon?: React.ReactNode;
    listenText?: string;
  }> = ({ selected, onClick, label, icon, listenText }) => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <div 
        onClick={onClick}
        style={{
          flex: 1,
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
      {listenText && <ListenButton text={listenText} />}
    </div>
  );

  return (
    <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>{t('profile_parent_title')} (Step {step} of 2)</p>
      
      <div style={{ flex: 1 }}>
        {step === 1 && (
          <>
            <h2 style={{ marginBottom: '24px' }}>{t('profile_concern_title')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {concernData.map(c => (
                <OptionCard 
                  key={c.code}
                  selected={concerns.includes(c.code)}
                  onClick={() => toggleConcern(c.code)}
                  label={lang === 'hi' ? c.label_hi : c.label_en}
                  icon={icons[c.icon]}
                  listenText={lang === 'hi' ? c.label_hi : c.label_en}
                />
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ marginBottom: '8px' }}>{t('profile_income_title')}</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '14px' }}>{t('profile_income_desc')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {incomeData.map(i => (
                <OptionCard 
                  key={i.code}
                  selected={income === i.code}
                  onClick={() => setIncome(i.code)}
                  label={lang === 'hi' ? i.label_hi : i.label_en}
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

export default ParentProfileScreen;
