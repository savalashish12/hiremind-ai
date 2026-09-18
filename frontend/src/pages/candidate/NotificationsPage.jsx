import { useContext } from "react";
import { NotificationContext } from "../../context/NotificationContext";

const NotificationsPage = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useContext(NotificationContext);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-white">Notifications {unreadCount > 0 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full ml-2">{unreadCount}</span>}</h1>
        {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-blue-400 hover:underline">Mark all read</button>}
      </div>
      {notifications.length === 0 ? <p className="text-xs text-slate-500">No notifications yet.</p> :
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} onClick={() => markRead(n.id)} className={`p-4 rounded-2xl border text-xs cursor-pointer ${n.isRead ? "bg-slate-900/30 border-slate-800" : "bg-slate-800/50 border-slate-700"}`}>
              <div className="flex justify-between gap-2"><span className="font-bold text-blue-300">{n.title}</span><span className="text-[10px] text-slate-500 shrink-0">{new Date(n.createdAt).toLocaleString()}</span></div>
              <p className="text-slate-400 mt-1 leading-relaxed">{n.message}</p>
            </div>
          ))}
        </div>}
    </div>
  );
};

export default NotificationsPage;
