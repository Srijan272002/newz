import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex space-x-xs">
      <div className="w-2 h-2 bg-primary-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-primary-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-primary-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
};

export default LoadingIndicator;