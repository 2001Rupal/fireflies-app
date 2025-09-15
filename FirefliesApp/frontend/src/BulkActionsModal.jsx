import { useState } from 'react';
import { 
  X, Trash2, Clock, Send, AlertTriangle, CheckCircle, 
  Loader2, Calendar, Users, RefreshCw 
} from 'lucide-react';
import calendarService from './CalendarService';

export default function BulkActionsModal({ selectedMeetings, onClose, onActionComplete }) {
  const [activeTab, setActiveTab] = useState('cancel');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  
  // Cancel form state
  const [sendCancelNotifications, setSendCancelNotifications] = useState(true);
  
  // Reschedule form state
  const [rescheduleOption, setRescheduleOption] = useState('shift'); // 'shift' or 'specific'
  const [shiftDays, setShiftDays] = useState(1);
  const [shiftHours, setShiftHours] = useState(0);
  const [specificDateTime, setSpecificDateTime] = useState('');
  const [sendRescheduleNotifications, setSendRescheduleNotifications] = useState(true);

  const resetState = () => {
    setError(null);
    setResults([]);
    setProgress(0);
    setCompleted(false);
  };

  const handleBulkCancel = async () => {
    setLoading(true);
    resetState();
    
    const results = [];
    
    try {
      for (let i = 0; i < selectedMeetings.length; i++) {
        const meeting = selectedMeetings[i];
        setProgress(((i + 1) / selectedMeetings.length) * 100);
        
        try {
          await calendarService.cancelMeeting(meeting.googleEventId, sendCancelNotifications);
          results.push({
            meeting: meeting.title,
            status: 'success',
            message: 'Cancelled successfully'
          });
        } catch (error) {
          results.push({
            meeting: meeting.title,
            status: 'error',
            message: error.message || 'Failed to cancel'
          });
        }
      }
      
      setResults(results);
      setCompleted(true);
      
      // Auto-close and refresh after 3 seconds if all successful
      const allSuccessful = results.every(r => r.status === 'success');
      if (allSuccessful) {
        setTimeout(() => {
          onActionComplete('bulk-cancelled');
          onClose();
        }, 3000);
      }
    } catch (error) {
      setError(error.message || 'Bulk cancellation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReschedule = async () => {
    setLoading(true);
    resetState();
    
    const results = [];
    
    try {
      for (let i = 0; i < selectedMeetings.length; i++) {
        const meeting = selectedMeetings[i];
        setProgress(((i + 1) / selectedMeetings.length) * 100);
        
        try {
          let newStartTime;
          
          if (rescheduleOption === 'shift') {
            const originalStart = new Date(meeting.startTime);
            newStartTime = new Date(
              originalStart.getTime() + 
              (shiftDays * 24 * 60 * 60 * 1000) + 
              (shiftHours * 60 * 60 * 1000)
            );
          } else {
            newStartTime = new Date(specificDateTime);
          }
          
          await calendarService.rescheduleMeeting(
            meeting.googleEventId, 
            newStartTime, 
            null, 
            sendRescheduleNotifications
          );
          
          results.push({
            meeting: meeting.title,
            status: 'success',
            message: `Rescheduled to ${newStartTime.toLocaleString()}`
          });
        } catch (error) {
          results.push({
            meeting: meeting.title,
            status: 'error',
            message: error.message || 'Failed to reschedule'
          });
        }
      }
      
      setResults(results);
      setCompleted(true);
      
      // Auto-close and refresh after 3 seconds if all successful
      const allSuccessful = results.every(r => r.status === 'success');
      if (allSuccessful) {
        setTimeout(() => {
          onActionComplete('bulk-rescheduled');
          onClose();
        }, 3000);
      }
    } catch (error) {
      setError(error.message || 'Bulk rescheduling failed');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Bulk Actions</h2>
            <p className="text-sm text-slate-400 mt-1">
              {selectedMeetings.length} meeting{selectedMeetings.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Selected Meetings Preview */}
        <div className="p-4 border-b border-slate-700 bg-slate-700/30">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Selected Meetings:</h3>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {selectedMeetings.map((meeting, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded border border-slate-600/30">
                <Calendar size={14} className="text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{meeting.title}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(meeting.startTime).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Users size={12} />
                  <span>{meeting.attendeesCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">Processing...</span>
              <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {completed && results.length > 0 && (
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Results:</h3>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-2 p-3 rounded border ${
                    result.status === 'success' 
                      ? 'bg-green-900/20 border-green-700/50 text-green-300'
                      : 'bg-red-900/20 border-red-700/50 text-red-300'
                  }`}
                >
                  {result.status === 'success' ? (
                    <CheckCircle size={16} className="flex-shrink-0" />
                  ) : (
                    <AlertTriangle size={16} className="flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.meeting}</p>
                    <p className="text-xs opacity-80">{result.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-900/30 border border-red-700/50 text-red-300 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        {!completed && (
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('cancel')}
              className={`flex-1 px-6 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'cancel'
                  ? 'text-red-400 border-b-2 border-red-400 bg-red-400/10'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }`}
            >
              <Trash2 size={16} />
              Cancel All
            </button>
            <button
              onClick={() => setActiveTab('reschedule')}
              className={`flex-1 px-6 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'reschedule'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/10'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }`}
            >
              <Clock size={16} />
              Reschedule All
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {completed ? (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
              <h3 className="text-lg font-semibold text-white mb-2">
                Bulk Action Completed
              </h3>
              <p className="text-slate-400 mb-6">
                {results.filter(r => r.status === 'success').length} of {results.length} operations successful
              </p>
              <button
                onClick={() => {
                  onActionComplete('bulk-completed');
                  onClose();
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </div>
          ) : activeTab === 'cancel' ? (
            <div className="space-y-6">
              <div className="p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  <span className="text-red-400 font-medium text-sm">Warning</span>
                </div>
                <p className="text-red-300 text-sm">
                  This will permanently cancel {selectedMeetings.length} meeting{selectedMeetings.length !== 1 ? 's' : ''}. 
                  This action cannot be undone.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendCancelNotifications}
                    onChange={(e) => setSendCancelNotifications(e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                    disabled={loading}
                  />
                  <div>
                    <span className="text-white text-sm font-medium">Send notifications</span>
                    <p className="text-slate-400 text-xs">
                      Notify all attendees about the cancellations
                    </p>
                  </div>
                </label>
              </div>

              <button
                onClick={handleBulkCancel}
                disabled={loading}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Cancelling {selectedMeetings.length} meetings...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Cancel {selectedMeetings.length} Meetings
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-3">Reschedule Option</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="rescheduleOption"
                      value="shift"
                      checked={rescheduleOption === 'shift'}
                      onChange={(e) => setRescheduleOption(e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <div>
                      <span className="text-white text-sm font-medium">Shift all meetings</span>
                      <p className="text-slate-400 text-xs">
                        Move all meetings by the same time offset
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="rescheduleOption"
                      value="specific"
                      checked={rescheduleOption === 'specific'}
                      onChange={(e) => setRescheduleOption(e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <div>
                      <span className="text-white text-sm font-medium">Set specific time</span>
                      <p className="text-slate-400 text-xs">
                        Schedule all meetings at the same time
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {rescheduleOption === 'shift' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Days</label>
                    <input
                      type="number"
                      value={shiftDays}
                      onChange={(e) => setShiftDays(parseInt(e.target.value) || 0)}
                      min="0"
                      max="30"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Hours</label>
                    <input
                      type="number"
                      value={shiftHours}
                      onChange={(e) => setShiftHours(parseInt(e.target.value) || 0)}
                      min="0"
                      max="23"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {rescheduleOption === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">New Date & Time</label>
                  <input
                    type="datetime-local"
                    value={specificDateTime}
                    onChange={(e) => setSpecificDateTime(e.target.value)}
                    min={getMinDateTime()}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <p className="text-slate-400 text-xs mt-1">
                    All meetings will be scheduled at this time
                  </p>
                </div>
              )}

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendRescheduleNotifications}
                    onChange={(e) => setSendRescheduleNotifications(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    disabled={loading}
                  />
                  <div>
                    <span className="text-white text-sm font-medium">Send notifications</span>
                    <p className="text-slate-400 text-xs">
                      Notify all attendees about the schedule changes
                    </p>
                  </div>
                </label>
              </div>

              <button
                onClick={handleBulkReschedule}
                disabled={
                  loading || 
                  (rescheduleOption === 'specific' && !specificDateTime) ||
                  (rescheduleOption === 'shift' && shiftDays === 0 && shiftHours === 0)
                }
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Rescheduling {selectedMeetings.length} meetings...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Reschedule {selectedMeetings.length} Meetings
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}