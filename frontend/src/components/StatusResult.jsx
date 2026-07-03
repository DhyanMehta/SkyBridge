import ActionPanel from './ActionPanel';

export default function StatusResult({ data, onBack }) {
  const { flight, disruption_type, summary, decision, action_result, escalate_reason } = data;

  const getStatusColor = (status) => {
    switch (status) {
      case 'CANCELLED': return 'bg-status-cancelledBg text-status-cancelledText border-status-cancelledText/20';
      case 'DELAYED_LONG': return 'bg-status-delayedLongBg text-status-delayedLongText border-status-delayedLongText/20';
      case 'DELAYED_SHORT': return 'bg-status-delayedShortBg text-status-delayedShortText border-status-delayedShortText/20';
      case 'ON_TIME': return 'bg-status-onTimeBg text-status-onTimeText border-status-onTimeText/20';
      default: return 'bg-skybridge-bg text-skybridge-textMain border-skybridge-border';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ');
  };

  return (
    <div className="w-full">
      <button 
        onClick={onBack}
        className="text-skybridge-textMuted hover:text-skybridge-textMain text-sm font-medium mb-6 flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skybridge-navy rounded px-1 -ml-1"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to search
      </button>

      <div className="bg-white rounded border border-skybridge-border overflow-hidden">
        
        {/* Digital Itinerary Header */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between sm:justify-start gap-4 mb-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-skybridge-navy">
                  Flight {flight.flight_id}
                </h2>
                <span className="font-mono text-sm px-2 py-1 bg-skybridge-bg border border-skybridge-border rounded text-skybridge-textMain">
                  Ref: {data.pnr}
                </span>
              </div>
              <div className="text-base text-skybridge-textMuted">
                {flight.origin} <span className="mx-2">&rarr;</span> {flight.destination}
              </div>
            </div>
            
            <span className={`px-3 py-1 rounded text-sm font-semibold border ${getStatusColor(disruption_type)} uppercase tracking-wider shrink-0`}>
              {getStatusLabel(disruption_type)}
            </span>
          </div>
          
          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-dashed border-skybridge-border">
            <p className="text-skybridge-textMain text-base leading-relaxed">
              {summary}
            </p>
          </div>
        </div>

        <div className="h-px w-full bg-skybridge-border"></div>

        {/* Action Panel Section */}
        <div className="p-6 sm:p-8 bg-white">
          <ActionPanel 
            decision={decision} 
            actionResult={action_result} 
            escalateReason={escalate_reason} 
          />
        </div>
        
        {/* Persistent Support Footer */}
        {decision !== 'ESCALATE' && (
          <div className="bg-skybridge-bg p-6 border-t border-skybridge-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-skybridge-textMuted text-sm">
              Need more help? Our team is available 24/7.
            </p>
            <button 
              onClick={() => alert("Connecting to human agent...")}
              className="text-skybridge-navy hover:text-skybridge-textMain font-medium text-sm whitespace-nowrap bg-white border border-skybridge-border hover:bg-skybridge-bg px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skybridge-navy"
            >
              Talk to an Agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
