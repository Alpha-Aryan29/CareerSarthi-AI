import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import { processMessage, type ChatMessage } from './engine';
import ChatBubble from '../../components/ChatBubble';
import concernData from '../../data/concern_categories.json';
import { Compass, Headphones, Mic, Send, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

interface SpeechResultEvent extends Event {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

const ChatScreen: React.FC = () => {
  const { lang, t } = useLanguage();
  const { locationDistrictId } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    sender: 'assistant',
    text: lang === 'hi' ? 'नमस्ते! हम आपके सवालों के जवाब देने के लिए यहाँ हैं। आप क्या जानना चाहेंगे?' : 'Hello! We are here to answer your questions. What would you like to know?'
  }]);

  const [inputValue, setInputValue] = useState('');
  const [notReallyCount, setNotReallyCount] = useState(0);
  const [escalationPrompt, setEscalationPrompt] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'unavailable' | 'error'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const responseTimerRef = useRef<number | null>(null);

  const suggestedConcerns = concernData.filter((concern) => concern.code !== 'other');

  const handleSend = (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setVoiceStatus('idle');
    setIsThinking(true);

    responseTimerRef.current = window.setTimeout(() => {
      const response = processMessage(text, locationDistrictId, lang);
      const assistantMsg: ChatMessage = { ...response, id: (Date.now() + 1).toString(), sender: 'assistant' };
      setMessages(prev => [...prev, assistantMsg]);
      setIsThinking(false);

      if (assistantMsg.requiresEscalation || assistantMsg.concernCode === 'safety') {
        setEscalationPrompt(true);
      }
    }, 600);
  };

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('unavailable');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) setInputValue((current) => `${current}${current ? ' ' : ''}${transcript}`);
    };
    recognition.onerror = (event) => {
      console.error('Voice input failed', event.error);
      setVoiceStatus('error');
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setVoiceStatus('idle');
    };
    recognitionRef.current = recognition;
    setVoiceStatus('listening');

    try {
      recognition.start();
    } catch (error) {
      console.error('Unable to start voice input', error);
      recognitionRef.current = null;
      setVoiceStatus('error');
    }
  };

  const handleFeedback = (helpful: boolean) => {
    if (!helpful) {
      setNotReallyCount((count) => count + 1);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const prompt = (location.state as { prompt?: unknown } | null)?.prompt;
    if (typeof prompt === 'string' && prompt.trim()) {
      setInputValue(prompt);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    if (responseTimerRef.current !== null) window.clearTimeout(responseTimerRef.current);
  }, []);

  useEffect(() => {
    if (notReallyCount >= 2) {
      setEscalationPrompt(true);
    }
  }, [notReallyCount]);

  return (
    <div className="chat-screen">
      <header className="chat-heading">
        <div className="chat-heading-mark"><Compass size={22} /></div>
        <div>
          <h1>{t('chat_assistant_name')}</h1>
          <span><span className="chat-online-dot" />{t('chat_assistant_type')}</span>
        </div>
        <div className="chat-language-badge">{lang === 'hi' ? 'हिन्दी' : 'English'}</div>
      </header>

      <div className="chat-thread">
        {messages.map(msg => (
          <ChatBubble
            key={msg.id}
            message={msg}
            onFeedback={handleFeedback}
            onEscalate={() => navigate('/escalation')}
          />
        ))}
        <div ref={messagesEndRef} />

        {isThinking && (
          <div className="chat-thinking">
            <span className="chat-thinking-mark"><Sparkles size={16} /></span>
            <span>{t('chat_thinking')}</span>
            <span className="chat-thinking-dots" aria-hidden="true"><i /><i /><i /></span>
          </div>
        )}

        {escalationPrompt && (
          <div className="chat-human-support">
            <div className="chat-human-support-icon"><Headphones size={19} /></div>
            <div>
              <strong>{t('chat_person_title')}</strong>
              <p>{t('chat_person_desc')}</p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/escalation')} style={{ width: 'auto', minWidth: '180px' }}>
              {t('btn_talk_person')}
            </Button>
          </div>
        )}

        {messages.length > 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', marginBottom: '32px' }}>
            <Button variant="secondary" onClick={() => navigate('/sentiment-end')} style={{ width: 'auto' }}>
              {t('chat_finish')}
            </Button>
          </div>
        )}
      </div>

      <div className="chat-composer">
        <div className="chat-suggestions">
          <div className="chat-suggestions-label">{t('chat_suggested')}</div>
          {suggestedConcerns.map(c => (
            <button
              type="button"
              key={c.code}
              disabled={isThinking}
              onClick={() => handleSend(lang === 'hi' ? c.label_hi : c.label_en)}
              className="chat-suggestion-chip"
            >
              {lang === 'hi' ? c.label_hi : c.label_en}
            </button>
          ))}
        </div>

        <div className="chat-compose-row">
          <button
            type="button"
            className={`chat-voice-button ${voiceStatus === 'listening' ? 'listening' : ''}`}
            onClick={handleVoiceInput}
            aria-label={voiceStatus === 'listening' ? t('chat_voice_stop') : t('chat_voice_start')}
            title={voiceStatus === 'listening' ? t('chat_voice_stop') : t('chat_voice_start')}
          >
            <Mic size={19} />
          </button>
          <input
            aria-label={t('chat_input_label')}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(inputValue)}
            placeholder={t('chat_placeholder')}
            disabled={isThinking}
          />
          <button
            type="button"
            className="chat-send-button"
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || isThinking}
            aria-label={t('btn_submit')}
          >
            <Send size={19} />
          </button>
        </div>
        <div className={`chat-voice-status ${voiceStatus === 'error' || voiceStatus === 'unavailable' ? 'error' : ''}`} aria-live="polite">
          {voiceStatus === 'listening' ? t('chat_voice_listening') : ''}
          {voiceStatus === 'unavailable' ? t('chat_voice_unavailable') : ''}
          {voiceStatus === 'error' ? t('chat_voice_error') : ''}
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
