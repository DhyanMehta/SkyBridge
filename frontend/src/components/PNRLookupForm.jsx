import { useState } from 'react';

export default function PNRLookupForm({ onResult }) {
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pnr: pnr.trim(), last_name: lastName.trim() }),
      });

      if (response.status === 404) {
        setError("We couldn't find that booking. Please check your PNR and last name, or talk to an agent.");
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
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-slate-800">Check Flight Status</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="pnr">
            Booking Reference (PNR)
          </label>
          <input
            id="pnr"
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
            placeholder="e.g. AB12CD"
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
            required
            maxLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="lastName">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. Mehta"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 mt-4">
            <p className="text-red-700 text-sm mb-3">{error}</p>
            <button 
              type="button" 
              className="text-sm font-medium text-red-700 hover:text-red-800 underline flex items-center"
              onClick={() => alert("Connecting to agent...")}
            >
              Talk to an Agent
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70 flex justify-center items-center mt-6"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "Check Flight Status"
          )}
        </button>
      </form>
    </div>
  );
}
