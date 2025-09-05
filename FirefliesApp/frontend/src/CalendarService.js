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
          // Token expired or invalid
          this.clearToken();
          throw new Error('Authentication required');
        }
        throw new Error('Failed to fetch meetings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching meetings:', error);
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

  async authenticate() {
    try {
      const authUrl = await this.getAuthUrl();
      
      // Open popup for authentication
      const popup = window.open(
        authUrl,
        'google-calendar-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      return new Promise((resolve, reject) => {
        const pollTimer = setInterval(() => {
          try {
            if (popup.closed) {
              clearInterval(pollTimer);
              reject(new Error('Authentication was cancelled'));
            }

            // Check for the callback URL
            const url = popup.location.href;
            if (url.includes('/auth/callback')) {
              const urlParams = new URLSearchParams(new URL(url).search);
              const code = urlParams.get('code');
              
              if (code) {
                popup.close();
                clearInterval(pollTimer);
                
                // Exchange code for token
                this.exchangeCodeForToken(code)
                  .then(() => resolve(this.accessToken))
                  .catch(reject);
              }
            }
          } catch (e) {
            // Ignore cross-origin errors while popup is on Google domain
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(pollTimer);
          if (!popup.closed) popup.close();
          reject(new Error('Authentication timeout'));
        }, 300000);
      });
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }
}

export default new CalendarService();