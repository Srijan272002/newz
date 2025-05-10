import React from 'react';
import { Message } from '../types/chat';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start mb-lg ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`${
          isUser
            ? 'glass-effect-dark text-primary-white rounded-card py-lg px-xl max-w-[80%]'
            : 'glass-effect rounded-card py-lg px-xl max-w-[80%] text-gray-dark'
        } ${isStreaming ? 'animate-pulse' : ''}`}
      >
        <div className="flex items-center space-x-sm mb-md">
          {!isUser && (
            <Bot size={16} className="text-black/70" />
          )}
          {isUser && (
            <User size={16} className="text-white/90" />
          )}
          <span className={`text-small ${isUser ? 'text-white/70' : 'text-black/50'}`}>
            {isUser ? 'You' : 'NewsChat AI'}
          </span>
        </div>
        
        <div className="whitespace-pre-wrap text-body leading-relaxed">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse"></span>
          )}
        </div>
        
        <div className={`text-small mt-md text-right ${isUser ? 'text-white/50' : 'text-black/40'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;