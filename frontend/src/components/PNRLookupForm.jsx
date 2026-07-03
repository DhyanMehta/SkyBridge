import { useState } from 'react';

export default function PNRLookupForm({ onResult }) {
  const [pnr, setPnr] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pnr: pnr.trim(), full_name: fullName.trim() }),
      });

      if (response.status === 404) {
        setError("We couldn't find that booking. Please check your PNR and full name, or talk to an agent.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      onResult(data);
    } catch (err) {
      setError("An unexpected error occurred. Please try again or talk to an agent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded border border-skybridge-border w-full">
      <h2 className="font-display text-xl font-bold mb-6 text-skybridge-textMain">Check Flight Status</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-skybridge-textMain" htmlFor="pnr">
            Booking Reference (PNR)
          </label>
          <p className="text-xs text-skybridge-textMuted mb-2 mt-1">Your 6-character booking reference, found in your confirmation email</p>
          <input
            id="pnr"
            type="text"
            className="w-full px-4 py-3 border border-skybridge-border rounded bg-white text-base focus:ring-2 focus:ring-offset-0 focus:ring-skybridge-navy focus:border-skybridge-navy outline-none transition-colors uppercase"
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
            placeholder="e.g. AB12CD"
            required
            maxLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-skybridge-textMain mb-2" htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            className="w-full px-4 py-3 border border-skybridge-border rounded bg-white text-base focus:ring-2 focus:ring-offset-0 focus:ring-skybridge-navy focus:border-skybridge-navy outline-none transition-colors"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Riya Mehta"
            required
          />
        </div>
        
        {error && (
          <div className="bg-status-cancelledBg p-4 rounded border border-[#FECACA] mt-6">
            <p className="text-status-cancelledText text-sm mb-3">{error}</p>
            <button 
              type="button" 
              className="text-sm font-medium text-status-cancelledText hover:underline flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-status-cancelledText rounded px-1 -ml-1"
              onClick={() => alert("Connecting to human agent...")}
            >
              Talk to an Agent
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-skybridge-navy hover:bg-[#152a45] text-white font-medium py-3 rounded transition-colors disabled:opacity-70 flex justify-center items-center mt-8 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skybridge-navy"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking your booking...
            </>
          ) : (
            "Check Flight Status"
          )}
        </button>
      </form>
    </div>
  );
}
