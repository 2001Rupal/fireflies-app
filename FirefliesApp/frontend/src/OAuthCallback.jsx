import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import calendarService from './CalendarService';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        window.close();
        return;
      }

      if (code) {
        try {
          await calendarService.exchangeCodeForToken(code);
          // Close the popup window
          window.close();
        } catch (error) {
          console.error('Token exchange failed:', error);
          window.close();
        }
      } else {
        window.close();
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Connecting your calendar...</p>
      </div>
    </div>
  );
}