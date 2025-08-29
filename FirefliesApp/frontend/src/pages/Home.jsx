



// import { useNavigate } from "react-router-dom";
// import { 
//   CalendarPlus, ListChecks, Bookmark, FileText, Clock, ChevronRight, 
//   TrendingUp, Users, Zap, MoreHorizontal, Sparkles, Activity, Target 
// } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import gsap from "gsap";

// const API = import.meta.env.VITE_API_BASE_URL || "";

// const [isOnline, setIsOnline] = useState(navigator.onLine);


// export default function Home() {
//   const navigate = useNavigate();
//   const pageRef = useRef(null);
//   const [stats, setStats] = useState({
//     totalMeetings: 0,
//     saved: 0,
//     plansGenerated: 0,
//     avgDuration: 0,
//   });
//   const [recentMeetings, setRecentMeetings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     gsap.fromTo(
//       pageRef.current,
//       { opacity: 0 },
//       { opacity: 1, duration: 0.8, ease: "power2.out" }
//     );
//   }, []);

//   useEffect(() => {
//     async function fetchDashboardData() {
//       try {
//         const res = await fetch(`${API}/api/meetings`);
//         const meetings = await res.json();

//         const total = meetings.length;
//         const saved = meetings.filter(m => m.summary && m.summary.length > 0).length;
//         const plans = meetings.filter(m => m.hasProjectPlan).length;
//         const avgDur = total > 0
//           ? Math.round(meetings.reduce((a, b) => a + (b.durationSeconds || 0), 0) / total)
//           : 0;

//         setStats({ totalMeetings: total, saved, plansGenerated: plans, avgDuration: avgDur });
//         setRecentMeetings(meetings.slice(0, 6));
//       } catch (err) {
//         console.error("Failed to fetch dashboard data:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchDashboardData();
//   }, []);

//   const handleScheduleMeeting = () => {
//     const googleCalendarUrl =
//       "https://calendar.google.com/calendar/render?" +
//       "action=TEMPLATE&" +
//       "text=Meeting&" +
//       "details=Meeting scheduled via Fireflies Dashboard&" +
//       "location=&" +
//       "add=fred@fireflies.ai";
//     window.open(googleCalendarUrl, "_blank");
//   };

//   const handleMeetingClick = async (id) => {
//     try {
//       const res = await fetch(`${API}/api/meetings/${id}`);
//       if (!res.ok) return;
//       const meeting = await res.json();

//       if (meeting.projectPlan || meeting.hasProjectPlan) {
//         navigate(`/project-plan/${meeting.id}`);
//       } else if (
//         meeting.functionalDoc?.length > 0 ||
//         meeting.mockups?.length > 0 ||
//         meeting.markdown?.length > 0
//       ) {
//         navigate(`/generate-files/${meeting.id}`);
//       } else {
//         navigate(`/meetings/${meeting.firefliesId || meeting.id}`);
//       }
//     } catch (err) {
//       console.error("Failed to navigate:", err);
//     }
//   };

//   return (
//     <div
//       ref={pageRef}
//       className="min-h-screen p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900/80 to-purple-900/90 text-white relative"
//     >
//       {/* background elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
//       </div>

//       {/* header */}
//       <header className="w-full mb-6 rounded-3xl bg-gradient-to-r from-slate-800/90 to-purple-900/70 backdrop-blur-md border border-slate-700/30 shadow-xl">
//         <div className="max-w-7xl mx-auto px-5 py-5 flex items-center justify-between gap-4">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
//               <Zap className="text-white" size={28} />
//             </div>
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
//                 Projectra Dashboard
//               </h1>
//               <p className="text-slate-300 mt-1 text-sm sm:text-base">
//                 Turning discussions into actionable plans
//               </p>
//             </div>
//           </div>
//           <div className="hidden sm:flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-full border border-slate-600/50">
//             <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//             <span className="text-sm text-slate-300">System Active</span>
//           </div>
//         </div>
//       </header>

//       {/* content */}
//       <main className="relative z-10 max-w-7xl mx-auto space-y-8">
//         {/* stats */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           <StatCard icon={<ListChecks size={18} />} label="Total Meetings" value={loading ? "…" : stats.totalMeetings} changePositive />
//           <StatCard icon={<Bookmark size={18} />} label="Saved" value={loading ? "…" : stats.saved} changePositive />
//           <StatCard icon={<FileText size={18} />} label="Plans Generated" value={loading ? "…" : stats.plansGenerated} changePositive />
//           <StatCard icon={<Clock size={18} />} label="Avg. Duration" value={loading ? "…" : `${stats.avgDuration}m`} changePositive={false} />
//         </div>

//         {/* main grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* recent meetings */}
//           <section className="lg:col-span-2 bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/30 shadow-lg">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-semibold text-white flex items-center gap-2">
//                 <Activity size={20} className="text-purple-400" /> Recent Meetings
//               </h2>
//               <button
//                 onClick={() => navigate("/meetings")}
//                 className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 group"
//               >
//                 Fetch meetings <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
//               </button>
//             </div>
//             {recentMeetings.length > 0 ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {recentMeetings.map((m, i) => (
//                   <MeetingCard key={i} meeting={m} onClick={() => handleMeetingClick(m.id)} />
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-10">
//                 <div className="mx-auto w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
//                   <Users className="text-slate-400" size={28} />
//                 </div>
//                 <p className="text-slate-300">No meetings yet</p>
//                 <p className="text-slate-400 text-sm mt-1">Fetch meetings to see them here</p>
//               </div>
//             )}
//           </section>

//           {/* sidebar */}
//           <aside className="space-y-6">
//             {/* quick actions */}
//             <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/30 shadow-lg">
//               <div className="flex items-center gap-3 mb-5">
//                 <div className="p-2 bg-emerald-500/20 rounded-lg">
//                   <Target size={18} className="text-emerald-400" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
//               </div>
//               <div className="space-y-3">
//                 <ActionButton icon={<CalendarPlus size={16} />} label="Schedule Meeting" onClick={handleScheduleMeeting} color="from-blue-600 to-indigo-700" />
//                 <ActionButton icon={<ListChecks size={16} />} label="Fetch Meetings" onClick={() => navigate("/meetings")} color="from-violet-600 to-purple-700" />
//                 <ActionButton icon={<Bookmark size={16} />} label="View Saved" onClick={() => navigate("/saved")} color="from-emerald-600 to-teal-700" />
//               </div>
//             </div>

//             {/* pro tip */}
//             <div className="bg-gradient-to-br from-amber-700/30 to-orange-700/20 backdrop-blur-md rounded-2xl p-5 border border-amber-600/20 shadow-lg">
//               <div className="flex items-start gap-3">
//                 <Sparkles className="text-amber-300 mt-0.5 flex-shrink-0" size={18} />
//                 <div>
//                   <h3 className="text-sm font-semibold text-amber-200 mb-1">Pro Tip</h3>
//                   <p className="text-amber-100/80 text-xs">
//                     Use the AI summary feature to extract action items 3x faster from your meetings.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </aside>
//         </div>
//       </main>
//     </div>
//   );
// }

// function StatCard({ icon, label, value, loading }) {
//   return (
//     <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-600/30 hover:border-slate-500/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
//       {/* Animated background gradient */}
//       <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
//       {/* Subtle glow effect */}
//       <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
      
//       {/* Content */}
//       <div className="relative z-10">
//         {/* Top section with icon */}
//         <div className="flex items-center justify-between mb-4">
//           <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-400/20
//             group-hover:from-blue-500/30 group-hover:to-purple-500/30 group-hover:border-blue-400/30
//             transition-all duration-500 transform perspective-1000 
//             group-hover:rotate-y-180">
//             <div className="text-blue-300 group-hover:text-blue-200 transition-colors duration-300">
//               {icon}
//             </div>
//           </div>
          
//           {/* Decorative dots */}
//           <div className="flex gap-1 opacity-40 group-hover:opacity-60 transition-opacity duration-300">
//             <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
//             <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
//             <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
//           </div>
//         </div>

//         {/* Value */}
//         <div className="mb-3">
//           {loading ? (
//             <div className="h-8 w-16 bg-slate-600/40 rounded-lg animate-pulse"></div>
//           ) : (
//             <div className="text-3xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300 tracking-tight">
//               {value}
//             </div>
//           )}
//         </div>

//         {/* Label */}
//         <div className="text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors duration-300 uppercase tracking-wider">
//           {label}
//         </div>

//         {/* Bottom accent line */}
//         <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//       </div>
//     </div>
//   );
// }


// /* Meeting card */
// function MeetingCard({ meeting, onClick }) {
//   return (
//     <div
//       onClick={onClick}
//       className="group bg-slate-800/30 backdrop-blur-md p-4 rounded-xl border border-slate-700/30 hover:border-slate-600/50 cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col"
//     >
//       <div className="flex justify-between items-start mb-3">
//         <h3 className="font-medium text-white truncate group-hover:text-blue-300 transition-colors text-sm">
//           {meeting.title || "Untitled Meeting"}
//         </h3>
//         <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700/50 rounded transition-all">
//           <MoreHorizontal size={14} className="text-slate-400" />
//         </button>
//       </div>
//       <div className="flex items-center gap-2 mb-4">
//         <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
//           {new Date(meeting.meetingDate).toLocaleDateString()}
//         </span>
//         <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
//           {Math.round(meeting.durationSeconds || 0)} min
//         </span>
//       </div>
//       <div className="flex justify-between items-center mt-auto">
//         <div className="flex gap-2">
//           {meeting.summary && <Tag color="blue" text="Saved" />}
//           {meeting.hasProjectPlan && <Tag color="green" text="Plan" />}
//         </div>
//         <ChevronRight size={14} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
//       </div>
//     </div>
//   );
// }

// /* Tag */
// function Tag({ text, color }) {
//   const colorMap = {
//     blue: "bg-blue-900/30 text-blue-400 border border-blue-800/30",
//     green: "bg-green-900/30 text-green-400 border border-green-800/30",
//     gray: "bg-slate-700/50 text-slate-400 border border-slate-600/30",
//   };
//   return (
//     <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[color]}`}>
//       {text}
//     </span>
//   );
// }

// /* Action button */
// function ActionButton({ icon, label, onClick, color }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${color} text-white font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm`}
//     >
//       {icon}
//       {label}
//     </button>
//   );
// }

import { useNavigate } from "react-router-dom";
import { 
  CalendarPlus, ListChecks, Bookmark, FileText, Clock, ChevronRight, 
  TrendingUp, Users, Zap, MoreHorizontal, Sparkles, Activity, Target 
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const API = import.meta.env.VITE_API_BASE_URL || "";

export default function Home() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    saved: 0,
    plansGenerated: 0,
    avgDuration: 0,
  });
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    gsap.fromTo(
      pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch(`${API}/api/meetings`);
        const meetings = await res.json();

        const total = meetings.length;
        const saved = meetings.filter(m => m.summary && m.summary.length > 0).length;
        const plans = meetings.filter(m => m.hasProjectPlan).length;
        const avgDur = total > 0
          ? Math.round(meetings.reduce((a, b) => a + (b.durationSeconds || 0), 0) / total)
          : 0;

        setStats({ totalMeetings: total, saved, plansGenerated: plans, avgDuration: avgDur });
        setRecentMeetings(meetings.slice(0, 6));
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleScheduleMeeting = () => {
    const googleCalendarUrl =
      "https://calendar.google.com/calendar/render?" +
      "action=TEMPLATE&" +
      "text=Meeting&" +
      "details=Meeting scheduled via Fireflies Dashboard&" +
      "location=&" +
      "add=fred@fireflies.ai";
    window.open(googleCalendarUrl, "_blank");
  };

  const handleMeetingClick = async (id) => {
    try {
      const res = await fetch(`${API}/api/meetings/${id}`);
      if (!res.ok) return;
      const meeting = await res.json();

      if (meeting.projectPlan || meeting.hasProjectPlan) {
        navigate(`/project-plan/${meeting.id}`);
      } else if (
        meeting.functionalDoc?.length > 0 ||
        meeting.mockups?.length > 0 ||
        meeting.markdown?.length > 0
      ) {
        navigate(`/generate-files/${meeting.id}`);
      } else {
        navigate(`/meetings/${meeting.firefliesId || meeting.id}`);
      }
    } catch (err) {
      console.error("Failed to navigate:", err);
    }
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900/80 to-purple-900/90 text-white relative"
    >
      {/* background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* header */}
      <header className="w-full mb-6 rounded-3xl bg-gradient-to-r from-slate-800/90 to-purple-900/70 backdrop-blur-md border border-slate-700/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-5 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Zap className="text-white" size={24} />
            </div>
            <div className="pt-5">
              <h1 className="text-2xl  sm:text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Projectra Dashboard
              </h1>
              <p className="text-slate-300  text-sm sm:text-base">
                Turning discussions into actionable plans
              </p>
            </div>
          </div>
          {/* <div className="hidden sm:flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-full border border-slate-600/50">
            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></div>
            <span className="text-sm text-slate-300">{isOnline ? "System Active" : "Offline"}</span>
          </div> */}
        </div>
      </header>

      {/* content */}
      <main className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<ListChecks size={18} />} label="Today's Meetings" value={loading ? "…" : stats.totalMeetings} />
          <StatCard icon={<Bookmark size={18} />} label="Saved" value={loading ? "…" : stats.saved} />
          <StatCard icon={<FileText size={18} />} label="Plans Generated" value={loading ? "…" : stats.plansGenerated} />
          <StatCard icon={<Clock size={18} />} label="Avg. Duration" value={loading ? "…" : `${stats.avgDuration}m`} />
        </div>

        {/* main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* recent meetings */}
          <section className="lg:col-span-2 bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/30 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Activity size={20} className="text-purple-400" /> Recent Updates
              </h2>
              <button
                onClick={() => navigate("/meetings")}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 group"
              >
                Fetch meetings <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            {recentMeetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentMeetings.map((m, i) => (
                  <MeetingCard key={i} meeting={m} onClick={() => handleMeetingClick(m.id)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="mx-auto w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                  <Users className="text-slate-400" size={28} />
                </div>
                <p className="text-slate-300">No meetings yet</p>
                <p className="text-slate-400 text-sm mt-1">Fetch meetings to see them here</p>
              </div>
            )}
          </section>

          {/* sidebar */}
          <aside className="space-y-6">
            {/* quick actions */}
            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/30 shadow-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Target size={18} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <ActionButton icon={<CalendarPlus size={16} />} label="Schedule Meeting" onClick={handleScheduleMeeting} color="from-blue-600 to-indigo-700" />
                <ActionButton icon={<ListChecks size={16} />} label="Fetch Meetings" onClick={() => navigate("/meetings")} color="from-violet-600 to-purple-700" />
                <ActionButton icon={<Bookmark size={16} />} label="View Saved" onClick={() => navigate("/saved")} color="from-emerald-600 to-teal-700" />
              </div>
            </div>

            
          </aside>
        </div>
      </main>
    </div>
  );
}

// StatCard Component
function StatCard({ icon, label, value, loading }) {
  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-600/30 hover:border-slate-500/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Top section with icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-400/20
            group-hover:from-blue-500/30 group-hover:to-purple-500/30 group-hover:border-blue-400/30
            transition-all duration-500 transform perspective-1000 
            group-hover:rotate-y-180">
            <div className="text-blue-300 group-hover:text-blue-200 transition-colors duration-300">
              {icon}
            </div>
          </div>
          
         
        </div>

        {/* Value */}
        <div className="mb-3">
          {loading ? (
            <div className="h-8 w-16 bg-slate-600/40 rounded-lg animate-pulse"></div>
          ) : (
            <div className="text-3xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300 tracking-tight">
              {value}
            </div>
          )}
        </div>

        {/* Label */}
        <div className="text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors duration-300 uppercase tracking-wider">
          {label}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
}

// MeetingCard Component
function MeetingCard({ meeting, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group bg-slate-800/30 backdrop-blur-md p-4 rounded-xl border border-slate-700/30 hover:border-slate-600/50 cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-white truncate group-hover:text-blue-300 transition-colors text-sm">
          {meeting.title || "Untitled Meeting"}
        </h3>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700/50 rounded transition-all">
          <MoreHorizontal size={14} className="text-slate-400" />
        </button>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
          {new Date(meeting.meetingDate).toLocaleDateString()}
        </span>
        <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
          {Math.round(meeting.durationSeconds || 0)} min
        </span>
      </div>
      <div className="flex justify-between items-center mt-auto">
        <div className="flex gap-2">
          {meeting.summary && <Tag color="blue" text="Saved" />}
          {meeting.hasProjectPlan && <Tag color="green" text="Plan" />}
        </div>
        <ChevronRight size={14} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
      </div>
    </div>
  );
}

// Tag Component
function Tag({ text, color }) {
  const colorMap = {
    blue: "bg-blue-900/30 text-blue-400 border border-blue-800/30",
    green: "bg-green-900/30 text-green-400 border border-green-800/30",
    gray: "bg-slate-700/50 text-slate-400 border border-slate-600/30",
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[color]}`}>
      {text}
    </span>
  );
}

// ActionButton Component
function ActionButton({ icon, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${color} text-white font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm`}
    >
      {icon}
      {label}
    </button>
  );
}
