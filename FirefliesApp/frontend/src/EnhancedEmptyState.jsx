import { Calendar, CalendarPlus, Filter, Search, Users, Zap, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';

export default function EnhancedEmptyState({ 
  hasMeetings, searchTerm, filter, selectedCategory, onScheduleMeeting, onClearFilters 
}) {
  if (hasMeetings) {
    // Has meetings but none match current filters
    return (
      <div className="text-center py-20 bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/30">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Filter className="text-slate-400" size={32} />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-4">No meetings match your filters</h3>
          
          <div className="space-y-3 text-slate-300 mb-8">
            {searchTerm && (
              <p>No meetings found for <span className="font-medium text-blue-400">"{searchTerm}"</span></p>
            )}
            {filter !== 'all' && (
              <p>No meetings in the <span className="font-medium text-blue-400">{filter}</span> timeframe</p>
            )}
            {selectedCategory !== 'all' && (
              <p>No <span className="font-medium text-blue-400">{selectedCategory}</span> meetings found</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <button 
                onClick={onClearFilters}
                className="px-6 py-3 bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-lg font-medium transition-colors flex items-center gap-2 border border-slate-600/50"
              >
                <RefreshCw size={16} />
                Clear All Filters
              </button>
              
              <button 
                onClick={onScheduleMeeting}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <CalendarPlus size={16} />
                Schedule New Meeting
              </button>
            </div>

            <div className="text-sm text-slate-400">
              Try adjusting your search terms or date filters to find what you're looking for
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // No meetings at all
  return (
    <div className="text-center py-20 bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/30">
      <div className="max-w-2xl mx-auto">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
            <Calendar className="text-blue-400" size={40} />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <Zap className="text-white" size={16} />
          </div>
        </div>
        
        <h3 className="text-3xl font-bold text-white mb-4">No upcoming meetings with Fireflies</h3>
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          Connect your calendar and schedule meetings with Fireflies to automatically capture, transcribe, 
          and summarize your conversations.
        </p>

        {/* Quick Start Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <CalendarPlus className="text-blue-400" size={24} />
            </div>
            <h4 className="text-white font-semibold mb-2">1. Schedule a Meeting</h4>
            <p className="text-slate-400 text-sm">
              Create a new meeting and invite Fireflies to automatically join and record
            </p>
          </div>
          
          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Users className="text-purple-400" size={24} />
            </div>
            <h4 className="text-white font-semibold mb-2">2. Invite fred@fireflies.ai</h4>
            <p className="text-slate-400 text-sm">
              Add our AI assistant to any meeting to capture conversations automatically
            </p>
          </div>
          
          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-green-400" size={24} />
            </div>
            <h4 className="text-white font-semibold mb-2">3. Get Instant Summaries</h4>
            <p className="text-slate-400 text-sm">
              Receive transcripts, summaries, and action items after every meeting
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              onClick={onScheduleMeeting}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-3 shadow-lg"
            >
              <CalendarPlus size={20} />
              Schedule Your First Meeting
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <a 
              href="https://help.fireflies.ai/hc/en-us/articles/360042353014-How-to-invite-Fireflies-ai-to-your-meetings" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              Learn how to invite Fireflies
              <ExternalLink size={14} />
            </a>
            
            <span className="text-slate-500">•</span>
            
            <a 
              href="https://fireflies.ai/features" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              View all features
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="mt-10 p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-700/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap className="text-yellow-400" size={14} />
            </div>
            <div className="text-left">
              <h5 className="text-yellow-300 font-medium mb-1">Pro Tip</h5>
              <p className="text-yellow-200/80 text-sm">
                Once you have meetings with Fireflies, you'll be able to search through transcripts, 
                extract action items, and generate meeting summaries directly from this dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}