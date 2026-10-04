import React from 'react';
import { Volume2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface ListenButtonProps {
  text: string;
}

const ListenButton: React.FC<ListenButtonProps> = ({ text }) => {
  const { lang, t } = useLanguage();

  const handleListen = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Audio not available on this browser.");
    }
  };

  return (
    <button
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
  );
};

export default ListenButton;
