import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import Button from '../../components/ui/Button';

interface Props {
  isStart: boolean;
  next: string;
}

const faces = [
  { val: 1, emoji: '😟' },
  { val: 2, emoji: '🙁' },
  { val: 3, emoji: '😐' },
  { val: 4, emoji: '🙂' },
  { val: 5, emoji: '😊' }
];

const SentimentScreen: React.FC<Props> = ({ isStart, next }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setSentimentStart, setSentimentEnd } = useSession();
  
  const [rating, setRating] = useState<number | null>(null);

  const handleNext = () => {
    if (rating !== null) {
      if (isStart) setSentimentStart(rating);
      else setSentimentEnd(rating);
    }
    navigate(next);
  };

  return (
    <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '48px' }}>
        {isStart ? t('sentiment_start_q') : t('sentiment_end_q')}
      </h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '64px' }}>
        {faces.map(f => (
          <button
            key={f.val}
            onClick={() => setRating(f.val)}
            style={{
              fontSize: '48px',
              background: 'none',
              border: 'none',
              opacity: rating === f.val ? 1 : 0.4,
              transform: rating === f.val ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            {f.emoji}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Button onClick={handleNext} disabled={rating === null}>
          {t('btn_continue')}
        </Button>
        <Button variant="secondary" onClick={() => navigate(next)}>
          Skip
        </Button>
      </div>
    </div>
  );
};

export default SentimentScreen;
