import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useSettings } from '../../hooks/useSettings';

interface ListenButtonProps {
  text: string;
}

const ListenButton: React.FC<ListenButtonProps> = ({ text }) => {
  const { lang, t } = useLanguage();
  const { audioSpeed } = useSettings();
  const [speechError, setSpeechError] = useState('');

  const handleListen = () => {
    if ('speechSynthesis' in window) {
      setSpeechError('');
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = audioSpeed === 'slow' ? 0.75 : 1;
      utterance.onerror = (event) => {
        console.error('Speech playback failed', event.error);
        setSpeechError(t('audio_playback_error'));
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setSpeechError(t('audio_unavailable'));
    }
  };

  return (
    <span className="listen-control">
      <button
        type="button"
        onClick={handleListen}
        aria-label={t('btn_listen')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: '1px solid var(--color-border)',
          padding: '6px 12px',
          borderRadius: '999px',
          color: 'var(--color-primary)',
          fontSize: '14px',
          minHeight: '36px'
        }}
      >
        <Volume2 size={16} />
        <span>{t('btn_listen')}</span>
      </button>
      {speechError && <small className="listen-error" role="status">{speechError}</small>}
    </span>
  );
};

export default ListenButton;
