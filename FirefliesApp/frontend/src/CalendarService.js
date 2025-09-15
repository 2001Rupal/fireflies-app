


const API = import.meta.env.VITE_API_BASE_URL || "";

class CalendarService {
  constructor() {
    this.accessToken = localStorage.getItem('google_access_token');
  }

  async getAuthUrl() {
    try {
      const response = await fetch(`${API}/api/calendar/auth-url`);
      if (!response.ok) throw new Error('Failed to get auth URL');
      const data = await response.json();
      return data.authUrl;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      throw error;
    }
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await fetch(`${API}/api/calendar/exchange-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) throw new Error('Failed to exchange code');
      
      const data = await response.json();
      this.accessToken = data.accessToken;
      localStorage.setItem('google_access_token', this.accessToken);
      return this.accessToken;
    } catch (error) {
      console.error('Error exchanging code:', error);
      throw error;
    }
  }

  async getUpcomingMeetings() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(`${API}/api/calendar/upcoming-meetings`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          const errorData = await response.json();
          console.error("Authentication error from API:", errorData.message);
          throw new Error('Authentication required');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch meetings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getUpcomingMeetings:', error.message);
      throw error;
    }
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  clearToken() {
    this.accessToken = null;
    localStorage.removeItem('google_access_token');
  }

  async addAttendee(eventId, email, displayName = null) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    if (!eventId) {
      throw new Error('Event ID is required');
    }
    
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email address is required');
    }

    try {
      console.log(`[Frontend] Adding attendee ${email} to event ${eventId}`);
      
      const response = await fetch(`${API}/api/calendar/events/${eventId}/attendees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          displayName: displayName?.trim() || null 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication required');
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'Invalid request data');
        } else if (response.status === 404) {
          throw new Error('Meeting not found. It may have been deleted or you may not have access to it.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to modify this meeting');
        } else {
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log(`[Frontend] Successfully added attendee ${email}`);
      return result;
    } catch (error) {
      console.error('Error adding attendee:', error);
      throw error;
    }
  }

  async removeAttendee(eventId, email) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    if (!eventId || !email) {
      throw new Error('Event ID and email are required');
    }

    try {
      console.log(`[Frontend] Removing attendee ${email} from event ${eventId}`);
      
      const response = await fetch(`${API}/api/calendar/events/${eventId}/attendees/${encodeURIComponent(email.trim())}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication required');
        } else if (response.status === 404) {
          console.log(`[Frontend] Attendee ${email} was not found in the meeting (already removed)`);
          return { message: 'Attendee was not in the meeting' };
        } else if (response.status === 403) {
          throw new Error('You do not have permission to modify this meeting');
        } else {
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log(`[Frontend] Successfully removed attendee ${email}`);
      return result;
    } catch (error) {
      console.error('Error removing attendee:', error);
      throw error;
    }
  }

  async updateAttendeeStatus(eventId, email, status) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const validStatuses = ['needsAction', 'declined', 'tentative', 'accepted'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    if (!eventId || !email) {
      throw new Error('Event ID and email are required');
    }

    try {
      console.log(`[Frontend] Updating attendee ${email} status to ${status} in event ${eventId}`);
      
      const response = await fetch(`${API}/api/calendar/events/${eventId}/attendees/${encodeURIComponent(email.trim())}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication required');
        } else if (response.status === 404) {
          throw new Error('Meeting or attendee not found');
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'Invalid status or request data');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to modify this meeting');
        } else {
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log(`[Frontend] Successfully updated attendee ${email} status to ${status}`);
      return result;
    } catch (error) {
      console.error('Error updating attendee status:', error);
      throw error;
    }
  }

  // ✅ NEW: Cancel Meeting Method
  async cancelMeeting(eventId, sendNotifications = true) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    if (!eventId) {
      throw new Error('Event ID is required');
    }

    try {
      console.log(`[Frontend] Cancelling meeting ${eventId}`);
      
      const response = await fetch(`${API}/api/calendar/events/${eventId}?sendNotifications=${sendNotifications}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication required');
        } else if (response.status === 404) {
          throw new Error('Meeting not found. It may have already been cancelled or deleted.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to cancel this meeting');
        } else {
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log(`[Frontend] Successfully cancelled meeting ${eventId}`);
      return result;
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      throw error;
    }
  }

  // ✅ NEW: Reschedule Meeting Method
  async rescheduleMeeting(eventId, newStartTime, newEndTime = null, sendNotifications = true) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    if (!eventId) {
      throw new Error('Event ID is required');
    }

    if (!newStartTime) {
      throw new Error('New start time is required');
    }

    // Validate that newStartTime is a Date object or valid date string
    const startDate = new Date(newStartTime);
    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid start time provided');
    }

    // Validate that the new start time is in the future
    if (startDate <= new Date()) {
      throw new Error('New start time must be in the future');
    }

    try {
      console.log(`[Frontend] Rescheduling meeting ${eventId} to ${startDate}`);
      
      const requestBody = {
        newStartTime: startDate.toISOString(),
        sendNotifications
      };

      // Include end time if provided
      if (newEndTime) {
        const endDate = new Date(newEndTime);
        if (isNaN(endDate.getTime())) {
          throw new Error('Invalid end time provided');
        }
        if (endDate <= startDate) {
          throw new Error('End time must be after start time');
        }
        requestBody.newEndTime = endDate.toISOString();
      }

      const response = await fetch(`${API}/api/calendar/events/${eventId}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication required');
        } else if (response.status === 404) {
          throw new Error('Meeting not found. It may have been deleted or cancelled.');
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'Invalid reschedule data');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to modify this meeting');
        } else {
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log(`[Frontend] Successfully rescheduled meeting ${eventId}`);
      return result;
    } catch (error) {
      console.error('Error rescheduling meeting:', error);
      throw error;
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async authenticate() {
    try {
      const authUrl = await this.getAuthUrl();
      
      const popup = window.open(
        authUrl,
        'google-calendar-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      return new Promise((resolve, reject) => {
        const pollTimer = setInterval(() => {
          try {
            if (!popup || popup.closed) {
              clearInterval(pollTimer);
              reject(new Error('Authentication was cancelled'));
              return;
            }

            const url = popup.location.href;
            if (url.includes('/auth/callback')) {
              const urlParams = new URLSearchParams(new URL(url).search);
              const code = urlParams.get('code');
              
              if (code) {
                popup.close();
                clearInterval(pollTimer);
                
                this.exchangeCodeForToken(code)
                  .then(() => resolve(this.accessToken))
                  .catch(reject);
              }
            }
          } catch (e) {
            // Ignore cross-origin errors while the popup is on Google's domain
          }
        }, 1000);

        setTimeout(() => {
          clearInterval(pollTimer);
          if (popup && !popup.closed) popup.close();
          reject(new Error('Authentication timeout'));
        }, 300000); // 5-minute timeout
      });
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }
}

export default new CalendarService();