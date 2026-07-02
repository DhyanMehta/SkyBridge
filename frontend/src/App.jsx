import { useState } from 'react';
import PNRLookupForm from './components/PNRLookupForm';
import StatusResult from './components/StatusResult';

function App() {
  const [resultData, setResultData] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">SkyBridge</span>
          </div>
          <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            Help Center
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center">
        {!resultData ? (
          <>
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Flight Disruption Recovery
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Enter your booking details below to view your flight status and manage your travel options instantly.
              </p>
            </div>
            <PNRLookupForm onResult={setResultData} />
          </>
        ) : (
          <StatusResult data={resultData} onBack={() => setResultData(null)} />
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm">
        &copy; 2026 SkyBridge Airways MVP.
      </footer>
    </div>
  );
}

export default App;
