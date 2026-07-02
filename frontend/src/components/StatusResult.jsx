import ActionPanel from './ActionPanel';

export default function StatusResult({ data, onBack }) {
  const { flight, disruption_type, summary, decision, action_result, escalate_reason } = data;

  const getStatusColor = (status) => {
    switch (status) {
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'DELAYED_LONG': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DELAYED_SHORT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ON_TIME': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ');
  };

  return (
    <div className="max-w-3xl w-full mx-auto">
      <button 
        onClick={onBack}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-6 flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to search
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Flight Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">
                {flight.airline} &bull; Flight {flight.flight_id}
              </div>
              <h2 className="text-3xl font-bold text-slate-800">
                {flight.origin} <span className="text-slate-400 font-light mx-2">&rarr;</span> {flight.destination}
              </h2>
            </div>
            
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(disruption_type)}`}>
              {getStatusLabel(disruption_type)}
            </span>
          </div>
          
          {/* Summary Box */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Agent Summary</h3>
            <p className="text-slate-700 text-lg leading-relaxed">{summary}</p>
          </div>
        </div>

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
          <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">
              Need more help? Our customer support team is available 24/7.
            </p>
            <button 
              onClick={() => alert("Connecting to human agent...")}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm whitespace-nowrap bg-white border border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
            >
              Talk to an Agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
