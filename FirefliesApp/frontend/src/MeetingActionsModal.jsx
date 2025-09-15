

import { useState } from 'react';
import { 
  X, Calendar, Trash2, Clock, Send, AlertTriangle, 
  CheckCircle, Loader2, Save 
} from 'lucide-react';
import calendarService from './CalendarService';

export default function MeetingActionsModal({ meeting, onClose, onActionComplete }) {
  const [activeTab, setActiveTab] = useState('cancel');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Cancel form state
  const [sendCancelNotifications, setSendCancelNotifications] = useState(true);
  
  // Reschedule form state
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [sendRescheduleNotifications, setSendRescheduleNotifications] = useState(true);

  const resetState = () => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    resetState();

    try {
      await calendarService.cancelMeeting(meeting.googleEventId, sendCancelNotifications);
      setSuccess('Meeting cancelled successfully');
      
      // Auto-close after success
      setTimeout(() => {
        onActionComplete('cancelled');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to cancel meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!newStartTime) {
      setError('Please select a new start time');
      return;
    }

    setLoading(true);
    resetState();

    try {
      const startDate = new Date(newStartTime);
      const endDate = newEndTime ? new Date(newEndTime) : null;

      await calendarService.rescheduleMeeting(
        meeting.googleEventId, 
        startDate, 
        endDate, 
        sendRescheduleNotifications
      );
      
      setSuccess('Meeting rescheduled successfully');
      
      // Auto-close after success
      setTimeout(() => {
        onActionComplete('rescheduled');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reschedule meeting');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not set';
    try {
      const date = new Date(dateTime);
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        year: 'numeric', 
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch {
      return 'Invalid date';
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Minimum 1 hour from now
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Manage Meeting</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Meeting Info */}
        <div className="p-6 border-b border-slate-700 bg-slate-700/30">
          <h3 className="font-medium text-white mb-2 truncate">{meeting.title}</h3>
          <div className="space-y-1 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{formatDateTime(meeting.startTime)}</span>
            </div>
            {meeting.attendeesCount > 0 && (
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{meeting.attendeesCount} attendees</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
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
            Cancel Meeting
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
            Reschedule
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
              <span className="text-green-300 text-sm">{success}</span>
            </div>
          )}

          {/* Cancel Tab */}
          {activeTab === 'cancel' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  <span className="text-red-400 font-medium text-sm">Warning</span>
                </div>
                <p className="text-red-300 text-sm">
                  This action cannot be undone. The meeting will be permanently cancelled 
                  and removed from all attendees' calendars.
                </p>
              </div>

              <div className="space-y-3">
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
                      Notify all attendees about the cancellation
                    </p>
                  </div>
                </label>
              </div>

              <button
                onClick={handleCancel}
                disabled={loading}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Cancel Meeting
                  </>
                )}
              </button>
            </div>
          )}

          {/* Reschedule Tab */}
          {activeTab === 'reschedule' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  New Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  min={getMinDateTime()}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  New End Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  min={newStartTime || getMinDateTime()}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <p className="text-slate-400 text-xs mt-1">
                  If not specified, meeting duration will remain the same
                </p>
              </div>

              <div className="space-y-3">
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
                      Notify all attendees about the schedule change
                    </p>
                  </div>
                </label>
              </div>

              <button
                onClick={handleReschedule}
                disabled={loading || !newStartTime}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Reschedule Meeting
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