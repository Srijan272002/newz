// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ChatContainer from './components/ChatContainer';
import Header from './components/Header';

function App() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 max-w-[1200px]">
        <ChatContainer />
      </main>
      <footer className="glass-effect border-t border-white/20 py-md">
        <div className="container mx-auto px-4 md:px-6 text-center text-small text-gray-medium/70 max-w-[1200px]">
          News RAG Chatbot &copy; {new Date().getFullYear()} - Powered by Google Gemini
        </div>
      </footer>
    </div>
  );
}

export default App;