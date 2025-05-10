import React from 'react';
import { Message } from '../types/chat';
import ChatMessage from './ChatMessage';
import LoadingIndicator from './LoadingIndicator';

interface ChatStatus {
  type: 'idle' | 'typing' | 'processing';
  message?: string;
}

interface ChatMessagesProps {
  messages: Message[];
  streamedMessage: Message | null;
  status: ChatStatus;
  onExampleClick: (question: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  streamedMessage,
  status,
  onExampleClick
}) => {
  if (messages.length === 0 && !streamedMessage && status.type === 'idle') {
    const exampleQuestions = [
      "What's happening with climate change?",
      "Latest tech innovations in AI?",
      "What are the major global conflicts right now?"
    ];

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-2xl">
        <h3 className="text-h3 font-semibold text-gray-dark mb-lg">
          Welcome to NewsChat AI!
        </h3>
        <p className="text-body text-gray-medium mb-xl max-w-md">
          I'm your AI-powered news assistant. Ask me anything about recent news
          and I'll provide information based on articles I've read.
        </p>
        <div className="bg-gray-off p-lg rounded-card border border-gray-light max-w-md">
          <p className="text-small text-gray-dark font-medium mb-md">Try asking:</p>
          <ul className="text-small text-gray-medium space-y-md">
            {exampleQuestions.map((question, index) => (
              <li 
                key={index}
                onClick={() => onExampleClick(question)}
                className="bg-primary-white p-md rounded-button border border-gray-light hover:bg-gray-off cursor-pointer transition-colors hover:border-gray-medium"
              >
                "{question}"
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-lg space-y-xl">
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
      
      {streamedMessage && (
        <ChatMessage message={streamedMessage} isStreaming={true} />
      )}
      
      {status.type !== 'idle' && (
        <div className="flex items-center space-x-md text-gray-medium">
          <LoadingIndicator />
          <span className="text-small">{status.message || 'Thinking...'}</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;