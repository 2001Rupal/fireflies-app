import { useState } from 'react';
import { 
  X, Calendar, Clock, Users, Video, ExternalLink, MapPin, 
  FileText, Tag, Share2, Copy, Edit3, Settings, Bell,
  Timer, Globe, Mail, Phone, User, Star, Download,
  AlertCircle, CheckCircle, XCircle, HelpCircle
} from 'lucide-react';

const getStatusIcon = (status) => {
  switch (status) {
    case 'accepted':
      return <CheckCircle className="text-green-400" size={14} />;
    case 'declined':
      return <XCircle className="text-red-400" size={14} />;
    case 'tentative':
      return <HelpCircle className="text-yellow-400" size={14} />;
    default:
      return <Clock className="text-slate-400" size={14} />;
  }
};

const formatTimeUntilMeeting = (startTime) => {
  const now = new Date();
  const meetingTime = new Date(startTime);
  const diffMs = meetingTime - now;
  
  if (diffMs < 0) return { text: 'Meeting has ended', color: 'text-gray-400', urgent: false };
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes <= 15) return { text: `Starting in ${diffMinutes} minutes`, color: 'text-red-400', urgent: true };
  if (diffMinutes <= 60) return { text: `Starting in ${diffMinutes} minutes`, color: 'text-orange-400', urgent: true };
  if (diffHours <= 24) return { text: `Starting in ${diffHours} hours ${diffMinutes % 60} minutes`, color: 'text-yellow-400', urgent: false };
  if (diffDays <= 7) return { text: `Starting in ${diffDays} days`, color: 'text-blue-400', urgent: false };
  return { text: `Starting in ${diffDays} days`, color: 'text-slate-400', urgent: false };
};

export default function MeetingDetailsModal({ meeting, onClose, onEdit, onManageAttendees }) {
  const [activeTab, setActiveTab] = useState('details');
  const [isFavorite, setIsFavorite] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  if (!meeting) return null;

  const timeInfo = formatTimeUntilMeeting(meeting.startTime);
  const duration = meeting.endTime 
    ? Math.round((new Date(meeting.endTime) - new Date(meeting.startTime)) / (1000 * 60))
    : 60;

  const formatDateTime = (dateTime, includeTime = true) => {
    if (!dateTime) return 'Not set';
    
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const options = includeTime 
        ? { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true 
          }
        : {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          };
      
      return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${type} copied!`);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: meeting.title,
      text: `${meeting.title}\n${formatDateTime(meeting.startTime)}\n${meeting.attendeesCount} attendees`,
      url: meeting.meetingLink
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url || ''}`
        );
        setCopySuccess('Meeting details copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const exportToCalendar = () => {
    try {
      const startTime = new Date(meeting.startTime);
      const endTime = meeting.endTime ? new Date(meeting.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000);
      
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Fireflies//Meeting Details//EN
BEGIN:VEVENT
SUMMARY:${(meeting.title || 'Untitled Meeting').replace(/[,;\\]/g, '\\$&')}
DTSTART:${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DESCRIPTION:${(meeting.description || '').replace(/[,;\\]/g, '\\$&')}
LOCATION:${(meeting.meetingLink || '').replace(/[,;\\]/g, '\\$&')}
CATEGORIES:${(meeting.category || 'GENERAL').toUpperCase()}
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${(meeting.title || 'meeting').replace(/\s+/g, '_')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting meeting:', error);
    }
  };

  const getCategoryInfo = (category) => {
    const categoryMap = {
      interview: { label: 'Interview', icon: <Users size={16} />, color: 'purple' },
      standup: { label: 'Standup', icon: <Timer size={16} />, color: 'orange' },
      '1on1': { label: '1-on-1', icon: <User size={16} />, color: 'green' },
      planning: { label: 'Planning', icon: <Calendar size={16} />, color: 'blue' },
      review: { label: 'Review', icon: <FileText size={16} />, color: 'yellow' },
      large: { label: 'Large Meeting', icon: <Globe size={16} />, color: 'red' },
      general: { label: 'General', icon: <Calendar size={16} />, color: 'slate' }
    };
    return categoryMap[category] || categoryMap.general;
  };

  const categoryInfo = getCategoryInfo(meeting.category);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white truncate">{meeting.title || 'Untitled Meeting'}</h2>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-1 rounded transition-colors ${
                  isFavorite ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
                }`}
              >
                <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className={`flex items-center gap-2 ${timeInfo.color} font-medium`}>
                <Timer size={16} />
                {timeInfo.text}
              </div>
              <div className={`flex items-center gap-2 px-2 py-1 rounded border text-${categoryInfo.color}-400 border-${categoryInfo.color}-500/30 bg-${categoryInfo.color}-500/10`}>
                {categoryInfo.icon}
                <span>{categoryInfo.label}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Share meeting"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={exportToCalendar}
              className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Export to calendar"
            >
              <Download size={18} />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-slate-400 hover:text-orange-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Edit meeting"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Copy Success Message */}
        {copySuccess && (
          <div className="px-6 py-2 bg-green-900/30 border-b border-green-800/50 text-green-300 text-sm">
            {copySuccess}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/60">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/10'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
            }`}
          >
            Meeting Details
          </button>
          <button
            onClick={() => setActiveTab('attendees')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'attendees'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/10'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
            }`}
          >
            Attendees ({meeting.attendeesCount || 0})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Time and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Start Time</label>
                    <div className="flex items-center gap-2 text-white">
                      <Clock size={18} className="text-blue-400" />
                      <span>{formatDateTime(meeting.startTime)}</span>
                      <button
                        onClick={() => handleCopy(formatDateTime(meeting.startTime), 'Start time')}
                        className="p-1 text-slate-400 hover:text-slate-300"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {meeting.endTime && (
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">End Time</label>
                      <div className="flex items-center gap-2 text-white">
                        <Clock size={18} className="text-blue-400" />
                        <span>{formatDateTime(meeting.endTime)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Duration</label>
                    <div className="flex items-center gap-2 text-white">
                      <Timer size={18} className="text-green-400" />
                      <span>{duration} minutes</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Meeting Link</label>
                    {meeting.meetingLink ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white no-underline transition-colors"
                        >
                          <Video size={16} />
                          Join Meeting
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={() => handleCopy(meeting.meetingLink, 'Meeting link')}
                          className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 rounded"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500">No meeting link available</span>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
                    <div className="flex items-center gap-2 text-white">
                      <MapPin size={18} className="text-purple-400" />
                      <span>{meeting.meetingLink ? 'Virtual Meeting' : 'Location not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              {meeting.description && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <p className="text-slate-300 whitespace-pre-wrap">{meeting.description}</p>
                  </div>
                </div>
              )}
              
              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={18} className="text-blue-400" />
                    <span className="font-medium text-white">Attendees</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{meeting.attendeesCount || 0}</p>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={18} className="text-green-400" />
                    <span className="font-medium text-white">Category</span>
                  </div>
                  <p className="text-lg font-semibold text-green-400 capitalize">{meeting.category || 'General'}</p>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={18} className="text-purple-400" />
                    <span className="font-medium text-white">Event ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-purple-400 truncate">{meeting.googleEventId}</p>
                    <button
                      onClick={() => handleCopy(meeting.googleEventId, 'Event ID')}
                      className="p-1 text-slate-400 hover:text-slate-300"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Meeting Attendees</h3>
                <button
                  onClick={onManageAttendees}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit3 size={16} />
                  Manage Attendees
                </button>
              </div>
              
              {meeting.attendees && meeting.attendees.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {meeting.attendees.map((attendee, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                          <User size={18} className="text-slate-300" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {attendee.displayName || attendee.email}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Mail size={12} />
                            <span>{attendee.email}</span>
                          </div>
                          {attendee.organizer && (
                            <span className="inline-block mt-1 px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded border border-blue-500/30">
                              Organizer
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(attendee.responseStatus)}
                        <span className="text-sm text-slate-300 capitalize">
                          {attendee.responseStatus === 'needsAction' ? 'Pending' : attendee.responseStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto text-slate-400 mb-4" size={48} />
                  <p className="text-slate-400">No attendees information available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}