import { useState } from 'react';
import AgentHandoffModal from './AgentHandoffModal';

export default function ActionPanel({ decision, actionResult, escalateReason, pnr, fullName, disruptionType }) {
  const [confirmedPnr, setConfirmedPnr] = useState(null);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  const handleConfirm = (flightId) => {
    // Generate a fake PNR like XYZ789
    const fakePnr = Math.random().toString(36).substring(2, 8).toUpperCase();
    setConfirmedPnr({ pnr: fakePnr, flightId });
  };

  if (decision === 'REBOOK') {
    if (confirmedPnr) {
      return (
        <div className="bg-status-onTimeBg border border-status-onTimeText/20 rounded p-6">
          <h3 className="text-status-onTimeText font-bold text-lg mb-2">Flight Confirmed</h3>
          <p className="text-status-onTimeText mb-6">
            You are successfully rebooked on <span className="font-bold">{confirmedPnr.flightId}</span>.
          </p>
          <div className="bg-white rounded px-4 py-3 border border-status-onTimeText/20 inline-block">
            <span className="text-sm text-status-onTimeText/80 block mb-1">New Booking Reference</span>
            <span className="text-xl font-mono font-bold text-status-onTimeText">{confirmedPnr.pnr}</span>
          </div>
        </div>
      );
    }

    const { alternatives, message, refund_also_available } = actionResult;
    return (
      <div>
        <h3 className="font-display font-bold text-xl text-skybridge-textMain mb-4">Available Alternate Flights</h3>
        {message && <p className="text-skybridge-textMain mb-6">{message}</p>}
        
        <div className="space-y-4">
          {alternatives?.map((alt, idx) => {
            const departureTime = new Date(alt.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={idx} className="bg-white border border-skybridge-border rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-skybridge-textMuted font-medium mb-1">Flight {alt.flight_id} &bull; {alt.class.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-xl font-bold text-skybridge-textMain mb-1">{departureTime}</div>
                  <div className="text-skybridge-textMuted">{alt.origin} &rarr; {alt.destination}</div>
                </div>
                <button 
                  onClick={() => handleConfirm(alt.flight_id)}
                  className="bg-skybridge-navy hover:bg-[#152a45] text-white font-medium py-3 px-6 rounded transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skybridge-navy"
                >
                  Confirm this flight
                </button>
              </div>
            );
          })}
        </div>
        
        {refund_also_available && (
          <div className="mt-6 p-4 bg-skybridge-bg rounded border border-skybridge-border text-sm text-skybridge-textMain text-center">
            Prefer not to travel? You are also eligible for a full refund. <button className="text-skybridge-navy font-medium hover:underline ml-1 focus:outline-none">Claim refund</button>
          </div>
        )}
      </div>
    );
  }

  if (decision === 'REFUND') {
    const { eligible, reference_id, reason } = actionResult;
    return (
      <div>
        <div className={`rounded p-6 border ${eligible ? 'bg-status-onTimeBg border-status-onTimeText/20' : 'bg-skybridge-bg border-skybridge-border'}`}>
          <h3 className={`font-bold text-lg mb-2 ${eligible ? 'text-status-onTimeText' : 'text-skybridge-textMain'}`}>
            Refund Eligibility
          </h3>
          <p className={eligible ? 'text-status-onTimeText/90' : 'text-skybridge-textMain'}>{reason}</p>
          
          {eligible && reference_id && (
            <div className="mt-6 bg-white rounded px-4 py-3 border border-status-onTimeText/20 inline-block">
              <span className="text-sm text-status-onTimeText/80 block mb-1">Refund Reference ID</span>
              <span className="text-xl font-mono font-bold text-status-onTimeText">{reference_id}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (decision === 'WAIT') {
    return (
      <div className="bg-skybridge-bg border border-skybridge-border rounded p-6">
        <div className="flex items-start gap-4">
          <div className="text-skybridge-navy mt-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h3 className="text-skybridge-textMain font-bold text-lg mb-1">Status Update</h3>
            <p className="text-skybridge-textMain">{actionResult.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (decision === 'ESCALATE') {
    return (
      <div className="bg-status-escalateBg border border-status-escalateText/20 rounded p-6">
        <h3 className="text-status-escalateText font-bold text-xl mb-3">This case needs a specialist</h3>
        <p className="text-status-escalateText/90 mb-2">{actionResult.message}</p>
        {escalateReason && (
          <p className="text-status-escalateText text-sm mb-6 bg-white/60 rounded px-4 py-2 border border-status-escalateText/10">
            <span className="font-semibold">Reason:</span> {escalateReason}
          </p>
        )}
        
        <button 
          onClick={() => setIsAgentModalOpen(true)}
          className="bg-skybridge-navy hover:bg-[#152a45] text-white font-medium py-3 px-8 rounded transition-colors w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skybridge-navy"
        >
          Talk to an Agent Now
        </button>

        <AgentHandoffModal 
          isOpen={isAgentModalOpen} 
          onClose={() => setIsAgentModalOpen(false)} 
          context={{ pnr, fullName, disruptionType, escalateReason }}
        />
      </div>
    );
  }

  return null;
}
