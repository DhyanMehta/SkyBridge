import { useState } from 'react';

export default function ActionPanel({ decision, actionResult, escalateReason }) {
  const [confirmedPnr, setConfirmedPnr] = useState(null);

  const handleConfirm = (flightId) => {
    // Generate a fake PNR like XYZ789
    const fakePnr = Math.random().toString(36).substring(2, 8).toUpperCase();
    setConfirmedPnr({ pnr: fakePnr, flightId });
  };

  if (decision === 'REBOOK') {
    if (confirmedPnr) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-6">
          <h3 className="text-green-800 font-semibold text-lg mb-2">Flight Confirmed!</h3>
          <p className="text-green-700 mb-4">
            You are successfully rebooked on <span className="font-bold">{confirmedPnr.flightId}</span>.
          </p>
          <div className="bg-white rounded-lg px-4 py-3 border border-green-100 inline-block">
            <span className="text-sm text-slate-500 block mb-1">New Booking Reference</span>
            <span className="text-xl font-mono font-bold text-slate-800">{confirmedPnr.pnr}</span>
          </div>
        </div>
      );
    }

    const { alternatives, message, refund_also_available } = actionResult;
    return (
      <div className="mt-6">
        <h3 className="font-semibold text-lg text-slate-800 mb-4">Available Alternate Flights</h3>
        {message && <p className="text-slate-600 mb-4">{message}</p>}
        
        <div className="space-y-4">
          {alternatives?.map((alt, idx) => {
            const departureTime = new Date(alt.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-500 font-medium mb-1">Flight {alt.flight_id} &bull; {alt.class.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-xl font-bold text-slate-800">{departureTime}</div>
                  <div className="text-slate-600">{alt.origin} &rarr; {alt.destination}</div>
                </div>
                <button 
                  onClick={() => handleConfirm(alt.flight_id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors whitespace-nowrap"
                >
                  Confirm this flight
                </button>
              </div>
            );
          })}
        </div>
        
        {refund_also_available && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600 text-center">
            Prefer not to travel? You are also eligible for a full refund. <button className="text-blue-600 font-medium hover:underline ml-1">Claim refund</button>
          </div>
        )}
      </div>
    );
  }

  if (decision === 'REFUND') {
    const { eligible, reference_id, reason } = actionResult;
    return (
      <div className="mt-6">
        <div className={`rounded-xl p-6 border ${eligible ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className={`font-semibold text-lg mb-2 ${eligible ? 'text-green-800' : 'text-slate-800'}`}>
            Refund Eligibility
          </h3>
          <p className={eligible ? 'text-green-700' : 'text-slate-600'}>{reason}</p>
          
          {eligible && reference_id && (
            <div className="mt-4 bg-white rounded-lg px-4 py-3 border border-green-100 inline-block">
              <span className="text-sm text-slate-500 block mb-1">Refund Reference ID</span>
              <span className="text-lg font-mono font-bold text-slate-800">{reference_id}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (decision === 'WAIT') {
    return (
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 text-blue-600 rounded-full p-2 mt-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h3 className="text-blue-800 font-semibold text-lg mb-1">Status Update</h3>
            <p className="text-blue-700">{actionResult.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (decision === 'ESCALATE') {
    return (
      <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-6">
        <h3 className="text-orange-800 font-bold text-xl mb-3">This case needs a specialist</h3>
        <p className="text-orange-700 mb-6">{actionResult.message || escalateReason}</p>
        
        <button 
          onClick={() => alert("Connecting to human agent...")}
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-8 rounded-lg transition-colors w-full sm:w-auto shadow-sm"
        >
          Talk to an Agent Now
        </button>
      </div>
    );
  }

  return null;
}
