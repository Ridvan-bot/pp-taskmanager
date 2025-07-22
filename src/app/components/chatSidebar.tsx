import React, { useState, useEffect } from 'react';
import { ChatMessage } from '@/types';

interface ChatSidebarProps {
  onClose: () => void;
}

interface Tool {
  name: string;
  description?: string;
  parameters?: unknown;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
    // On mount: preload available AI/MCP tools/functions
    useEffect(() => {
      const preloadTools = async () => {
        try {
          const response = await fetch('/api/tools', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Expected JSON but got:', text.substring(0, 200));
            throw new Error('Response is not JSON');
          }
          
          const data = await response.json();
          // Spara hela tool-objekten istället för bara namnen
          const allTools = data.tools?.functions || [];
          setTools(allTools);
        } catch (error) {
          console.error('Error preloading tools:', error);
          // Set empty tools array as fallback
          setTools([]);
        }
      };
  
      preloadTools();
    }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('/api/chat-mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          functions: tools,
        }),
      });
      const data = await response.json();
      const botContent = data.choices?.[0]?.message?.content || data.generated_text || 'No response';
      setMessages(prev => [...prev, { role: 'assistant', content: botContent }]);
    } catch (error) {
      console.error('Error from MCP client:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error from MCP client.' }]);
    }
    setLoading(false);
  };

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: 370,
        background: "rgba(30,41,59,0.98)",
        borderLeft: "none",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        boxShadow: "-8px 0 24px 0 rgba(59,130,246,0.10)",
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 20,
          borderBottom: "1px solid #334155",
          background: "rgba(30,41,59,0.98)",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: 0.5,
          }}
        >
          💬 Chat
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 28,
            cursor: "pointer",
            borderRadius: 8,
            transition: "background 0.2s",
          }}
          aria-label="Close chat"
          onMouseOver={(e) => (e.currentTarget.style.background = "#334155")}
          onMouseOut={(e) => (e.currentTarget.style.background = "none")}
        >
          ×
        </button>
      </div>
      <div
        style={{
          flex: 1,
          padding: 20,
          color: "#fff",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background: msg.role === "user" ? "#3b82f6" : "rgba(59,130,246,0.10)",
              color: "#fff",
              borderRadius: 16,
              padding: "10px 16px",
              marginBottom: 4,
              maxWidth: "80%",
              fontSize: 15,
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div style={{ color: "#fff" }}>...</div>}
      </div>
      <div
        style={{
          padding: 20,
          borderTop: "1px solid #334155",
          background: "rgba(30,41,59,0.98)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#1e293b",
            borderRadius: 16,
            boxShadow: "0 2px 8px 0 rgba(59,130,246,0.04)",
            padding: "6px 12px",
          }}
        >
          <input
            type="text"
            placeholder="Skriv ett meddelande..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#fff",
              fontSize: 15,
              borderRadius: 12,
            }}
          />
          <button
            onClick={handleSend}
            style={{
              marginLeft: 8,
              background: "linear-gradient(90deg,#3b82f6 0%,#60a5fa 100%)",
              border: "none",
              color: "#fff",
              borderRadius: 12,
              padding: "8px 16px",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 2px 8px 0 rgba(59,130,246,0.10)",
              transition: "background 0.2s",
            }}
          >
            Skicka
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
