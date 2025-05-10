import React, { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, MessageSquare } from 'lucide-react';

interface Session {
  sessionId: string;
  lastMessage: string;
  timestamp: string;
}

interface SessionSidebarProps {
  sessions: Session[];
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  isOpen,
  onClose,
  isLoading = false
}) => {
  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('session-sidebar');
      const menuButton = document.getElementById('menu-button');
      if (isOpen && sidebar && !sidebar.contains(e.target as Node) && menuButton && !menuButton.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-20 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div
        id="session-sidebar"
        className={`fixed top-0 left-0 h-full w-96 bg-white shadow-2xl transform transition-all duration-300 ease-in-out z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-lg bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Chat History</h2>
          <button
            onClick={onClose}
            className="p-sm hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close sidebar"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            <p className="mt-md">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-lg text-center">
            <MessageSquare size={32} className="mb-md opacity-50" />
            <p className="text-lg font-medium">No Chat Sessions</p>
            <p className="mt-sm text-sm">Start a new conversation to begin chatting</p>
          </div>
        ) : (
          <div className="p-md space-y-md">
            {sessions.map((session) => (
              <button
                key={session.sessionId}
                onClick={() => onSessionSelect(session.sessionId)}
                className={`w-full text-left p-lg rounded-xl transition-all duration-200 hover:shadow-md ${
                  session.sessionId === currentSessionId
                    ? 'bg-blue-50 border-blue-200 border text-gray-800'
                    : 'hover:bg-gray-50 text-gray-600 border border-gray-100'
                }`}
              >
                <div className="flex items-center gap-sm mb-xs">
                  <MessageSquare size={16} className={session.sessionId === currentSessionId ? 'text-blue-500' : 'text-gray-400'} />
                  <span className="text-small font-medium">
                    {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-small line-clamp-2 opacity-80">{session.lastMessage}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SessionSidebar; 