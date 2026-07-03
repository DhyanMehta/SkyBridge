import { useState } from 'react';
import PNRLookupForm from './components/PNRLookupForm';
import StatusResult from './components/StatusResult';

function App() {
  const [resultData, setResultData] = useState(null);

  return (
    <div className="min-h-screen bg-skybridge-bg flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-skybridge-border sticky top-0 z-10">
        <div className="max-w-[640px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="font-display font-bold text-xl text-skybridge-navy tracking-tight">SkyBridge</span>
          <button 
            onClick={() => alert("Connecting to human agent...")}
            className="text-sm font-medium text-skybridge-textMuted hover:text-skybridge-textMain transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skybridge-navy rounded px-1"
          >
            Talk to an Agent
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[640px] mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col">
        {!resultData ? (
          <div className="animate-fade-in-up">
            <div className="mb-10">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-skybridge-textMain mb-3 tracking-tight">
                Manage your booking
              </h1>
              <p className="text-base text-skybridge-textMuted max-w-lg">
                Enter your booking details to view your flight status and manage your travel options.
              </p>
            </div>
            <PNRLookupForm onResult={setResultData} />
          </div>
        ) : (
          <div className="animate-fade-in-up w-full">
            <StatusResult data={resultData} onBack={() => setResultData(null)} />
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="w-full max-w-[640px] mx-auto px-4 sm:px-6 py-8 text-skybridge-textMuted text-xs">
        &copy; 2026 SkyJet Airways
      </footer>
    </div>
  );
}

export default App;
