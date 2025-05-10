import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import SessionSidebar from './SessionSidebar';
import { Message } from '../types/chat';
import { AlertCircle, Menu } from 'lucide-react';
import LoadingIndicator from './LoadingIndicator';
import config from '../config';

// Use configuration values
const SOCKET_URL = config.SOCKET_URL;
const API_BASE_URL = config.API_BASE_URL;
const SOCKET_OPTIONS = config.SOCKET_OPTIONS;

interface ChatStatus {
  type: 'idle' | 'typing' | 'processing';
  message?: string;
}

interface Session {
  sessionId: string;
  lastMessage: string;
  timestamp: string;
}

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [streamedMessage, setStreamedMessage] = useState<Message | null>(null);
  const [status, setStatus] = useState<ChatStatus>({ type: 'idle' });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      setIsHistoryLoading(true);
      const response = await fetchWithTimeout(`${API_BASE_URL}/session`);
      const data = await response.json();
      setSessions(data.sessions || []); // Ensure sessions is always an array
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]); // Initialize with empty array on error
      setError('No chat sessions available.');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Initialize socket connection and session
  useEffect(() => {
    // Try to get existing session ID from local storage
    const storedSessionId = localStorage.getItem('chatSessionId');
    const currentSessionId = storedSessionId || uuidv4();
    
    if (!storedSessionId) {
      localStorage.setItem('chatSessionId', currentSessionId);
    }
    
    setSessionId(currentSessionId);
    
    // Initialize socket connection with robust configuration
    socketRef.current = io(SOCKET_URL, {
      ...SOCKET_OPTIONS,
      query: { sessionId: currentSessionId },
    });
    
    // Socket event listeners
    socketRef.current.on('connect', () => {
      console.log('Connected to server with socket ID:', socketRef.current?.id);
      console.log('Using session ID:', currentSessionId);
      setError(null);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      console.error('Connection details:', {
        url: SOCKET_URL,
        options: SOCKET_OPTIONS,
        sessionId: currentSessionId
      });
      setError('Unable to connect to chat server. The server might be temporarily unavailable. Please try again later.');
    });

    socketRef.current.on('connect_timeout', () => {
      console.error('Socket connection timeout');
      setError('Connection timed out. Please check your internet connection and try again.');
    });

    socketRef.current.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Attempting to reconnect... (Attempt ${attemptNumber})`);
      setError(`Attempting to reconnect to server... (Attempt ${attemptNumber})`);
    });

    socketRef.current.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      setError('Unable to reconnect to the server. Please refresh the page or try again later.');
    });

    socketRef.current.on('session', (data) => {
      setSessionId(data.sessionId);
      localStorage.setItem('chatSessionId', data.sessionId);
    });
    
    socketRef.current.on('message', (message: Message) => {
      console.log('Received message from server:', message);
      if (message.isComplete) {
        setStreamedMessage(null);
        setMessages((prevMessages) => [...prevMessages, message]);
        setIsLoading(false);
        // Refresh sessions after new message
        fetchSessions();
      }
    });
    
    socketRef.current.on('message-stream', (message: Message) => {
      console.log('Received message stream:', message);
      setStreamedMessage(message);
    });
    
    socketRef.current.on('status', (newStatus: ChatStatus) => {
      setStatus(newStatus);
    });
    
    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
      setError('An error occurred with the chat connection. Please try again later.');
      setIsLoading(false);
      setStatus({ type: 'idle' });
    });
    
    // Fetch chat history and sessions
    fetchChatHistory(currentSessionId);
    fetchSessions();
    
    // Cleanup socket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedMessage]);
  
  // Fetch chat history from API
  const fetchChatHistory = async (sid: string) => {
    setIsHistoryLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/chat/${sid}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError('Unable to load chat history. Please try again later.');
    } finally {
      setIsHistoryLoading(false);
    }
  };
  
  // Send message to server
  const sendMessage = (content: string) => {
    if (!content.trim() || !socketRef.current) return;
    
    console.log('Sending message:', content);
    
    // Add user message to messages array
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);
    
    // Send message to server
    socketRef.current.emit('message', {
      message: content,
      sessionId
    });
    console.log('Message emitted to server with sessionId:', sessionId);
  };
  
  // Clear chat history
  const clearChat = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      setMessages([]);
      setStreamedMessage(null);
      setError(null);
      fetchSessions();
    } catch (error) {
      console.error('Error clearing chat:', error);
      setError('Failed to clear chat history. Please try again.');
    }
  };
  
  // Create new session
  const createNewSession = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('chatSessionId');
      
      // Generate new session ID
      const newSessionId = uuidv4();
      localStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
      
      // Reconnect socket with new session ID
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = io(SOCKET_URL, {
          ...SOCKET_OPTIONS,
          query: { sessionId: newSessionId },
        });
      }
      
      // Clear messages
      setMessages([]);
      setStreamedMessage(null);
      setError(null);
      fetchSessions();
    } catch (error) {
      console.error('Error creating new session:', error);
      setError('Failed to create new session. Please try again.');
    }
  };

  // Switch to a different session
  const switchSession = async (newSessionId: string) => {
    try {
      localStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
      
      // Reconnect socket with new session ID
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = io(SOCKET_URL, {
          ...SOCKET_OPTIONS,
          query: { sessionId: newSessionId },
        });
      }
      
      // Fetch chat history for new session
      await fetchChatHistory(newSessionId);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Error switching session:', error);
      setError('Failed to switch session. Please try again.');
    }
  };

  const retryConnection = () => {
    if (socketRef.current) {
      socketRef.current.connect();
      fetchChatHistory(sessionId);
    }
  };
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Enhanced error handling for fetch requests
  const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
    const timeout = 8000; // 8 seconds timeout
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      // Ensure no double slashes in URL
      const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
      
      const response = await fetch(cleanUrl, {
        ...options,
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(id);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Endpoint not found: ${cleanUrl}. Please ensure the backend server is running and the endpoint exists.`);
        }
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(id);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please check your connection and try again.');
        }
        throw error;
      }
      throw new Error('An unknown error occurred while connecting to the server.');
    }
  };

  return (
    <div className="flex h-full">
      <SessionSidebar
        sessions={sessions}
        currentSessionId={sessionId}
        onSessionSelect={switchSession}
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        isLoading={isHistoryLoading}
      />
      
      <div className={`flex flex-col h-full w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 ${
        isSidebarOpen ? 'opacity-50' : 'opacity-100'
      }`}>
        <div className="flex items-center p-md border-b bg-white/90">
          <button
            id="menu-button"
            onClick={toggleSidebar}
            className={`p-sm hover:bg-gray-100 rounded-full transition-colors mr-md ${
              isSidebarOpen ? 'bg-gray-100' : ''
            }`}
            aria-label={isSidebarOpen ? "Close session sidebar" : "Open session sidebar"}
          >
            <Menu size={20} className={`text-gray-600 transform transition-transform ${
              isSidebarOpen ? 'rotate-90' : ''
            }`} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">NewsChat AI</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-lg">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500 mr-md" />
              <span className="text-gray-700">{error}</span>
            </div>
            <button
              onClick={retryConnection}
              className="mt-md text-small text-gray-500 hover:text-gray-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isHistoryLoading ? (
            <div className="flex justify-center items-center h-full p-lg">
              <LoadingIndicator />
            </div>
          ) : (
            <ChatMessages
              messages={messages}
              streamedMessage={streamedMessage}
              status={status}
              onExampleClick={(question) => {
                sendMessage(question);
              }}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t bg-white/90">
          <ChatInput
            onSendMessage={sendMessage}
            isLoading={isLoading}
            onClearChat={clearChat}
            onNewSession={createNewSession}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;