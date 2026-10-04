import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import { processMessage, type ChatMessage } from './engine';
import ChatBubble from '../../components/ChatBubble';
import concernData from '../../data/concern_categories.json';
import { Send, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

const ChatScreen: React.FC = () => {
  const { lang, t } = useLanguage();
  const { locationDistrictId } = useSession();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    sender: 'assistant',
    text: lang === 'hi' ? 'नमस्ते! हम आपके सवालों के जवाब देने के लिए यहाँ हैं। आप क्या जानना चाहेंगे?' : 'Hello! We are here to answer your questions. What would you like to know?'
  }]);

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // All 8 concern categories for chips
  const suggestedConcerns = concernData;

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Simulate slight network delay
    setTimeout(() => {
      const response = processMessage(text, locationDistrictId, lang);
      setMessages(prev => [...prev, { ...response, id: (Date.now() + 1).toString(), sender: 'assistant' }]);
    }, 600);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: 'calc(100vh - 73px - 72px)' }}>
      {/* Chat History */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px', paddingBottom: '32px' }}>
        {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
        <div ref={messagesEndRef} />

        {messages.length > 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', marginBottom: '32px' }}>
            <Button variant="secondary" onClick={() => navigate('/sentiment-end')} style={{ width: 'auto' }}>
              Finish Session
            </Button>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        {/* Chips */}
        <div style={{ padding: '12px 16px', overflowX: 'auto', whiteSpace: 'nowrap', borderBottom: '1px solid var(--color-border)', display: 'flex', WebkitOverflowScrolling: 'touch' }}>
          {suggestedConcerns.map(c => (
            <button
              key={c.code}
              onClick={() => handleSend(lang === 'hi' ? c.label_hi : c.label_en)}
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                marginRight: '8px',
                borderRadius: '999px',
                border: '1px solid var(--color-primary)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary)',
                fontSize: '14px',
                fontWeight: 500,
                whiteSpace: 'nowrap'
              }}
            >
              {lang === 'hi' ? c.label_hi : c.label_en}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', padding: '8px' }}>
            <Mic size={28} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
            placeholder={t('chat_placeholder')}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '24px',
              border: '1px solid var(--color-border)',
              padding: '0 16px',
              fontSize: '16px',
              backgroundColor: 'var(--color-background)'
            }}
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim()}
            style={{ background: 'none', border: 'none', color: inputValue.trim() ? 'var(--color-primary)' : 'var(--color-border)', padding: '8px' }}
          >
            <Send size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
