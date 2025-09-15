import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Bell, X, Clock, Users, Video, ExternalLink } from 'lucide-react';

const MeetingNotifications = forwardRef(({ meetings, settings }, ref) => {
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useImperativeHandle(ref, () => ({
    showNotification: (notification) => {
      setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
    },
    clearNotifications: () => {
      setNotifications([]);
    }
  }));

  useEffect(() => {
    if (!settings.enabled || !meetings.length) return;

    const checkUpcomingMeetings = () => {
      const now = new Date();
      
      meetings.forEach(meeting => {
        if (dismissed.has(meeting.googleEventId)) return;
        
        const meetingTime = new Date(meeting.startTime);
        const minutesUntil = Math.floor((meetingTime - now) / (1000 * 60));
        
        // Show notification at specified time before meeting
        if (minutesUntil === settings.beforeMinutes && minutesUntil > 0) {
          const notification = {
            id: meeting.googleEventId,
            type: 'reminder',
            meeting,
            title: 'Meeting Starting Soon',
            message: `${meeting.title} starts in ${settings.beforeMinutes} minutes`,
            minutesUntil,
            timestamp: now
          };
          
          setNotifications(prev => [...prev, notification]);
          
          // Browser notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: meeting.googleEventId,
              requireInteraction: true
            });

            browserNotification.onclick = () => {
              if (meeting.meetingLink) {
                window.open(meeting.meetingLink, '_blank');
              }
              browserNotification.close();
            };
          }
        }
        
        // Urgent notification for meetings starting in 5 minutes or less
        if (minutesUntil <= 5 && minutesUntil > 0 && !dismissed.has(`urgent-${meeting.googleEventId}`)) {
          const urgentNotification = {
            id: `urgent-${meeting.googleEventId}`,
            type: 'urgent',
            meeting,
            title: 'Meeting Starting Now!',
            message: `${meeting.title} starts in ${minutesUntil} minutes`,
            minutesUntil,
            timestamp: now
          };
          
          setNotifications(prev => [...prev, urgentNotification]);
        }
      });
    };

    const interval = setInterval(checkUpcomingMeetings, 60000); // Check every minute
    checkUpcomingMeetings(); // Initial check
    
    return () => clearInterval(interval);
  }, [meetings, settings, dismissed]);

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setDismissed(prev => new Set([...prev, notificationId]));
  };

  const joinMeeting = (meeting) => {
    if (meeting.meetingLink) {
      window.open(meeting.meetingLink, '_blank');
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
          onJoin={() => joinMeeting(notification.meeting)}
        />
      ))}
    </div>
  );
});

const NotificationCard = ({ notification, onDismiss, onJoin }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'urgent':
        return 'bg-red-900/95 border-red-500/50 shadow-red-500/20';
      case 'reminder':
        return 'bg-blue-900/95 border-blue-500/50 shadow-blue-500/20';
      default:
        return 'bg-slate-900/95 border-slate-500/50 shadow-slate-500/20';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'urgent':
        return <Clock className="text-red-400" size={20} />;
      case 'reminder':
        return <Bell className="text-blue-400" size={20} />;
      default:
        return <Bell className="text-slate-400" size={20} />;
    }
  };

  return (
    <div 
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`backdrop-blur-md rounded-lg border shadow-lg p-4 ${getNotificationStyles()}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {getIcon()}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-slate-300 text-sm mb-2">
                {notification.message}
              </p>
              
              {/* Meeting details */}
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  <span>{notification.meeting.attendeesCount || 0} attendees</span>
                </div>
                {notification.meeting.meetingLink && (
                  <div className="flex items-center gap-1">
                    <Video size={12} />
                    <span>Virtual meeting</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-slate-300 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          {notification.meeting.meetingLink && (
            <button
              onClick={onJoin}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink size={14} />
              Join Now
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

MeetingNotifications.displayName = 'MeetingNotifications';

export default MeetingNotifications;