import React from 'react';
import type { ChatMessage } from '../features/conversation/engine';
import OutcomeDataCard from './OutcomeDataCard';
import CareerLadder from './CareerLadder';
import ListenButton from './ui/ListenButton';

interface Props {
  message: ChatMessage;
}

const ChatBubble: React.FC<Props> = ({ message }) => {
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
              <a href="/escalation" style={{
                display: 'inline-flex', padding: '8px 16px', borderRadius: '8px',
                backgroundColor: 'var(--color-primary)', color: 'white', textDecoration: 'none',
                fontWeight: 600, fontSize: '14px'
              }}>
                Talk to a person
              </a>
            </div>
          )}
          {message.outcomeData && <OutcomeDataCard outcome={message.outcomeData} trade={message.trade} />}
          {message.pathwaySteps && <CareerLadder steps={message.pathwaySteps} />}
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
