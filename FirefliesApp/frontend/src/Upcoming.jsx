




import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import calendarService from './CalendarService';
import AttendeesModal from './AttendeesModal';
import MeetingActionsModal from './MeetingActionsModal';
import MeetingDetailsModal from './MeetingDetailsModal';
import BulkActionsModal from './BulkActionsModal';
import MeetingNotifications from './MeetingNotifications';
import { 
  ArrowLeft, Calendar, Users, Video, ExternalLink, AlertCircle, 
  Search, CalendarPlus, Filter, Clock, MapPin, MoreVertical, 
  Bell, Download, RefreshCw, UserPlus, Settings, CheckSquare,
  Square, Grid3X3, List, SortAsc, SortDesc, Eye, Star,
  Zap, Timer, Coffee, Briefcase, Globe, Copy, Share2
} from 'lucide-react';

// Date utility functions
const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isThisWeek = (date) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day;
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return date >= startOfWeek && date <= endOfWeek;
};

const isThisMonth = (date) => {
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

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

const getDurationInMinutes = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end - start) / (1000 * 60));
};

export default function Upcoming() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const notificationRef = useRef(null);
  
  // Core state
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters and view state
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'asc');
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'list');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Selection state
  const [selectedMeetings, setSelectedMeetings] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);
  
  // Modal state
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedMeetingForActions, setSelectedMeetingForActions] = useState(null);
  const [selectedMeetingForDetails, setSelectedMeetingForDetails] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Settings state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showPastMeetings, setShowPastMeetings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    beforeMinutes: 15,
    sound: true
  });

  // Initialize
  useEffect(() => {
    fetchMeetings();
    initializeNotifications();
    
    // Auto-refresh every 5 minutes if enabled
    let refreshInterval;
    if (autoRefresh) {
      refreshInterval = setInterval(fetchMeetings, 300000);
    }
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('filter', filter);
    if (searchTerm) params.set('search', searchTerm);
    if (sortBy !== 'date') params.set('sort', sortBy);
    if (sortOrder !== 'asc') params.set('order', sortOrder);
    if (viewMode !== 'list') params.set('view', viewMode);
    
    setSearchParams(params, { replace: true });
  }, [filter, searchTerm, sortBy, sortOrder, viewMode, setSearchParams]);

  const initializeNotifications = () => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setNotificationSettings(prev => ({ 
        ...prev, 
        enabled: permission === 'granted' 
      }));
    }
  };

  const fetchMeetings = async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    
    try {
      const upcomingMeetings = await calendarService.getUpcomingMeetings();
      let processedMeetings = Array.isArray(upcomingMeetings) ? upcomingMeetings : [];
      
      // Add meeting categories and additional metadata
      processedMeetings = processedMeetings.map(meeting => ({
        ...meeting,
        category: categorizeMeeting(meeting),
        duration: getDurationInMinutes(meeting.startTime, meeting.endTime),
        isUrgent: formatTimeUntilMeeting(meeting.startTime).urgent,
        isPast: new Date(meeting.startTime) < new Date()
      }));
      
      // Filter past meetings if needed
      if (!showPastMeetings) {
        processedMeetings = processedMeetings.filter(m => !m.isPast);
      }
      
      setMeetings(processedMeetings);
      
      // Schedule notifications for upcoming meetings
      if (notificationSettings.enabled) {
        scheduleAllNotifications(processedMeetings);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err.message || 'Failed to fetch meetings');
      if (err.message === 'Authentication required') {
        navigate('/');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const categorizeMeeting = (meeting) => {
    const title = meeting.title?.toLowerCase() || '';
    const description = meeting.description?.toLowerCase() || '';
    
    if (title.includes('interview') || description.includes('interview')) return 'interview';
    if (title.includes('standup') || title.includes('daily') || description.includes('standup')) return 'standup';
    if (title.includes('retrospective') || title.includes('retro')) return 'retrospective';
    if (title.includes('planning') || title.includes('sprint')) return 'planning';
    if (title.includes('review') || title.includes('demo')) return 'review';
    if (title.includes('1:1') || title.includes('one-on-one')) return '1on1';
    if (title.includes('all-hands') || title.includes('town hall')) return 'allhands';
    if (meeting.attendeesCount > 10) return 'large';
    if (meeting.attendeesCount <= 3) return 'small';
    return 'general';
  };

  const scheduleAllNotifications = (meetingsList) => {
    meetingsList.forEach(meeting => {
      if (!meeting.isPast && notificationSettings.enabled) {
        scheduleNotification(meeting);
      }
    });
  };

  const scheduleNotification = (meeting) => {
    try {
      const meetingTime = new Date(meeting.startTime);
      const notificationTime = new Date(meetingTime.getTime() - (notificationSettings.beforeMinutes * 60 * 1000));
      const now = new Date();
      
      if (notificationTime > now) {
        setTimeout(() => {
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(`Meeting Starting in ${notificationSettings.beforeMinutes} Minutes`, {
              body: `${meeting.title}\n${meeting.attendeesCount} attendees`,
              icon: '/favicon.ico',
              tag: meeting.googleEventId,
              requireInteraction: true,
              actions: [
                { action: 'join', title: 'Join Meeting' },
                { action: 'snooze', title: 'Remind me in 5 min' }
              ]
            });
            
            notification.onclick = () => {
              if (meeting.meetingLink) {
                window.open(meeting.meetingLink, '_blank');
              }
              notification.close();
            };
            
            if (notificationSettings.sound) {
              // Play notification sound (you'd need to add an audio file)
              const audio = new Audio('/notification.wav');
              audio.play().catch(() => {}); // Ignore if audio fails
            }
          }
        }, notificationTime.getTime() - now.getTime());
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  // Filtering and sorting logic
  const filteredMeetings = useMemo(() => {
    if (!Array.isArray(meetings)) return [];
    
    let result = meetings.filter(meeting => {
      if (!meeting?.startTime) return false;
      
      try {
        const meetingDate = new Date(meeting.startTime);
        if (isNaN(meetingDate.getTime())) return false;
        
        // Date filter
        let dateMatch = true;
        switch (filter) {
          case 'today':
            dateMatch = isToday(meetingDate);
            break;
          case 'week':
            dateMatch = isThisWeek(meetingDate);
            break;
          case 'month':
            dateMatch = isThisMonth(meetingDate);
            break;
          case 'urgent':
            dateMatch = meeting.isUrgent;
            break;
          default:
            dateMatch = true;
        }
        
        // Category filter
        let categoryMatch = true;
        if (selectedCategory !== 'all') {
          categoryMatch = meeting.category === selectedCategory;
        }
        
        // Search filter
        let searchMatch = true;
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          searchMatch = (
            meeting.title?.toLowerCase().includes(searchLower) ||
            meeting.description?.toLowerCase().includes(searchLower) ||
            meeting.attendees?.some(attendee => 
              attendee.email?.toLowerCase().includes(searchLower) ||
              attendee.displayName?.toLowerCase().includes(searchLower)
            )
          );
        }
        
        return dateMatch && categoryMatch && searchMatch;
      } catch {
        return false;
      }
    });

    // Sort meetings
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'attendees':
          comparison = (a.attendeesCount || 0) - (b.attendeesCount || 0);
          break;
        case 'duration':
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'date':
        default:
          try {
            comparison = new Date(a.startTime) - new Date(b.startTime);
          } catch {
            comparison = 0;
          }
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [meetings, filter, searchTerm, sortBy, sortOrder, selectedCategory]);

  // Statistics
  const stats = useMemo(() => {
    if (!Array.isArray(meetings)) return { total: 0, today: 0, thisWeek: 0, urgent: 0, categories: {} };
    
    const validMeetings = meetings.filter(m => m?.startTime && !isNaN(new Date(m.startTime).getTime()));
    const categories = {};
    
    validMeetings.forEach(m => {
      categories[m.category] = (categories[m.category] || 0) + 1;
    });
    
    return {
      total: validMeetings.length,
      today: validMeetings.filter(m => isToday(new Date(m.startTime))).length,
      thisWeek: validMeetings.filter(m => isThisWeek(new Date(m.startTime))).length,
      urgent: validMeetings.filter(m => m.isUrgent).length,
      categories
    };
  }, [meetings]);

  // Event handlers
  const handleRefresh = () => {
    setRefreshing(true);
    fetchMeetings();
  };

  const handleMeetingActionComplete = (action) => {
    console.log(`Meeting ${action} completed`);
    setSelectedMeetings(new Set());
    handleRefresh();
  };

  const handleSelectMeeting = (meetingId) => {
    const newSelected = new Set(selectedMeetings);
    if (newSelected.has(meetingId)) {
      newSelected.delete(meetingId);
    } else {
      newSelected.add(meetingId);
    }
    setSelectedMeetings(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMeetings.size === filteredMeetings.length) {
      setSelectedMeetings(new Set());
    } else {
      setSelectedMeetings(new Set(filteredMeetings.map(m => m.googleEventId)));
    }
  };

  const handleBulkAction = (action) => {
    const selectedMeetingObjects = filteredMeetings.filter(m => 
      selectedMeetings.has(m.googleEventId)
    );
    // Handle bulk actions through the BulkActionsModal
    setShowBulkActions(true);
  };

  const exportToCalendar = () => {
    if (filteredMeetings.length === 0) {
      alert('No meetings to export');
      return;
    }

    try {
      const icsEvents = filteredMeetings.map(meeting => {
        const startTime = new Date(meeting.startTime);
        const endTime = meeting.endTime ? new Date(meeting.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000);
        
        return `BEGIN:VEVENT
SUMMARY:${(meeting.title || 'Untitled Meeting').replace(/[,;\\]/g, '\\$&')}
DTSTART:${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DESCRIPTION:${(meeting.description || '').replace(/[,;\\]/g, '\\$&')}
LOCATION:${(meeting.meetingLink || '').replace(/[,;\\]/g, '\\$&')}
CATEGORIES:${meeting.category.toUpperCase()}
END:VEVENT`;
      }).join('\n');

      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Fireflies//Upcoming Meetings//EN
${icsEvents}
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'fireflies_upcoming_meetings.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting calendar:', error);
      alert('Failed to export calendar. Please try again.');
    }
  };

  const shareFilteredMeetings = async () => {
    try {
      const meetingsList = filteredMeetings.map(m => 
        `• ${m.title} - ${new Date(m.startTime).toLocaleString()}`
      ).join('\n');
      
      const shareText = `Upcoming Meetings (${filteredMeetings.length}):\n\n${meetingsList}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Upcoming Meetings',
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('Meetings list copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/80 to-purple-900/90 text-white flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-slate-300">Loading your upcoming meetings...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/80 to-purple-900/90 text-white flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="text-red-400 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-red-300 mb-2">Failed to Load Meetings</h2>
        <p className="text-slate-400 mb-6 max-w-md">{error}</p>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
          <button 
            onClick={fetchMeetings} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/80 to-purple-900/90 text-white relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6">
        {/* Enhanced Header */}
        <EnhancedHeader 
          filteredCount={filteredMeetings.length}
          totalCount={stats.total}
          filter={filter}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onExport={exportToCalendar}
          onShare={shareFilteredMeetings}
          onNavigateBack={() => navigate('/')}
        />

        {/* Enhanced Filters & Controls */}
        <EnhancedFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filter={filter}
          onFilterChange={setFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          stats={stats}
          selectMode={selectMode}
          onSelectModeChange={setSelectMode}
          selectedCount={selectedMeetings.size}
          onSelectAll={handleSelectAll}
          onBulkAction={handleBulkAction}
        />

        {/* Meeting Content */}
        <main className="space-y-6">
          {filteredMeetings.length > 0 ? (
            <>
              {/* Quick Actions Bar */}
              <QuickActionsBar 
                meetings={filteredMeetings}
                onScheduleMeeting={() => {
                  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting&details=Meeting scheduled via Fireflies Dashboard&add=fred@fireflies.ai`;
                  window.open(url, "_blank");
                }}
                notificationSettings={notificationSettings}
                onNotificationSettingsChange={setNotificationSettings}
                autoRefresh={autoRefresh}
                onAutoRefreshChange={setAutoRefresh}
              />

              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {filteredMeetings.map((meeting, index) => (
                    <EnhancedMeetingCard 
                      key={meeting.googleEventId || `meeting-${index}`} 
                      meeting={meeting} 
                      isSelected={selectedMeetings.has(meeting.googleEventId)}
                      selectMode={selectMode}
                      onSelect={() => handleSelectMeeting(meeting.googleEventId)}
                      onAttendeesClick={() => setSelectedMeeting(meeting)}
                      onDetailsClick={() => setSelectedMeetingForDetails(meeting)}
                      onManageClick={() => setSelectedMeetingForActions(meeting)}
                      notificationSettings={notificationSettings}
                      onSetReminder={(meeting) => scheduleNotification(meeting)}
                    />
                  ))}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredMeetings.map((meeting, index) => (
                    <MeetingGridCard
                      key={meeting.googleEventId || `meeting-${index}`}
                      meeting={meeting}
                      isSelected={selectedMeetings.has(meeting.googleEventId)}
                      selectMode={selectMode}
                      onSelect={() => handleSelectMeeting(meeting.googleEventId)}
                      onDetailsClick={() => setSelectedMeetingForDetails(meeting)}
                      onManageClick={() => setSelectedMeetingForActions(meeting)}
                    />
                  ))}
                </div>
              ) : (
                <EnhancedCalendarView 
                  meetings={filteredMeetings} 
                  onMeetingClick={setSelectedMeetingForDetails}
                  selectedMeetings={selectedMeetings}
                  selectMode={selectMode}
                  onMeetingSelect={handleSelectMeeting}
                />
              )}
            </>
          ) : (
            <EnhancedEmptyState 
              hasMeetings={stats.total > 0}
              searchTerm={searchTerm}
              filter={filter}
              selectedCategory={selectedCategory}
              onScheduleMeeting={() => {
                const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting&details=Meeting scheduled via Fireflies Dashboard&add=fred@fireflies.ai`;
                window.open(url, "_blank");
              }}
              onClearFilters={() => {
                setFilter('all');
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            />
          )}
        </main>
      </div>
      
      {/* Modals */}
      {selectedMeeting && (
        <AttendeesModal
          attendees={selectedMeeting.attendees || []}
          meetingTitle={selectedMeeting.title}
          meetingId={selectedMeeting.googleEventId}
          onClose={() => setSelectedMeeting(null)}
          onAttendeesUpdate={fetchMeetings}
        />
      )}

      {selectedMeetingForActions && (
        <MeetingActionsModal
          meeting={selectedMeetingForActions}
          onClose={() => setSelectedMeetingForActions(null)}
          onActionComplete={handleMeetingActionComplete}
        />
      )}

      {selectedMeetingForDetails && (
        <MeetingDetailsModal
          meeting={selectedMeetingForDetails}
          onClose={() => setSelectedMeetingForDetails(null)}
          onEdit={() => {
            setSelectedMeetingForActions(selectedMeetingForDetails);
            setSelectedMeetingForDetails(null);
          }}
          onManageAttendees={() => {
            setSelectedMeeting(selectedMeetingForDetails);
            setSelectedMeetingForDetails(null);
          }}
        />
      )}

      {showBulkActions && (
        <BulkActionsModal
          selectedMeetings={filteredMeetings.filter(m => selectedMeetings.has(m.googleEventId))}
          onClose={() => setShowBulkActions(false)}
          onActionComplete={handleMeetingActionComplete}
        />
      )}

      {/* Notification System */}
      <MeetingNotifications
        ref={notificationRef}
        meetings={filteredMeetings}
        settings={notificationSettings}
      />
    </div>
  );
}

// Enhanced Header Component
const EnhancedHeader = ({ 
  filteredCount, totalCount, filter, refreshing, onRefresh, 
  onExport, onShare, onNavigateBack 
}) => (
  <header className="mb-8 bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/30">
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={onNavigateBack}
          className="p-2 hover:bg-slate-700/50 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            Upcoming Meetings
          </h1>
          <p className="text-slate-400 mt-1">
            {filteredCount} of {totalCount} meetings
            {filter !== 'all' && ` (${filter} filter applied)`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors disabled:opacity-50 border border-slate-600/30"
          aria-label="Refresh meetings"
          title="Refresh meetings"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
        </button>
        
        <button 
          onClick={onShare}
          disabled={filteredCount === 0}
          className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600/30"
          title="Share meetings list"
        >
          <Share2 size={16} />
          Share
        </button>
        
        <button 
          onClick={onExport}
          disabled={filteredCount === 0}
          className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-600/80 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/30"
          title="Export to calendar"
        >
          <Download size={16} />
          Export
        </button>
        
        <button 
          onClick={() => {
            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting&details=Meeting scheduled via Fireflies Dashboard&add=fred@fireflies.ai`;
            window.open(url, "_blank");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg transition-colors border border-green-500/30 shadow-lg"
          title="Schedule new meeting"
        >
          <CalendarPlus size={16} />
          <span className="hidden sm:inline">Schedule</span>
        </button>
      </div>
    </div>
  </header>
);

// Enhanced Filters Component
const EnhancedFilters = ({ 
  searchTerm, onSearchChange, filter, onFilterChange, sortBy, onSortByChange,
  sortOrder, onSortOrderChange, viewMode, onViewModeChange, selectedCategory,
  onCategoryChange, stats, selectMode, onSelectModeChange, selectedCount,
  onSelectAll, onBulkAction 
}) => (
  <div className="space-y-4 mb-6">
    {/* Search and View Controls */}
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search by title, description, or attendee..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <select 
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
        >
          <option value="date">Sort by Date</option>
          <option value="title">Sort by Title</option>
          <option value="attendees">Sort by Attendees</option>
          <option value="duration">Sort by Duration</option>
          <option value="category">Sort by Category</option>
        </select>
        
        <button
          onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2.5 bg-slate-800/60 border border-slate-700 rounded-lg hover:bg-slate-700/60 transition-colors"
          title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
        >
          {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
        </button>
        
        <div className="flex bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden">
          <button 
            onClick={() => onViewModeChange('list')}
            className={`px-3 py-2.5 text-sm transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}
            title="List view"
          >
            <List size={16} />
          </button>
          <button 
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-2.5 text-sm transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}
            title="Grid view"
          >
            <Grid3X3 size={16} />
          </button>
          <button 
            onClick={() => onViewModeChange('calendar')}
            className={`px-3 py-2.5 text-sm transition-colors ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}
            title="Calendar view"
          >
            <Calendar size={16} />
          </button>
        </div>
        
        <button
          onClick={() => onSelectModeChange(!selectMode)}
          className={`px-3 py-2.5 rounded-lg transition-colors border ${
            selectMode 
              ? 'bg-purple-600 text-white border-purple-500/50' 
              : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-700/60'
          }`}
          title="Toggle selection mode"
        >
          <CheckSquare size={16} />
        </button>
      </div>
    </div>

    {/* Selection Controls */}
    {selectMode && (
      <div className="flex items-center justify-between p-3 bg-purple-900/30 border border-purple-700/50 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onSelectAll}
            className="flex items-center gap-2 text-purple-300 hover:text-purple-200"
          >
            <CheckSquare size={16} />
            Select All ({selectedCount} selected)
          </button>
        </div>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBulkAction('cancel')}
              className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded text-sm transition-colors"
            >
              Cancel Selected
            </button>
            <button
              onClick={() => onBulkAction('reschedule')}
              className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded text-sm transition-colors"
            >
              Bulk Reschedule
            </button>
          </div>
        )}
      </div>
    )}

    {/* Filter Chips */}
    <div className="flex flex-wrap items-center gap-2">
      <FilterChip text="All" count={stats.total} active={filter === 'all'} onClick={() => onFilterChange('all')} />
      <FilterChip text="Today" count={stats.today} active={filter === 'today'} onClick={() => onFilterChange('today')} />
      <FilterChip text="This Week" count={stats.thisWeek} active={filter === 'week'} onClick={() => onFilterChange('week')} />
      <FilterChip text="Urgent" count={stats.urgent} active={filter === 'urgent'} onClick={() => onFilterChange('urgent')} color="red" />
      
      {/* Category Filters */}
      <div className="ml-4 flex items-center gap-2">
        <span className="text-sm text-slate-400">Category:</span>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-slate-800/60 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="interview">Interviews</option>
          <option value="standup">Standups</option>
          <option value="1on1">1-on-1s</option>
          <option value="planning">Planning</option>
          <option value="review">Reviews</option>
          <option value="large">Large Meetings</option>
          <option value="general">General</option>
        </select>
      </div>
    </div>
  </div>
);

// Filter Chip Component
const FilterChip = ({ text, count, active, onClick, color = 'blue' }) => {
  const colorClasses = {
    blue: active ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700',
    red: active ? 'bg-red-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-2 border border-slate-600/30 ${colorClasses[color]}`}
    >
      {text} 
      <span className={`px-2 py-0.5 rounded-full text-xs ${
        active ? 'bg-white/20' : 'bg-slate-600/50'
      }`}>
        {count}
      </span>
    </button>
  );
};

// Quick Actions Bar Component
const QuickActionsBar = ({ 
  meetings, onScheduleMeeting, notificationSettings, onNotificationSettingsChange,
  autoRefresh, onAutoRefreshChange 
}) => {
  const upcomingSoonCount = meetings.filter(m => m.isUrgent).length;
  const todayCount = meetings.filter(m => isToday(new Date(m.startTime))).length;

  return (
    <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-4 border border-slate-700/30 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          {upcomingSoonCount > 0 && (
            <div className="flex items-center gap-2 text-orange-400">
              <Timer size={16} />
              <span className="text-sm font-medium">{upcomingSoonCount} starting soon</span>
            </div>
          )}
          
          {todayCount > 0 && (
            <div className="flex items-center gap-2 text-blue-400">
              <Calendar size={16} />
              <span className="text-sm font-medium">{todayCount} today</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-green-400">
            <Zap size={16} />
            <span className="text-sm font-medium">
              {meetings.length} with Fireflies
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => onAutoRefreshChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
            Auto-refresh
          </label>
          
          <button
            onClick={async () => {
              if (!notificationSettings.enabled) {
                const permission = await Notification.requestPermission();
                onNotificationSettingsChange({
                  ...notificationSettings,
                  enabled: permission === 'granted'
                });
              }
            }}
            className={`p-2 rounded-lg transition-colors border ${
              notificationSettings.enabled
                ? 'bg-green-600/20 text-green-400 border-green-500/50'
                : 'bg-slate-700/50 text-slate-400 border-slate-600/50 hover:bg-slate-600/50'
            }`}
            title={notificationSettings.enabled ? 'Notifications enabled' : 'Enable notifications'}
          >
            <Bell size={16} />
          </button>
          
          <button
            onClick={onScheduleMeeting}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2 border border-green-500/30"
          >
            <CalendarPlus size={16} />
            <span className="hidden sm:inline">New Meeting</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Meeting Card Component
const EnhancedMeetingCard = ({ 
  meeting, isSelected, selectMode, onSelect, onAttendeesClick, 
  onDetailsClick, onManageClick, notificationSettings, onSetReminder 
}) => {
  const [showOptions, setShowOptions] = useState(false);
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'interview': return <Users size={14} />;
      case 'standup': return <Coffee size={14} />;
      case '1on1': return <Users size={14} />;
      case 'planning': return <Briefcase size={14} />;
      case 'review': return <Eye size={14} />;
      case 'large': return <Globe size={14} />;
      default: return <Calendar size={14} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'interview': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'standup': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case '1on1': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'planning': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'review': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'large': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest('.options-dropdown')) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showOptions]);

  if (!meeting) return null;

  return (
    <div className={`bg-slate-800/40 backdrop-blur-md p-5 rounded-xl border transition-all duration-300 group relative ${
      isSelected 
        ? 'border-purple-500/70 bg-purple-900/20' 
        : meeting.isUrgent 
          ? 'border-orange-500/50 hover:border-orange-400/70' 
          : 'border-slate-700/30 hover:border-blue-500/50'
    }`}>
      {selectMode && (
        <button
          onClick={onSelect}
          className="absolute top-4 left-4 z-10"
        >
          {isSelected ? (
            <CheckSquare size={18} className="text-purple-400" />
          ) : (
            <Square size={18} className="text-slate-400 hover:text-slate-300" />
          )}
        </button>
      )}

      <div className={`flex justify-between items-start mb-4 ${selectMode ? 'ml-8' : ''}`}>
        <div className="flex-1 min-w-0">
          {/* Status indicator and time */}
          <div className="flex items-center gap-3 mb-2">
            <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${timeInfo.color} bg-current/10`}>
              <div className={`w-2 h-2 rounded-full ${timeInfo.urgent ? 'animate-pulse' : ''} ${timeInfo.color.replace('text-', 'bg-')}`} />
              {timeInfo.text}
            </div>
            
            <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${getCategoryColor(meeting.category)}`}>
              {getCategoryIcon(meeting.category)}
              <span className="capitalize">{meeting.category}</span>
            </div>
            
            {meeting.duration > 0 && (
              <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                {meeting.duration}min
              </span>
            )}
          </div>
          
          <h3 className="font-semibold text-white text-lg mb-1 truncate cursor-pointer hover:text-blue-300 transition-colors"
              onClick={onDetailsClick}>
            {meeting.title || 'Untitled Meeting'}
          </h3>
          
          <div className="flex items-center gap-3 text-sm text-slate-400 mb-3">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatDateTime(meeting.startTime)}</span>
            </div>
            {meeting.meetingLink && (
              <div className="flex items-center gap-1">
                <Video size={14} />
                <span>Virtual</span>
              </div>
            )}
          </div>
          
          {meeting.description && (
            <p className="text-slate-300 text-sm mb-4 line-clamp-2 opacity-80">
              {meeting.description}
            </p>
          )}
        </div>
        
        <div className="relative options-dropdown">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions(!showOptions);
            }}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Meeting options"
          >
            <MoreVertical size={18} />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 top-10 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 w-48 backdrop-blur-sm">
              <button 
                onClick={() => {
                  onDetailsClick();
                  setShowOptions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2 text-slate-300"
              >
                <Eye size={14} />
                View Details
              </button>
              <button 
                onClick={() => {
                  onManageClick();
                  setShowOptions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2 text-slate-300"
              >
                <Settings size={14} />
                Manage Meeting
              </button>
              <div className="border-t border-slate-700 my-1"></div>
              <button 
                onClick={() => {
                  onSetReminder(meeting);
                  setShowOptions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2 text-slate-300"
              >
                <Bell size={14} />
                Set Reminder
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(meeting.meetingLink || '');
                  setShowOptions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2 text-slate-300"
                disabled={!meeting.meetingLink}
              >
                <Copy size={14} />
                Copy Link
              </button>
              {meeting.meetingLink && (
                <a 
                  href={meeting.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2 text-slate-300 no-underline"
                  onClick={() => setShowOptions(false)}
                >
                  <ExternalLink size={14} />
                  Join Meeting
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <button 
          onClick={onAttendeesClick}
          className="flex items-center gap-2 hover:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!meeting.attendees || meeting.attendees.length === 0}
        >
          <Users size={16} />
          <span className="text-sm">{meeting.attendeesCount || 0} attendees</span>
        </button>
        
        <div className="flex items-center gap-2">
          {meeting.isUrgent && (
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-600/20 text-orange-400 rounded text-xs font-medium">
              <Timer size={12} />
              Starting Soon
            </div>
          )}
          
          {meeting.meetingLink && (
            <a 
              href={meeting.meetingLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors no-underline text-white border border-blue-500/30"
            >
              <ExternalLink size={16} />
              Join
            </a>
          )}
        </div>
      </div>
    </div>
  );
};