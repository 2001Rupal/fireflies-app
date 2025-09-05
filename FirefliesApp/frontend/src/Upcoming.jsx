import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import calendarService from './CalendarService';
import { ArrowLeft, Calendar, Clock, Users, Video, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';

// Helper to check if a date is today
const isToday = (someDate) => {
  const today = new Date();
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear();
};

// Helper to check if a date is within the next 7 days
const isThisWeek = (someDate) => {
  const today = new Date();
  const weekFromNow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  return someDate >= today && someDate < weekFromNow;
};

export default function Upcoming() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 });

  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      setError(null);
      try {
        const upcomingMeetings = await calendarService.getUpcomingMeetings();
        setMeetings(upcomingMeetings);

        // Calculate stats
        const todayCount = upcomingMeetings.filter(m => isToday(new Date(m.startTime))).length;
        const thisWeekCount = upcomingMeetings.filter(m => isThisWeek(new Date(m.startTime))).length;
        setStats({ total: upcomingMeetings.length, today: todayCount, thisWeek: thisWeekCount });

      } catch (err) {
        setError(err.message);
        if (err.message === 'Authentication required') {
          navigate('/'); // Redirect to home if not authenticated
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [navigate]);

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-slate-900 to-blue-900/90 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-700/50 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">All Upcoming Meetings</h1>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Upcoming" value={stats.total} />
          <StatCard label="Meetings Today" value={stats.today} />
          <StatCard label="This Week" value={stats.thisWeek} />
        </div>

        {/* Meetings List */}
        <main>
          {loading && <div className="text-center p-10">Loading meetings...</div>}
          {error && (
            <div className="text-center p-10 bg-red-900/20 rounded-lg">
              <AlertCircle className="mx-auto text-red-400 mb-2" size={32} />
              <p className="text-red-300">Error: {error}</p>
            </div>
          )}
          {!loading && !error && (
            <div className="space-y-4">
              {meetings.length > 0 ? (
                meetings.map((meeting, index) => <UpcomingMeetingCard key={index} meeting={meeting} />)
              ) : (
                <div className="text-center py-20 bg-slate-800/40 rounded-lg">
                  <Calendar className="mx-auto text-slate-400 mb-4" size={40} />
                  <p className="text-slate-300">No upcoming meetings found.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Reusable StatCard for this page
const StatCard = ({ label, value }) => (
  <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-5 border border-slate-700/30">
    <p className="text-sm text-slate-400 mb-2">{label}</p>
    <p className="text-4xl font-bold text-white">{value}</p>
  </div>
);

// Reusable UpcomingMeetingCard
function UpcomingMeetingCard({ meeting }) {
    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(date);
    };

    return (
        <div className="bg-slate-800/40 backdrop-blur-md p-4 rounded-xl border border-slate-700/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white text-base mb-1 truncate">{meeting.title}</h3>
                    <p className="text-sm text-slate-400">{formatDateTime(meeting.startTime)}</p>
                </div>
                {meeting.meetingLink && (
                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="ml-4 p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-full hover:bg-slate-700" aria-label="Open meeting link">
                        <ExternalLink size={18} />
                    </a>
                )}
            </div>
            <div className="flex items-center justify-between text-sm text-slate-300">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2" title={`${meeting.attendeesCount} attendees`}>
                        <Users size={16} />
                        <span>{meeting.attendeesCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Video size={16} />
                        <span>Fireflies Invited</span>
                    </div>
                </div>
            </div>
        </div>
    );
}