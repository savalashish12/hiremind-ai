import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Layers,
  Info,
  Mail,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Sparkles
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

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

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on navigate
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const markAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      fetchNotifications();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications");
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
    setShowUserDropdown(false);
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  // Check state redirect scroll on homepage load
  useEffect(() => {
    if (location.pathname === "/" && location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
      // Clear state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <nav className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/80 z-50 w-full">
      <div className="max-w-7xl mx-auto px-6 h-18 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
            HM
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            HireMind <span className="text-white text-base font-medium">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7">
          <Link to="/" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/jobs" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Jobs
          </Link>
          <button
            onClick={() => scrollToSection("features")}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("testimonials")}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Feedback
          </button>
          <Link to="/pricing" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Pricing
          </Link>
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-5">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Toggle theme mode"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {!user ? (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4.5">
              
              {/* Notification Bell */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold ring-2 ring-slate-950 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-850 rounded-2xl shadow-2xl overflow-hidden text-slate-100 z-50"
                    >
                      <div className="flex justify-between items-center p-4 border-b border-slate-850 bg-slate-950/60">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">Notifications</h4>
                          <button
                            onClick={fetchNotifications}
                            className="text-xs hover:scale-105 active:scale-95 transition-all text-slate-400 hover:text-white"
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
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-850">
                        {notifications.length === 0 ? (
                          <p className="p-5 text-center text-xs text-slate-500">No notifications yet</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markRead(n.id)}
                              className={`p-4 text-xs transition-colors cursor-pointer ${
                                n.isRead ? "bg-slate-950/20 hover:bg-slate-800/20" : "bg-slate-800/40 hover:bg-slate-800/60"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1 gap-2">
                                <span className="font-semibold text-blue-300">{n.title}</span>
                                <span className="text-[9px] text-slate-500 whitespace-nowrap">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-slate-400 leading-relaxed mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  {user.candidateProfile?.profileImage ? (
                    <img
                      src={user.candidateProfile.profileImage}
                      alt="Avatar"
                      className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-200 hidden lg:inline max-w-[100px] truncate">
                    {user.fullName.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-56 bg-slate-900/95 backdrop-blur-md border border-slate-850 rounded-2xl shadow-2xl overflow-hidden z-50 text-xs text-slate-300"
                    >
                      {/* User Info Header */}
                      <div className="p-4 border-b border-slate-850 bg-slate-950/40">
                        <p className="font-bold text-white truncate">{user.fullName}</p>
                        <p className="text-[10px] text-slate-550 truncate mt-0.5">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[9px] font-extrabold tracking-wide uppercase border border-blue-500/20">
                          {user.role}
                        </span>
                      </div>

                      {/* Dropdown Links */}
                      <div className="p-1.5 space-y-0.5">
                        
                        {user.role === "RECRUITER" && (
                          <>
                            <Link
                              to="/recruiter-dashboard"
                              onClick={() => setShowUserDropdown(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
                            >
                              <LayoutDashboard size={14} />
                              Recruiter Dashboard
                            </Link>
                            <Link
                              to="/recruiter/company-profile"
                              onClick={() => setShowUserDropdown(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
                            >
                              <Briefcase size={14} />
                              Company Profile
                            </Link>
                          </>
                        )}

                        {user.role === "CANDIDATE" && (
                          <>
                            <Link
                              to="/candidate-dashboard"
                              onClick={() => setShowUserDropdown(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
                            >
                              <LayoutDashboard size={14} />
                              Candidate Dashboard
                            </Link>
                            <Link
                              to="/candidate/portfolio"
                              onClick={() => setShowUserDropdown(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
                            >
                              <User size={14} />
                              My Career Portfolio
                            </Link>
                            <Link
                              to="/candidate/ats"
                              onClick={() => setShowUserDropdown(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
                            >
                              <Sparkles size={14} />
                              AI ATS Scanner
                            </Link>
                          </>
                        )}

                        {user.role === "ADMIN" && (
                          <Link
                            to="/admin-dashboard"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
                          >
                            <LayoutDashboard size={14} />
                            Admin Console
                          </Link>
                        )}
                        
                      </div>

                      <div className="p-1.5 border-t border-slate-850 bg-slate-950/20">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-semibold"
                        >
                          <LogOut size={14} />
                          Log Out Workspace
                        </button>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-900 bg-slate-950 overflow-hidden"
          >
            <div className="p-6 space-y-4 flex flex-col text-slate-300 font-medium">
              <Link to="/" className="hover:text-white py-1">Home</Link>
              <Link to="/jobs" className="hover:text-white py-1">Jobs</Link>
              <button onClick={() => scrollToSection("features")} className="text-left hover:text-white py-1 cursor-pointer">Features</button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-left hover:text-white py-1 cursor-pointer">About</button>
              <button onClick={() => scrollToSection("testimonials")} className="text-left hover:text-white py-1 cursor-pointer">Feedback</button>
              <Link to="/pricing" className="hover:text-white py-1">Pricing</Link>
              
              <div className="border-t border-slate-900 pt-4 flex flex-col gap-3">
                {!user ? (
                  <>
                    <Link to="/login" className="text-center py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900">
                      Login
                    </Link>
                    <Link to="/register" className="text-center py-2.5 rounded-xl bg-blue-600 text-white font-bold">
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    {user.role === "CANDIDATE" && (
                      <>
                        <Link to="/candidate-dashboard" className="text-center py-2 rounded-xl bg-slate-900">Dashboard</Link>
                        <Link to="/candidate/portfolio" className="text-center py-2 rounded-xl bg-slate-900">Portfolio</Link>
                      </>
                    )}
                    {user.role === "RECRUITER" && (
                      <>
                        <Link to="/recruiter-dashboard" className="text-center py-2 rounded-xl bg-slate-900">Dashboard</Link>
                        <Link to="/recruiter/company-profile" className="text-center py-2 rounded-xl bg-slate-900">Company Profile</Link>
                      </>
                    )}
                    {user.role === "ADMIN" && (
                      <Link to="/admin-dashboard" className="text-center py-2 rounded-xl bg-slate-900">Admin Console</Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded-xl bg-red-650/15 border border-red-500/20 text-red-400 font-bold"
                    >
                      Log Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  );
};

export default Navbar;