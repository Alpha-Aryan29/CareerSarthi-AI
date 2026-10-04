import React from 'react';
import type { ChatMessage } from '../features/conversation/engine';
import OutcomeDataCard from './OutcomeDataCard';
import CareerLadder from './CareerLadder';
import ListenButton from './ui/ListenButton';

interface Props {
  message: ChatMessage;
  onFeedback?: (helpful: boolean) => void;
  onEscalate?: () => void;
}

const ChatBubble: React.FC<Props> = ({ message, onFeedback, onEscalate }) => {
  const isUser = message.sender === 'user';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '24px'
    }}>
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
        <p style={{ margin: 0, fontSize: '18px', lineHeight: '28px' }}>{message.text}</p>
      </div>

      {!isUser && (
        <div style={{ marginTop: '8px', marginLeft: '8px', width: '100%', maxWidth: '85%' }}>
          <ListenButton text={message.text} />

          {message.isFallback && (
            <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                onClick={onEscalate}
                style={{
                  display: 'inline-flex', padding: '8px 16px', borderRadius: '8px',
                  backgroundColor: 'var(--color-primary)', color: 'white', border: 'none',
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer'
                }}
              >
                Talk to a person
              </button>
            </div>
          )}

          {message.outcomeData && <OutcomeDataCard outcome={message.outcomeData} trade={message.trade} />}
          {message.pathwaySteps && <CareerLadder steps={message.pathwaySteps} />}

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Did this help?</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onFeedback?.(true)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', cursor: 'pointer', fontWeight: 600 }}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => onFeedback?.(false)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', cursor: 'pointer', fontWeight: 600 }}
              >
                Not really
              </button>
            </div>
            {(message.requiresEscalation || message.concernCode === 'safety') && (
              <button
                type="button"
                onClick={onEscalate}
                style={{ alignSelf: 'flex-start', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--color-primary)', backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                Talk to a person
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
