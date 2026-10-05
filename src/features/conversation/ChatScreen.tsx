import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import { processMessage, requestGroundedLlmAnswer, type ChatMessage } from './engine';
import ChatBubble from '../../components/ChatBubble';
import concernData from '../../data/concern_categories.json';
import locationsData from '../../data/locations.json';
import { Headphones, Mic, Send, Sparkles, UserRound } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { writeCounsellingSession } from '../../lib/escalations';

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
  const {
    locationDistrictId,
    learnerInterestIds,
    learnerEducationId,
    parentIncomeBracketId,
    sentimentStart,
    setActiveCounsellingSessionId,
  } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    sender: 'assistant',
    text: t('chat_greeting')
  }]);

  const [inputValue, setInputValue] = useState('');
  const [notReallyCount, setNotReallyCount] = useState(0);
  const [unrecognisedCount, setUnrecognisedCount] = useState(0);
  const [llmError, setLlmError] = useState(false);
  const [sessionLogError, setSessionLogError] = useState(false);
  const [escalationPrompt, setEscalationPrompt] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'unavailable' | 'error'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const responseTimerRef = useRef<number | null>(null);
  const sessionIdRef = useRef('');
  const previousLanguageRef = useRef(lang);

  const suggestedConcerns = concernData.filter((concern) => concern.code !== 'other');

  const handleSend = (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setVoiceStatus('idle');
    setIsThinking(true);
    setLlmError(false);

    responseTimerRef.current = window.setTimeout(() => {
      void (async () => {
        const response = processMessage(text, {
          locationId: locationDistrictId,
          interestIds: learnerInterestIds,
          educationId: learnerEducationId,
          incomeBracketId: parentIncomeBracketId,
        }, lang);
        let groundedResponse = response;
        if (!response.isFallback) {
          try {
            const answer = await requestGroundedLlmAnswer(text, response.text, lang);
            if (answer) groundedResponse = { ...response, text: answer };
          } catch (error) {
            console.error('Grounded language model request failed', error);
            setLlmError(true);
          }
        }
        const assistantMsg: ChatMessage = { ...groundedResponse, id: (Date.now() + 1).toString(), sender: 'assistant' };
        if (!sessionIdRef.current) {
          sessionIdRef.current = typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `session-${Date.now()}`;
          setActiveCounsellingSessionId(sessionIdRef.current);
        }
        const concernNames: Record<string, string> = {
          earning_potential: 'earning potential',
          job_security: 'job security',
          social_status: 'social status',
          growth_further_education: 'growth/further education',
          safety: 'safety',
          distance_travel: 'distance/travel',
          cost: 'cost',
          only_for_failures: 'only for failures',
        };
        try {
          writeCounsellingSession({
            id: sessionIdRef.current,
            concern: (concernNames[assistantMsg.concernCode || ''] || 'other') as import('../../lib/escalations').ConcernType,
            trade: assistantMsg.trade?.name_en || 'Not selected',
            district: locationsData.find((item) => item.id === locationDistrictId)?.name_en || 'Not selected',
            sentimentBefore: sentimentStart,
            sentimentAfter: null,
            escalated: false,
            resolved: false,
            createdAt: new Date().toISOString(),
            demo: false,
          });
        } catch (error) {
          console.error('Unable to save counselling session', error);
          setSessionLogError(true);
        }
        setMessages((prev) => [...prev, assistantMsg]);
        setIsThinking(false);

        if (assistantMsg.isFallback && assistantMsg.concernCode === 'other' && !assistantMsg.requiresEscalation) {
          const nextCount = unrecognisedCount + 1;
          setUnrecognisedCount(nextCount);
          if (nextCount >= 2) openEscalation(`${t('chat_escalation_unknown_summary')} ${text}`, 'other');
        }
        if (assistantMsg.requiresEscalation || assistantMsg.concernCode === 'safety') {
          setEscalationPrompt(true);
        }
      })();
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
      const nextCount = notReallyCount + 1;
      setNotReallyCount(nextCount);
      if (nextCount >= 2) openEscalation(`${t('chat_escalation_feedback_summary')} ${[...messages].reverse().find((message) => message.sender === 'user')?.text || ''}`);
    } else {
      setNotReallyCount(0);
    }
  };

  const openEscalation = (summary?: string, concernOverride?: string) => {
    const latestAssistant = [...messages].reverse().find((message) => message.sender === 'assistant');
    const concernNames: Record<string, string> = {
      earning_potential: 'earning potential',
      job_security: 'job security',
      social_status: 'social status',
      growth_further_education: 'growth/further education',
      safety: 'safety',
      distance_travel: 'distance/travel',
      cost: 'cost',
      only_for_failures: 'only for failures',
    };
    if (sessionIdRef.current) {
      try {
        writeCounsellingSession({
          id: sessionIdRef.current,
          concern: (concernNames[latestAssistant?.concernCode || ''] || 'other') as import('../../lib/escalations').ConcernType,
          trade: latestAssistant?.trade?.name_en || 'Not selected',
          district: locationsData.find((item) => item.id === locationDistrictId)?.name_en || 'Not selected',
          sentimentBefore: sentimentStart,
          sentimentAfter: null,
          escalated: true,
          resolved: false,
          createdAt: new Date().toISOString(),
          demo: false,
        });
      } catch (error) {
        console.error('Unable to mark counselling session escalated', error);
        setSessionLogError(true);
      }
    }
    navigate('/escalation', {
      state: {
        concern: concernOverride || latestAssistant?.concernCode || 'other',
        tradeId: latestAssistant?.trade?.id,
        districtId: locationDistrictId,
        sessionId: sessionIdRef.current,
        summary: summary || `${t('chat_escalation_default_summary')} ${[...messages].reverse().find((message) => message.sender === 'user')?.text || t('btn_talk_person')}`,
      },
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (previousLanguageRef.current === lang) return;
    previousLanguageRef.current = lang;
    let latestQuestion = '';
    setMessages((current) => current.map((message) => {
      if (message.sender === 'user') {
        latestQuestion = message.text;
        return message;
      }
      if (message.id === '1') return { ...message, text: t('chat_greeting') };
      if (!latestQuestion) return message;
      const localized = processMessage(latestQuestion, {
        locationId: locationDistrictId,
        interestIds: learnerInterestIds,
        educationId: learnerEducationId,
        incomeBracketId: parentIncomeBracketId,
      }, lang);
      return { ...message, ...localized, id: message.id, sender: 'assistant' };
    }));
  }, [lang, t, locationDistrictId, learnerInterestIds, learnerEducationId, parentIncomeBracketId]);

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
        <div className="chat-heading-mark"><UserRound size={22} /></div>
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
            onEscalate={() => openEscalation()}
            onSuggest={handleSend}
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

        {llmError && <p className="chat-voice-status error" role="status">{t('chat_llm_error')}</p>}
        {sessionLogError && <p className="chat-voice-status error" role="status">{t('chat_log_error')}</p>}

        {escalationPrompt && (
          <div className="chat-human-support">
            <div className="chat-human-support-icon"><Headphones size={19} /></div>
            <div>
              <strong>{t('chat_person_title')}</strong>
              <p>{t('chat_person_desc')}</p>
            </div>
            <Button variant="secondary" onClick={() => openEscalation()} style={{ width: 'auto', minWidth: '180px' }}>
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
