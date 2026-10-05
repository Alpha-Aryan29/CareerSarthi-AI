import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import Button from '../../components/ui/Button';
import { readCounsellingSessions, writeCounsellingSession } from '../../lib/escalations';

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
  const {
    setSentimentStart,
    setSentimentEnd,
    activeCounsellingSessionId,
    setActiveCounsellingSessionId,
  } = useSession();
  
  const [rating, setRating] = useState<number | null>(null);

  const handleNext = () => {
    if (rating !== null) {
      if (isStart) {
        setSentimentStart(rating);
        setSentimentEnd(null);
      } else {
        setSentimentEnd(rating);
        const session = activeCounsellingSessionId
          ? readCounsellingSessions().find((item) => item.id === activeCounsellingSessionId)
          : undefined;
        if (session) {
          try {
            writeCounsellingSession({ ...session, sentimentAfter: rating });
          } catch (error) {
            console.error('Unable to save post-counselling sentiment', error);
            window.alert(t('chat_log_error'));
          }
        }
      }
    }
    setActiveCounsellingSessionId(null);
    navigate(next);
  };

  const handleSkip = () => {
    if (isStart) setSentimentStart(null);
    setSentimentEnd(null);
    setActiveCounsellingSessionId(null);
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
        <Button variant="secondary" onClick={handleSkip}>
          {t('sentiment_skip')}
        </Button>
      </div>
    </div>
  );
};

export default SentimentScreen;
