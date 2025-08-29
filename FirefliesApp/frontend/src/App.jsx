


import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import MeetingList from "./MeetingList";
import MeetingDetail from "./MeetingDetail";
import SavedMeetings from "./SavedMeetings";
import GenerateFiles from "./GenerateFiles";
import ProjectPlan from "./ProjectPlan";
import Backlog from "./Backlog";
import { useEffect, useState, useRef } from "react";
import "./App.css";
import NotFound404 from "./NotFound404";

// Import the updated custom hook
import useNetworkStatus from "./UseNetworkStatus";

// Enhanced Network Status Banner Component
const NetworkStatusBanner = ({ isOnline }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  
  useEffect(() => {
    if (!isOnline) {
      setIsVisible(true);
      setWasOffline(true);
    } else {
      // If we were previously offline and now online, show reconnected message briefly
      if (wasOffline) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 3000); // Hide after 3 seconds
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, wasOffline]);
  
  if (!isVisible) return null;
  
  return (
    <div className={`network-banner ${isOnline ? 'online' : 'offline'}`}>
      <div className="network-banner-content">
        <div className="network-banner-icon">
          {isOnline ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM15.16 7.76L16.58 9.18C16.86 8.5 17 7.77 17 7C17 4.24 14.76 2 12 2C10.22 2 8.63 2.77 7.53 4.05L8.95 5.47C9.73 4.8 10.81 4.36 12 4.36C14.2 4.36 16 6.16 16 8.36C16 8.73 15.93 9.08 15.84 9.41L15.16 7.76ZM12 19C9.24 19 7 16.76 7 14C7 13.59 7.05 13.19 7.14 12.8L5.61 11.27C5.23 12.28 5 13.39 5 14.55C5 18.35 8.2 21.5 12 21.5C13.95 21.5 15.73 20.77 17.09 19.54L15.67 18.12C14.68 18.75 13.39 19.18 12 19.18V19ZM2.81 2.81L1.39 4.22L5.17 8H5C5 11.87 8.13 15 12 15C12.84 15 13.64 14.84 14.38 14.57L15.8 16C14.77 16.43 13.62 16.73 12.41 16.88L12.41 19H15.73C16.54 19 17.21 19.67 17.21 20.48V20.48C17.21 21.29 16.54 21.96 15.73 21.96H8.27C7.46 21.96 6.79 21.29 6.79 20.48V20.48C6.79 19.67 7.46 19 8.27 19H10.59V16.88C6.7 16.42 3.56 13.9 2.12 10.45L1.34 10.45C0.88 10.45 0.48 10.06 0.48 9.6V9.6C0.48 9.14 0.88 8.75 1.34 8.75H3.05C3.03 8.5 3 8.25 3 8H3.01L7.01 12L8.42 13.41L2.81 7.8V7.8L1.39 6.38L2.81 4.96L4.22 6.37L19.78 21.93L21.19 20.52L2.81 2.81ZM17.71 14.15L19.15 15.59C19.68 14.86 20.06 14 20.26 13.06L21.94 14.74C21.52 16.1 20.75 17.3 19.74 18.24L18.32 16.82C19.03 16.1 19.54 15.2 19.79 14.19L17.71 14.15Z" fill="currentColor"/>
            </svg>
          )}
        </div>
        <div className="network-banner-text">
          {isOnline ? (
            <>
              <strong>Connection Restored!</strong> You're back online.
            </>
          ) : (
            <>
              <strong>No Internet Connection</strong> Some features may be unavailable.
            </>
          )}
        </div>
        {isOnline && (
          <button 
            className="network-banner-close"
            onClick={() => setIsVisible(false)}
            aria-label="Close notification"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
          </button>
        )}
      </div>
      {!isOnline && (
        <div className="network-banner-progress">
          <div className="network-banner-progress-bar"></div>
        </div>
      )}
    </div>
  );
};

// Enhanced Logo Component
const EnhancedLogo = () => {
  const [displayText, setDisplayText] = useState("");
  const [showTagline, setShowTagline] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const intervalRef = useRef(null);

  const fullText = "Projectra";
  const tagline = "Turning Discussions into Actionable Plans";
  
  // Generate particles data
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 5 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: Math.random() * 2 + 2,
    color: `hsl(${Math.random() * 60 + 200}, 70%, 65%)`,
  }));

  useEffect(() => {
    let currentIndex = 0;
    intervalRef.current = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(intervalRef.current);
        setTimeout(() => {
          setShowTagline(true);
          setAnimationComplete(true);
        }, 300);
      }
    }, 120);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="brand h-13" tabIndex={-1}>
      <div className="logo-container">
        <div className="logo-icon">
          <svg 
            viewBox="0 0 100 100" 
            className={`logo-svg ${animationComplete ? 'pulse' : ''}`}
          >
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#3f51b5" 
              strokeWidth="4"
              className="logo-circle"
            />
            <path 
              d="M30,40 L70,40 L70,60 L30,60 Z M40,30 L40,70 M60,30 L60,70" 
              stroke="#2196f3" 
              strokeWidth="3" 
              fill="none"
              className="logo-inner"
            />
          </svg>
        </div>
        
        <div className="text-container">
          <h1 className="enhanced-logo">
            {displayText}
            <span className="cursor">|</span>
            {particles.map(particle => (
              <span 
                key={particle.id}
                className="logo-particle"
                style={{
                  top: `${particle.y}%`,
                  left: `${particle.x}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${particle.duration}s`,
                }}
              />
            ))}
          </h1>
          
          {showTagline && (
            <div className="tagline-container">
              <small className="enhanced-tagline">{tagline}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const isOnline = useNetworkStatus();

  return (
    <BrowserRouter>
      {/* Enhanced Network Status Banner */}
      <NetworkStatusBanner isOnline={isOnline} />

      <div className="app-root">
        <header className="app-header" role="banner">
          <EnhancedLogo />
          
          <nav className="nav" role="navigation" aria-label="Primary navigation">
            <NavLink 
              to="/" 
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} 
              end
            >
              Home
            </NavLink>
            <NavLink 
              to="/meetings" 
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Meetings
            </NavLink>
            <NavLink 
              to="/saved" 
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Saved
            </NavLink>
          </nav>
        </header>

        <main className="app-main" role="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/meetings" element={<MeetingList />} />
            <Route path="/meetings/:id" element={<MeetingDetail />} />
            <Route path="/saved" element={<SavedMeetings />} />
            <Route path="/generate-files/:dbId" element={<GenerateFiles />} />
            <Route path="/project-plan/:dbId" element={<ProjectPlan />} />
            <Route path="/meeting/:dbId/backlog" element={<Backlog />} />
              <Route path="*" element={<NotFound404 />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}