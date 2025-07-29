import React, { useState, useEffect } from 'react';
import { ChatMessage } from '@/types';

interface ChatSidebarProps {
  onClose: () => void;
  selectedCustomer?: string;
  selectedProject?: string;
}

interface Tool {
  name: string;
  description?: string;
  parameters?: unknown;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onClose, selectedCustomer, selectedProject }) => {
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
    
    // Skapa kontext-meddelande med vald kund och projekt
    const contextMessages: ChatMessage[] = [];
    if (selectedCustomer || selectedProject) {
      let contextContent = "KONTEXT: ";
      if (selectedCustomer) {
        contextContent += `Användaren har valt kund: "${selectedCustomer}". `;
      }
      if (selectedProject) {
        contextContent += `Användaren har valt projekt: "${selectedProject}". `;
      }
      contextContent += "Om användaren vill skapa tasks eller arbeta med data för denna kund/projekt, använd dessa värden automatiskt om de inte specificerar annat.";
      
      contextMessages.push({ 
        role: 'system', 
        content: contextContent 
      });
    }
    
    const newMessages = [...messages, userMessage];
    const messagesWithContext = [...contextMessages, ...newMessages];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('/api/chat-mcp-vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messagesWithContext,
          functions: tools,
        }),
      });
      
      if (!response.ok) {
        // Hantera HTTP-fel (4xx, 5xx)
        await response.text();
        let errorMessage = '🚫 **Anslutningsfel**\n\nKunde inte nå AI-tjänsten. Kontrollera din internetanslutning och försök igen.';
        
        if (response.status === 429) {
          errorMessage = '⏱️ **För många förfrågningar**\n\nVänta en stund innan du försöker igen.';
        } else if (response.status >= 500) {
          errorMessage = '🔧 **Serverfel**\n\nServern har tekniska problem. Försök igen om en stund.';
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        return;
      }
      
      const data = await response.json();
      const botContent = data.choices?.[0]?.message?.content || data.generated_text || 'Inget svar mottaget från AI-tjänsten.';
      setMessages(prev => [...prev, { role: 'assistant', content: botContent }]);
    } catch (error) {
      console.error('Error from MCP client:', error);
      
      // Hantera nätverksfel och andra exceptions
      let errorMessage = '🌐 **Anslutningsfel**\n\nKunde inte ansluta till AI-tjänsten. Kontrollera din internetanslutning.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = '📡 **Nätverksfel**\n\nKontrollera din internetanslutning och försök igen.';
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    }
    setLoading(false);
  };

  return (
    <aside
      className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-hidden 
                 w-full sm:w-96 lg:w-[370px]
                 bg-slate-800/98 
                 sm:rounded-tl-3xl sm:rounded-bl-3xl
                 sm:shadow-[-8px_0_24px_0_rgba(59,130,246,0.10)]"
    >
      <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-600 bg-slate-800/98">
        <div>
          <span className="text-white font-bold text-lg sm:text-xl tracking-wide block">
            💬 Chat
          </span>
          {(selectedCustomer || selectedProject) && (
            <div className="text-xs text-slate-400 mt-1">
              {selectedCustomer && <span>Customer: {selectedCustomer}</span>}
              {selectedCustomer && selectedProject && <span> • </span>}
              {selectedProject && <span>Project: {selectedProject}</span>}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-white text-2xl sm:text-3xl cursor-pointer rounded-lg p-1 sm:p-2 
                     hover:bg-slate-600 transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Close chat"
        >
          ×
        </button>
      </div>
      <div className="flex-1 p-4 sm:p-5 text-white overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`
              ${msg.role === "user" ? "self-end bg-blue-500" : "self-start bg-blue-500/10"}
              text-white rounded-2xl p-3 sm:p-4 mb-1 max-w-[85%] sm:max-w-[80%] text-sm sm:text-base
              break-words
            `}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-white text-center py-2">...</div>}
      </div>
      <div className="p-4 sm:p-5 border-t border-slate-600 bg-slate-800/98">
        <div className="flex items-center bg-slate-700 rounded-2xl shadow-sm p-2 sm:p-3">
          <input
            type="text"
            placeholder="Skriv ett meddelande..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1 p-2 sm:p-3 border-none outline-none bg-transparent text-white 
                       text-sm sm:text-base rounded-xl placeholder-slate-400"
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-gradient-to-r from-blue-500 to-blue-400 border-none text-white 
                       rounded-xl px-3 py-2 sm:px-4 sm:py-2 font-semibold text-sm sm:text-base 
                       cursor-pointer shadow-sm hover:from-blue-600 hover:to-blue-500 
                       transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Skicka
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
