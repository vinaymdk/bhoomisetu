import { useEffect, useRef, useState } from 'react';
import { aiChatService, type ChatLanguage } from '../services/aiChat.service';
import './AIChatPage.css';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export const AIChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        'Hi! I can help with property suggestions, FAQs, and booking.\nAsk your questions like: Find 2BHK under 50L, Show verified plots near metro.',
    },
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<ChatLanguage>('en');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [isSending, setIsSending] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const topGuide =
    language === 'hi'
      ? 'AI Chat Support का उपयोग कैसे करें: अपनी आवश्यकता, बजट और स्थान को स्पष्ट रूप से लिखें.'
      : language === 'te'
        ? 'AI Chat Support ను ఎలా ఉపయోగించాలి: మీ అవసరం, బడ్జెట్, లొకేషన్‌ను స్పష్టంగా వ్రాయండి.'
        : 'How to use AI Chat Support: Share your requirement, budget, and location clearly.';
  const bottomGuide =
    language === 'hi'
      ? 'मानव सहायता चाहिए? बताएं और हम Customer Support से जोड़ देंगे.'
      : language === 'te'
        ? 'మనవ సహాయం కావాలా? చెప్పండి, Customer Support కు కలుపుతాం.'
        : 'Need human help? Tell us and we will connect Customer Support.';

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userId = `${Date.now()}-user`;
    setMessages((prev) => [...prev, { id: userId, role: 'user', text: trimmed }]);
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setIsSending(true);
    try {
      const response = await aiChatService.sendMessage(trimmed, language, conversationId);
      setConversationId(response.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: response.content,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: 'Unable to reach AI service. Please try again shortly.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInput(text);
    
    // Auto-expand textarea up to 4 lines
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const lineHeight = 24;
      const maxHeight = lineHeight * 4;
      const newHeight = Math.min(inputRef.current.scrollHeight, maxHeight);
      inputRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleScroll = () => {
    const el = messagesRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setShowScrollDown(!atBottom);
  };

  return (
    <div className="ai-chat-page">
      <div className="ai-chat-header">
        <div>
          <h1>AI Chat Support</h1>
          <p>24/7 assistant for FAQs, property suggestions, and booking.</p>
        </div>
        <div className="ai-chat-language">
          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value as ChatLanguage)}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>
      </div>

      <div className="ai-chat-body">
        <div className="ai-chat-guide ai-chat-guide-top">{topGuide}</div>
        <div className="ai-chat-messages" ref={messagesRef} onScroll={handleScroll}>
          {messages.map((msg) => (
            <div key={msg.id} className={`ai-chat-message ${msg.role}`}>
              <div className="ai-chat-bubble">{msg.text}</div>
            </div>
          ))}
        </div>
        {showScrollDown && (
          <button
            className="ai-chat-scroll"
            onClick={() => {
              const el = messagesRef.current;
              if (!el) return;
              el.scrollTop = el.scrollHeight;
            }}
          >
            ↓
          </button>
        )}
        <div className="ai-chat-guide ai-chat-guide-bottom">{bottomGuide}</div>
      </div>

      <form
        className="ai-chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
      >
        <div className="ai-chat-input-field">
          <textarea
            ref={inputRef}
            placeholder={
              language === 'en'
                ? 'Ask about properties, FAQs, or bookings...'
                : language === 'hi'
                  ? 'प्रॉपर्टी या बुकिंग के बारे में पूछें...'
                  : 'ప్రాపర్టీలు లేదా బుకింగ్ గురించి అడగండు...'
            }
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
          />
          <button type="submit" disabled={isSending}>
            {isSending ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};
