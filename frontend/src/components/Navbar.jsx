import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.log("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Poll every 60s
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      fetchNotifications();
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark read");
    }
  };

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch {
      console.log("Failed to mark read");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <nav className="flex justify-between items-center p-6 bg-slate-950 text-white relative z-50 shadow-md">
      <Link to="/" className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
        HireMind AI
      </Link>

      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          title="Toggle Light/Dark Mode"
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>

        {!user ? (
          <>
            <Link to="/login" className="hover:text-blue-400 transition-colors">
              Login
            </Link>
            <Link to="/register" className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Register
            </Link>
          </>
        ) : (
          <>
            {user.role === "ADMIN" && (
              <Link to="/admin-dashboard" className="hover:text-blue-400 transition-colors font-medium">
                Admin Panel
              </Link>
            )}

            {user.role === "RECRUITER" && (
              <>
                <Link to="/recruiter-dashboard" className="hover:text-blue-400 transition-colors font-medium">
                  Dashboard
                </Link>
                <Link to="/recruiter/company-profile" className="hover:text-blue-400 transition-colors font-medium">
                  Company Profile
                </Link>
              </>
            )}

            {user.role === "CANDIDATE" && (
              <>
                <Link to="/candidate-dashboard" className="hover:text-blue-400 transition-colors font-medium">
                  Dashboard
                </Link>
                <Link to="/candidate/ats" className="hover:text-blue-400 transition-colors font-medium">
                  ATS Optimizer
                </Link>
                <Link to="/candidate/mock-interview" className="hover:text-blue-400 transition-colors font-medium">
                  Mock Interview
                </Link>
                <Link to="/candidate/portfolio" className="hover:text-blue-400 transition-colors font-medium">
                  Portfolio
                </Link>
                <Link to="/candidate/saved-jobs" className="hover:text-blue-400 transition-colors font-medium">
                  Saved Jobs
                </Link>
              </>
            )}

            <Link to="/jobs" className="hover:text-blue-400 transition-colors font-medium">
              Browse Jobs
            </Link>

            <Link to="/pricing" className="hover:text-blue-400 transition-colors font-medium">
              Pricing
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden text-slate-100 z-50">
                  <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-950">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">Notifications</h4>
                      <button
                        onClick={fetchNotifications}
                        className="text-xs hover:scale-110 active:scale-95 transition-all"
                        title="Refresh Notifications"
                      >
                        🔄
                      </button>
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-400 hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-sm text-slate-400">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={`p-4 text-xs transition-colors cursor-pointer ${
                            n.isRead ? "bg-slate-950/20 hover:bg-slate-800/40" : "bg-slate-800/80 hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-blue-300">{n.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-300">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;