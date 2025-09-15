import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, Video, ExternalLink, CheckSquare, Square, 
  Timer, Eye, Settings, Bell, Copy, Share2, Star 
} from 'lucide-react';

const formatTimeUntilMeeting = (startTime) => {
  const now = new Date();
  const meetingTime = new Date(startTime);
  const diffMs = meetingTime - now;
  
  if (diffMs < 0) return { text: 'Past', color: 'text-gray-400', urgent: false };
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes <= 15) return { text: `${diffMinutes}m`, color: 'text-red-400', urgent: true };
  if (diffMinutes <= 60) return { text: `${diffMinutes}m`, color: 'text-orange-400', urgent: true };
  if (diffHours <= 24) return { text: `${diffHours}h ${diffMinutes % 60}m`, color: 'text-yellow-400', urgent: false };
  if (diffDays <= 7) return { text: `${diffDays}d ${diffHours % 24}h`, color: 'text-blue-400', urgent: false };
  return { text: `${diffDays} days`, color: 'text-slate-400', urgent: false };
};

export default function MeetingGridCard({ 
  meeting, isSelected, selectMode, onSelect, onDetailsClick, onManageClick 
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const timeInfo = formatTimeUntilMeeting(meeting.startTime);
  
  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Time not set';
    
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return new Intl.DateTimeFormat('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      }).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'interview': return 'from-purple-600/20 to-purple-800/20 border-purple-500/30';
      case 'standup': return 'from-orange-600/20 to-orange-800/20 border-orange-500/30';
      case '1on1': return 'from-green-600/20 to-green-800/20 border-green-500/30';
      case 'planning': return 'from-blue-600/20 to-blue-800/20 border-blue-500/30';
      case 'review': return 'from-yellow-600/20 to-yellow-800/20 border-yellow-500/30';
      case 'large': return 'from-red-600/20 to-red-800/20 border-red-500/30';
      default: return 'from-slate-600/20 to-slate-800/20 border-slate-500/30';
    }
  };

  const handleCopyLink = () => {
    if (meeting.meetingLink) {
      navigator.clipboard.writeText(meeting.meetingLink);
    }
  };

  if (!meeting) return null;

  return (
    <div className={`bg-gradient-to-br ${getCategoryColor(meeting.category)} backdrop-blur-md p-5 rounded-xl border transition-all duration-300 group relative hover:scale-105 hover:shadow-xl ${
      isSelected 
        ? 'border-purple-500/70 ring-2 ring-purple-500/30' 
        : meeting.isUrgent 
          ? 'border-orange-500/50 hover:border-orange-400/70' 
          : 'hover:border-blue-500/50'
    }`}>
      {/* Selection and favorite controls */}
      <div className="flex items-center justify-between mb-3">
        {selectMode && (
          <button
            onClick={onSelect}
            className="z-10"
          >
            {isSelected ? (
              <CheckSquare size={18} className="text-purple-400" />
            ) : (
              <Square size={18} className="text-slate-400 hover:text-slate-300" />
            )}
          </button>
        )}
        
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`p-1 rounded transition-colors ${
            isFavorite ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
          }`}
        >
          <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Status indicator */}
      <div className={`flex items-center gap-2 mb-3 px-2 py-1 rounded-full text-xs font-medium ${timeInfo.color} bg-current/10 w-fit`}>
        <div className={`w-2 h-2 rounded-full ${timeInfo.urgent ? 'animate-pulse' : ''} ${timeInfo.color.replace('text-', 'bg-')}`} />
        {timeInfo.text}
      </div>

      {/* Meeting title */}
      <h3 className="font-semibold text-white text-lg mb-2 truncate cursor-pointer hover:text-blue-300 transition-colors line-clamp-2"
          onClick={onDetailsClick}>
        {meeting.title || 'Untitled Meeting'}
      </h3>

      {/* Meeting time */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
        <Clock size={14} />
        <span>{formatDateTime(meeting.startTime)}</span>
      </div>

      {/* Meeting info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Users size={14} />
          <span>{meeting.attendeesCount || 0}</span>
        </div>
        
        {meeting.meetingLink && (
          <div className="flex items-center gap-1 text-sm text-slate-400">
            <Video size={14} />
            <span>Virtual</span>
          </div>
        )}
        
        {meeting.duration > 0 && (
          <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
            {meeting.duration}min
          </span>
        )}
      </div>

      {/* Description */}
      {meeting.description && (
        <p className="text-slate-300 text-sm mb-4 line-clamp-2 opacity-80">
          {meeting.description}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
        <div className="flex items-center gap-2">
          <button
            onClick={onDetailsClick}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/30 rounded transition-colors"
            title="View details"
          >
            <Eye size={16} />
          </button>
          
          <button
            onClick={onManageClick}
            className="p-2 text-slate-400 hover:text-orange-400 hover:bg-slate-700/30 rounded transition-colors"
            title="Manage meeting"
          >
            <Settings size={16} />
          </button>
          
          <button
            onClick={handleCopyLink}
            disabled={!meeting.meetingLink}
            className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700/30 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Copy meeting link"
          >
            <Copy size={16} />
          </button>
        </div>

        {meeting.meetingLink && (
          <a 
            href={meeting.meetingLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors no-underline text-white"
          >
            <ExternalLink size={12} />
            Join
          </a>
        )}
      </div>

      {/* Urgent indicator */}
      {meeting.isUrgent && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </div>
  );
}