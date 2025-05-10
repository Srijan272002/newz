import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Plus } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onClearChat: () => void;
  onNewSession: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  onClearChat, 
  onNewSession 
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <div className="w-full p-lg">
      <div className="flex items-center justify-between mb-md">
        <button
          onClick={onClearChat}
          className="flex items-center gap-xs py-sm text-small text-gray-medium hover:text-gray-dark transition-colors group"
          aria-label="Clear chat"
        >
          <Trash2 size={16} className="group-hover:text-primary-black transition-colors" />
          Clear Chat
        </button>
        <button
          onClick={onNewSession}
          className="flex items-center gap-xs py-sm text-small text-gray-medium hover:text-gray-dark transition-colors group"
          aria-label="New session"
        >
          <Plus size={16} className="group-hover:text-primary-black transition-colors" />
          New Chat
        </button>
      </div>
      
      <div className="relative">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about the news..."
          className="w-full resize-none glass-input rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent min-h-[50px] max-h-[120px] text-body placeholder:text-gray-medium/70"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
            !message.trim() || isLoading
              ? 'text-gray-medium/50 cursor-not-allowed'
              : 'text-black/70 hover:text-black transition-colors'
          }`}
          aria-label="Send message"
        >
          <Send size={20} className={`transform rotate-45 ${isLoading ? 'opacity-30' : ''}`} />
        </button>
      </div>
      
      <p className="text-small text-gray-medium mt-sm text-center">
        Press Enter to send, Shift+Enter for a new line
      </p>
    </div>
  );
};

export default ChatInput;