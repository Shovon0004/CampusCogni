import { getApiUrl } from '@/lib/config';

let pingInterval: NodeJS.Timeout | null = null;

const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const startBackendPing = () => {
  // Don't ping if already pinging
  if (pingInterval) {
    return;
  }

  console.log('🏓 Starting backend ping service (every 5 minutes)');

  const pingBackend = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/health/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🏓 Backend ping successful:', {
          status: data.status,
          timestamp: data.timestamp,
          uptime: Math.floor(data.uptime / 60) + ' minutes'
        });
      } else {
        console.warn('🏓 Backend ping failed with status:', response.status);
      }
    } catch (error) {
      console.error('🏓 Backend ping error:', error);
    }
  };

  // Ping immediately
  pingBackend();

  // Set up interval for future pings
  pingInterval = setInterval(pingBackend, PING_INTERVAL);
};

export const stopBackendPing = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
    console.log('🏓 Backend ping service stopped');
  }
};

// Auto-start ping when module loads (for client-side)
if (typeof window !== 'undefined') {
  startBackendPing();
  
  // Stop pinging when page is about to unload
  window.addEventListener('beforeunload', stopBackendPing);
}
