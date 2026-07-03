import { useState, useEffect } from 'react';

export default function AgentHandoffModal({ isOpen, onClose, context }) {
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsConnecting(true);
      const timer = setTimeout(() => {
        setIsConnecting(false);
      }, 1000); // 1s transition
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pnr = context?.pnr;
  const fullName = context?.fullName;
  const reason = context?.escalateReason;
  const disruptionType = context?.disruptionType;
  
  const subject = pnr ? `SkyBridge Escalation - PNR: ${pnr}` : "SkyBridge Support Request";
  
  let body = "";
  if (pnr) body += `PNR: ${pnr}\n`;
  if (fullName) body += `Name: ${fullName}\n`;
  if (disruptionType) body += `Disruption: ${disruptionType}\n`;
  if (reason) body += `Escalation Reason: ${reason}\n`;
  
  const mailtoLink = `mailto:support@skyjet.example?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const telLink = `tel:+91-265-612-3100`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-skybridge-navy/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="bg-white rounded border border-skybridge-border shadow-xl w-full max-w-md relative z-10 overflow-hidden">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-skybridge-textMuted hover:text-skybridge-textMain focus:outline-none focus:ring-2 focus:ring-skybridge-navy rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {isConnecting ? (
            <div className="flex flex-col items-center justify-center py-10">
              <svg className="animate-spin h-10 w-10 text-skybridge-navy mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-skybridge-textMain font-medium text-center">Connecting you to a SkyJet support agent...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="font-display text-2xl font-bold text-skybridge-navy mb-2">Contact Support</h2>
              <p className="text-skybridge-textMuted text-sm mb-6">Our specialists are ready to assist you.</p>

              {reason && (
                <div className="bg-skybridge-bg p-4 rounded border border-skybridge-border mb-6">
                  <p className="text-sm font-semibold text-skybridge-textMain mb-1">Here's what we'll tell the agent:</p>
                  <p className="text-sm text-skybridge-textMuted leading-relaxed">{reason}</p>
                </div>
              )}

              <div className="space-y-4">
                <a 
                  href={mailtoLink}
                  className="flex items-center gap-4 p-4 border border-skybridge-border rounded hover:bg-skybridge-bg transition-colors focus:outline-none focus:ring-2 focus:ring-skybridge-navy"
                >
                  <div className="bg-skybridge-navy/10 p-2.5 rounded text-skybridge-navy shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                    <div className="font-bold text-skybridge-textMain">Email Support</div>
                    <div className="text-sm text-skybridge-textMuted">support@skyjet.example</div>
                  </div>
                </a>

                <a 
                  href={telLink}
                  className="flex items-center gap-4 p-4 border border-skybridge-border rounded hover:bg-skybridge-bg transition-colors focus:outline-none focus:ring-2 focus:ring-skybridge-navy"
                >
                  <div className="bg-skybridge-navy/10 p-2.5 rounded text-skybridge-navy shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <div>
                    <div className="font-bold text-skybridge-textMain">Call Support</div>
                    <div className="text-sm text-skybridge-textMuted">+91-265-612-3100</div>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
