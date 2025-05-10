import React from 'react';
import { Newspaper } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="glass-effect border-b border-white/20 sticky top-0 z-10">
      <nav className="max-w-container mx-auto px-lg py-md flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <div className="glass-effect-dark p-sm rounded-button">
            <Newspaper className="h-5 w-5 text-white/90" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-black/80">
            NewsChat AI
          </h1>
        </div>
        <div className="text-small font-medium text-black/60 hidden md:block">
          Your AI-powered news assistant
        </div>
      </nav>
    </header>
  );
};

export default Header;