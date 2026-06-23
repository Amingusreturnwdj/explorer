import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const GEMINI_API_KEY = 'AQ.Ab8RN6LuQdRV5C9BK7gLjn5HlnjLAfiq2Zrh3vZdLAYyq9M9EQ';

export default function AIChat() {
  const { shops, currentLocation } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Map Companion. I can help you find places and give recommendations based on your current map data.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const contextPrompt = `You are a helpful AI Map Companion. The user is asking: "${userMessage}".
Current context: 
- Total shops on map: ${shops.length}
- Shop details: ${JSON.stringify(shops.map(s => ({name: s.name, category: s.category, desc: s.description})))}
- User current location: ${currentLocation ? JSON.stringify(currentLocation) : 'Unknown'}

Please provide a helpful, concise, and friendly response based on this context.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: contextPrompt }] }]
        })
      });
      
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button className="btn glass-panel" style={floatingBtnStyle} onClick={() => setIsOpen(true)}>
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="glass-panel animate-fade-in" style={chatPanelStyle}>
      <div style={headerStyle}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Bot size={20} color="var(--primary)" />
          <h3 style={{margin: 0}}>AI Companion</h3>
        </div>
        <button className="btn-icon btn-outline" onClick={() => setIsOpen(false)}><X size={18} /></button>
      </div>

      <div style={messagesStyle}>
        {messages.map((msg, i) => (
          <div key={i} style={{...messageBubbleStyle, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}}>
            <div style={{fontSize: '12px', marginBottom: '4px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '4px'}}>
              {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
              {msg.role === 'user' ? 'You' : 'AI'}
            </div>
            <div style={{fontSize: '14px'}}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div style={{...messageBubbleStyle, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)'}}>
            <div className="typing-indicator">...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={inputContainerStyle}>
        <input 
          type="text" 
          className="input-field" 
          style={{marginBottom: 0, borderRadius: '8px 0 0 8px', borderRight: 'none'}} 
          placeholder="Ask for recommendations..." 
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="btn" style={{borderRadius: '0 8px 8px 0'}} disabled={isLoading}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

const floatingBtnStyle = {
  position: 'absolute', bottom: '30px', left: '30px', width: '60px', height: '60px', borderRadius: '50%', padding: 0, zIndex: 20
};

const chatPanelStyle = {
  position: 'absolute', bottom: '30px', left: '30px', width: '350px', height: '500px',
  display: 'flex', flexDirection: 'column', zIndex: 20, overflow: 'hidden'
};

const headerStyle = {
  padding: '16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)'
};

const messagesStyle = {
  flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px'
};

const messageBubbleStyle = {
  maxWidth: '80%', padding: '12px', borderRadius: '12px'
};

const inputContainerStyle = {
  padding: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', backgroundColor: 'rgba(0,0,0,0.2)'
};
