import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const fallbackTimer = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    fetchNotifications();

    // Real-time stream (SSE). Falls back to 60s polling if SSE fails.
    let eventSource = null;
    let pollStarted = false;
    const startPolling = () => {
      if (pollStarted) return;
      pollStarted = true;
      fallbackTimer.current = setInterval(fetchNotifications, 60000);
    };

    try {
      const token = localStorage.getItem('token');
      const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
      eventSource = new EventSource(`${base}/notifications/stream?token=${encodeURIComponent(token || '')}`);

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'notification') {
            const record = data.notification || { title: data.title, message: data.message, createdAt: new Date().toISOString(), isRead: false };
            setNotifications((prev) => [record, ...prev]);
            toast(data.title, { description: data.message });
          }
        } catch {}
      };

      eventSource.onerror = () => {
        try { eventSource.close(); } catch {}
        eventSource = null;
        startPolling();
      };
    } catch {
      startPolling();
    }

    const manualRefresh = setInterval(fetchNotifications, 5 * 60 * 1000); // safety re-sync

    return () => {
      try { eventSource?.close(); } catch {}
      clearInterval(manualRefresh);
      if (fallbackTimer.current) clearInterval(fallbackTimer.current);
    };
  }, [user, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch {}
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
