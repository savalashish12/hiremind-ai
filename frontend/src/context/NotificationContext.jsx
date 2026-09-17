import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    if (!user) return;
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
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
