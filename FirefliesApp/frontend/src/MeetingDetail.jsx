

// import { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Download, ArrowLeft, Save, RefreshCw, Check, Settings2, FileText, Calendar, Clock, Zap, Play, Headphones, Edit, Eye, ChevronDown, ChevronUp } from 'lucide-react';
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import FileSelectionModal from './FileSelectionModal';
// import { FixedSizeList as List } from 'react-window';


// const API = import.meta.env.VITE_API_BASE_URL || "";

// // Helper functions
// function parseDate(value) {
//   if (!value) return null;
//   const n = typeof value === "number" ? value : Number(value) || null;
//   return n ? new Date(n) : new Date(value);
// }

// function safeJsonParse(str) {
//   if (typeof str !== 'string') {
//     return str;
//   }
//   try {
//     const trimmed = str.trim();
//     if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
//       return JSON.parse(str);
//     }
//   } catch (e) {
//     console.warn("Failed to parse JSON string, returning as is:", str);
//     return str;
//   }
//   return str;
// }

// function useAutosizeTextArea(textAreaRef, value) {
//   useEffect(() => {
//     if (textAreaRef?.current) {
//       textAreaRef.current.style.height = "auto";
//       textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
//     }
//   }, [textAreaRef, value]);
// }

// const CustomCheckbox = ({ label, checked, onChange, icon }) => (
//   <label 
//     onClick={onChange} 
//     className="flex items-center gap-3 cursor-pointer text-slate-300 hover:text-white transition-all duration-300 group p-1"
//   >
//     <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
//       checked 
//         ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400 shadow-lg shadow-blue-500/25' 
//         : 'bg-slate-700/50 border-slate-600 group-hover:border-slate-500'
//     }`}>
//       {checked && (
//         <Check size={12} className="text-white animate-in fade-in duration-200" strokeWidth={3} />
//       )}
//     </div>
//     <div className="flex items-center gap-2">
//       {icon && <span className="text-sm">{icon}</span>}
//       <span className="text-sm font-medium group-hover:translate-x-0.5 transition-transform duration-300">
//         {label}
//       </span>
//     </div>
//   </label>
// );

// const LoadingSkeleton = () => (
//   <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/60 to-purple-900/70 p-4 md:p-6">
//     <div className="container mx-auto max-w-7xl">
//       <div className="space-y-6">
//         {/* Header skeleton */}
//         <div className="h-32 bg-slate-800/30 backdrop-blur-md rounded-3xl border border-slate-700/20 animate-pulse" />
        
//         {/* Tabs skeleton */}
//         <div className="h-16 bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/20 animate-pulse" />
        
//         {/* Content skeleton */}
//         <div className="space-y-4">
//           <div className="h-24 bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/20 animate-pulse" />
//           <div className="h-96 bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/20 animate-pulse" />
//         </div>
//       </div>
//     </div>
//   </div>
// );

// const SectionCard = ({ children, className = "", ...props }) => (
//   <div 
//     className={`bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 ${className}`} 
//     {...props}
//   >
//     {children}
//   </div>
// );

// const ActionButton = ({ children, variant = "secondary", className = "", ...props }) => {
//   const baseClasses = "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]";
  
//   const variants = {
//     primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30",
//     secondary: "bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/40 text-slate-200 hover:text-white",
//     ghost: "bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 hover:text-white"
//   };

//   return (
//     <button 
//       className={`${baseClasses} ${variants[variant]} ${className}`} 
//       {...props}
//     >
//       {children}
//     </button>
//   );
// };

// const TabButton = ({ active, onClick, icon, children, count }) => (
//   <button
//     onClick={onClick}
//     className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 relative ${
//       active
//         ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
//         : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 hover:text-white'
//     }`}
//   >
//     <div className={`p-1 rounded-lg ${active ? 'bg-white/20' : 'bg-slate-600/50'}`}>
//       {icon}
//     </div>
//     <span>{children}</span>
//     {count && (
//       <span className={`px-2 py-1 text-xs rounded-full ${
//         active ? 'bg-white/20 text-white' : 'bg-slate-600/50 text-slate-400'
//       }`}>
//         {count}
//       </span>
//     )}
//   </button>
// );

// // Main Component
// export default function MeetingDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [meeting, setMeeting] = useState(null);
//   const [summary, setSummary] = useState("");
//   const [dbId, setDbId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState('summary');
//   const [summaryPreferences, setSummaryPreferences] = useState(null);
//   const [previewMode, setPreviewMode] = useState(true);
//   const [showFileSelectionModal, setShowFileSelectionModal] = useState(false);

//   const textAreaRef = useRef(null);
//   useAutosizeTextArea(textAreaRef, summary);

//   useEffect(() => {
//     setLoading(true);
//     fetch(`${API}/api/external/meetings/${id}`)
//     .then(res => {
//         if (!res.ok) {
//             return res.text().then(text => { 
//                 try {
//                     const errorJson = JSON.parse(text);
//                     throw new Error(errorJson.message || 'An unknown error occurred.');
//                 } catch (e) {
//                     throw new Error(text || 'An unknown server error occurred.');
//                 }
//             });
//         }
//         return res.json();
//     })
//     .then(data => {
//       let meetingData = data.transcript ? data.transcript : data;
//       const databaseId = data.dbId ? data.dbId : meetingData.dbId;

//       meetingData.sentences = safeJsonParse(meetingData.sentences);
//       if (meetingData.summary) {
//         meetingData.summary.action_items = safeJsonParse(meetingData.summary.action_items);
//         meetingData.summary.keywords = safeJsonParse(meetingData.summary.keywords);
//         meetingData.summary.extended_sections = safeJsonParse(meetingData.summary.extended_sections);
//       }

//       setMeeting(meetingData);
//       if (databaseId) { setDbId(databaseId); }
//       upsertMeetingToDb(meetingData);

//       if (data.summaryPreferencesJson) {
//         setSummaryPreferences(JSON.parse(data.summaryPreferencesJson));
//       } else {
//         const extendedPrefs = {};
//         if (meetingData.summary?.extended_sections && Array.isArray(meetingData.summary.extended_sections)) {
//           meetingData.summary.extended_sections.forEach(section => {
//             extendedPrefs[section.title] = false;
//           });
//         }
//         setSummaryPreferences({
//           overview: true, action_items: true, keywords: true, bullet_gist: true,
//           extended_sections: extendedPrefs
//         });
//       }
      
//       if (data.userEditedSummary) {
//         setSummary(data.userEditedSummary);
//       } else {
//         let finalSummary = "";
//         const summaryData = meetingData.summary;
//         if (summaryData) {
//             const tempPrefs = data.summaryPreferencesJson ? JSON.parse(data.summaryPreferencesJson) : { overview: true, action_items: true, keywords: true, bullet_gist: true };

//             if (tempPrefs.overview && (summaryData.overview || summaryData.short_summary)) {
//               finalSummary += `## Overview\n${summaryData.overview || summaryData.short_summary}\n\n`;
//             }
//             if (tempPrefs.action_items && summaryData.action_items) {
//               if (Array.isArray(summaryData.action_items) && summaryData.action_items.length > 0) {
//                 finalSummary += `## Action Items\n- ${summaryData.action_items.join('\n- ')}\n\n`;
//               } else if (typeof summaryData.action_items === 'string') {
//                 finalSummary += `## Action Items\n${summaryData.action_items}\n\n`;
//               }
//             }
//             if (tempPrefs.keywords && summaryData.keywords) {
//               if (Array.isArray(summaryData.keywords) && summaryData.keywords.length > 0) {
//                 finalSummary += `## Keywords\n${summaryData.keywords.join(', ')}\n\n`;
//               } else if (typeof summaryData.keywords === 'string') {
//                  finalSummary += `## Keywords\n${summaryData.keywords}\n\n`;
//               }
//             }
//             if (tempPrefs.bullet_gist && summaryData.bullet_gist) {
//               finalSummary += `## Key Points\n${summaryData.bullet_gist}\n\n`;
//             }
//         }
//         setSummary(finalSummary);
//       }
//     })
//     .catch((err) => { 
//         console.error("Caught error:", err); 
//         alert(`Failed to load meeting details: ${err.message}`);
//     })
//     .finally(() => setLoading(false));
//   }, [id]);

//   const handleRegenerateSummary = () => {
//     if (!window.confirm("This will overwrite any manual edits in the text area. Are you sure you want to regenerate the summary?")) {
//       return;
//     }
//     if (!meeting?.summary || !summaryPreferences) return;

//     let finalSummary = "";
//     const summaryData = meeting.summary;

//     if (summaryPreferences.overview && (summaryData.overview || summaryData.short_summary)) {
//       finalSummary += `## Overview\n${summaryData.overview || summaryData.short_summary}\n\n`;
//     }
//     if (summaryPreferences.action_items && Array.isArray(summaryData.action_items) && summaryData.action_items.length > 0) {
//       finalSummary += `## Action Items\n- ${summaryData.action_items.join('\n- ')}\n\n`;
//     }
//     if (summaryPreferences.keywords && Array.isArray(summaryData.keywords) && summaryData.keywords.length > 0) {
//       finalSummary += `## Keywords\n${summaryData.keywords.join(', ')}\n\n`;
//     }
//     if (summaryPreferences.bullet_gist && summaryData.bullet_gist) {
//       finalSummary += `## Key Points\n${summaryData.bullet_gist}\n\n`;
//     }
//     if (meeting.summary.extended_sections && summaryPreferences.extended_sections) {
//         const selectedSections = meeting.summary.extended_sections
//             .filter(section => summaryPreferences.extended_sections[section.title])
//             .map(section => `## ${section.title}\n${section.content}`)
//             .join('\n\n');
//         if (selectedSections) {
//             finalSummary += `${selectedSections}\n\n`;
//         }
//     }
//     setSummary(finalSummary);
//   };

//   const handleSaveAll = async () => {
//     if (!dbId) return alert("Meeting not saved in DB yet.");
//     setSaving(true);
//     try {
//       await Promise.all([
//         fetch(`${API}/api/meetings/${dbId}/summary`, {
//           method: "PUT", headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ summary: summary })
//         }),
//         fetch(`${API}/api/meetings/${dbId}/preferences`, {
//           method: "PUT", headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ preferences: summaryPreferences })
//         })
//       ]);
//       alert("Summary and preferences saved successfully!");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to save changes.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   async function upsertMeetingToDb(data) {
//     try {
//       const payload = {
//           FirefliesId: String(data?.id ?? ""), Title: data?.title ?? "",
//           MeetingDate: data?.date ? new Date(data.date).toISOString() : null,
//           DurationSeconds: Math.round(Number(data?.duration ?? 0)),
//           TranscriptJson: JSON.stringify(data?.sentences ?? []),
//           Summary: data?.summary?.overview ?? data?.summary?.short_summary ?? "",
//           BulletGist: data.summary?.bullet_gist ?? null,
//           ActionItems: Array.isArray(data.summary?.action_items) 
//             ? JSON.stringify(data.summary.action_items) 
//             : data.summary?.action_items ?? null,
//           Keywords: Array.isArray(data.summary?.keywords) 
//             ? JSON.stringify(data.summary.keywords) 
//             : data.summary?.keywords ?? null,
//             ExtendedSectionsJson: JSON.stringify(data.summary?.extended_sections ?? null),
//           AudioUrl: data?.audio_url ?? null
//       };
//       const res = await fetch(`${API}/api/meetings/upsert`, {
//           method: "POST", headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload)
//       });
//       if (!res.ok) throw new Error(await res.text());
//       const saved = await res.json();
//       if (saved?.id) setDbId(saved.id);
//     } catch (err) { console.error("Upsert failed:", err); }
//   }

//   async function downloadSummaryFile() {
//     if (!dbId) return alert("Meeting not saved yet.");
//     const blob = new Blob([summary], { type: 'text/plain' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${meeting.title}-summary.md`;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     window.URL.revokeObjectURL(url);
//   }

//   const handleFileSelectionConfirm = (selectedFileIds) => {
//     setShowFileSelectionModal(false);
//     if (dbId) {
//       navigate(`/generate-files/${dbId}`, { 
//         state: { 
//           summary, 
//           meetingId: id,
//           selectedFiles: selectedFileIds
//         } 
//       });
//     } else {
//       alert("Meeting not saved in DB yet. Please wait.");
//     }
//   };
  
//   if (loading || !summaryPreferences) return <LoadingSkeleton />;
//   if (!meeting) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/60 to-purple-900/70 flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-6xl mb-4">🔍</div>
//           <div className="text-xl text-slate-300">Meeting not found</div>
//         </div>
//       </div>
//     );
//   }

//   const d = parseDate(meeting.date);
//   const audioSrc = meeting?.audio_url ? (meeting.audio_url.startsWith('http') ? meeting.audio_url : `${API}${meeting.audio_url}`) : null;

//   console.log("Rendering MeetingDetail with data:", { audioSrc });
//   return (
//     <div className="min-h-screen rounded-3xl pb-5 bg-gradient-to-br from-slate-900 via-blue-900/60 to-purple-900/70 text-white">
//       {/* Animated background elements */}
//       <div className="absolute  inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
//       </div>

//       <div className="container  mx-auto relative z-10 max-w-7xl p-3 md:p-6 space-y-5">
//         {/* Enhanced Header */}
//         <SectionCard className="p-6 md:p-8 ">
//           <div className="flex   flex-col lg:flex-row justify-between items-start gap-6">
//             <div className="flex items-start gap-4 min-w-0 flex-1">
//               <ActionButton
//                 variant="ghost"
//                 onClick={() => navigate(-1)}
//                 className="p-3 shrink-0"
//               >
//                 <ArrowLeft size={20} />
//               </ActionButton>
              
//               <div className="flex items-start gap-4 min-w-0 flex-1">
//                 <div className="p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-lg shrink-0 animate-pulse">
//                   <FileText size={28} className="text-white" />
//                 </div>
                
//                 <div className="min-w-0 flex-1">
//                   <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
//                     {meeting.title}
//                   </h1>
                  
//                   <div className="flex flex-wrap items-center gap-3">
//                     <div className="flex items-center gap-2 bg-slate-700/50 backdrop-blur-sm px-4 py-1 rounded-xl border border-slate-600/30 hover:bg-slate-700/70 transition-all duration-300">
//                       <Calendar size={16} className="text-blue-400" />
//                       <span className="text-slate-400 font-semibold text-sm">
//                         {d ? d.toLocaleDateString(undefined, { 
//                           weekday: 'short',
//                           year: 'numeric', 
//                           month: 'short', 
//                           day: 'numeric' 
//                         }) : "Date unavailable"}
//                       </span>
//                     </div>
                    
//                     <div className="flex items-center gap-2 bg-slate-700/50 backdrop-blur-sm px-4 py-1 rounded-xl border border-slate-600/30 hover:bg-slate-700/70 transition-all duration-300">
//                       <Clock size={16} className="text-purple-400" />
//                       <span className="text-slate-400 font-semibold text-sm">
//                         {Math.round(meeting.duration)} min
//                       </span>
//                     </div>
                    
//                     {audioSrc && (
//                       <div className="flex items-center gap-2 bg-green-600/20 border border-green-500/30 px-4 py-2 rounded-xl">
//                         <Headphones size={16} className="text-green-400" />
//                         <span className="text-green-300 font-medium text-sm">Audio Available</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Quick Actions were here, now moved to the summary card */}
//           </div>
//         </SectionCard>

//         {/* Tab Navigation */}
//         <SectionCard className="p-2">
//           <div className="flex gap-2">
//             <TabButton
//               active={activeTab === 'summary'}
//               onClick={() => setActiveTab('summary')}
//               icon={<FileText size={16} />}
//             >
//               Meeting Summary
//             </TabButton>
            
//             <TabButton
//               active={activeTab === 'transcript'}
//               onClick={() => setActiveTab('transcript')}
//               icon={<Headphones size={16} />}
//               count={meeting.sentences?.length || 0}
//             >
//               Transcript
//             </TabButton>
//           </div>
//         </SectionCard>

//         {/* Tab Content */}
//         {activeTab === 'summary' && (
//           <div className="space-y-6">
//             {/* Summary Settings - Horizontal Layout */}
//             <SectionCard className="p-6">
//               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/30">
//                 <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
//                   <Settings2 size={20} className="text-white" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-white">Summary Settings</h3>
//               </div>

//               {/* Core Sections - Horizontal Grid */}
//               <div className="mb-6">
//                 <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
//                   <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
//                   Core Sections
//                 </h4>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                   {[
//                     { key: 'overview', label: 'Overview',  },
//                     { key: 'action_items', label: 'Action Items',  },
//                     { key: 'keywords', label: 'Keywords',  },
//                     { key: 'bullet_gist', label: 'Key Points',  }
//                   ].map(({ key, label, icon }) => (
//                     <div 
//                       key={key} 
//                       className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${
//                         summaryPreferences[key] 
//                           ? 'border-blue-500/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10 shadow-lg shadow-blue-500/10' 
//                           : 'border-slate-700/40 bg-slate-700/20 hover:bg-slate-700/30 hover:border-slate-600/60'
//                       }`}
//                       onClick={() => setSummaryPreferences(prev => ({ ...prev, [key]: !prev[key] }))}
//                     >
//                       <CustomCheckbox
//                         label={label}
//                         checked={!!summaryPreferences[key]}
//                         onChange={() => {}}
//                         icon={icon}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Extended Sections */}
//               {summaryPreferences.extended_sections && Object.keys(summaryPreferences.extended_sections).length > 0 && (
//                 <div className="border border-slate-700/40 rounded-2xl p-5 bg-slate-700/10 mb-6">
//                   <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
//                     <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
//                     Extended Sections
//                   </h4>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                     {Object.keys(summaryPreferences.extended_sections).map((title) => (
//                       <div 
//                         key={title}
//                         className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
//                           summaryPreferences.extended_sections[title]
//                             ? 'border-purple-500/50 bg-purple-600/10'
//                             : 'border-slate-700/40 bg-slate-700/10 hover:bg-slate-700/20 hover:border-slate-600/60'
//                         }`}
//                         onClick={() => {
//                           setSummaryPreferences(prev => ({
//                             ...prev, 
//                             extended_sections: { 
//                               ...prev.extended_sections, 
//                               [title]: !prev.extended_sections[title] 
//                             }
//                           }));
//                         }}
//                       >
//                         <CustomCheckbox
//                           label={title}
//                           checked={summaryPreferences.extended_sections[title]}
//                           onChange={() => {}}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="flex gap-4">
//                 <ActionButton 
//                   variant="primary"
//                   onClick={handleRegenerateSummary}
//                   className="flex-shrink-0"
//                 >
//                   <RefreshCw size={16} />
//                   Regenerate Summary
//                 </ActionButton>
//               </div>
//             </SectionCard>

//             {/* Summary Content */}
//             <SectionCard className="p-6 md:p-8  ">
//               <div className="flex justify-between items-center mb-6">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
//                     <FileText size={20} className="text-white" />
//                   </div>
//                   <h3 className="text-xl font-semibold text-white">Meeting Summary</h3>
//                 </div>
                
//                 {/* MOVED BUTTONS START HERE */}
//                 <div className="flex items-center gap-2">
//                   <ActionButton
//                     variant="ghost"
//                     onClick={downloadSummaryFile}
//                     className="p-3"
//                     title="Download Summary"
//                   >
//                     <Download size={18} />
//                   </ActionButton>
                  
//                   <ActionButton
//                     variant="ghost"
//                     onClick={() => setPreviewMode(prev => !prev)}
//                     className="p-3"
//                     title={previewMode ? "Switch to Edit Mode" : "Switch to Preview Mode"}
//                   >
//                     {previewMode ? <Edit size={18} /> : <Eye size={18} />}
//                   </ActionButton>
//                 </div>
//                 {/* MOVED BUTTONS END HERE */}

//               </div>

//               <div className="min-h-[500px]">
//                 {previewMode ? (
//                   <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-700/40 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
//                     <ReactMarkdown
//                       remarkPlugins={[remarkGfm]}
//                       components={{
//                         h2: ({ node, ...props }) => {
//                           const text = props.children[0];
//                           let gradientClass = "from-slate-600 to-slate-700";
//                           if (typeof text === 'string') {
//                               if (text.includes("Overview")) gradientClass = "from-blue-600 to-blue-700";
//                               else if (text.includes("Action Items")) gradientClass = "from-green-600 to-green-700";
//                               else if (text.includes("Keywords")) gradientClass = "from-amber-600 to-orange-600";
//                               else if (text.includes("Key Points")) gradientClass = "from-purple-600 to-purple-700";
//                           }
//                           return (
//                             <h2 
//                               {...props} 
//                               className={`inline-block px-6 py-3 rounded-xl text-white text-sm font-bold mb-6 mt-8 first:mt-0 bg-gradient-to-r ${gradientClass} shadow-lg transform hover:scale-105 transition-transform duration-300`}
//                             />
//                           );
//                         },
//                         p: ({ node, ...props }) => <p {...props} className="text-slate-300 leading-relaxed mb-5 text-base" />,
//                         ul: ({ node, ...props }) => <ul {...props} className="text-slate-300 list-disc list-inside mb-5 space-y-2 pl-2" />,
//                         li: ({ node, ...props }) => <li {...props} className="text-slate-300 leading-relaxed" />
//                       }}
//                     >
//                       {summary || "No summary content available. Please generate or edit the summary."}
//                     </ReactMarkdown>
//                   </div>
//                 ) : (
//                   <div className="relative">
//                     <textarea
//                       ref={textAreaRef}
//                       value={summary}
//                       onChange={(e) => setSummary(e.target.value)}
//                       className="w-full min-h-[500px] bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-mono text-sm leading-relaxed placeholder:text-slate-500 transition-all duration-300"
//                       placeholder="Start editing your meeting summary here..."
//                     />
//                     <div className="absolute bottom-4 right-4 text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-lg backdrop-blur-sm">
//                       {summary.length} characters
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Enhanced Action Buttons */}
//               <div className="flex  m-15 gap-10 mt-8 pt-6 border-t border-slate-700/30">
//                 <ActionButton
//                   variant="primary"
//                   onClick={handleSaveAll}
//                   disabled={!dbId || saving}
//                   className="flex-1"
//                 >
//                   <Save size={18} />
//                   {saving ? (
//                     <>
//                       <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
//                       Saving...
//                     </>
//                   ) : (
//                     'Save Changes'
//                   )}
//                 </ActionButton>
                
//                 <ActionButton
//                   variant="secondary"
//                   onClick={() => setShowFileSelectionModal(true)}
//                   disabled={!dbId}
//                   className="flex-1"
//                 >
//                   <FileText size={18} />
//                   Generate Files
//                 </ActionButton>
//               </div>
//             </SectionCard>
//           </div>
//         )}

//         {/* Transcript Tab Content */}
//         {activeTab === 'transcript' && (
//           <SectionCard className="p-6 md:p-8 animate-in slide-in-from-top duration-500">
//             <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/30">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl">
//                   <Headphones size={20} className="text-white" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-white">Meeting Transcript</h3>
//                 {meeting.sentences?.length && (
//                   <div className="px-3 py-1 bg-slate-700/50 rounded-lg text-sm text-slate-300">
//                     {meeting.sentences.length} segments
//                   </div>
//                 )}
//               </div>
              
//               {audioSrc && (
//                 <div className="flex items-center gap-2 bg-green-600/20 border border-green-500/30 px-4 py-2 rounded-xl">
//                   <Play size={14} className="text-green-400" />
//                   <span className="text-green-300 text-sm font-medium">Audio Ready</span>
//                 </div>
//               )}
//             </div>

//             {/* Audio Player */}
//             {audioSrc && (
//               <div className="mb-8 p-6 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl border border-slate-700/40">
//                 <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
//                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                   Meeting Recording
//                 </h4>
//                 <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
//                   <audio 
//                     controls 
//                     src={audioSrc} 
//                     className="w-full h-12 bg-slate-700 rounded-lg"
//                     style={{
//                       filter: 'sepia(1) hue-rotate(200deg) saturate(1.5) brightness(1.2)'
//                     }}
//                   >
//                     <div className="text-slate-400 text-center py-4">
//                       Your browser does not support the audio element.
//                     </div>
//                   </audio>
//                 </div>
//               </div>
//             )}
            
//             {/* Transcript Content */}
//             <div className="bg-gradient-to-br from-slate-700/20 to-slate-800/20 rounded-2xl border border-slate-700/40 overflow-hidden">
//               {meeting.sentences?.length ? (
//                 <div className="max-h-[600px]  overflow-y-auto custom-scrollbar">
//                   <div className="p-2 ">
//                     {meeting.sentences.map((s, index) => (
//                       <div 
//                         key={s.index || index} 
//                         className="group hover:bg-slate-700/20 rounded-xl p-2 transition-all duration-300 border border-transparent hover:border-slate-600/30"
//                       >
//                         <div className="flex items-start gap-4">
//                           <div className="flex items-center gap-3 min-w-0 mb-1">
//                             <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-300"></div>
//                             <span className="text-blue-400 font-semibold text-sm bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/30">
//                               {s.speaker_name ?? `Speaker ${index + 1}`}
//                             </span>
//                           </div>
//                         </div>
//                         <p className="text-slate-300 leading-relaxed ml-7 text-base group-hover:text-slate-200 transition-colors duration-300">
//                           {s.text}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center py-16">
//                   <div className="text-6xl mb-4 opacity-50">📝</div>
//                   <div className="text-xl text-slate-400 mb-2">No Transcript Available</div>
//                   <div className="text-sm text-slate-500">
//                     The meeting transcript could not be loaded or is not available.
//                   </div>
//                 </div>
//               )}
//             </div>
//           </SectionCard>
//         )}

//         {/* File Selection Modal */}
//         <FileSelectionModal
//           isOpen={showFileSelectionModal}
//           onClose={() => setShowFileSelectionModal(false)}
//           onConfirm={handleFileSelectionConfirm}
//         />
//       </div>

//       <style>
//   {`
//     .custom-scrollbar::-webkit-scrollbar {
//       width: 8px;
//     }
//     .custom-scrollbar::-webkit-scrollbar-track {
//       background: rgba(51, 65, 85, 0.3);
//       border-radius: 4px;
//     }
//     .custom-scrollbar::-webkit-scrollbar-thumb {
//       background: linear-gradient(180deg, #3b82f6, #8b5cf6);
//       border-radius: 4px;
//     }
//     .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//       background: linear-gradient(180deg, #2563eb, #7c3aed);
//     }
//   `}
// </style>
//     </div>
//   );
// }

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, ArrowLeft, Save, RefreshCw, Check, Settings2, FileText, Calendar, Clock, Zap, Play, Headphones, Edit, Eye, ChevronDown, ChevronUp, PieChart, Smile, Meh, Frown, TrendingUp, BarChart3, Filter } from 'lucide-react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FileSelectionModal from './FileSelectionModal';
import { FixedSizeList as List } from 'react-window';

const API = import.meta.env.VITE_API_BASE_URL || "";

// Helper functions
function parseDate(value) {
  if (!value) return null;
  const n = typeof value === "number" ? value : Number(value) || null;
  return n ? new Date(n) : new Date(value);
}

function safeJsonParse(str) {
  if (typeof str !== 'string') {
    return str;
  }
  try {
    const trimmed = str.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      return JSON.parse(str);
    }
  } catch (e) {
    console.warn("Failed to parse JSON string, returning as is:", str);
    return str;
  }
  return str;
}

function useAutosizeTextArea(textAreaRef, value) {
  useEffect(() => {
    if (textAreaRef?.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [textAreaRef, value]);
}

const CustomCheckbox = ({ label, checked, onChange, icon }) => (
  <label 
    onClick={onChange} 
    className="flex items-center gap-3 cursor-pointer text-slate-300 hover:text-white transition-all duration-300 group p-1"
  >
    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
      checked 
        ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400 shadow-lg shadow-blue-500/25' 
        : 'bg-slate-700/50 border-slate-600 group-hover:border-slate-500'
    }`}>
      {checked && (
        <Check size={12} className="text-white animate-in fade-in duration-200" strokeWidth={3} />
      )}
    </div>
    <div className="flex items-center gap-2">
      {icon && <span className="text-sm">{icon}</span>}
      <span className="text-sm font-medium group-hover:translate-x-0.5 transition-transform duration-300">
        {label}
      </span>
    </div>
  </label>
);

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/60 to-purple-900/70 p-4 md:p-6">
    <div className="container mx-auto max-w-7xl">
      <div className="space-y-6">
        <div className="h-32 bg-slate-800/30 backdrop-blur-md rounded-3xl border border-slate-700/20 animate-pulse" />
        <div className="h-16 bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/20 animate-pulse" />
        <div className="space-y-4">
          <div className="h-24 bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/20 animate-pulse" />
          <div className="h-96 bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/20 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const SectionCard = ({ children, className = "", ...props }) => (
  <div 
    className={`bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 ${className}`} 
    {...props}
  >
    {children}
  </div>
);

const ActionButton = ({ children, variant = "secondary", className = "", ...props }) => {
  const baseClasses = "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30",
    secondary: "bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/40 text-slate-200 hover:text-white",
    ghost: "bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 hover:text-white"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

const TabButton = ({ active, onClick, icon, children, count }) => (
  <div>
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 relative ${
      active
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
        : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 hover:text-white'
    }`}
  >
    <div className={`p-1 rounded-lg ${active ? 'bg-white/20' : 'bg-slate-600/50'}`}>
      {icon}
    </div>
    <span>{children}</span>
    {count !== undefined && (
      <span className={`px-2 py-1 text-xs rounded-full ${
        active ? 'bg-white/20 text-white' : 'bg-slate-600/50 text-slate-400'
      }`}>
        {count}
      </span>
    )}
    </button>
  </div>
);

// Enhanced sentiment analysis helper functions
function getSentenceSentiment(sentence) {
  // Check AI filters first (more specific)
  if (sentence?.ai_filters?.sentiment) {
    const sentiment = String(sentence.ai_filters.sentiment).toLowerCase();
    if (sentiment.includes('pos') || sentiment === 'positive') return 'positive';
    if (sentiment.includes('neg') || sentiment === 'negative') return 'negative';
    if (sentiment.includes('neu') || sentiment === 'neutral') return 'neutral';
  }
  
  // Fallback to sentence-level sentiment property
  if (sentence?.sentiment) {
    const sentiment = String(sentence.sentiment).toLowerCase();
    if (sentiment.includes('pos') || sentiment === 'positive') return 'positive';
    if (sentiment.includes('neg') || sentiment === 'negative') return 'negative';
    if (sentiment.includes('neu') || sentiment === 'neutral') return 'neutral';
  }
  
  return 'neutral'; // Default fallback
}

function percent(n) {
  return `${Number(n || 0).toFixed(1)}%`;
}

function getSentimentColor(sentiment) {
  switch (sentiment) {
    case 'positive': return { bg: 'bg-emerald-500', text: 'text-emerald-400', ring: 'ring-emerald-400' };
    case 'negative': return { bg: 'bg-red-500', text: 'text-red-400', ring: 'ring-red-400' };
    default: return { bg: 'bg-amber-500', text: 'text-amber-400', ring: 'ring-amber-400' };
  }
}

function getSentimentIcon(sentiment) {
  switch (sentiment) {
    case 'positive': return <Smile size={16} className="text-emerald-400" />;
    case 'negative': return <Frown size={16} className="text-red-400" />;
    default: return <Meh size={16} className="text-amber-400" />;
  }
}

// Main Component
export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [summary, setSummary] = useState("");
  const [dbId, setDbId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [summaryPreferences, setSummaryPreferences] = useState(null);
  const [previewMode, setPreviewMode] = useState(true);
  const [showFileSelectionModal, setShowFileSelectionModal] = useState(false);

  // Enhanced sentiment-related UI states
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [highlightedSentence, setHighlightedSentence] = useState(null);
  const [sentimentViewMode, setSentimentViewMode] = useState('overview'); // 'overview' | 'timeline' | 'detailed'

  const textAreaRef = useRef(null);
  useAutosizeTextArea(textAreaRef, summary);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/external/meetings/${id}`)
    .then(res => {
        if (!res.ok) {
            return res.text().then(text => { 
                try {
                    const errorJson = JSON.parse(text);
                    throw new Error(errorJson.message || 'An unknown error occurred.');
                } catch (e) {
                    throw new Error(text || 'An unknown server error occurred.');
                }
            });
        }
        return res.json();
    })
    .then(data => {
      let meetingData = data.transcript ? data.transcript : data;
      const databaseId = data.dbId ? data.dbId : meetingData.dbId;

      meetingData.sentences = safeJsonParse(meetingData.sentences);
      if (meetingData.summary) {
        meetingData.summary.action_items = safeJsonParse(meetingData.summary.action_items);
        meetingData.summary.keywords = safeJsonParse(meetingData.summary.keywords);
        meetingData.summary.extended_sections = safeJsonParse(meetingData.summary.extended_sections);
      }

      setMeeting(meetingData);
      if (databaseId) { setDbId(databaseId); }
      upsertMeetingToDb(meetingData);

      if (data.summaryPreferencesJson) {
        setSummaryPreferences(JSON.parse(data.summaryPreferencesJson));
      } else {
        const extendedPrefs = {};
        if (meetingData.summary?.extended_sections && Array.isArray(meetingData.summary.extended_sections)) {
          meetingData.summary.extended_sections.forEach(section => {
            extendedPrefs[section.title] = false;
          });
        }
        setSummaryPreferences({
          overview: true, action_items: true, keywords: true, bullet_gist: true,
          extended_sections: extendedPrefs
        });
      }
      
      if (data.userEditedSummary) {
        setSummary(data.userEditedSummary);
      } else {
        let finalSummary = "";
        const summaryData = meetingData.summary;
        if (summaryData) {
            const tempPrefs = data.summaryPreferencesJson ? JSON.parse(data.summaryPreferencesJson) : { overview: true, action_items: true, keywords: true, bullet_gist: true };

            if (tempPrefs.overview && (summaryData.overview || summaryData.short_summary)) {
              finalSummary += `## Overview\n${summaryData.overview || summaryData.short_summary}\n\n`;
            }
            if (tempPrefs.action_items && summaryData.action_items) {
              if (Array.isArray(summaryData.action_items) && summaryData.action_items.length > 0) {
                finalSummary += `## Action Items\n- ${summaryData.action_items.join('\n- ')}\n\n`;
              } else if (typeof summaryData.action_items === 'string') {
                finalSummary += `## Action Items\n${summaryData.action_items}\n\n`;
              }
            }
            if (tempPrefs.keywords && summaryData.keywords) {
              if (Array.isArray(summaryData.keywords) && summaryData.keywords.length > 0) {
                finalSummary += `## Keywords\n${summaryData.keywords.join(', ')}\n\n`;
              } else if (typeof summaryData.keywords === 'string') {
                 finalSummary += `## Keywords\n${summaryData.keywords}\n\n`;
              }
            }
            if (tempPrefs.bullet_gist && summaryData.bullet_gist) {
              finalSummary += `## Key Points\n${summaryData.bullet_gist}\n\n`;
            }
        }
        setSummary(finalSummary);
      }
    })
    .catch((err) => { 
        console.error("Caught error:", err); 
        alert(`Failed to load meeting details: ${err.message}`);
    })
    .finally(() => setLoading(false));
  }, [id]);

  const handleRegenerateSummary = () => {
    if (!window.confirm("This will overwrite any manual edits in the text area. Are you sure you want to regenerate the summary?")) {
      return;
    }
    if (!meeting?.summary || !summaryPreferences) return;

    let finalSummary = "";
    const summaryData = meeting.summary;

    if (summaryPreferences.overview && (summaryData.overview || summaryData.short_summary)) {
      finalSummary += `## Overview\n${summaryData.overview || summaryData.short_summary}\n\n`;
    }
    if (summaryPreferences.action_items && Array.isArray(summaryData.action_items) && summaryData.action_items.length > 0) {
      finalSummary += `## Action Items\n- ${summaryData.action_items.join('\n- ')}\n\n`;
    }
    if (summaryPreferences.keywords && Array.isArray(summaryData.keywords) && summaryData.keywords.length > 0) {
      finalSummary += `## Keywords\n${summaryData.keywords.join(', ')}\n\n`;
    }
    if (summaryPreferences.bullet_gist && summaryData.bullet_gist) {
      finalSummary += `## Key Points\n${summaryData.bullet_gist}\n\n`;
    }
    if (meeting.summary.extended_sections && summaryPreferences.extended_sections) {
        const selectedSections = meeting.summary.extended_sections
            .filter(section => summaryPreferences.extended_sections[section.title])
            .map(section => `## ${section.title}\n${section.content}`)
            .join('\n\n');
        if (selectedSections) {
            finalSummary += `${selectedSections}\n\n`;
        }
    }
    setSummary(finalSummary);
  };

  const handleSaveAll = async () => {
    if (!dbId) return alert("Meeting not saved in DB yet.");
    setSaving(true);
    try {
      await Promise.all([
        fetch(`${API}/api/meetings/${dbId}/summary`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary: summary })
        }),
        fetch(`${API}/api/meetings/${dbId}/preferences`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferences: summaryPreferences })
        })
      ]);
      alert("Summary and preferences saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  async function upsertMeetingToDb(data) {
    try {
      const payload = {
          FirefliesId: String(data?.id ?? ""), Title: data?.title ?? "",
          MeetingDate: data?.date ? new Date(data.date).toISOString() : null,
          DurationSeconds: Math.round(Number(data?.duration ?? 0)),
          TranscriptJson: JSON.stringify(data?.sentences ?? []),
          Summary: data?.summary?.overview ?? data?.summary?.short_summary ?? "",
          BulletGist: data.summary?.bullet_gist ?? null,
          ActionItems: Array.isArray(data.summary?.action_items) 
            ? JSON.stringify(data.summary.action_items) 
            : data.summary?.action_items ?? null,
          Keywords: Array.isArray(data.summary?.keywords) 
            ? JSON.stringify(data.summary.keywords) 
            : data.summary?.keywords ?? null,
          ExtendedSectionsJson: JSON.stringify(data.summary?.extended_sections ?? null),
          AudioUrl: data?.audio_url ?? null,
          // Include sentiment data in the payload
          SentimentPositivePct: data?.analytics?.sentiments?.positive_pct ?? null,
          SentimentNeutralPct: data?.analytics?.sentiments?.neutral_pct ?? null,
          SentimentNegativePct: data?.analytics?.sentiments?.negative_pct ?? null,
          AnalyticsJson: data?.analytics ? JSON.stringify(data.analytics) : null
      };
      const res = await fetch(`${API}/api/meetings/upsert`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      if (saved?.id) setDbId(saved.id);
    } catch (err) { console.error("Upsert failed:", err); }
  }

  async function downloadSummaryFile() {
    if (!dbId) return alert("Meeting not saved yet.");
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting.title}-summary.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  const handleFileSelectionConfirm = (selectedFileIds) => {
    setShowFileSelectionModal(false);
    if (dbId) {
      navigate(`/generate-files/${dbId}`, { 
        state: { 
          summary, 
          meetingId: id,
          selectedFiles: selectedFileIds
        } 
      });
    } else {
      alert("Meeting not saved in DB yet. Please wait.");
    }
  };

  // Enhanced sentiment computations
  const sentimentStats = useMemo(() => {
    if (!meeting) return { 
      positive: 0, neutral: 0, negative: 0, 
      counts: { positive: 0, neutral: 0, negative: 0 },
      totalSentences: 0,
      hasAnalytics: false
    };

    // First, check if we have analytics data from the backend
    const analytics = meeting.analytics?.sentiments;
    const hasAnalytics = analytics && (
      analytics.positive_pct !== undefined || 
      analytics.neutral_pct !== undefined || 
      analytics.negative_pct !== undefined
    );

    if (hasAnalytics) {
      return {
        positive: Number(analytics.positive_pct) || 0,
        neutral: Number(analytics.neutral_pct) || 0,
        negative: Number(analytics.negative_pct) || 0,
        counts: {
          positive: null, // Analytics don't provide absolute counts
          neutral: null,
          negative: null
        },
        totalSentences: Array.isArray(meeting.sentences) ? meeting.sentences.length : 0,
        hasAnalytics: true
      };
    }

    // Fallback to sentence-level analysis
    const sentences = Array.isArray(meeting.sentences) ? meeting.sentences : [];
    const counts = { positive: 0, neutral: 0, negative: 0 };
    
    sentences.forEach(sentence => {
      const sentiment = getSentenceSentiment(sentence);
      counts[sentiment] = (counts[sentiment] || 0) + 1;
    });

    const total = Math.max(1, counts.positive + counts.neutral + counts.negative);
    
    return {
      positive: (counts.positive / total) * 100,
      neutral: (counts.neutral / total) * 100,
      negative: (counts.negative / total) * 100,
      counts,
      totalSentences: sentences.length,
      hasAnalytics: false
    };
  }, [meeting]);

  const filteredSentences = useMemo(() => {
    if (!meeting?.sentences) return [];
    const sentences = Array.isArray(meeting.sentences) ? meeting.sentences : [];
    
    if (filterSentiment === 'all') return sentences;
    
    return sentences.filter(sentence => {
      const sentiment = getSentenceSentiment(sentence);
      return sentiment === filterSentiment;
    });
  }, [meeting, filterSentiment]);

  function jumpToSentence(sentenceIndex) {
    setActiveTab('transcript');
    setTimeout(() => {
      const el = document.getElementById(`sentence-${sentenceIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-blue-400');
        setTimeout(() => el.classList.remove('ring-2', 'ring-blue-400'), 2000);
        setHighlightedSentence(sentenceIndex);
      }
    }, 120);
  }

  if (loading || !summaryPreferences) return <LoadingSkeleton />;
  if (!meeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/60 to-purple-900/70 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <div className="text-xl text-slate-300">Meeting not found</div>
        </div>
      </div>
    );
  }

  const d = parseDate(meeting.date);
  const audioSrc = meeting?.audio_url ? (meeting.audio_url.startsWith('http') ? meeting.audio_url : `${API}${meeting.audio_url}`) : null;

  // Enhanced sentiment overview component
  const SentimentOverview = () => {
    const { positive, neutral, negative, hasAnalytics, totalSentences } = sentimentStats;
    
    // Create conic gradient for donut chart
    const posEnd = positive;
    const neuEnd = positive + neutral;
    const gradient = `conic-gradient(#10B981 0% ${posEnd}%, #F59E0B ${posEnd}% ${neuEnd}%, #EF4444 ${neuEnd}% 100%)`;

    return (
      <div className="space-y-6">
        {/* Header with data source indicator */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-white mb-1">Sentiment Distribution</h4>
            <p className="text-sm text-slate-400">
              {hasAnalytics ? 'Based on Fireflies AI analysis' : 'Based on individual sentence analysis'} 
              {totalSentences > 0 && ` • ${totalSentences} segments`}
            </p>
          </div>
          <div className="flex gap-2">
            <ActionButton 
              variant={sentimentViewMode === 'overview' ? 'primary' : 'ghost'}
              onClick={() => setSentimentViewMode('overview')}
              className="text-xs px-3 py-1"
            >
              <BarChart3 size={14} />
              Overview
            </ActionButton>
            <ActionButton 
              variant={sentimentViewMode === 'detailed' ? 'primary' : 'ghost'}
              onClick={() => setSentimentViewMode('detailed')}
              className="text-xs px-3 py-1"
            >
              <TrendingUp size={14} />
              Detailed
            </ActionButton>
          </div>
        </div>

        {sentimentViewMode === 'overview' ? (
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Donut Chart */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-full p-4" style={{ background: gradient }}>
                <div className="w-full h-full rounded-full bg-slate-900/90 flex items-center justify-center text-center p-4">
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Overall Sentiment</div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {positive > neutral && positive > negative ? 'Positive' : 
                       negative > positive && negative > neutral ? 'Negative' : 'Neutral'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {Math.round(Math.max(positive, neutral, negative))}% dominant
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="flex-1 w-full">
  <div className="grid grid-cols-1 gap-4">
    {[
      { key: 'positive', label: 'Positive', value: positive, color: 'emerald', icon: <Smile size={18} /> },
      { key: 'neutral', label: 'Neutral', value: neutral, color: 'amber', icon: <Meh size={18} /> },
      { key: 'negative', label: 'Negative', value: negative, color: 'red', icon: <Frown size={18} /> }
    ].map(item => {
      const colorClasses = {
        emerald: 'bg-emerald-400',
        amber: 'bg-amber-400',
        red: 'bg-red-400'
      };
      
      return (
        <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-700/20 border border-slate-600/30">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${colorClasses[item.color]}`}></div>
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="font-medium text-slate-200">{item.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 bg-slate-600/40 rounded-full h-3 overflow-hidden">
              <div 
                style={{ width: `${item.value}%` }} 
                className={`h-full rounded-full ${colorClasses[item.color]} transition-all duration-500`} 
              />
            </div>
            <div className="text-sm font-semibold text-slate-300 w-16 text-right">
              {percent(item.value)}
            </div>
            {sentimentStats.counts[item.key] !== null && (
              <div className="text-xs text-slate-500 w-12 text-right">
                ({sentimentStats.counts[item.key]})
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
</div>
          </div>
        ) : (
          // Detailed view with additional metrics
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SectionCard className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">{percent(positive)}</div>
                  <div className="text-sm text-slate-300">Positive Sentiment</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {sentimentStats.counts.positive !== null ? `${sentimentStats.counts.positive} segments` : 'AI-analyzed'}
                  </div>
                </div>
              </SectionCard>
              
              <SectionCard className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400 mb-1">{percent(neutral)}</div>
                  <div className="text-sm text-slate-300">Neutral Sentiment</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {sentimentStats.counts.neutral !== null ? `${sentimentStats.counts.neutral} segments` : 'AI-analyzed'}
                  </div>
                </div>
              </SectionCard>
              
              <SectionCard className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400 mb-1">{percent(negative)}</div>
                  <div className="text-sm text-slate-300">Negative Sentiment</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {sentimentStats.counts.negative !== null ? `${sentimentStats.counts.negative} segments` : 'AI-analyzed'}
                  </div>
                </div>
              </SectionCard>
            </div>
            
            {/* Additional insights */}
            <SectionCard className="p-4">
              <h5 className="text-white font-medium mb-3">Sentiment Insights</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>
                    {positive > 60 ? 'Meeting had predominantly positive tone' :
                     negative > 40 ? 'Meeting contained significant concerns or issues' :
                     'Meeting maintained balanced emotional tone'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>
                    {hasAnalytics ? 'Sentiment analysis powered by Fireflies AI' : 
                     'Sentiment derived from individual segment classification'}
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          <ActionButton 
            variant={filterSentiment === 'all' ? 'primary' : 'ghost'} 
            onClick={() => setFilterSentiment('all')}
            className="text-sm"
          >
            <Filter size={14} />
            All Segments ({totalSentences})
          </ActionButton>
          <ActionButton 
            variant={filterSentiment === 'positive' ? 'primary' : 'secondary'} 
            onClick={() => setFilterSentiment('positive')}
            className="text-sm"
          >
            <Smile size={14} />
            Positive ({sentimentStats.counts.positive || Math.round(positive * totalSentences / 100)})
          </ActionButton>
          <ActionButton 
            variant={filterSentiment === 'neutral' ? 'primary' : 'secondary'} 
            onClick={() => setFilterSentiment('neutral')}
            className="text-sm"
          >
            <Meh size={14} />
            Neutral ({sentimentStats.counts.neutral || Math.round(neutral * totalSentences / 100)})
          </ActionButton>
          <ActionButton 
            variant={filterSentiment === 'negative' ? 'primary' : 'secondary'} 
            onClick={() => setFilterSentiment('negative')}
            className="text-sm"
          >
            <Frown size={14} />
            Negative ({sentimentStats.counts.negative || Math.round(negative * totalSentences / 100)})
          </ActionButton>
        </div>
      </div>
    );
  };

  // Enhanced sentiment list component
  const SentimentList = () => {
    if (filteredSentences.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-slate-400 mb-2">No segments found for this sentiment</div>
          <div className="text-sm text-slate-500">Try selecting a different filter</div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-white font-medium">
            {filterSentiment === 'all' ? 'All Segments' : `${filterSentiment.charAt(0).toUpperCase() + filterSentiment.slice(1)} Segments`}
          </h5>
          <div className="text-sm text-slate-400">
            Showing {filteredSentences.length} of {sentimentStats.totalSentences}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
          {filteredSentences.map((sentence, idx) => {
            const sentiment = getSentenceSentiment(sentence);
            const sentimentColors = getSentimentColor(sentiment);
            const sentenceId = sentence.index ?? idx;
            const speakerName = sentence.speaker_name || `Speaker ${idx + 1}`;
            
            return (
              <div
                key={sentenceId}
                onClick={() => jumpToSentence(sentenceId)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:bg-slate-700/30 ${
                  highlightedSentence === sentenceId 
                    ? `border-blue-400 bg-slate-700/40 ${sentimentColors.ring} ring-1` 
                    : 'border-slate-600/30 hover:border-slate-500/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${sentimentColors.bg}`}></div>
                    {getSentimentIcon(sentiment)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-blue-400 bg-slate-700/50 px-2 py-1 rounded">
                        {speakerName}
                      </span>
                      <span className={`text-xs font-medium ${sentimentColors.text} capitalize`}>
                        {sentiment}
                      </span>
                      {sentence.start_time && (
                        <span className="text-xs text-slate-500">
                          {Math.floor(sentence.start_time / 60)}:{String(Math.floor(sentence.start_time % 60)).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {sentence.text}
                    </p>
                    
                    {/* Show AI filters if available */}
                    {sentence.ai_filters && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(sentence.ai_filters).map(([key, value]) => {
                          if (key === 'sentiment' || !value) return null;
                          return (
                            <span key={key} className="text-xs bg-slate-600/40 text-slate-400 px-2 py-1 rounded">
                              {key}: {String(value)}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-slate-700/20 rounded-lg text-xs text-slate-400 text-center">
          Click any segment to jump to that part in the transcript
        </div>
      </div>
    );
  };

  // MAIN RENDER
  return (
    <div className="min-h-screen rounded-3xl pb-5 bg-gradient-to-br from-slate-900 via-blue-900/60 to-purple-900/70 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto relative z-10 max-w-7xl p-3 md:p-6 space-y-5">
        <SectionCard className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <ActionButton
                variant="ghost"
                onClick={() => navigate(-1)}
                className="p-3 shrink-0"
              >
                <ArrowLeft size={20} />
              </ActionButton>
              
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-lg shrink-0 animate-pulse">
                  <FileText size={28} className="text-white" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                    {meeting.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-700/50 backdrop-blur-sm px-4 py-1 rounded-xl border border-slate-600/30 hover:bg-slate-700/70 transition-all duration-300">
                      <Calendar size={16} className="text-blue-400" />
                      <span className="text-slate-400 font-semibold text-sm">
                        {d ? d.toLocaleDateString(undefined, { 
                          weekday: 'short',
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : "Date unavailable"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-slate-700/50 backdrop-blur-sm px-4 py-1 rounded-xl border border-slate-600/30 hover:bg-slate-700/70 transition-all duration-300">
                      <Clock size={16} className="text-purple-400" />
                      <span className="text-slate-400 font-semibold text-sm">
                        {Math.round(meeting.duration)} min
                      </span>
                    </div>
                    
                   

                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-2">
          <div className="flex gap-2">
            <TabButton
              active={activeTab === 'summary'}
              onClick={() => setActiveTab('summary')}
              icon={<FileText size={16} />}
            >
              Meeting Summary
            </TabButton>
            
            <TabButton
              active={activeTab === 'transcript'}
              onClick={() => setActiveTab('transcript')}
              icon={<Headphones size={16} />}
              count={meeting.sentences?.length || 0}
            >
              Transcript
            </TabButton>

            <TabButton
              active={activeTab === 'sentiment'}
              onClick={() => setActiveTab('sentiment')}
              icon={<PieChart size={16} />}
              count={sentimentStats.totalSentences}
            >
              Sentiment Analysis
            </TabButton>
          </div>
        </SectionCard>

        {activeTab === 'summary' && (
          <div className="space-y-6">
            <SectionCard className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/30">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Settings2 size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Summary Settings</h3>
              </div>

              <div className="mb-6">
                <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                  Core Sections
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'action_items', label: 'Action Items' },
                    { key: 'keywords', label: 'Keywords' },
                    { key: 'bullet_gist', label: 'Key Points' }
                  ].map(({ key, label, icon }) => (
                    <div 
                      key={key} 
                      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${
                        summaryPreferences[key] 
                          ? 'border-blue-500/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10 shadow-lg shadow-blue-500/10' 
                          : 'border-slate-700/40 bg-slate-700/20 hover:bg-slate-700/30 hover:border-slate-600/60'
                      }`}
                      onClick={() => setSummaryPreferences(prev => ({ ...prev, [key]: !prev[key] }))}
                    >
                      <CustomCheckbox
                        label={label}
                        checked={!!summaryPreferences[key]}
                        onChange={() => {}}
                        icon={icon}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {summaryPreferences.extended_sections && Object.keys(summaryPreferences.extended_sections).length > 0 && (
                <div className="border border-slate-700/40 rounded-2xl p-5 bg-slate-700/10 mb-6">
                  <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                    Extended Sections
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.keys(summaryPreferences.extended_sections).map((title) => (
                      <div 
                        key={title}
                        className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                          summaryPreferences.extended_sections[title]
                            ? 'border-purple-500/50 bg-purple-600/10'
                            : 'border-slate-700/40 bg-slate-700/10 hover:bg-slate-700/20 hover:border-slate-600/60'
                        }`}
                        onClick={() => {
                          setSummaryPreferences(prev => ({
                            ...prev, 
                            extended_sections: { 
                              ...prev.extended_sections, 
                              [title]: !prev.extended_sections[title] 
                            }
                          }));
                        }}
                      >
                        <CustomCheckbox
                          label={title}
                          checked={summaryPreferences.extended_sections[title]}
                          onChange={() => {}}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <ActionButton 
                  variant="primary"
                  onClick={handleRegenerateSummary}
                  className="flex-shrink-0"
                >
                  <RefreshCw size={16} />
                  Regenerate Summary
                </ActionButton>
              </div>
            </SectionCard>

            <SectionCard className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                    <FileText size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Meeting Summary</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <ActionButton
                    variant="ghost"
                    onClick={downloadSummaryFile}
                    className="p-3"
                    title="Download Summary"
                  >
                    <Download size={18} />
                  </ActionButton>
                  
                  <ActionButton
                    variant="ghost"
                    onClick={() => setPreviewMode(prev => !prev)}
                    className="p-3"
                    title={previewMode ? "Switch to Edit Mode" : "Switch to Preview Mode"}
                  >
                    {previewMode ? <Edit size={18} /> : <Eye size={18} />}
                  </ActionButton>
                </div>
              </div>

              <div className="min-h-[500px]">
                {previewMode ? (
                  <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-700/40 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({ node, ...props }) => {
                          const text = props.children[0];
                          let gradientClass = "from-slate-600 to-slate-700";
                          if (typeof text === 'string') {
                              if (text.includes("Overview")) gradientClass = "from-blue-600 to-blue-700";
                              else if (text.includes("Action Items")) gradientClass = "from-green-600 to-green-700";
                              else if (text.includes("Keywords")) gradientClass = "from-amber-600 to-orange-600";
                              else if (text.includes("Key Points")) gradientClass = "from-purple-600 to-purple-700";
                          }
                          return (
                            <h2 
                              {...props} 
                              className={`inline-block px-6 py-3 rounded-xl text-white text-sm font-bold mb-6 mt-8 first:mt-0 bg-gradient-to-r ${gradientClass} shadow-lg transform hover:scale-105 transition-transform duration-300`}
                            />
                          );
                        },
                        p: ({ node, ...props }) => <p {...props} className="text-slate-300 leading-relaxed mb-5 text-base" />,
                        ul: ({ node, ...props }) => <ul {...props} className="text-slate-300 list-disc list-inside mb-5 space-y-2 pl-2" />,
                        li: ({ node, ...props }) => <li {...props} className="text-slate-300 leading-relaxed" />
                      }}
                    >
                      {summary || "No summary content available. Please generate or edit the summary."}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="relative">
                    <textarea
                      ref={textAreaRef}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full min-h-[500px] bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-mono text-sm leading-relaxed placeholder:text-slate-500 transition-all duration-300"
                      placeholder="Start editing your meeting summary here..."
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                      {summary.length} characters
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-10 mt-8 pt-6 border-t border-slate-700/30">
                <ActionButton
                  variant="primary"
                  onClick={handleSaveAll}
                  disabled={!dbId || saving}
                  className="flex-1"
                >
                  <Save size={18} />
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </ActionButton>
                
                <ActionButton
                  variant="secondary"
                  onClick={() => setShowFileSelectionModal(true)}
                  disabled={!dbId}
                  className="flex-1"
                >
                  <FileText size={18} />
                  Generate Files
                </ActionButton>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'transcript' && (
          <SectionCard className="p-6 md:p-8 animate-in slide-in-from-top duration-500">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl">
                  <Headphones size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Meeting Transcript</h3>
                {meeting.sentences?.length && (
                  <div className="px-3 py-1 bg-slate-700/50 rounded-lg text-sm text-slate-300">
                    {meeting.sentences.length} segments
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
               
                
                {/* Sentiment filter for transcript */}
                <div className="flex gap-1">
                  <ActionButton 
                    variant={filterSentiment === 'all' ? 'primary' : 'ghost'}
                    onClick={() => setFilterSentiment('all')}
                    className="text-xs px-3 py-1"
                  >
                    All
                  </ActionButton>
                  <ActionButton 
                    variant={filterSentiment === 'positive' ? 'primary' : 'ghost'}
                    onClick={() => setFilterSentiment('positive')}
                    className="text-xs px-3 py-1"
                  >
                    <Smile size={12} />
                  </ActionButton>
                  <ActionButton 
                    variant={filterSentiment === 'neutral' ? 'primary' : 'ghost'}
                    onClick={() => setFilterSentiment('neutral')}
                    className="text-xs px-3 py-1"
                  >
                    <Meh size={12} />
                  </ActionButton>
                  <ActionButton 
                    variant={filterSentiment === 'negative' ? 'primary' : 'ghost'}
                    onClick={() => setFilterSentiment('negative')}
                    className="text-xs px-3 py-1"
                  >
                    <Frown size={12} />
                  </ActionButton>
                </div>
              </div>
            </div>

            {audioSrc && (
              <div className="mb-8 p-6 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl border border-slate-700/40">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Meeting Recording
                </h4>
               
                  <audio 
                    controls 
                    src={audioSrc} 
                    className="w-140 h-12 bg-slate-700 rounded-3xl "
                    style={{
                      filter: 'sepia(1) hue-rotate(200deg) saturate(1.5) brightness(1.2)'
                    }}
                  >
                    <div className="text-slate-400 text-center py-4">
                      Your browser does not support the audio element.
                    </div>
                  </audio>
                
              </div>
            )}
            
            <div className="bg-gradient-to-br from-slate-700/20 to-slate-800/20 rounded-2xl border border-slate-700/40 overflow-hidden">
              {filteredSentences.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  <div className="p-2">
                    {filteredSentences.map((sentence, index) => {
                      const sentenceId = sentence.index ?? index;
                      const sentiment = getSentenceSentiment(sentence);
                      const sentimentColors = getSentimentColor(sentiment);

                      return (
                        <div 
                          id={`sentence-${sentenceId}`}
                          key={sentenceId} 
                          className={`group hover:bg-slate-700/20 rounded-xl p-4 transition-all duration-300 border ${highlightedSentence === sentenceId ? 'border-blue-400' : 'border-transparent hover:border-slate-600/30'}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex items-center gap-3 min-w-0 mb-2">
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${sentimentColors.bg} group-hover:scale-110 transition-transform duration-300`}></div>
                              <span className="text-blue-400 font-semibold text-sm bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/30">
                                {sentence.speaker_name ?? `Speaker ${index + 1}`}
                              </span>
                              <span className={`text-xs font-medium ${sentimentColors.text} capitalize bg-slate-800/50 px-2 py-1 rounded border border-slate-700/30`}>
                                {sentiment}
                              </span>
                              {sentence.start_time && (
                                <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/30">
                                  {Math.floor(sentence.start_time / 60)}:{String(Math.floor(sentence.start_time % 60)).padStart(2, '0')}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-300 leading-relaxed ml-7 text-base group-hover:text-slate-200 transition-colors duration-300">
                            {sentence.text}
                          </p>
                          
                          {/* Show AI filters if available */}
                          {sentence.ai_filters && Object.keys(sentence.ai_filters).length > 1 && (
                            <div className="mt-3 ml-7 flex flex-wrap gap-1">
                              {Object.entries(sentence.ai_filters).map(([key, value]) => {
                                if (key === 'sentiment' || !value || value === 'null') return null;
                                return (
                                  <span key={key} className="text-xs bg-slate-600/40 text-slate-400 px-2 py-1 rounded">
                                    {key}: {String(value)}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4 opacity-50">📝</div>
                  <div className="text-xl text-slate-400 mb-2">
                    {filterSentiment === 'all' ? 'No Transcript Available' : `No ${filterSentiment} segments found`}
                  </div>
                  <div className="text-sm text-slate-500">
                    {filterSentiment === 'all' 
                      ? 'The meeting transcript could not be loaded or is not available.'
                      : 'Try selecting a different sentiment filter or view all segments.'
                    }
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {activeTab === 'sentiment' && (
          <SectionCard className="p-6 md:p-8 animate-in slide-in-from-top duration-500">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <PieChart size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Sentiment Analysis</h3>
                <div className="px-3 py-1 bg-slate-700/50 rounded-lg text-sm text-slate-300">
                  {sentimentStats.hasAnalytics ? 'AI-Powered Analysis' : 'Sentence-Level Analysis'}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Sentiment Overview */}
              <SentimentOverview />

              {/* Sentiment Breakdown */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <SectionCard className="p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Filter size={16} />
                      Segment Analysis
                    </h4>
                    <SentimentList />
                  </SectionCard>
                </div>

                <div>
                  <SectionCard className="p-6">
                    <h4 className="text-white font-semibold mb-4">Quick Stats</h4>
                    <div className="space-y-4">
                      <div className="text-sm text-slate-300">
                        <div className="flex justify-between items-center">
                          <span>Total Segments:</span>
                          <span className="font-semibold">{sentimentStats.totalSentences}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-300">
                        <div className="flex justify-between items-center">
                          <span>Dominant Sentiment:</span>
                          <span className="font-semibold capitalize">
                            {sentimentStats.positive > sentimentStats.neutral && sentimentStats.positive > sentimentStats.negative ? 'Positive' :
                             sentimentStats.negative > sentimentStats.positive && sentimentStats.negative > sentimentStats.neutral ? 'Negative' : 'Neutral'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-300">
                        <div className="flex justify-between items-center">
                          <span>Analysis Type:</span>
                          <span className="font-semibold">
                            {sentimentStats.hasAnalytics ? 'Fireflies AI' : 'Rule-based'}
                          </span>
                        </div>
                      </div>

                      {/* Meeting tone indicator */}
                      <div className="mt-6 p-4 rounded-xl border border-slate-600/30">
                        <div className="text-sm text-slate-300 mb-2 font-medium">Meeting Tone</div>
                        <div className="text-xs text-slate-400">
                          {sentimentStats.positive > 70 ? 'Very positive and enthusiastic discussion' :
                           sentimentStats.positive > 50 ? 'Generally positive with good engagement' :
                           sentimentStats.negative > 40 ? 'Some concerns or issues were raised' :
                           sentimentStats.negative > 60 ? 'Significant challenges or problems discussed' :
                           'Balanced and neutral conversation'}
                        </div>
                      </div>

                      {/* Data source info */}
                      <div className="mt-4 p-3 bg-slate-700/20 rounded-lg">
                        <div className="text-xs text-slate-400 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span>
                              {sentimentStats.hasAnalytics 
                                ? 'Analysis from Fireflies AI engine' 
                                : 'Computed from individual sentence sentiment'
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>Click segments to jump to transcript location</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        <FileSelectionModal
          isOpen={showFileSelectionModal}
          onClose={() => setShowFileSelectionModal(false)}
          onConfirm={handleFileSelectionConfirm}
        />
      </div>

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(51, 65, 85, 0.3);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #3b82f6, #8b5cf6);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #2563eb, #7c3aed);
          }
        `}
      </style>
    </div>
  );
}