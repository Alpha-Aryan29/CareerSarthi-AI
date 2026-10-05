import React, { useEffect, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { UserRound } from 'lucide-react';
import type { ChatMessage } from '../features/conversation/engine';
import OutcomeDataCard from './OutcomeDataCard';
import CareerLadder from './CareerLadder';
import ListenButton from './ui/ListenButton';

interface Props {
  message: ChatMessage;
  onFeedback?: (helpful: boolean) => void;
  onEscalate?: () => void;
  onSuggest?: (question: string) => void;
}

const ChatBubble: React.FC<Props> = ({ message, onFeedback, onEscalate, onSuggest }) => {
  const isUser = message.sender === 'user';
  const { lang, t } = useLanguage();
  const { readAloud, audioSpeed } = useSettings();
  const [feedback, setFeedback] = useState<boolean | null>(null);

  useEffect(() => {
    if (isUser || !readAloud || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = audioSpeed === 'slow' ? 0.75 : 1;
    utterance.onerror = (event) => console.error('Automatic reply playback failed', event.error);
    window.speechSynthesis.speak(utterance);
  }, [audioSpeed, isUser, lang, message.id, message.text, readAloud]);

  return (
    <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-assistant'}`} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '24px'
    }}>
      <div className="chat-message-meta">
        {!isUser && <span className="chat-avatar assistant"><UserRound size={16} /></span>}
        <span>{isUser ? t('chat_user_label') : t('chat_assistant_name')}</span>
        {isUser && <span className="chat-avatar user"><UserRound size={14} /></span>}
      </div>
      <div style={{
        backgroundColor: isUser ? 'var(--color-primary)' : 'var(--color-surface)',
        color: isUser ? 'var(--color-primary-contrast)' : 'var(--color-text)',
        padding: '16px',
        borderRadius: '16px',
        borderBottomRightRadius: isUser ? '4px' : '16px',
        borderBottomLeftRadius: !isUser ? '4px' : '16px',
        maxWidth: '85%',
        border: isUser ? 'none' : '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.7' }}>{message.text}</p>
      </div>

      {!isUser && (
        <div style={{ marginTop: '8px', marginLeft: '8px', width: '100%', maxWidth: '85%' }}>
          <ListenButton text={message.text} />

          {message.isFallback && !message.requiresEscalation && (
            <div style={{ marginTop: '16px' }}>
              {message.suggestedQuestions?.map((question) => (
                <button
                  type="button"
                  className="chat-follow-up-question"
                  key={question}
                  onClick={() => onSuggest?.(question)}
                >
                  {question}
                </button>
              ))}
              <button
                type="button"
                onClick={onEscalate}
                style={{
                  display: 'inline-flex', padding: '8px 16px', borderRadius: '8px',
                  backgroundColor: 'var(--color-primary)', color: 'white', border: 'none',
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer'
                }}
              >
                {t('btn_talk_person')}
              </button>
            </div>
          )}

          {message.outcomeData && <OutcomeDataCard outcome={message.outcomeData} trade={message.trade} />}
          {message.pathwaySteps && <CareerLadder steps={message.pathwaySteps} />}

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {message.isAnswer && (feedback === null ? (
              <>
                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{t('chat_did_this_help')}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => { setFeedback(true); onFeedback?.(true); }}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {t('chat_yes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFeedback(false); onFeedback?.(false); }}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {t('chat_not_really')}
                  </button>
                </div>
              </>
            ) : (
              <div className="chat-feedback-confirmation">{t('chat_feedback_thanks')}</div>
            ))}
            {(message.requiresEscalation || message.concernCode === 'safety') && (
              <button
                type="button"
                onClick={onEscalate}
                style={{ alignSelf: 'flex-start', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--color-primary)', backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                {t('btn_talk_person')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
