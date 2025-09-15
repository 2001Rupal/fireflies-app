

import { useNavigate } from "react-router-dom";
import { 
  CalendarPlus, ListChecks, Bookmark, FileText, Clock, ChevronRight, 
  Users, Zap, Activity, Target,
  Calendar, Video, UserPlus, AlertCircle, RefreshCw, ExternalLink, MoreHorizontal
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import calendarService from "../CalendarService";
import AttendeesModal from '../AttendeesModal'; 

const API = import.meta.env.VITE_API_BASE_URL || "";

// --- Main Home Component ---
export default function Home() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  
  const [stats, setStats] = useState({ totalMeetings: 0, saved: 0, plansGenerated: 0, avgDuration: 0 });
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState(null);
  const [isCalendarAuthenticated, setIsCalendarAuthenticated] = useState(false);
  const [selectedMeetingForAttendees, setSelectedMeetingForAttendees] = useState(null);

  // Initial animation
  useEffect(() => {
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.out" });
  }, []);

  // Data fetching on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${API}/api/meetings`);
        if (!res.ok) throw new Error('Failed to fetch meetings');
        const meetings = await res.json();

        const total = meetings.length;
        const saved = meetings.filter(m => m.summary && m.summary.length > 0).length;
        const plans = meetings.filter(m => m.hasProjectPlan).length;
        const avgDur = total > 0 ? Math.round(meetings.reduce((a, b) => a + (b.durationSeconds || 0), 0) / total) : 0;

        setStats({ totalMeetings: total, saved, plansGenerated: plans, avgDuration: avgDur });
        setRecentMeetings(meetings.slice(0, 6));
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    const checkCalendarAuth = () => {
      const isAuthenticated = calendarService.isAuthenticated();
      setIsCalendarAuthenticated(isAuthenticated);
      if (isAuthenticated) {
        fetchUpcomingMeetings();
      }
    };

    fetchDashboardData();
    checkCalendarAuth();
  }, []);

  const fetchUpcomingMeetings = async () => {
    setCalendarLoading(true);
    setCalendarError(null);
    
    try {
      const meetings = await calendarService.getUpcomingMeetings();
      setUpcomingMeetings(meetings);
    } catch (error) {
      console.error("Error fetching upcoming meetings:", error);
      setCalendarError(error.message);
      if (error.message === 'Authentication required') {
        setIsCalendarAuthenticated(false);
        calendarService.clearToken();
      }
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleCalendarAuth = async () => {
    setCalendarLoading(true);
    setCalendarError(null);
    
    try {
      await calendarService.authenticate();
      setIsCalendarAuthenticated(true);
      await fetchUpcomingMeetings();
    } catch (error) {
      console.error("Authentication failed:", error);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleScheduleMeeting = () => {
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting&details=Meeting scheduled via Fireflies Dashboard&add=fred@fireflies.ai`;
    window.open(googleCalendarUrl, "_blank");
  };

  const handleMeetingClick = (firefliesId) => {
    navigate(`/meetings/${firefliesId}`);
  };

  const handleAttendeesClick = (meeting) => {
    setSelectedMeetingForAttendees(meeting);
  };

  return (
    <div ref={pageRef} className="min-h-screen p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900/80 to-purple-900/90 text-white relative">
      <BackgroundElements />
      <Header />
      
      <main className="relative z-10 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<ListChecks size={18} />} label="Total Meetings" value={loading ? "…" : stats.totalMeetings} />
          <StatCard icon={<Bookmark size={18} />} label="Saved" value={loading ? "…" : stats.saved} />
          <StatCard icon={<FileText size={18} />} label="Plans Generated" value={loading ? "…" : stats.plansGenerated} />
          <StatCard icon={<Clock size={18} />} label="Avg. Duration" value={loading ? "…" : `${stats.avgDuration}m`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <RecentMeetingsSection meetings={recentMeetings} onMeetingClick={handleMeetingClick} />
            <UpcomingMeetingsSection 
              isAuthenticated={isCalendarAuthenticated}
              isLoading={calendarLoading}
              error={calendarError}
              meetings={upcomingMeetings}
              onAuth={handleCalendarAuth}
              onRefresh={fetchUpcomingMeetings}
              onAttendeesClick={handleAttendeesClick}
            />
          </section>

          <aside className="space-y-6">
            <QuickActions onSchedule={handleScheduleMeeting} />
            {isCalendarAuthenticated && <CalendarStatus />}
          </aside>
        </div>
      </main>


{selectedMeetingForAttendees && (
  <AttendeesModal
    attendees={selectedMeetingForAttendees.attendees}
    meetingTitle={selectedMeetingForAttendees.title}
    meetingId={selectedMeetingForAttendees.googleEventId} // ✨ FIX: Pass the Google Event ID
    onClose={() => setSelectedMeetingForAttendees(null)}
    onAttendeesUpdate={fetchUpcomingMeetings} // ✨ FIX: Pass the update handler to refresh the list
  />
)}
    </div>
  );
}


// --- Sub-components for better structure ---

const BackgroundElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
    <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
  </div>
);

const Header = () => (
  <header className="w-full mb-6 rounded-3xl bg-gradient-to-r from-slate-800/90 to-purple-900/70 backdrop-blur-md border border-slate-700/30 shadow-xl">
    <div className="max-w-7xl mx-auto px-5 py-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
          <Zap className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            Projectra Dashboard
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Turning discussions into actionable plans
          </p>
        </div>
      </div>
    </div>
  </header>
);

const StatCard = ({ icon, label, value }) => (
  <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-600/30 hover:border-slate-500/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
    <div className="relative z-10">
      <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-400/20 w-fit mb-4">
        {icon}
      </div>
      <p className="mb-3 text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-sm font-medium text-slate-300 uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

const RecentMeetingsSection = ({ meetings, onMeetingClick }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/30 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity size={20} className="text-purple-400" /> Recent Updates
        </h2>
        <button onClick={() => navigate("/meetings")} className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 group">
          Fetch meetings <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      {meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map((m) => <MeetingCard key={m.id} meeting={m} onClick={() => onMeetingClick(m.firefliesId)} />)}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="mx-auto w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
            <Users className="text-slate-400" size={28} />
          </div>
          <p className="text-slate-300">No meetings yet</p>
        </div>
      )}
    </div>
  );
};

const UpcomingMeetingsSection = ({ isAuthenticated, isLoading, error, meetings, onAuth, onRefresh, onAttendeesClick }) => {
  const navigate = useNavigate();
  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="text-center py-10">
          <div className="mx-auto w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4"><Calendar className="text-slate-400" size={28} /></div>
          <p className="text-slate-300 mb-2">Connect your Google Calendar</p>
          <button onClick={onAuth} disabled={isLoading} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors disabled:opacity-50">
            {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {isLoading ? "Connecting..." : "Connect"}
          </button>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-10">
          <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4"><AlertCircle className="text-red-400" size={28} /></div>
          <p className="text-red-300 mb-2">Failed to load meetings</p>
        </div>
      );
    }
    if (isLoading) {
      return <div className="text-center py-10"><RefreshCw className="text-slate-400 animate-spin mx-auto" size={28} /></div>;
    }
    if (meetings.length > 0) {
      return (
        <>
          <div className="space-y-3">
            {meetings.slice(0, 5).map((meeting, index) => <UpcomingMeetingCard key={index} meeting={meeting} onAttendeesClick={() => onAttendeesClick(meeting)} />)}
          </div>
          {meetings && meetings.length > 0 && (
  <div className="mt-4 text-center">
    <button onClick={() => navigate('/upcoming')}>
      {meetings.length > 5 
        ? `View all ${meetings.length} upcoming meetings`
        : `View ${meetings.length === 1 ? 'meeting details' : `all ${meetings.length} meetings`}`
      }
    </button>
  </div>
)}
        </>
      );
    }
    return (
      <div className="text-center py-10">
        <div className="mx-auto w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4"><Calendar className="text-slate-400" size={28} /></div>
        <p className="text-slate-300">No upcoming meetings with Fireflies</p>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/30 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Calendar size={20} className="text-green-400" /> Upcoming Meetings
        </h2>
        {isAuthenticated && (
          <button onClick={onRefresh} disabled={isLoading} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700/50 rounded-lg transition-colors">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

const QuickActions = ({ onSchedule }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/30 shadow-lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-emerald-500/20 rounded-lg"><Target size={18} className="text-emerald-400" /></div>
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
      </div>
      <div className="space-y-3">
        <ActionButton icon={<CalendarPlus size={16} />} label="Schedule Meeting" onClick={onSchedule} color="from-blue-600 to-indigo-700" />
        <ActionButton icon={<ListChecks size={16} />} label="Fetch Meetings" onClick={() => navigate("/meetings")} color="from-violet-600 to-purple-700" />
        <ActionButton icon={<Bookmark size={16} />} label="View Saved" onClick={() => navigate("/saved")} color="from-emerald-600 to-teal-700" />
      </div>
    </div>
  );
};

const CalendarStatus = () => (
  <div className="bg-gradient-to-br from-green-700/30 to-emerald-700/20 backdrop-blur-md rounded-2xl p-5 border border-green-600/20 shadow-lg">
    <div className="flex items-start gap-3">
      <Calendar className="text-green-300 mt-0.5 flex-shrink-0" size={18} />
      <div>
        <h3 className="text-sm font-semibold text-green-200 mb-1">Calendar Connected</h3>
        <p className="text-green-100/80 text-xs">Your upcoming meetings are automatically synced.</p>
      </div>
    </div>
  </div>
);

const MeetingCard = ({ meeting, onClick }) => (
  <div onClick={onClick} className="group bg-slate-800/30 backdrop-blur-md p-4 rounded-xl border border-slate-700/30 hover:border-slate-600/50 cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col">
    <div className="flex justify-between items-start mb-3">
      <h3 className="font-medium text-white truncate group-hover:text-blue-300 transition-colors text-sm">{meeting.title || "Untitled Meeting"}</h3>
      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700/50 rounded transition-all"><MoreHorizontal size={14} className="text-slate-400" /></button>
    </div>
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">{new Date(meeting.meetingDate).toLocaleDateString()}</span>
      <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">{Math.round(meeting.durationSeconds || 0)} min</span>
    </div>
    <div className="flex justify-between items-center mt-auto">
      <div className="flex gap-2">
        {meeting.summary && <Tag color="blue" text="Saved" />}
        {meeting.hasProjectPlan && <Tag color="green" text="Plan" />}
        {meeting.participantCount === 0 && <Tag color="red" text="Not Attended" />}
      </div>
      <ChevronRight size={14} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
    </div>
  </div>
);

const UpcomingMeetingCard = ({ meeting, onAttendeesClick }) => {
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(date);
  };

  return (
    <div className="group bg-slate-700/30 backdrop-blur-md p-4 rounded-xl border border-slate-600/30 hover:border-green-500/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white group-hover:text-green-300 transition-colors text-sm mb-1 truncate">{meeting.title}</h3>
          <p className="text-xs text-slate-400">{formatDateTime(meeting.startTime)}</p>
        </div>
        {meeting.meetingLink && (
          <a 
            href={meeting.meetingLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="ml-2 flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors flex items-center gap-1.5 shadow-lg hover:shadow-blue-500/50"
          >
            Join Meeting
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onAttendeesClick} className="flex items-center gap-1 cursor-pointer hover:bg-slate-700/50 p-1 rounded-md" title="View attendees">
              <Users size={14} className="text-slate-400" />
              <span className="text-xs text-slate-400">{meeting.attendeesCount}</span>
          </button>
          <div className="flex items-center gap-1"><Video size={14} className="text-slate-400" /><span className="text-xs text-slate-400">Fireflies Invited</span></div>
        </div>
      </div>
    </div>
  );
};

const Tag = ({ text, color }) => {
  const colorMap = {
    blue: "bg-blue-900/30 text-blue-400 border border-blue-800/30",
    green: "bg-green-900/30 text-green-400 border border-green-800/30",
    red: "bg-red-900/30 text-red-400 border-red-800/30",
  };
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[color]}`}>{text}</span>;
};

const ActionButton = ({ icon, label, onClick, color }) => (
  <button onClick={onClick} className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${color} text-white font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm`}>
    {icon}{label}
  </button>
);