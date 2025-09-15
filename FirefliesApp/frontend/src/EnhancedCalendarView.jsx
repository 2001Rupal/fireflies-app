import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, CheckSquare, Square, Eye, Settings } from 'lucide-react';

export default function EnhancedCalendarView({ 
  meetings, onMeetingClick, selectedMeetings, selectMode, onMeetingSelect 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('month'); // 'month', 'week'

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    // Generate 6 weeks worth of days
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getMeetingsForDate = (date) => {
    if (!Array.isArray(meetings)) return [];
    
    return meetings.filter(meeting => {
      if (!meeting?.startTime) return false;
      try {
        const meetingDate = new Date(meeting.startTime);
        return meetingDate.toDateString() === date.toDateString();
      } catch {
        return false;
      }
    });
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      slots.push({
        hour,
        time12: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`,
        time24: `${hour.toString().padStart(2, '0')}:00`
      });
    }
    return slots;
  };

  const getMeetingPosition = (meeting, dayStart) => {
    const meetingStart = new Date(meeting.startTime);
    const minutesFromDayStart = (meetingStart.getHours() - 6) * 60 + meetingStart.getMinutes();
    const top = (minutesFromDayStart / 60) * 60; // 60px per hour
    
    const duration = meeting.endTime 
      ? (new Date(meeting.endTime) - new Date(meeting.startTime)) / (1000 * 60)
      : 60; // default 1 hour
    const height = Math.max((duration / 60) * 60, 30); // minimum 30px height
    
    return { top, height };
  };

  const days = viewType === 'month' ? generateCalendarDays() : generateWeekDays();
  const timeSlots = getTimeSlots();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/60">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">
            {viewType === 'month' 
              ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : `Week of ${currentDate.toLocaleDateString()}`
            }
          </h3>
          
          <div className="flex bg-slate-700/50 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewType === 'month' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewType === 'week' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              Week
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => viewType === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
            className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors"
          >
            Today
          </button>
          
          <button
            onClick={() => viewType === 'month' ? navigateMonth(1) : navigateWeek(1)}
            className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-4">
        {viewType === 'month' ? (
          <MonthView 
            days={days}
            currentDate={currentDate}
            getMeetingsForDate={getMeetingsForDate}
            onMeetingClick={onMeetingClick}
            selectedMeetings={selectedMeetings}
            selectMode={selectMode}
            onMeetingSelect={onMeetingSelect}
          />
        ) : (
          <WeekView
            days={days}
            timeSlots={timeSlots}
            getMeetingsForDate={getMeetingsForDate}
            getMeetingPosition={getMeetingPosition}
            onMeetingClick={onMeetingClick}
            selectedMeetings={selectedMeetings}
            selectMode={selectMode}
            onMeetingSelect={onMeetingSelect}
          />
        )}
      </div>
    </div>
  );
}

const MonthView = ({ 
  days, currentDate, getMeetingsForDate, onMeetingClick, 
  selectedMeetings, selectMode, onMeetingSelect 
}) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm text-slate-400 font-medium py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayMeetings = getMeetingsForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <CalendarDay
              key={index}
              day={day}
              meetings={dayMeetings}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              onMeetingClick={onMeetingClick}
              selectedMeetings={selectedMeetings}
              selectMode={selectMode}
              onMeetingSelect={onMeetingSelect}
            />
          );
        })}
      </div>
    </>
  );
};

const WeekView = ({ 
  days, timeSlots, getMeetingsForDate, getMeetingPosition, 
  onMeetingClick, selectedMeetings, selectMode, onMeetingSelect 
}) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="flex">
      {/* Time column */}
      <div className="w-16 flex-shrink-0 border-r border-slate-700/30">
        <div className="h-12"></div> {/* Header spacer */}
        {timeSlots.map(slot => (
          <div key={slot.hour} className="h-15 flex items-start justify-end pr-2 text-xs text-slate-500">
            {slot.time12}
          </div>
        ))}
      </div>
      
      {/* Days columns */}
      <div className="flex-1 grid grid-cols-7">
        {days.map((day, dayIndex) => {
          const dayMeetings = getMeetingsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <div key={dayIndex} className="border-r border-slate-700/30 last:border-r-0">
              {/* Day header */}
              <div className={`h-12 flex flex-col items-center justify-center border-b border-slate-700/30 ${
                isToday ? 'bg-blue-600/20 text-blue-300' : 'text-slate-400'
              }`}>
                <div className="text-xs">{weekDays[day.getDay()]}</div>
                <div className={`text-lg font-semibold ${
                  isToday ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : ''
                }`}>
                  {day.getDate()}
                </div>
              </div>
              
              {/* Time slots */}
              <div className="relative">
                {timeSlots.map(slot => (
                  <div key={slot.hour} className="h-15 border-b border-slate-700/20"></div>
                ))}
                
                {/* Meetings */}
                {dayMeetings.map((meeting, meetingIndex) => {
                  const position = getMeetingPosition(meeting);
                  const isSelected = selectedMeetings?.has(meeting.googleEventId);
                  
                  return (
                    <div
                      key={meetingIndex}
                      className={`absolute left-1 right-1 rounded text-xs p-1 cursor-pointer z-10 border transition-all ${
                        isSelected 
                          ? 'bg-purple-600/80 border-purple-400/50 text-white'
                          : 'bg-blue-600/80 border-blue-400/50 text-white hover:bg-blue-500/80'
                      }`}
                      style={{ 
                        top: `${position.top + 48}px`, // +48 for header
                        height: `${Math.max(position.height, 20)}px`
                      }}
                      onClick={() => onMeetingClick(meeting)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        {selectMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMeetingSelect(meeting.googleEventId);
                            }}
                            className="flex-shrink-0 mt-0.5"
                          >
                            {isSelected ? (
                              <CheckSquare size={12} />
                            ) : (
                              <Square size={12} />
                            )}
                          </button>
                        )}
                        <div className="flex-1 min-w-0 truncate">
                          <div className="font-medium truncate">{meeting.title}</div>
                          {position.height > 40 && (
                            <div className="text-xs opacity-80 truncate">
                              {new Date(meeting.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CalendarDay = ({ 
  day, meetings, isCurrentMonth, isToday, onMeetingClick, 
  selectedMeetings, selectMode, onMeetingSelect 
}) => {
  return (
    <div className={`min-h-[100px] border border-slate-700/30 rounded-lg p-2 transition-all hover:bg-slate-700/20 ${
      isCurrentMonth ? 'bg-slate-700/20' : 'bg-slate-800/20 opacity-60'
    } ${isToday ? 'ring-2 ring-blue-500 bg-blue-900/20' : ''}`}>
      <div className={`text-sm mb-2 ${
        isCurrentMonth ? 'text-slate-300' : 'text-slate-500'
      } ${isToday ? 'font-bold text-blue-400' : ''}`}>
        {day.getDate()}
      </div>
      
      <div className="space-y-1">
        {meetings.slice(0, 3).map((meeting, idx) => {
          const isSelected = selectedMeetings?.has(meeting.googleEventId);
          
          return (
            <div key={idx} className="relative">
              <div
                className={`text-xs px-2 py-1 rounded cursor-pointer transition-all border ${
                  isSelected 
                    ? 'bg-purple-600/80 border-purple-400/50 text-white'
                    : 'bg-blue-600/80 border-blue-400/50 text-white hover:bg-blue-500/80'
                } truncate`}
                onClick={() => onMeetingClick(meeting)}
                title={meeting.title}
              >
                <div className="flex items-center gap-1">
                  {selectMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMeetingSelect(meeting.googleEventId);
                      }}
                      className="flex-shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare size={10} />
                      ) : (
                        <Square size={10} />
                      )}
                    </button>
                  )}
                  <span className="truncate">{meeting.title}</span>
                  <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                    <Clock size={8} />
                    <span>{new Date(meeting.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {meetings.length > 3 && (
          <div className="text-xs text-slate-400 px-2">
            +{meetings.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};