    // // import React, { useState, useEffect, useRef } from "react";
    // // import { useParams, useNavigate, useLocation } from "react-router-dom";
    // // import {
    // //   ArrowLeft,
    // //   Save,
    // //   Loader2,
    // //   Download,
    // //   Calendar,
    // //   FileText,
    // //   Eye,
    // //   X,
    // //   Edit,
    // //   Sparkles
    // // } from "lucide-react";
    // // import gsap from "gsap";
    // // import ReactMarkdown from "react-markdown";
    // // import remarkGfm from "remark-gfm";

    // // const API = import.meta.env.VITE_API_BASE_URL || "";

    // // // File configuration mapping
    // // const FILE_CONFIG = {
    // //   functional: {
    // //     name: "FunctionalDoc.txt",
    // //     title: "Functional Document",
    // //     description: "Detailed functional requirements and specifications",
    // //     icon: FileText,
    // //     color: "from-blue-500 to-cyan-500"
    // //   },
    // //   mockups: {
    // //     name: "Mockups.txt", 
    // //     title: "Mockups",
    // //     description: "UI/UX mockups and design specifications",
    // //     icon: FileText,
    // //     color: "from-purple-500 to-pink-500"
    // //   },
    // //   markdown: {
    // //     name: "Markdown.md",
    // //     title: "Markdown File", 
    // //     description: "Formatted markdown documentation",
    // //     icon: FileText,
    // //     color: "from-green-500 to-emerald-500"
    // //   }
    // // };

    // // export default function GenerateFiles() {
    // //   const { dbId } = useParams();
    // //   const navigate = useNavigate();
    // //   const location = useLocation();

    // //   // Get selected files from navigation state
    // //   const selectedFiles = location.state?.selectedFiles || ['functional', 'mockups', 'markdown'];

    // //   const [files, setFiles] = useState([]);
    // //   const [editingFiles, setEditingFiles] = useState([]);
    // //   const [isEditing, setIsEditing] = useState([]);
    // //   const [loading, setLoading] = useState(false);
    // //   const [saving, setSaving] = useState(false);
    // //   const [error, setError] = useState(null);
    // //   const [projectPlanExists, setProjectPlanExists] = useState(false);
    // //   const [showModal, setShowModal] = useState(false);
    // //   const [projectDuration, setProjectDuration] = useState(4);
    // //   const [additionalDetails, setAdditionalDetails] = useState("");
    // //   const [generatingPlan, setGeneratingPlan] = useState(false);

    // //   const pageRef = useRef(null);
    // //   const cardRefs = useRef([]);
    // //   const saveBtnRef = useRef(null);
    // //   const generatePlanBtnRef = useRef(null);
    // //   const viewPlanBtnRef = useRef(null);
    // //   const modalRef = useRef(null);

    // //   // Create filtered file list based on selected files
    // //   const getFilteredFiles = () => {
    // //     return selectedFiles.map(fileId => ({
    // //       id: fileId,
    // //       name: FILE_CONFIG[fileId].name,
    // //       title: FILE_CONFIG[fileId].title,
    // //       description: FILE_CONFIG[fileId].description,
    // //       color: FILE_CONFIG[fileId].color
    // //     }));
    // //   };

    // //   useEffect(() => {
    // //     async function initializeFilesAndCheckPlan() {
    // //       if (!dbId) {
    // //         setError("Missing meeting DB id.");
    // //         return;
    // //       }
    // //       setLoading(true);
    // //       setError(null);
        
    // //       try {
    // //         setIsEditing(new Array(selectedFiles.length).fill(false));

    // //         const filesRes = await fetch(
    // //           `${API}/api/meetings/${dbId}/generate-files`,
    // //           {
    // //             method: "POST",
    // //             headers: { "Content-Type": "application/json" },
    // //             body: JSON.stringify({ selectedFiles })
    // //           }
    // //         );

    // //         if (!filesRes.ok) {
    // //           throw new Error(`Failed to load files: ${await filesRes.text()}`);
    // //         }
            
    // //         const filesData = await filesRes.json();
            
    // //         const filteredFiles = getFilteredFiles().map((config, index) => {
    // //           const matchingFile = filesData.find(f => f.name === config.name);
    // //           return matchingFile || { 
    // //             name: config.name, 
    // //             content: `Generated ${config.title} content will appear here...` 
    // //           };
    // //         });
            
    // //         setFiles(filteredFiles);
    // //         setEditingFiles(filteredFiles.map(f => f.content ?? ""));

    // //         const planRes = await fetch(`${API}/api/meetings/${dbId}/project-plan`);
    // //         if (planRes.ok) {
    // //           setProjectPlanExists(true);
    // //         } else if (planRes.status === 404) {
    // //           setProjectPlanExists(false);
    // //         } else {
    // //           console.error("Error checking project plan status:", await planRes.text());
    // //         }
    // //       } catch (err) {
    // //         console.error("Initialization error:", err);
    // //         setError(err.message || "Failed to initialize data.");
    // //       } finally {
    // //         setLoading(false);
    // //       }
    // //     }
    // //     initializeFilesAndCheckPlan();
    // //   }, [dbId, selectedFiles]);

    // //   async function handleSave() {
    // //     if (!dbId) return;
    // //     setSaving(true);
    // //     setError(null);
        
    // //     try {
    // //       const payload = files.map((f, i) => ({ 
    // //         name: f.name, 
    // //         content: editingFiles[i] 
    // //       }));

    // //       const res = await fetch(`${API}/api/meetings/${dbId}/files`, {
    // //         method: "PUT",
    // //         headers: { "Content-Type": "application/json" },
    // //         body: JSON.stringify(payload),
    // //       });
        
    // //       if (!res.ok) throw new Error(await res.text());
    // //       alert("Files saved successfully!");
    // //     } catch (err) {
    // //       console.error("Save error:", err);
    // //       setError(err.message || "Failed to save files");
    // //     } finally {
    // //       setSaving(false);
    // //     }
    // //   }

    // //   function handleDownload(filename, content) {
    // //     const blob = new Blob([content], { type: "text/plain" });
    // //     const link = document.createElement("a");
    // //     link.href = URL.createObjectURL(blob);
    // //     link.download = filename;
    // //     document.body.appendChild(link);
    // //     link.click();
    // //     document.body.removeChild(link);
    // //   }

    // //   function openModal() {
    // //     setShowModal(true);
    // //     setTimeout(() => {
    // //       if (modalRef.current) {
    // //         gsap.fromTo(
    // //           modalRef.current,
    // //           { opacity: 0, scale: 0.9 },
    // //           { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
    // //         );
    // //       }
    // //     }, 10);
    // //   }

    // //   function closeModal() {
    // //     if (modalRef.current) {
    // //       gsap.to(modalRef.current, {
    // //         opacity: 0,
    // //         scale: 0.9,
    // //         duration: 0.2,
    // //         ease: "power2.in",
    // //         onComplete: () => setShowModal(false),
    // //       });
    // //     }
    // //   }

    // //   async function handleGenerateProjectPlan() {
    // //     if (!dbId || projectDuration <= 0) {
    // //       setError("Invalid project duration.");
    // //       return;
    // //     }

    // //     setGeneratingPlan(true);
    // //     setError(null);

    // //     try {
    // //       const res = await fetch(
    // //         `${API}/api/meetings/${dbId}/generate-project-plan`,
    // //         {
    // //           method: "POST",
    // //           headers: { "Content-Type": "application/json" },
    // //           body: JSON.stringify({
    // //             durationWeeks: projectDuration,
    // //             additionalDetails: additionalDetails.trim(),
    // //           }),
    // //         }
    // //       );

    // //       if (!res.ok) {
    // //         const errorText = await res.text();
    // //         throw new Error(errorText);
    // //       }

    // //       closeModal();
    // //       setProjectPlanExists(true);
    // //       navigate(`/project-plan/${dbId}`);
    // //     } catch (err) {
    // //       console.error("Generate project plan error:", err);
    // //       setError(err.message || "Failed to generate project plan.");
    // //     } finally {
    // //       setGeneratingPlan(false);
    // //     }
    // //   }

    // //   function handleViewProjectPlan() {
    // //     navigate(`/project-plan/${dbId}`);
    // //   }

    // //   // GSAP animations
    // //   useEffect(() => {
    // //     gsap.fromTo(
    // //       pageRef.current,
    // //       { opacity: 0, y: 20 },
    // //       { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    // //     );

    // //     gsap.fromTo(
    // //       cardRefs.current,
    // //       { opacity: 0, y: 40 },
    // //       {
    // //         opacity: 1,
    // //         y: 0,
    // //         duration: 0.6,
    // //         ease: "power3.out",
    // //         stagger: 0.15,
    // //       }
    // //     );
    // //   }, [projectPlanExists]);

    // //   if (loading) {
    // //     return (
    // //       <div className="flex flex-col items-center justify-center h-64 text-lg text-slate-300">
    // //         <Loader2 className="animate-spin w-8 h-8 mb-3 text-blue-400" />
    // //         Loading files and checking project plan status...
    // //       </div>
    // //     );
    // //   }

    // //   if (error) {
    // //     return (
    // //       <div className="flex flex-col items-center justify-center h-64 text-red-400 font-semibold">
    // //         {error}
    // //       </div>
    // //     );
    // //   }

    // //   const filteredFileConfigs = getFilteredFiles();

    // //   return (
    // //     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/60 to-purple-900/70 text-white p-4 md:p-6">
    // //       <div className="container mx-auto max-w-5xl">
    // //         <div ref={pageRef} className="rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 p-6 md:p-8">
    // //           {/* Header */}
    // //           <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
    // //             <div>
    // //               <div className="flex items-center gap-3 mb-2">
    // //                 <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
    // //                   <Sparkles size={24} className="text-white" />
    // //                 </div>
    // //                 <h2 className="text-2xl md:text-3xl font-bold text-white">
    // //                   Generate & Edit Files
    // //                 </h2>
    // //               </div>
    // //               <p className="text-slate-400 text-sm md:text-base">
    // //                 Editing {selectedFiles.length} selected file{selectedFiles.length !== 1 ? 's' : ''}
    // //               </p>
    // //             </div>
    // //             <button
    // //               onClick={() => navigate(-1)}
    // //               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/40 transition shadow-sm text-slate-200 hover:text-white"
    // //             >
    // //               <ArrowLeft size={18} />
    // //               Back
    // //             </button>
    // //           </div>

    // //           {/* File Editors */}
    // //           <div className="space-y-6">
    // //             {filteredFileConfigs.map((config, idx) => {
    // //               const fileData = files[idx];
                
    // //               return (
    // //                 <div
    // //                   key={config.id}
    // //                   ref={(el) => (cardRefs.current[idx] = el)}
    // //                   className="p-6 rounded-2xl bg-slate-700/30 backdrop-blur-md border border-slate-600/40 transition hover:shadow-lg hover:border-slate-500/50 duration-300 ease-in-out"
    // //                 >
    // //                   {/* Title with edit + download */}
    // //                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
    // //                     <div className="flex items-center gap-3">
    // //                       <div className={`p-2 rounded-lg bg-gradient-to-r ${config.color}`}>
    // //                         <FileText size={20} className="text-white" />
    // //                       </div>
    // //                       <div>
    // //                         <h3 className="text-lg font-semibold text-white">
    // //                           {config.title}
    // //                         </h3>
    // //                         <p className="text-sm text-slate-400">{config.description}</p>
    // //                       </div>
    // //                     </div>
    // //                     <div className="flex gap-2">
    // //                       <button
    // //                         onClick={() => {
    // //                           const arr = [...isEditing];
    // //                           arr[idx] = !arr[idx];
    // //                           setIsEditing(arr);
    // //                         }}
    // //                         className="p-2 rounded-lg hover:bg-slate-600/50 transition text-slate-300 hover:text-white"
    // //                         title={isEditing[idx] ? "Stop Editing" : "Edit File"}
    // //                       >
    // //                         <Edit size={18} className={isEditing[idx] ? "text-blue-400" : "text-slate-400"} />
    // //                       </button>
    // //                       <button
    // //                         onClick={() => handleDownload(config.name, editingFiles[idx] ?? "")}
    // //                         className="p-2 rounded-lg hover:bg-slate-600/50 transition text-slate-300 hover:text-white"
    // //                         title="Download File"
    // //                       >
    // //                         <Download size={18} />
    // //                       </button>
    // //                     </div>
    // //                   </div>

    // //                   {/* Viewer / Editor */}
    // //                   <div className="relative font-sans text-[15px] leading-relaxed border border-slate-600/40 rounded-xl overflow-hidden bg-slate-800/50">
    // //                     {isEditing[idx] ? (
    // //                       <textarea
    // //                         rows={12}
    // //                         value={editingFiles[idx] ?? ""}
    // //                         onChange={(e) => {
    // //                           const arr = [...editingFiles];
    // //                           arr[idx] = e.target.value;
    // //                           setEditingFiles(arr);
    // //                         }}
    // //                         className="w-full p-5 bg-slate-700/30 text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/60 rounded-xl placeholder-slate-500 transition"
    // //                         placeholder="Start writing your content here..."
    // //                       />
    // //                     ) : (
    // //                       <div className="p-5 text-slate-200 max-h-80 overflow-y-auto prose prose-invert prose-slate">
    // //                         <ReactMarkdown remarkPlugins={[remarkGfm]}>
    // //                           {editingFiles[idx] ?? "*No content available*"}
    // //                         </ReactMarkdown>
    // //                       </div>
    // //                     )}
    // //                   </div>
    // //                 </div>
    // //               );
    // //             })}
    // //           </div>

    // //           {/* Buttons */}
    // //           <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
    // //             <button
    // //               ref={saveBtnRef}
    // //               onClick={handleSave}
    // //               disabled={saving}
    // //               className="w-full sm:w-48 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-500 hover:to-purple-500 transition transform flex items-center justify-center gap-2"
    // //             >
    // //               {saving ? (
    // //                 <>
    // //                   <Loader2 className="animate-spin w-5 h-5" />
    // //                   Saving...
    // //                 </>
    // //               ) : (
    // //                 <>
    // //                   <Save size={18} />
    // //                   Update Files
    // //                 </>
    // //               )}
    // //             </button>

    // //             {projectPlanExists ? (
    // //               <button
    // //                 ref={viewPlanBtnRef}
    // //                 onClick={handleViewProjectPlan}
    // //                 className="w-full sm:w-48 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg hover:from-green-500 hover:to-teal-500 transition transform flex items-center justify-center gap-2"
    // //               >
    // //                 <Eye size={18} />
    // //                 View Project Plan
    // //               </button>
    // //             ) : (
    // //               <button
    // //                 ref={generatePlanBtnRef}
    // //                 onClick={openModal}
    // //                 className="w-full sm:w-48 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg hover:from-green-500 hover:to-teal-500 transition transform flex items-center justify-center gap-2"
    // //               >
    // //                 <FileText size={18} />
    // //                 Generate Plan
    // //               </button>
    // //             )}
    // //           </div>

    // //           {error && (
    // //             <div className="text-red-400 font-medium mt-4 text-center">{error}</div>
    // //           )}
    // //         </div>

    // //         {/* Modal */}
    // //         {showModal && (
    // //           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
    // //             <div
    // //               ref={modalRef}
    // //               className="bg-slate-800 border border-slate-700/40 rounded-2xl p-6 max-w-md w-full shadow-2xl backdrop-blur-xl"
    // //             >
    // //               <div className="flex items-center justify-between mb-6">
    // //                 <h3 className="text-xl font-bold text-white">
    // //                   Generate Project Plan
    // //                 </h3>
    // //                 <button
    // //                   onClick={closeModal}
    // //                   className="p-2 hover:bg-slate-700/50 rounded-lg transition text-slate-400 hover:text-white"
    // //                   disabled={generatingPlan}
    // //                 >
    // //                   <X size={20} />
    // //                 </button>
    // //               </div>

    // //               <div className="space-y-4">
    // //                 <div>
    // //                   <label className="block text-sm font-semibold text-slate-300 mb-2">
    // //                     <Calendar className="inline w-4 h-4 mr-1" />
    // //                     Project Duration (weeks)
    // //                   </label>
    // //                   <input
    // //                     type="number"
    // //                     min="1"
    // //                     max="52"
    // //                     value={projectDuration}
    // //                     onChange={(e) => setProjectDuration(parseInt(e.target.value) || 1)}
    // //                     className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/40 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
    // //                     disabled={generatingPlan}
    // //                   />
    // //                 </div>

    // //                 <div>
    // //                   <label className="block text-sm font-semibold text-slate-300 mb-2">
    // //                     Additional Details (optional)
    // //                   </label>
    // //                   <textarea
    // //                     rows={4}
    // //                     value={additionalDetails}
    // //                     onChange={(e) => setAdditionalDetails(e.target.value)}
    // //                     placeholder="Any specific requirements, constraints, or preferences..."
    // //                     className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/40 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
    // //                     disabled={generatingPlan}
    // //                   />
    // //                 </div>
    // //               </div>

    // //               <div className="flex gap-3 mt-6">
    // //                 <button
    // //                   onClick={closeModal}
    // //                   disabled={generatingPlan}
    // //                   className="flex-1 py-2 px-4 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700/50 transition font-medium"
    // //                 >
    // //                   Cancel
    // //                 </button>
    // //                 <button
    // //                   onClick={handleGenerateProjectPlan}
    // //                   disabled={generatingPlan || projectDuration <= 0}
    // //                   className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-500 hover:to-teal-500 transition font-medium flex items-center justify-center gap-2"
    // //                 >
    // //                   {generatingPlan ? (
    // //                     <>
    // //                       <Loader2 className="animate-spin w-4 h-4" />
    // //                       Generating...
    // //                     </>
    // //                   ) : (
    // //                     "Generate"
    // //                   )}
    // //                 </button>
    // //               </div>
    // //             </div>
    // //           </div>
    // //         )}
    // //       </div>
    // //     </div>
    // //   );
    // // }


    // import React, { useState, useEffect, useRef, useCallback } from "react";
    // import { useParams, useNavigate, useLocation } from "react-router-dom";
    // import {
    //   ArrowLeft, Save, Loader2, Download, Calendar, FileText,
    //   Eye, X, Edit, Sparkles, AlertTriangle,Thermometer,
    // } from "lucide-react";
    // import gsap from "gsap";
    // import ReactMarkdown from "react-markdown";
    // import remarkGfm from "remark-gfm";

    // const API = import.meta.env.VITE_API_BASE_URL || "";

    // // A centralized configuration for file types.
    // const FILE_CONFIG = {
    //   functional: {
    //     name: "FunctionalDoc.txt",
    //     title: "Functional Document",
    //     description: "Detailed functional requirements and specifications.",
    //     icon: FileText,
    //     color: "from-blue-500 to-cyan-500",
    //   },
    //   mockups: {
    //     name: "Mockups.txt",
    //     title: "Mockups & UI/UX",
    //     description: "UI/UX mockups and design specifications.",
    //     icon: FileText,
    //     color: "from-purple-500 to-pink-500",
    //   },
    //   markdown: {
    //     name: "Markdown.md",
    //     title: "Technical Documentation",
    //     description: "Formatted technical documentation in Markdown.",
    //     icon: FileText,
    //     color: "from-green-500 to-emerald-500",
    //   },
    // };

    // // --- Sub-components for better structure ---

    // /**
    //  * Displays the main page header.
    //  */
    // const PageHeader = ({ documentCount, onBack }) => (
    //   <div className="flex w-full items-start justify-between gap-4 mb-8">
    //     <div>
    //       <div className="flex items-center gap-3 mb-2">
    //         <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
    //           <Sparkles size={24} className="text-white" />
    //         </div>
    //         <h1 className="text-2xl md:text-3xl font-bold text-white">
    //           Document Editor
    //         </h1>
    //       </div>
    //       <p className="text-slate-400 text-sm md:text-base ml-1">
    //         Reviewing and editing {documentCount} generated document{documentCount !== 1 ? 's' : ''}.
    //       </p>
    //     </div>
    //     <button
    //       onClick={onBack}
    //       className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/40 transition-colors shadow-sm text-slate-200 hover:text-white md:ml-auto"
    //     >
    //       <ArrowLeft size={18} />
    //       Back
    //     </button>
    //   </div>
    // );

    // /**
    //  * Renders a card for editing or viewing a single file.
    //  */
    // const FileEditorCard = React.memo(({ document, onContentChange, onToggleEdit, onDownload, isSaving, cardRef }) => {
    //   const Icon = document.icon || FileText;

    //   return (
    //     <div
    //       ref={cardRef}
    //       className="p-6 rounded-2xl bg-slate-700/30 backdrop-blur-md border border-slate-600/40 transition-all hover:shadow-lg hover:border-slate-500/50 duration-300 ease-in-out"
    //     >
    //       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
    //         <div className="flex items-center gap-3">
    //           <div className={`p-2 rounded-lg bg-gradient-to-r ${document.color}`}>
    //             <Icon size={20} className="text-white" />
    //           </div>
    //           <div>
    //             <h3 className="text-lg font-semibold text-white">{document.title}</h3>
    //             <p className="text-sm text-slate-400">{document.description}</p>
    //           </div>
    //         </div>
    //         <div className="flex gap-2">
    //           <button
    //             onClick={onToggleEdit}
    //             className="p-2 rounded-lg hover:bg-slate-600/50 transition-colors text-slate-300 hover:text-white"
    //             title={document.isEditing ? "View Mode" : "Edit Mode"}
    //           >
    //             <Edit size={18} className={document.isEditing ? "text-blue-400" : "text-slate-400"} />
    //           </button>
    //           <button
    //             onClick={onDownload}
    //             className="p-2 rounded-lg hover:bg-slate-600/50 transition-colors text-slate-300 hover:text-white"
    //             title="Download File"
    //           >
    //             <Download size={18} />
    //           </button>
    //         </div>
    //       </div>

    //       <div className="relative font-sans text-[15px] leading-relaxed border border-slate-600/40 rounded-xl overflow-hidden bg-slate-800/50">
    //         {document.isEditing ? (
    //           <textarea
    //             rows={12}
    //             value={document.content}
    //             onChange={onContentChange}
    //             disabled={isSaving}
    //             className="w-full h-full p-5 bg-transparent text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/60 rounded-xl placeholder-slate-500 transition"
    //             placeholder="Start writing your content here..."
    //           />
    //         ) : (
    //           <div className="p-5 text-slate-200 max-h-80 overflow-y-auto prose prose-invert prose-slate">
    //             <ReactMarkdown remarkPlugins={[remarkGfm]}>
    //               {document.content || "*No content available*"}
    //             </ReactMarkdown>
    //           </div>
    //         )}
    //       </div>
    //     </div>
    //   );
    // });


    // // --- Main Component ---

    // export default function GenerateFiles() {
    //   const { dbId } = useParams();
    //   const navigate = useNavigate();
    //   const location = useLocation();

    //   // State Management
    //   const selectedFiles = location.state?.selectedFiles || ['functional', 'mockups', 'markdown'];
    //   const [documents, setDocuments] = useState([]);
    //   const [status, setStatus] = useState({ loading: true, error: null, saving: false });
    //   const [projectPlanExists, setProjectPlanExists] = useState(false);
    //   const [isModalOpen, setIsModalOpen] = useState(false);

    //   // Animation Refs
    //   const pageRef = useRef(null);
    //   const cardRefs = useRef([]);

    //   // Fetch and initialize data on component mount
    //   useEffect(() => {
    //     const initialize = async () => {
    //       if (!dbId) {
    //         setStatus({ loading: false, error: "Missing meeting DB id." });
    //         return;
    //       }
    //       setStatus({ loading: true, error: null });

    //       try {
    //         // Fetch generated files
    //         const filesRes = await fetch(`${API}/api/meetings/${dbId}/generate-files`, {
    //           method: "POST",
    //           headers: { "Content-Type": "application/json" },
    //           body: JSON.stringify({ selectedFiles }),
    //         });
    //         if (!filesRes.ok) throw new Error(`Failed to load documents: ${await filesRes.text()}`);
    //         const filesData = await filesRes.json();
    //         const filesMap = new Map(filesData.map(f => [f.name, f.content]));

    //         // Create the unified documents state
    //         const initialDocuments = selectedFiles.map(fileId => {
    //           const config = FILE_CONFIG[fileId];
    //           return {
    //             id: fileId,
    //             ...config,
    //             content: filesMap.get(config.name) || `Generated content for ${config.title} will appear here...`,
    //             isEditing: false,
    //           };
    //         });
    //         setDocuments(initialDocuments);

    //         // Check for existing project plan
    //         const planRes = await fetch(`${API}/api/meetings/${dbId}/project-plan`);
    //         setProjectPlanExists(planRes.ok);

    //       } catch (err) {
    //         console.error("Initialization error:", err);
    //         setStatus({ loading: false, error: err.message || "Failed to initialize data." });
    //       } finally {
    //         setStatus(prev => ({ ...prev, loading: false }));
    //       }
    //     };
    //     initialize();
    //   }, [dbId, navigate]); // `selectedFiles` is stable, removed from deps

    //   // GSAP Animations
    //   useEffect(() => {
    //     if (!status.loading) {
    //       gsap.fromTo(pageRef.current,
    //         { opacity: 0, y: 20 },
    //         { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    //       );
    //       gsap.fromTo(cardRefs.current.filter(Boolean),
    //         { opacity: 0, y: 40 },
    //         { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.15 }
    //       );
    //     }
    //   }, [status.loading]);
    
    //   // --- Event Handlers (memoized with useCallback) ---

    //   const handleSave = useCallback(async () => {
    //     if (!dbId) return;
    //     setStatus({ saving: true, error: null });
        
    //     try {
    //       const payload = documents.map(({ name, content }) => ({ name, content }));
    //       const res = await fetch(`${API}/api/meetings/${dbId}/files`, {
    //         method: "PUT",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(payload),
    //       });
    //       if (!res.ok) throw new Error(await res.text());
    //       alert("Files saved successfully!");
    //     } catch (err) {
    //       console.error("Save error:", err);
    //       setStatus({ saving: false, error: err.message || "Failed to save files" });
    //     } finally {
    //       setStatus(prev => ({ ...prev, saving: false }));
    //     }
    //   }, [dbId, documents]);

    //   const handleDownload = useCallback((filename, content) => {
    //     const blob = new Blob([content], { type: "text/plain" });
    //     const link = document.createElement("a");
    //     link.href = URL.createObjectURL(blob);
    //     link.download = filename;
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //   }, []);

    //   const handleContentChange = useCallback((index, newContent) => {
    //     setDocuments(prevDocs => 
    //       prevDocs.map((doc, i) => i === index ? { ...doc, content: newContent } : doc)
    //     );
    //   }, []);

    //   const handleToggleEdit = useCallback((index) => {
    //     setDocuments(prevDocs =>
    //       prevDocs.map((doc, i) => i === index ? { ...doc, isEditing: !doc.isEditing } : doc)
    //     );
    //   }, []);


    //   // --- Render Logic ---

    //   if (status.loading) {
    //     return (
    //       <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-lg text-slate-300">
    //         <Loader2 className="animate-spin w-8 h-8 mb-3 text-blue-400" />
    //         Loading Documents...
    //       </div>
    //     );
    //   }

    //   if (status.error && !status.saving) {
    //     return (
    //       <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-red-400 font-semibold">
    //         <AlertTriangle className="w-10 h-10 mb-4" />
    //         <p className="text-xl">An Error Occurred</p>
    //         <p className="text-base text-slate-400 mt-1">{status.error}</p>
    //       </div>
    //     );
    //   }

    //   return (
    //     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/60 to-purple-900/70 text-white p-4 md:p-6">
    //       <div className="container mx-auto max-w-5xl">
    //         <div ref={pageRef} className="rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 p-6 md:p-8">
    //           <PageHeader documentCount={selectedFiles.length} onBack={() => navigate(-1)} />

    //           <div className="space-y-6">
    //             {documents.map((doc, idx) => (
    //               <FileEditorCard
    //                 key={doc.id}
    //                 cardRef={el => (cardRefs.current[idx] = el)}
    //                 document={doc}
    //                 isSaving={status.saving}
    //                 onContentChange={(e) => handleContentChange(idx, e.target.value)}
    //                 onToggleEdit={() => handleToggleEdit(idx)}
    //                 onDownload={() => handleDownload(doc.name, doc.content)}
    //               />
    //             ))}
    //           </div>

    //           <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
    //             <button
    //               onClick={handleSave}
    //               disabled={status.saving}
    //               className="w-full sm:w-48 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-500 hover:to-purple-500 transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    //             >
    //               {status.saving ? (
    //                 <><Loader2 className="animate-spin w-5 h-5" /> Saving...</>
    //               ) : (
    //                 <><Save size={18} /> Save Changes</>
    //               )}
    //             </button>
                
    //             {projectPlanExists ? (
    //                <button
    //                   onClick={() => navigate(`/project-plan/${dbId}`)}
    //                   className="w-full sm:w-48 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg hover:from-green-500 hover:to-teal-500 transition-transform flex items-center justify-center gap-2"
    //                 >
    //                   <Eye size={18} /> View Project Plan
    //                 </button>
    //             ) : (
    //                 <button
    //                   onClick={() => setIsModalOpen(true)}
    //                   className="w-full sm:w-48 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg hover:from-green-500 hover:to-teal-500 transition-transform flex items-center justify-center gap-2"
    //                 >
    //                   <FileText size={18} /> Generate Plan
    //                 </button>
    //             )}
    //           </div>
            
    //           {status.error && status.saving && (
    //              <div className="text-red-400 font-medium mt-4 text-center">{status.error}</div>
    //            )}
    //         </div>
    //       </div>
        
    //       {/* The modal can also be extracted to its own file if it grows more complex */}
    //       {/* <GeneratePlanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} dbId={dbId} /> */}
    //     </div>
    //   );
    // }



    // import React, { useState, useEffect, useRef, useCallback } from "react";
    // import { useParams, useNavigate, useLocation } from "react-router-dom";
    // import {
    //   ArrowLeft, Save, Loader2, Download, Calendar, FileText,
    //   Eye, X, Edit, Sparkles, AlertTriangle,
    // } from "lucide-react";
    // import gsap from "gsap";
    // import ReactMarkdown from "react-markdown";
    // import remarkGfm from "remark-gfm";

    // const API = import.meta.env.VITE_API_BASE_URL || "";

    // // A centralized configuration for file types.
    // const FILE_CONFIG = {
    //   functional: {
    //     name: "FunctionalDoc.txt",
    //     title: "Functional Document",
    //     description: "Detailed functional requirements and specifications.",
    //     icon: FileText,
    //     color: "from-blue-500 to-cyan-500",
    //   },
    //   mockups: {
    //     name: "Mockups.txt",
    //     title: "Mockups & UI/UX",
    //     description: "UI/UX mockups and design specifications.",
    //     icon: FileText,
    //     color: "from-purple-500 to-pink-500",
    //   },
    //   markdown: {
    //     name: "Markdown.md",
    //     title: "Technical Documentation",
    //     description: "Formatted technical documentation in Markdown.",
    //     icon: FileText,
    //     color: "from-green-500 to-emerald-500",
    //   },
    // };

    // // --- Sub-components for better structure ---

    // /**
    //  * Displays the main page header.
    //  */
    // const PageHeader = ({ documentCount, onBack }) => (
    //   <div className="flex w-full items-start justify-between gap-4 mb-8">
    //     <div>
    //       <div className="flex items-center gap-3 mb-2">
    //         <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
    //           <Sparkles size={24} className="text-white" />
    //         </div>
    //         <h1 className="text-2xl md:text-3xl font-bold text-white">
    //           Document Editor
    //         </h1>
    //       </div>
    //       <p className="text-slate-400 text-sm md:text-base ml-1">
    //         Reviewing and editing {documentCount} generated document{documentCount !== 1 ? 's' : ''}.
    //       </p>
    //     </div>
    //     <button
    //       onClick={onBack}
    //       className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/40 transition-colors shadow-sm text-slate-200 hover:text-white md:ml-auto"
    //     >
    //       <ArrowLeft size={18} />
    //       Back
    //     </button>
    //   </div>
    // );

    // /**
    //  * Renders a card for editing or viewing a single file.
    //  */
    // const FileEditorCard = React.memo(({ document, onContentChange, onToggleEdit, onDownload, isSaving, cardRef }) => {
    //   const Icon = document.icon || FileText;

    //   return (
    //     <div
    //       ref={cardRef}
    //       className="p-6 rounded-2xl bg-slate-700/30 backdrop-blur-md border border-slate-600/40 transition-all hover:shadow-lg hover:border-slate-500/50 duration-300 ease-in-out"
    //     >
    //       {/* === MODIFIED SECTION: Buttons are now always on the right === */}
    //       <div className="flex items-start justify-between mb-4 gap-4">
    //         <div className="flex items-center gap-3">
    //           <div className={`p-2 rounded-lg bg-gradient-to-r ${document.color}`}>
    //             <Icon size={20} className="text-white" />
    //           </div>
    //           <div>
    //             <h3 className="text-lg font-semibold text-white">{document.title}</h3>
    //             <p className="text-sm text-slate-400">{document.description}</p>
    //           </div>
    //         </div>
    //         <div className="flex gap-2 flex-shrink-0">
    //           <button
    //             onClick={onToggleEdit}
    //             className="p-2 rounded-lg hover:bg-slate-600/50 transition-colors text-slate-300 hover:text-white"
    //             title={document.isEditing ? "View Mode" : "Edit Mode"}
    //           >
    //             <Edit size={18} className={document.isEditing ? "text-blue-400" : "text-slate-400"} />
    //           </button>
    //           <button
    //             onClick={onDownload}
    //             className="p-2 rounded-lg hover:bg-slate-600/50 transition-colors text-slate-300 hover:text-white"
    //             title="Download File"
    //           >
    //             <Download size={18} />
    //           </button>
    //         </div>
    //       </div>

    //       <div className="relative font-sans text-[15px] leading-relaxed border border-slate-600/40 rounded-xl overflow-hidden bg-slate-800/50">
    //         {document.isEditing ? (
    //           <textarea
    //             rows={12}
    //             value={document.content}
    //             onChange={onContentChange}
    //             disabled={isSaving}
    //             className="w-full h-full p-5 bg-transparent text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/60 rounded-xl placeholder-slate-500 transition"
    //             placeholder="Start writing your content here..."
    //           />
    //         ) : (
    //           <div className="p-5 text-slate-200 max-h-80 overflow-y-auto prose prose-invert prose-slate">
    //             <ReactMarkdown remarkPlugins={[remarkGfm]}>
    //               {document.content || "*No content available*"}
    //             </ReactMarkdown>
    //           </div>
    //         )}
    //       </div>
    //     </div>
    //   );
    // });


    // // --- Main Component ---

    // export default function GenerateFiles() {
    //   const { dbId } = useParams();
    //   const navigate = useNavigate();
    //   const location = useLocation();

    //   // State Management
    //   const selectedFiles = location.state?.selectedFiles || ['functional', 'mockups', 'markdown'];
    //   const [documents, setDocuments] = useState([]);
    //   const [status, setStatus] = useState({ loading: true, error: null, saving: false });
    //   const [projectPlanExists, setProjectPlanExists] = useState(false);
    //   const [isModalOpen, setIsModalOpen] = useState(false);

    //   // Animation Refs
    //   const pageRef = useRef(null);
    //   const cardRefs = useRef([]);

    //   // Fetch and initialize data on component mount
    //   useEffect(() => {
    //     const initialize = async () => {
    //       if (!dbId) {
    //         setStatus({ loading: false, error: "Missing meeting DB id." });
    //         return;
    //       }
    //       setStatus({ loading: true, error: null });

    //       try {
    //         // Fetch generated files
    //         const filesRes = await fetch(`${API}/api/meetings/${dbId}/generate-files`, {
    //           method: "POST",
    //           headers: { "Content-Type": "application/json" },
    //           body: JSON.stringify({ selectedFiles }),
    //         });
    //         if (!filesRes.ok) throw new Error(`Failed to load documents: ${await filesRes.text()}`);
    //         const filesData = await filesRes.json();
    //         const filesMap = new Map(filesData.map(f => [f.name, f.content]));

    //         // Create the unified documents state
    //         const initialDocuments = selectedFiles.map(fileId => {
    //           const config = FILE_CONFIG[fileId];
    //           return {
    //             id: fileId,
    //             ...config,
    //             content: filesMap.get(config.name) || `Generated content for ${config.title} will appear here...`,
    //             isEditing: false,
    //           };
    //         });
    //         setDocuments(initialDocuments);

    //         // Check for existing project plan
    //         const planRes = await fetch(`${API}/api/meetings/${dbId}/project-plan`);
    //         setProjectPlanExists(planRes.ok);

    //       } catch (err) {
    //         console.error("Initialization error:", err);
    //         setStatus({ loading: false, error: err.message || "Failed to initialize data." });
    //       } finally {
    //         setStatus(prev => ({ ...prev, loading: false }));
    //       }
    //     };
    //     initialize();
    //   }, [dbId, navigate]);

    //   // GSAP Animations
    //   useEffect(() => {
    //     if (!status.loading) {
    //       gsap.fromTo(pageRef.current,
    //         { opacity: 0, y: 20 },
    //         { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    //       );
    //       gsap.fromTo(cardRefs.current.filter(Boolean),
    //         { opacity: 0, y: 40 },
    //         { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.15 }
    //       );
    //     }
    //   }, [status.loading]);
    
    //   // --- Event Handlers (memoized with useCallback) ---

    //   const handleSave = useCallback(async () => {
    //     if (!dbId) return;
    //     setStatus(prev => ({ ...prev, saving: true, error: null }));
        
    //     try {
    //       const payload = documents.map(({ name, content }) => ({ name, content }));
    //       const res = await fetch(`${API}/api/meetings/${dbId}/files`, {
    //         method: "PUT",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(payload),
    //       });
    //       if (!res.ok) throw new Error(await res.text());
    //       alert("Files saved successfully!");
    //     } catch (err) {
    //       console.error("Save error:", err);
    //       setStatus(prev => ({ ...prev, saving: false, error: err.message || "Failed to save files" }));
    //     } finally {
    //       setStatus(prev => ({ ...prev, saving: false }));
    //     }
    //   }, [dbId, documents]);

    //   const handleDownload = useCallback((filename, content) => {
    //     const blob = new Blob([content], { type: "text/plain" });
    //     const link = document.createElement("a");
    //     link.href = URL.createObjectURL(blob);
    //     link.download = filename;
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //   }, []);

    //   const handleContentChange = useCallback((index, newContent) => {
    //     setDocuments(prevDocs => 
    //       prevDocs.map((doc, i) => i === index ? { ...doc, content: newContent } : doc)
    //     );
    //   }, []);

    //   const handleToggleEdit = useCallback((index) => {
    //     setDocuments(prevDocs =>
    //       prevDocs.map((doc, i) => i === index ? { ...doc, isEditing: !doc.isEditing } : doc)
    //     );
    //   }, []);


    //   // --- Render Logic ---

    //   if (status.loading) {
    //     return (
    //       <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-lg text-slate-300">
    //         <Loader2 className="animate-spin w-8 h-8 mb-3 text-blue-400" />
    //         Loading Documents...
    //       </div>
    //     );
    //   }

    //   if (status.error && !status.saving) {
    //     return (
    //       <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-red-400 font-semibold">
    //         <AlertTriangle className="w-10 h-10 mb-4" />
    //         <p className="text-xl">An Error Occurred</p>
    //         <p className="text-base text-slate-400 mt-1">{status.error}</p>
    //       </div>
    //     );
    //   }

    //   return (
    //     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/60 to-purple-900/70 text-white p-4 md:p-6">
    //       <div className="container mx-auto max-w-5xl">
    //         <div ref={pageRef} className="rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 p-6 md:p-8">
    //           <PageHeader documentCount={selectedFiles.length} onBack={() => navigate(-1)} />

    //           <div className="space-y-6">
    //             {documents.map((doc, idx) => (
    //               <FileEditorCard
    //                 key={doc.id}
    //                 cardRef={el => (cardRefs.current[idx] = el)}
    //                 document={doc}
    //                 isSaving={status.saving}
    //                 onContentChange={(e) => handleContentChange(idx, e.target.value)}
    //                 onToggleEdit={() => handleToggleEdit(idx)}
    //                 onDownload={() => handleDownload(doc.name, doc.content)}
    //               />
    //             ))}
    //           </div>

    //           {/* === MODIFIED SECTION: Buttons are now smaller and in one line === */}
    //           <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
    //             <button
    //               onClick={handleSave}
    //               disabled={status.saving}
    //               className="py-2 px-5 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-500 hover:to-purple-500 transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    //             >
    //               {status.saving ? (
    //                 <><Loader2 className="animate-spin w-5 h-5" /> Saving...</>
    //               ) : (
    //                 <><Save size={16} /> Save Changes</>
    //               )}
    //             </button>
                
    //             {projectPlanExists ? (
    //                <button
    //                   onClick={() => navigate(`/project-plan/${dbId}`)}
    //                   className="py-2 px-5 text-sm font-semibold rounded-lg bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg hover:from-green-500 hover:to-teal-500 transition-transform flex items-center justify-center gap-2"
    //                 >
    //                   <Eye size={16} /> View Project Plan
    //                 </button>
    //             ) : (
    //                 <button
    //                   onClick={() => setIsModalOpen(true)}
    //                   className="py-2 px-5 text-sm font-semibold rounded-lg bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg hover:from-green-500 hover:to-teal-500 transition-transform flex items-center justify-center gap-2"
    //                 >
    //                   <FileText size={16} /> Generate Plan
    //                 </button>
    //             )}
    //           </div>
            
    //           {status.error && status.saving && (
    //              <div className="text-red-400 font-medium mt-4 text-center">{status.error}</div>
    //            )}
    //         </div>
    //       </div>
        
    //       {/* Modal remains unchanged */}
    //     </div>
    //   );
    // }

    // import React, { useState, useEffect, useRef } from "react";
    // import { useParams, useNavigate, useLocation } from "react-router-dom";
    // import {
    //   ArrowLeftFromLine,
    //   Thermometer,
    //   Save,
    //   Loader2,
    //   Download,
    //   Calendar,
    //   FileText,
    //   Eye,
    //   X,
    //   Pencil,
    // } from "lucide-react";
    // import gsap from "gsap";

    // const API = import.meta.env.VITE_API_BASE_URL || "";

    // // File configuration mapping
    // const FILE_CONFIG = {
    //   functional: {
    //     name: "FunctionalDoc.txt",
    //     title: "Functional Document",
    //     description: "Detailed functional requirements and specifications"
    //   },
    //   mockups: {
    //     name: "Mockups.txt", 
    //     title: "Mockups",
    //     description: "UI/UX mockups and design specifications"
    //   },
    //   markdown: {
    //     name: "Markdown.md",
    //     title: "Markdown File", 
    //     description: "Formatted markdown documentation"
    //   }
    // };

    // export default function GenerateFiles() {
    //   const { dbId } = useParams();
    //   const navigate = useNavigate();
    //   const location = useLocation();

    //   // Get selected files from navigation state
    //   const selectedFiles = location.state?.selectedFiles || ['functional', 'mockups', 'markdown']; // fallback to all files

    //   const [files, setFiles] = useState([]);
    //   const [editingFiles, setEditingFiles] = useState([]);
    //   const [isEditing, setIsEditing] = useState([]); // dynamic based on selected files
    //   const [loading, setLoading] = useState(false);
    //   const [saving, setSaving] = useState(false);
    //   const [error, setError] = useState(null);

    //   const [projectPlanExists, setProjectPlanExists] = useState(false);

    //   const [showModal, setShowModal] = useState(false);
    //   const [projectDuration, setProjectDuration] = useState(4);
    //   const [additionalDetails, setAdditionalDetails] = useState("");
    //   const [generatingPlan, setGeneratingPlan] = useState(false);
    //   const [temperature, setTemperature] = useState(0.3);

    //   const pageRef = useRef(null);
    //   const cardRefs = useRef([]);
    //   const saveBtnRef = useRef(null);
    //   const generatePlanBtnRef = useRef(null);
    //   const viewPlanBtnRef = useRef(null);
    //   const modalRef = useRef(null);

    //   // Create filtered file list based on selected files
    //   const getFilteredFiles = () => {
    //     return selectedFiles.map(fileId => ({
    //       id: fileId,
    //       name: FILE_CONFIG[fileId].name,
    //       title: FILE_CONFIG[fileId].title,
    //       description: FILE_CONFIG[fileId].description
    //     }));
    //   };

    //   useEffect(() => {
    //     async function initializeFilesAndCheckPlan() {
    //       if (!dbId) {
    //         setError("Missing meeting DB id.");
    //         return;
    //       }
    //       setLoading(true);
    //       setError(null);
        
    //       try {
    //         // Initialize editing state based on selected files
    //         setIsEditing(new Array(selectedFiles.length).fill(false));

    //         const filesRes = await fetch(
    //           `${API}/api/meetings/${dbId}/generate-files`,
    //           {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             // Pass selected file types to backend
    //             body: JSON.stringify({ selectedFiles })
    //           }
    //         );

    //         if (!filesRes.ok) {
    //           throw new Error(`Failed to load files: ${await filesRes.text()}`);
    //         }
            
    //         const filesData = await filesRes.json();
            
    //         // Filter the response to only include selected files
    //         const filteredFiles = getFilteredFiles().map((config, index) => {
    //           const matchingFile = filesData.find(f => f.name === config.name);
    //           return matchingFile || { 
    //             name: config.name, 
    //             content: `Generated ${config.title} content will appear here...` 
    //           };
    //         });
            
    //         setFiles(filteredFiles);
    //         setEditingFiles(filteredFiles.map(f => f.content ?? ""));

    //         const planRes = await fetch(`${API}/api/meetings/${dbId}/project-plan`);
    //         if (planRes.ok) {
    //           setProjectPlanExists(true);
    //         } else if (planRes.status === 404) {
    //           setProjectPlanExists(false);
    //         } else {
    //           console.error(
    //             "Error checking project plan status:",
    //             await planRes.text()
    //           );
    //         }
    //       } catch (err) {
    //         console.error("Initialization error:", err);
    //         setError(err.message || "Failed to initialize data.");
    //       } finally {
    //         setLoading(false);
    //       }
    //     }
    //     initializeFilesAndCheckPlan();
    //   }, [dbId, selectedFiles]);

    //   function getTemperatureDescription(temp) {
    //   if (temp <= 0.2) return "Very Conservative - Highly consistent, predictable output";
    //   if (temp <= 0.4) return "Conservative - Balanced with slight creativity";
    //   if (temp <= 0.6) return "Balanced - Good mix of consistency and creativity";
    //   if (temp <= 0.8) return "Creative - More varied and innovative output";
    //   return "Very Creative - Highly diverse and experimental output";
    // }

    // function getTemperatureColor(temp) {
    //   if (temp <= 0.2) return "from-blue-500 to-cyan-500";
    //   if (temp <= 0.4) return "from-green-500 to-blue-500";
    //   if (temp <= 0.6) return "from-yellow-500 to-green-500";
    //   if (temp <= 0.8) return "from-orange-500 to-yellow-500";
    //   return "from-red-500 to-orange-500";
    // }

    //   async function handleSave() {
    //     if (!dbId) return;
    //     setSaving(true);
    //     setError(null);
        
    //     try {
    //       const payload = files.map((f, i) => ({ 
    //         name: f.name, 
    //         content: editingFiles[i] 
    //       }));

    //       const res = await fetch(`${API}/api/meetings/${dbId}/files`, {
    //         method: "PUT",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(payload),
    //       });
        
    //       if (!res.ok) throw new Error(await res.text());
    //       alert("Files saved successfully!");
    //     } catch (err) {
    //       console.error("Save error:", err);
    //       setError(err.message || "Failed to save files");
    //     } finally {
    //       setSaving(false);
    //     }
    //   }

    //   function handleDownload(filename, content) {
    //     const blob = new Blob([content], { type: "text/plain" });
    //     const link = document.createElement("a");
    //     link.href = URL.createObjectURL(blob);
    //     link.download = filename;
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //   }

    //   function openModal() {
    //     setShowModal(true);
    //     setTimeout(() => {
    //       if (modalRef.current) {
    //         gsap.fromTo(
    //           modalRef.current,
    //           { opacity: 0, scale: 0.9 },
    //           { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
    //         );
    //       }
    //     }, 10);
    //   }

    //   function closeModal() {
    //     if (modalRef.current) {
    //       gsap.to(modalRef.current, {
    //         opacity: 0,
    //         scale: 0.9,
    //         duration: 0.2,
    //         ease: "power2.in",
    //         onComplete: () => setShowModal(false),
    //       });
    //     }
    //   }

    //   async function handleGenerateProjectPlan() {
    //     if (!dbId || projectDuration <= 0) {
    //       setError("Invalid project duration.");
    //       return;
    //     }

    //     setGeneratingPlan(true);
    //     setError(null);

    //     try {
    //       const res = await fetch(
    //         `${API}/api/meetings/${dbId}/generate-project-plan`,
    //         {
    //           method: "POST",
    //           headers: { "Content-Type": "application/json" },
    //           body: JSON.stringify({
    //             durationWeeks: projectDuration,
    //             additionalDetails: additionalDetails.trim(),
    //           }),
    //         }
    //       );

    //       if (!res.ok) {
    //         const errorText = await res.text();
    //         throw new Error(errorText);
    //       }

    //       closeModal();
    //       setProjectPlanExists(true);
    //       navigate(`/project-plan/${dbId}`);
    //     } catch (err) {
    //       console.error("Generate project plan error:", err);
    //       setError(err.message || "Failed to generate project plan.");
    //     } finally {
    //       setGeneratingPlan(false);
    //     }
    //   }

    //   function handleViewProjectPlan() {
    //     navigate(`/project-plan/${dbId}`);
    //   }

    //   // GSAP animations
    //   useEffect(() => {
    //     gsap.fromTo(
    //       pageRef.current,
    //       { opacity: 0, y: 20 },
    //       { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    //     );

    //     gsap.fromTo(
    //       cardRefs.current,
    //       { opacity: 0, y: 40 },
    //       {
    //         opacity: 1,
    //         y: 0,
    //         duration: 0.6,
    //         ease: "power3.out",
    //         stagger: 0.15,
    //       }
    //     );
    //   }, [projectPlanExists]);

    //   if (loading) {
    //     return (
    //       <div className="flex flex-col items-center justify-center h-64 text-lg text-gray-600">
    //         <Loader2 className="animate-spin w-8 h-8 mb-3 text-blue-500" />
    //         Loading files and checking project plan status...
    //       </div>
    //     );
    //   }

    //   if (error) {
    //     return (
    //       <div className="flex flex-col items-center justify-center h-64 text-red-600 font-semibold">
    //         {error}
    //       </div>
    //     );
    //   }

    //   const filteredFileConfigs = getFilteredFiles();

    //   return (
    //     <div ref={pageRef} className="max-w-5xl mx-auto px-6 py-8">
    //       {/* Header */}
    //       <div className="flex items-center justify-between mb-6">
    //         <div>
    //           <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
    //             Generate & Edit Meeting Files
    //           </h2>
    //           <p className="text-gray-600 mt-2">
    //             Editing {selectedFiles.length} selected file{selectedFiles.length !== 1 ? 's' : ''}
    //           </p>
    //         </div>
    //         <button
    //           onClick={() => navigate(-1)}
    //           className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition shadow-sm"
    //         >
    //           <ArrowLeftFromLine size={18} />
    //           Back
    //         </button>
    //       </div>

    //       {/* File Editors - Only show selected files */}
    //       <div className="space-y-8">
    //         {filteredFileConfigs.map((config, idx) => {
    //           const fileData = files[idx];
            
    //           return (
    //             <div
    //               key={config.id}
    //               ref={(el) => (cardRefs.current[idx] = el)}
    //               className="p-6 rounded-2xl bg-white/80 shadow-lg backdrop-blur-md border border-gray-200 transition hover:shadow-2xl hover:scale-[1.01] duration-300 ease-in-out"
    //             >
    //               {/* Title with edit + download */}
    //               <div className="flex items-center justify-between mb-3">
    //                 <div>
    //                   <label className="block text-lg font-semibold text-gray-800">
    //                     {config.title}
    //                   </label>
    //                   <p className="text-sm text-gray-500">{config.description}</p>
    //                 </div>
    //                 <div className="flex gap-2">
    //                   <button
    //                     onClick={() => {
    //                       const arr = [...isEditing];
    //                       arr[idx] = !arr[idx];
    //                       setIsEditing(arr);
    //                     }}
    //                     className="p-2 rounded-lg hover:bg-gray-100 transition"
    //                     title={isEditing[idx] ? "Stop Editing" : "Edit File"}
    //                   >
    //                     <Pencil
    //                       size={20}
    //                       className={isEditing[idx] ? "text-blue-600" : "text-gray-600"}
    //                     />
    //                   </button>
    //                   <button
    //                     onClick={() =>
    //                       handleDownload(config.name, editingFiles[idx] ?? "")
    //                     }
    //                     className="p-2 rounded-lg hover:bg-gray-100 transition"
    //                     title="Download File"
    //                   >
    //                     <Download size={20} />
    //                   </button>
    //                 </div>
    //               </div>

    //               {/* Viewer / Editor */}
    //               <div className="relative font-mono text-sm leading-relaxed border border-gray-300 rounded-xl overflow-hidden">
    //                 {isEditing[idx] ? (
    //                   <textarea
    //                     rows={12}
    //                     value={editingFiles[idx] ?? ""}
    //                     onChange={(e) => {
    //                       const arr = [...editingFiles];
    //                       arr[idx] = e.target.value;
    //                       setEditingFiles(arr);
    //                     }}
    //                     className="w-full p-4 bg-white text-gray-800 resize-none focus:outline-none"
    //                   />
    //                 ) : (
    //                   <div className="p-4 text-gray-800 max-h-72 overflow-y-auto whitespace-pre-wrap space-y-2">
    //                     {editingFiles[idx]
    //                       ?.split("\n")
    //                       .filter((line) => line.trim() !== "")
    //                       .map((line, i) => {
    //                         // Clean markdown
    //                         const cleanedLine = line
    //                           .replace(/^#+\s?/, "") // remove heading markers ##
    //                           .replace(/[*_]{1,2}/g, ""); // remove **, *, _

    //                         // Headings
    //                         if (/^#+\s/.test(line)) {
    //                           return (
    //                             <div key={i} className="font-bold text-gray-900">
    //                               {cleanedLine}
    //                             </div>
    //                           );
    //                         }
    //                         // Bullet points
    //                         if (/^[-*]\s/.test(line)) {
    //                           return (
    //                             <li key={i} className="ml-5 list-disc">
    //                               {cleanedLine.replace(/^[-*]\s/, "")}
    //                             </li>
    //                           );
    //                         }
    //                         // Normal paragraph
    //                         return <p key={i}>{cleanedLine}</p>;
    //                       })}
    //                   </div>
    //                 )}
    //               </div>
    //             </div>
    //           );
    //         })}
    //       </div>

    //       {/* Buttons */}
    //       <div className="mt-8 flex justify-center items-center gap-4">
    //         <button
    //           ref={saveBtnRef}
    //           onClick={handleSave}
    //           disabled={saving}
    //           className="w-48 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:scale-[1.02] active:scale-95 transition transform flex items-center justify-center gap-3"
    //         >
    //           {saving ? (
    //             <>
    //               <Loader2 className="animate-spin w-5 h-5" />
    //               Updating...
    //             </>
    //           ) : (
    //             <>
    //               <Save size={20} />
    //               Update Files
    //             </>
    //           )}
    //         </button>

    //         {projectPlanExists ? (
    //           <button
    //             ref={viewPlanBtnRef}
    //             onClick={handleViewProjectPlan}
    //             className="w-58 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg hover:scale-[1.02] active:scale-95 transition transform flex items-center justify-center gap-3"
    //           >
    //             <Eye size={20} />
    //             View Project Plan
    //           </button>
    //         ) : (
    //           <button
    //             ref={generatePlanBtnRef}
    //             onClick={openModal}
    //             className="w-48 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg hover:scale-[1.02] active:scale-95 transition transform flex items-center justify-center gap-3"
    //           >
    //             <FileText size={20} />
    //             Generate Plan
    //           </button>
    //         )}
    //       </div>

    //       {error && (
    //         <div className="text-red-600 font-medium mt-4 text-center">{error}</div>
    //       )}

    //       {/* Modal */}
    //       {showModal && (
    //   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    //     <div
    //       ref={modalRef}
    //       className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
    //     >
    //       <div className="flex items-center justify-between mb-6">
    //         <h3 className="text-2xl font-bold text-gray-800">
    //           Generate Project Plan
    //         </h3>
    //         <button
    //           onClick={closeModal}
    //           className="p-2 hover:bg-gray-100 rounded-lg transition"
    //           disabled={generatingPlan}
    //         >
    //           <X size={20} />
    //         </button>
    //       </div>

    //       <div className="space-y-6">
    //         <div>
    //           <label className="block text-sm font-semibold text-gray-700 mb-2">
    //             <Calendar className="inline w-4 h-4 mr-1" />
    //             Project Duration (weeks)
    //           </label>
    //           <input
    //             type="number"
    //             min="1"
    //             max="52"
    //             value={projectDuration}
    //             onChange={(e) =>
    //               setProjectDuration(parseInt(e.target.value) || 1)
    //             }
    //             className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
    //             disabled={generatingPlan}
    //           />
    //         </div>

    //         {/* Temperature Control Section */}
    //         <div>
    //           <div className="flex items-center justify-between mb-2">
    //             <label className="block text-sm font-semibold text-gray-700">
    //               <Thermometer className="inline w-4 h-4 mr-1" />
    //               AI Temperature
    //             </label>
    //             <div className="flex items-center gap-2">
    //               <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getTemperatureColor(temperature)} text-white`}>
    //                 {temperature.toFixed(1)}
    //               </span>
    //             </div>
    //           </div>

    //           <div className="relative mb-3">
    //             <input
    //               type="range"
    //               min="0.1"
    //               max="1.0"
    //               step="0.1"
    //               value={temperature}
    //               onChange={(e) => setTemperature(parseFloat(e.target.value))}
    //               className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
    //               disabled={generatingPlan}
    //             />
    //             <div className="flex justify-between text-xs text-gray-500 mt-1">
    //               <span>0.1</span>
    //               <span>0.5</span>
    //               <span>1.0</span>
    //             </div>
    //           </div>

    //           <div className="bg-gray-50 rounded-lg p-3">
    //             <p className="text-sm font-medium text-gray-800 mb-1">
    //               {getTemperatureDescription(temperature)}
    //             </p>
    //             <p className="text-xs text-gray-600">
    //               Lower values = more consistent results, Higher values = more creative variations
    //             </p>
    //           </div>

    //           {/* Temperature Visual Guide */}
    //           <div className="grid grid-cols-5 gap-1 mt-3">
    //             <div className="text-center">
    //               <div className="w-full h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded mb-1"></div>
    //               <span className="text-xs text-gray-600">Conservative</span>
    //             </div>
    //             <div className="text-center">
    //               <div className="w-full h-1.5 bg-gradient-to-r from-green-500 to-blue-500 rounded mb-1"></div>
    //               <span className="text-xs text-gray-600">Balanced</span>
    //             </div>
    //             <div className="text-center">
    //               <div className="w-full h-1.5 bg-gradient-to-r from-yellow-500 to-green-500 rounded mb-1"></div>
    //               <span className="text-xs text-gray-600">Moderate</span>
    //             </div>
    //             <div className="text-center">
    //               <div className="w-full h-1.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded mb-1"></div>
    //               <span className="text-xs text-gray-600">Creative</span>
    //             </div>
    //             <div className="text-center">
    //               <div className="w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded mb-1"></div>
    //               <span className="text-xs text-gray-600">Experimental</span>
    //             </div>
    //           </div>
    //         </div>

    //         <div>
    //           <label className="block text-sm font-semibold text-gray-700 mb-2">
    //             Additional Details (optional)
    //           </label>
    //           <textarea
    //             rows={4}
    //             value={additionalDetails}
    //             onChange={(e) => setAdditionalDetails(e.target.value)}
    //             placeholder="Any specific requirements, constraints, or preferences..."
    //             className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
    //             disabled={generatingPlan}
    //           />
    //         </div>
    //       </div>

    //       <div className="flex gap-3 mt-8">
    //         <button
    //           onClick={closeModal}
    //           disabled={generatingPlan}
    //           className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
    //         >
    //           Cancel
    //         </button>
    //         <button
    //           onClick={handleGenerateProjectPlan}
    //           disabled={generatingPlan || projectDuration <= 0}
    //           className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:scale-[1.02] transition font-medium flex items-center justify-center gap-2"
    //         >
    //           {generatingPlan ? (
    //             <>
    //               <Loader2 className="animate-spin w-4 h-4" />
    //               Generating...
    //             </>
    //           ) : (
    //             "Generate"
    //           )}
    //         </button>
    //       </div>
    //     </div>

    //     {/* Custom Slider Styles */}
    //     <style jsx>{`
    //       .slider::-webkit-slider-thumb {
    //         appearance: none;
    //         height: 20px;
    //         width: 20px;
    //         border-radius: 50%;
    //         background: linear-gradient(45deg, #6366f1, #8b5cf6);
    //         cursor: pointer;
    //         box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    //       }
    //       .slider::-moz-range-thumb {
    //         height: 20px;
    //         width: 20px;
    //         border-radius: 50%;
    //         background: linear-gradient(45deg, #6366f1, #8b5cf6);
    //         cursor: pointer;
    //         border: none;
    //         box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    //       }
    //     `}</style>
    //   </div>
    // )}
    //     </div>
    //   );
    // }

    
//     import React, { useState, useEffect, useRef, useCallback } from "react";
//     import { useParams, useNavigate, useLocation } from "react-router-dom";
//     import { ArrowLeft, Thermometer, Save, Loader2, Download, FileText, Eye, X, Pencil } from "lucide-react";
//     import gsap from "gsap";

//     const API = import.meta.env.VITE_API_BASE_URL || "";

//     // --- CONFIGURATION ---
//     const FILE_CONFIG = {
//     functional: { name: "FunctionalDoc.txt", title: "Functional Document", description: "Detailed functional requirements", icon: FileText },
//     mockups: { name: "Mockups.txt", title: "Mockups", description: "UI/UX design specifications", icon: Eye },
//     markdown: { name: "Markdown.md", title: "Markdown File", description: "Formatted documentation", icon: Pencil },
//     };

//     // --- REUSABLE COMPONENTS ---

//     const FullScreenStatus = ({ loading, error, loadingText }) => (
//         <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 text-center">
//             {loading && <><Loader2 className="animate-spin mr-3 text-blue-400" size={32} /> <span className="text-lg">{loadingText}</span></>}
//             {error && <p className="text-lg text-red-500">{error}</p>}
//         </div>
//     );

//     const Notification = ({ message, type, onDismiss }) => {
//     useEffect(() => {
//         if (message) {
//         const timer = setTimeout(onDismiss, 3000);
//         return () => clearTimeout(timer);
//         }
//     }, [message, onDismiss]);

//     if (!message) return null;

//     const baseClasses = "fixed bottom-5 right-5 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl z-50 transition-all transform animate-fade-in-up";
//     const typeClasses = type === 'success' 
//         ? "bg-gradient-to-r from-green-500 to-teal-500 text-white" 
//         : "bg-gradient-to-r from-red-500 to-orange-500 text-white";

//     return (
//         <div className={`${baseClasses} ${typeClasses}`}>
//         <span>{message}</span>
//         <button onClick={onDismiss} className="p-1 rounded-full hover:bg-white/20 transition-colors"><X size={16} /></button>
//         </div>
//     );
//     };

//     const ProjectPlanModal = ({ isOpen, onClose, onGenerate }) => {
//         const [duration, setDuration] = useState(4);
//         const [details, setDetails] = useState("");
//         const [temperature, setTemperature] = useState(0.3);
//         const [isGenerating, setIsGenerating] = useState(false);
//         const modalRef = useRef(null);

//         useEffect(() => {
//             if (isOpen) {
//                 gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
//             }
//         }, [isOpen]);

//         const handleClose = useCallback(() => {
//             gsap.to(modalRef.current, { opacity: 0, scale: 0.95, duration: 0.2, ease: "power2.in", onComplete: onClose });
//         }, [onClose]);

//         const handleGenerate = async () => {
//             setIsGenerating(true);
//             await onGenerate({ duration, details, temperature });
//             setIsGenerating(false);
//         };

//         if (!isOpen) return null;

//         const getTempColor = (t) => t <= 0.2 ? "text-blue-400" : t <= 0.5 ? "text-green-400" : t <= 0.8 ? "text-yellow-400" : "text-red-400";

//         return (
//             <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 ">
//                 <div ref={modalRef} className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl space-y-6">
//                     <div className="flex items-center justify-between">
//                         <h3 className="text-2xl font-bold text-white">Generate Project Plan</h3>
//                         <button onClick={handleClose} disabled={isGenerating} className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition"><X size={20} /></button>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-semibold text-slate-300 mb-2">Project Duration (weeks)</label>
//                         <input type="number" min="1" max="52" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 1)} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition" disabled={isGenerating} />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-semibold text-slate-300 mb-2">AI Temperature <span className={`font-bold ${getTempColor(temperature)}`}>{temperature.toFixed(1)}</span></label>
//                         <input type="range" min="0.1" max="1.0" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" disabled={isGenerating} />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-semibold text-slate-300 mb-2">Additional Details (optional)</label>
//                         <textarea rows={3} value={details} onChange={e => setDetails(e.target.value)} placeholder="e.g., specific tech stack, team size..." className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl resize-none transition" disabled={isGenerating} />
//                     </div>
//                     <div className="flex gap-4 pt-4">
//                         <button onClick={handleClose} disabled={isGenerating} className="flex-1 py-3 px-4 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 transition font-medium">Cancel</button>
//                         <button onClick={handleGenerate} disabled={isGenerating || duration <= 0} className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50">
//                             {isGenerating ? <><Loader2 className="animate-spin" size={20} /> Generating...</> : "Generate"}
//                         </button>
//                     </div>
//                 </div>
//                 <style>{` 
//                 .slider::-webkit-slider-thumb { 
//                     background: #fff; 
//                     box-shadow: 0 0 5px #fff, 0 0 10px #fff; 
//                 } 
//                 `}</style>
//             </div>
//         );
//     };

//     const FileEditorCard = React.memo(({ config, content, isEditing, onToggleEdit, onContentChange, onDownload, cardRef }) => {
//         return (
//             <div ref={cardRef} className="p-6 rounded-2xl bg-slate-800/40 shadow-lg backdrop-blur-md border border-slate-700/50 transition-all duration-300 ease-in-out hover:shadow-blue-500/10 hover:border-slate-600">
//                 <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-4">
//                         <div className="p-3 bg-slate-900/50 rounded-lg text-blue-400"><config.icon size={22} /></div>
//                         <div>
//                             <h3 className="text-lg font-semibold text-white">{config.title}</h3>
//                             <p className="text-sm text-slate-400">{config.description}</p>
//                         </div>
//                     </div>
//                     <div className="flex gap-2">
//                         <button onClick={onToggleEdit} title={isEditing ? "View" : "Edit"} className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition"><Pencil size={18} /></button>
//                         <button onClick={onDownload} title="Download" className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition"><Download size={18} /></button>
//                     </div>
//                 </div>
//                 <div className="relative font-mono text-sm leading-relaxed border border-slate-700 rounded-xl overflow-hidden bg-slate-900/70 min-h-[288px]">
//                     {isEditing ? (
//                         <textarea rows={12} value={content} onChange={onContentChange} className="w-full h-full p-4 bg-transparent text-slate-200 resize-none focus:outline-none" />
//                     ) : (
//                         <div className="p-4 max-h-72 overflow-y-auto whitespace-pre-wrap text-slate-300">{content}</div>
//                     )}
//                 </div>
//             </div>
//         );
//     });

//     // --- MAIN PAGE COMPONENT ---

//     export default function GenerateFiles() {
//         const { dbId } = useParams();
//         const navigate = useNavigate();
//         const location = useLocation();
//         const selectedFiles = location.state?.selectedFiles || Object.keys(FILE_CONFIG);

//         const [filesContent, setFilesContent] = useState([]);
//         const [isEditing, setIsEditing] = useState([]);
//         const [loading, setLoading] = useState(true);
//         const [saving, setSaving] = useState(false);
//         const [error, setError] = useState(null);
//         const [notification, setNotification] = useState({ message: '', type: '' });
//         const [projectPlanExists, setProjectPlanExists] = useState(false);
//         const [isModalOpen, setIsModalOpen] = useState(false);

//         const pageRef = useRef(null);
//         const cardRefs = useRef([]);

//         useEffect(() => {
//             const initialize = async () => {
//                 if (!dbId) return setError("Missing meeting ID.");
//                 setLoading(true);
//                 try {
//                     setIsEditing(new Array(selectedFiles.length).fill(false));
//                     const filesRes = await fetch(`${API}/api/meetings/${dbId}/generate-files`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selectedFiles }) });
//                     if (!filesRes.ok) throw new Error(await filesRes.text());
//                     const filesData = await filesRes.json();
                    
//                     const filteredContent = selectedFiles.map(id => {
//                         const config = FILE_CONFIG[id];
//                         const file = filesData.find(f => f.name === config.name);
//                         return file ? file.content : `Content for ${config.title} will appear here.`;
//                     });
//                     setFilesContent(filteredContent);

//                     const planRes = await fetch(`${API}/api/meetings/${dbId}/project-plan`);
//                     setProjectPlanExists(planRes.ok);
//                 } catch (err) {
//                     setError(err.message);
//                 } finally {
//                     setLoading(false);
//                 }
//             };
//             initialize();
//         }, [dbId, selectedFiles]);
        
//         useEffect(() => {
//             if (!loading) {
//                 gsap.fromTo(pageRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
//                 gsap.fromTo(cardRefs.current.filter(Boolean), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" });
//             }
//         }, [loading]);

//         const showNotification = (message, type = 'success') => {
//             setNotification({ message, type });
//         };

//         const handleSave = useCallback(async () => {
//             setSaving(true);
//             try {
//                 const payload = selectedFiles.map((id, i) => ({ name: FILE_CONFIG[id].name, content: filesContent[i] }));
//                 const res = await fetch(`${API}/api/meetings/${dbId}/files`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
//                 if (!res.ok) throw new Error(await res.text());
//                 showNotification("Files saved successfully!");
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setSaving(false);
//             }
//         }, [dbId, selectedFiles, filesContent]);

//         const handleDownload = useCallback((index) => {
//             const config = FILE_CONFIG[selectedFiles[index]];
//             const content = filesContent[index];
//             const blob = new Blob([content], { type: "text/plain" });
//             const link = document.createElement("a");
//             link.href = URL.createObjectURL(blob);
//             link.download = config.name;
//             link.click();
//             URL.revokeObjectURL(link.href);
//         }, [selectedFiles, filesContent]);

//         const handleGeneratePlan = useCallback(async (formData) => {
//             try {
//                 const res = await fetch(`${API}/api/meetings/${dbId}/generate-project-plan`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ durationWeeks: formData.duration, additionalDetails: formData.details.trim(), temperature: formData.temperature }) });
//                 if (!res.ok) throw new Error(await res.text());
//                 setIsModalOpen(false);
//                 setProjectPlanExists(true);
//                 showNotification("Project plan generated successfully!");
//                 navigate(`/project-plan/${dbId}`);
//             } catch (err) {
//                 setError(err.message);
//             }
//         }, [dbId, navigate]);

//         if (loading || error) return <FullScreenStatus loading={loading} error={error} loadingText="Generating initial documents..." />;

//         return (
//             // --- THIS IS THE MODIFIED LINE ---
//             <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/60 to-purple-900/70 text-white   rounded-3xl ">
//                 <div className="max-w-5xl mx-auto px-4 sm:px-6 py-1">
                    
//                     <div className="flex  items-center ">
//                         <div className=" flex mr-5"><IconButton 
//                                       title="Back" 
//                                       onClick={() => navigate(-1)}
//                                       icon={<ArrowLeft className="w-4 h-4" />}
//                                       variant="secondary"
//                                     />
//                                     </div>
//                        <div className="pt-10">
                        
//                             <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Generate & Edit Files</h1>
//                             <p className="text-slate-400 mt-2">Editing {selectedFiles.length} selected document{selectedFiles.length > 1 && "s"}</p>
//                         </div>
                        
//                     </div>
//                     <div className="space-y-8">
//                         {selectedFiles.map((fileId, idx) => (
//                             <FileEditorCard
//                                 key={fileId}
//                                 cardRef={el => (cardRefs.current[idx] = el)}
//                                 config={FILE_CONFIG[fileId]}
//                                 content={filesContent[idx]}
//                                 isEditing={isEditing[idx]}
//                                 onToggleEdit={() => setIsEditing(prev => prev.map((val, i) => i === idx ? !val : val))}
//                                 onContentChange={e => setFilesContent(prev => prev.map((val, i) => i === idx ? e.target.value : val))}
//                                 onDownload={() => handleDownload(idx)}
//                             />
//                         ))}
//                     </div>
//                     <div className="mt-8 flex flex-row justify-center items-center gap-4 border-t border-slate-800 pt-8">
//                         <button onClick={handleSave} disabled={saving} className="w-60 mb-4 px-6 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 ease-in-out flex items-center justify-center gap-2 disabled:opacity-50">
//                             {saving ? <><Loader2 className="animate-spin" size={20} /> Updating...</> : <><Save size={20} /> Update Documents</>}
//                         </button>
//                         {projectPlanExists ? (
//                             <button onClick={() => navigate(`/project-plan/${dbId}`)} className="w-60 mb-4 px-6 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 ease-in-out flex items-center justify-center gap-2">
//                             <Eye size={20} /> View Project Plan
//                             </button>
//                         ) : (
//                             <button onClick={() => setIsModalOpen(true)} className="w-60  mb-4 px-6 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 ease-in-out flex items-center justify-center gap-2">
//                             <FileText size={20} /> Generate Project Plan
//                             </button>
//                         )}
//                     </div>
//                 </div>
//                 <ProjectPlanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onGenerate={handleGeneratePlan} />
//                 <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />
//             </div>
//         );
//     }function IconButton({ 
//   icon, 
//   title, 
//   onClick, 
//   disabled = false,
//   variant = "primary"
// }) {
//   const variantStyles = {
//     primary: "bg-slate-700/50 hover:bg-slate-700/70 text-blue-400 hover:text-blue-300",
//     secondary: "bg-slate-700/50 hover:bg-slate-700/70 text-slate-400 hover:text-slate-300",
//     success: "bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300",
//     accent: "bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300"
//   };

//   return (
//     <button
//       title={title}
//       onClick={onClick}
//       disabled={disabled}
//       className={`
//         w-11 h-11 rounded-xl flex items-center justify-center
//         transition-all duration-300 ease-out
//         border border-slate-600/40
//         hover:scale-110 hover:shadow-lg
//         active:scale-95
//         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
//         focus:outline-none focus:ring-2 focus:ring-blue-500/50
//         ${variantStyles[variant]}
//       `}
//     >
//       {icon}
//     </button>
//   );
// }


import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Thermometer, Save, Loader2, Download, FileText, Eye, X, Pencil } from "lucide-react";
import gsap from "gsap";

const API = import.meta.env.VITE_API_BASE_URL || "";

// --- CONFIGURATION ---
const FILE_CONFIG = {
  functional: { name: "FunctionalDoc.txt", title: "Functional Document", description: "Detailed functional requirements", icon: FileText },
  mockups: { name: "Mockups.txt", title: "Mockups", description: "UI/UX design specifications", icon: Eye },
  markdown: { name: "Markdown.md", title: "Markdown File", description: "Formatted documentation", icon: Pencil },
};

// --- REUSABLE COMPONENTS ---

// New Engaging Loading Animation Component
const EngagingLoadingAnimation = ({ progress }) => {
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const [currentTip, setCurrentTip] = useState(0);
  
  const loadingTips = [
    "Analyzing meeting content...",
    "Extracting key requirements...",
    "Structuring documentation...",
    "Generating technical specifications...",
    "Almost done! Finalizing documents..."
  ];
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Create floating elements
    const elements = [];
    const types = ['document', 'code', 'design'];
    const colors = ['from-blue-500/20', 'from-purple-500/20', 'from-cyan-500/20'];
    const icons = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
    ];
    
    // Create 8 floating elements
    for (let i = 0; i < 8; i++) {
      const el = document.createElement('div');
      const typeIndex = i % 3;
      
      el.className = `absolute w-12 h-12 rounded-xl bg-gradient-to-br ${colors[typeIndex]} to-transparent backdrop-blur-sm border flex items-center justify-center`;
      el.style.left = `${10 + (i % 3) * 40}%`;
      el.style.top = `${20 + Math.random() * 60}%`;
      
      // Add icon based on type
      const icon = document.createElement('div');
      icon.className = 'text-white opacity-70';
      icon.innerHTML = icons[typeIndex];
      
      el.appendChild(icon);
      container.appendChild(el);
      elements.push(el);
    }
    
    // Animate the elements with more dynamic movement
    const animations = elements.map((el, i) => {
      const x = Math.random() * 300 - 150;
      const y = Math.random() * 200 - 100;
      const duration = 2 + Math.random() * 2;
      const delay = i * 0.2;
      const rotation = Math.random() * 360;
      
      return gsap.to(el, {
        x: x,
        y: y,
        rotation: rotation,
        opacity: 0.8,
        duration: duration,
        delay: delay,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });
    
    // Progress animation
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${progress}%`,
        duration: 0.5,
        ease: "power2.out"
      });
    }
    
    // Rotate through tips
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % loadingTips.length);
    }, 4000);
    
    // Clean up function
    return () => {
      animations.forEach(anim => anim.kill());
      elements.forEach(el => el.remove());
      clearInterval(tipInterval);
    };
  }, [progress]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/95 backdrop-blur-md z-50">
      <div className="text-center max-w-md mx-4">
        <div ref={containerRef} className="relative w-72 h-72 mx-auto mb-6"></div>
        
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
            {progress}%
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-4">Crafting Your Documents</h3>
        
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <p className="text-blue-300 text-sm animate-pulse">✨ {loadingTips[currentTip]}</p>
        </div>
        
        <div className="w-full bg-slate-700/50 rounded-full h-2.5 mb-2 overflow-hidden">
          <div 
            ref={progressRef}
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: '0%' }}
          ></div>
        </div>
        
        <p className="text-slate-400 text-sm">Processing {progress}% complete</p>
      </div>
    </div>
  );
};

const FullScreenStatus = ({ loading, error, loadingText }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 text-center">
    {loading && (
      <>
        <div className="relative w-40 h-40 mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="absolute top-0 left-0 w-8 h-8 bg-blue-500/20 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute top-4 right-2 w-6 h-6 bg-purple-500/20 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute bottom-6 left-6 w-5 h-5 bg-cyan-500/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        </div>
        <span className="text-lg">{loadingText}</span>
      </>
    )}
    {error && <p className="text-lg text-red-500">{error}</p>}
  </div>
);

const Notification = ({ message, type, onDismiss }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  const baseClasses = "fixed bottom-5 right-5 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl z-50 transition-all transform animate-fade-in-up";
  const typeClasses = type === 'success' 
      ? "bg-gradient-to-r from-green-500 to-teal-500 text-white" 
      : "bg-gradient-to-r from-red-500 to-orange-500 text-white";

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <span>{message}</span>
      <button onClick={onDismiss} className="p-1 rounded-full hover:bg-white/20 transition-colors"><X size={16} /></button>
    </div>
  );
};

const ProjectPlanModal = ({ isOpen, onClose, onGenerate }) => {
    const [duration, setDuration] = useState(4);
    const [details, setDetails] = useState("");
    const [temperature, setTemperature] = useState(0.3);
    const [isGenerating, setIsGenerating] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
        }
    }, [isOpen]);

    const handleClose = useCallback(() => {
        gsap.to(modalRef.current, { opacity: 0, scale: 0.95, duration: 0.2, ease: "power2.in", onComplete: onClose });
    }, [onClose]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        await onGenerate({ duration, details, temperature });
        setIsGenerating(false);
    };

    if (!isOpen) return null;

    const getTempColor = (t) => t <= 0.2 ? "text-blue-400" : t <= 0.5 ? "text-green-400" : t <= 0.8 ? "text-yellow-400" : "text-red-400";

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 ">
            <div ref={modalRef} className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">Generate Project Plan</h3>
                    <button onClick={handleClose} disabled={isGenerating} className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition"><X size={20} /></button>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Project Duration (weeks)</label>
                    <input type="number" min="1" max="52" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 1)} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition" disabled={isGenerating} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">AI Temperature <span className={`font-bold ${getTempColor(temperature)}`}>{temperature.toFixed(1)}</span></label>
                    <input type="range" min="0.1" max="1.0" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" disabled={isGenerating} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Additional Details (optional)</label>
                    <textarea rows={3} value={details} onChange={e => setDetails(e.target.value)} placeholder="e.g., specific tech stack, team size..." className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl resize-none transition" disabled={isGenerating} />
                </div>
                <div className="flex gap-4 pt-4">
                    <button onClick={handleClose} disabled={isGenerating} className="flex-1 py-3 px-4 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 transition font-medium">Cancel</button>
                    <button onClick={handleGenerate} disabled={isGenerating || duration <= 0} className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                        {isGenerating ? <><Loader2 className="animate-spin" size={20} /> Generating...</> : "Generate"}
                    </button>
                </div>
            </div>
            <style>{` 
            .slider::-webkit-slider-thumb { 
                background: #fff; 
                box-shadow: 0 0 5px #fff, 0 0 10px #fff; 
            } 
            `}</style>
        </div>
    );
};

const FileEditorCard = React.memo(({ config, content, isEditing, onToggleEdit, onContentChange, onDownload, cardRef }) => {
    return (
        <div ref={cardRef} className="p-6 rounded-2xl bg-slate-800/40 shadow-lg backdrop-blur-md border border-slate-700/50 transition-all duration-300 ease-in-out hover:shadow-blue-500/10 hover:border-slate-600">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900/50 rounded-lg text-blue-400"><config.icon size={22} /></div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{config.title}</h3>
                        <p className="text-sm text-slate-400">{config.description}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onToggleEdit} title={isEditing ? "View" : "Edit"} className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition"><Pencil size={18} /></button>
                    <button onClick={onDownload} title="Download" className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition"><Download size={18} /></button>
                </div>
            </div>
            <div className="relative font-mono text-sm leading-relaxed border border-slate-700 rounded-xl overflow-hidden bg-slate-900/70 min-h-[288px]">
                {isEditing ? (
                    <textarea rows={12} value={content} onChange={onContentChange} className="w-full h-full p-4 bg-transparent text-slate-200 resize-none focus:outline-none" />
                ) : (
                    <div className="p-4 max-h-72 overflow-y-auto whitespace-pre-wrap text-slate-300">{content}</div>
                )}
            </div>
        </div>
    );
});

// --- MAIN PAGE COMPONENT ---

export default function GenerateFiles() {
    const { dbId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const selectedFiles = location.state?.selectedFiles || Object.keys(FILE_CONFIG);

    const [filesContent, setFilesContent] = useState([]);
    const [isEditing, setIsEditing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [projectPlanExists, setProjectPlanExists] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
    const [progress, setProgress] = useState(0);

    const pageRef = useRef(null);
    const cardRefs = useRef([]);

    useEffect(() => {
        const initialize = async () => {
            if (!dbId) return setError("Missing meeting ID.");
            setLoading(true);
            setShowLoadingAnimation(true);
            
            // Simulate progress for demo purposes
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return prev + Math.random() * 15;
                });
            }, 800);
            
            try {
                setIsEditing(new Array(selectedFiles.length).fill(false));
                const filesRes = await fetch(`${API}/api/meetings/${dbId}/generate-files`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selectedFiles }) });
                if (!filesRes.ok) throw new Error(await filesRes.text());
                const filesData = await filesRes.json();
                
                const filteredContent = selectedFiles.map(id => {
                    const config = FILE_CONFIG[id];
                    const file = filesData.find(f => f.name === config.name);
                    return file ? file.content : `Content for ${config.title} will appear here.`;
                });
                setFilesContent(filteredContent);

                const planRes = await fetch(`${API}/api/meetings/${dbId}/project-plan`);
                setProjectPlanExists(planRes.ok);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                setProgress(100);
                setTimeout(() => setShowLoadingAnimation(false), 500);
            }
        };
        initialize();
    }, [dbId, selectedFiles]);
    
    useEffect(() => {
        if (!loading) {
            gsap.fromTo(pageRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
            gsap.fromTo(cardRefs.current.filter(Boolean), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" });
        }
    }, [loading]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
    };

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            const payload = selectedFiles.map((id, i) => ({ name: FILE_CONFIG[id].name, content: filesContent[i] }));
            const res = await fetch(`${API}/api/meetings/${dbId}/files`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error(await res.text());
            showNotification("Files saved successfully!");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [dbId, selectedFiles, filesContent]);

    const handleDownload = useCallback((index) => {
        const config = FILE_CONFIG[selectedFiles[index]];
        const content = filesContent[index];
        const blob = new Blob([content], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = config.name;
        link.click();
        URL.revokeObjectURL(link.href);
    }, [selectedFiles, filesContent]);

    const handleGeneratePlan = useCallback(async (formData) => {
        try {
            const res = await fetch(`${API}/api/meetings/${dbId}/generate-project-plan`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ durationWeeks: formData.duration, additionalDetails: formData.details.trim(), temperature: formData.temperature }) });
            if (!res.ok) throw new Error(await res.text());
            setIsModalOpen(false);
            setProjectPlanExists(true);
            showNotification("Project plan generated successfully!");
            navigate(`/project-plan/${dbId}`);
        } catch (err) {
            setError(err.message);
        }
    }, [dbId, navigate]);

    if (loading || error) return <FullScreenStatus loading={loading} error={error} loadingText="Generating initial documents..." />;

    return (
        <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/60 to-purple-900/70 text-white rounded-3xl">
            {showLoadingAnimation && <EngagingLoadingAnimation progress={Math.min(progress, 100)} />}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-1">
                
                <div className="flex items-center ">
                    <div className="flex mr-5">
                        <IconButton 
                            title="Back" 
                            onClick={() => navigate(-1)}
                            icon={<ArrowLeft className="w-4 h-4" />}
                            variant="secondary"
                        />
                    </div>
                    <div className="pt-10">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Generate & Edit Files</h1>
                        <p className="text-slate-400 mt-2">Editing {selectedFiles.length} selected document{selectedFiles.length > 1 && "s"}</p>
                    </div>
                </div>
                <div className="space-y-8">
                    {selectedFiles.map((fileId, idx) => (
                        <FileEditorCard
                            key={fileId}
                            cardRef={el => (cardRefs.current[idx] = el)}
                            config={FILE_CONFIG[fileId]}
                            content={filesContent[idx]}
                            isEditing={isEditing[idx]}
                            onToggleEdit={() => setIsEditing(prev => prev.map((val, i) => i === idx ? !val : val))}
                            onContentChange={e => setFilesContent(prev => prev.map((val, i) => i === idx ? e.target.value : val))}
                            onDownload={() => handleDownload(idx)}
                        />
                    ))}
                </div>
                <div className="mt-8 flex flex-row justify-center items-center gap-4 border-t border-slate-800 pt-8">
                    <button onClick={handleSave} disabled={saving} className="w-60 mb-4 px-6 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 ease-in-out flex items-center justify-center gap-2 disabled:opacity-50">
                        {saving ? <><Loader2 className="animate-spin" size={20} /> Updating...</> : <><Save size={20} /> Update Documents</>}
                    </button>
                    {projectPlanExists ? (
                        <button onClick={() => navigate(`/project-plan/${dbId}`)} className="w-60 mb-4 px-6 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 ease-in-out flex items-center justify-center gap-2">
                        <Eye size={20} /> View Project Plan
                        </button>
                    ) : (
                        <button onClick={() => setIsModalOpen(true)} className="w-60 mb-4 px-6 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 ease-in-out flex items-center justify-center gap-2">
                        <FileText size={20} /> Generate Project Plan
                        </button>
                    )}
                </div>
            </div>
            <ProjectPlanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onGenerate={handleGeneratePlan} />
            <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />
        </div>
    );
}

function IconButton({ 
  icon, 
  title, 
  onClick, 
  disabled = false,
  variant = "primary"
}) {
  const variantStyles = {
    primary: "bg-slate-700/50 hover:bg-slate-700/70 text-blue-400 hover:text-blue-300",
    secondary: "bg-slate-700/50 hover:bg-slate-700/70 text-slate-400 hover:text-slate-300",
    success: "bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300",
    accent: "bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300"
  };

  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-11 h-11 rounded-xl flex items-center justify-center
        transition-all duration-300 ease-out
        border border-slate-600/40
        hover:scale-110 hover:shadow-lg
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
        ${variantStyles[variant]}
      `}
    >
      {icon}
    </button>
  );
}