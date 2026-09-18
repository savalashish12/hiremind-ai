import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard, Briefcase, FileText, Target, BookmarkCheck, User,
  Brain, BarChart2, Users, Building2, CalendarDays,
  GitCompareArrows, FolderOpen, MessagesSquare, Bell, CreditCard,
  Compass, UploadCloud, ScrollText, Activity, LogOut, Map
} from "lucide-react";

const linkCls = ({ isActive }) =>
  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 lg:shrink ${
    isActive ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800"
  }`;

const CANDIDATE_LINKS = [
  { to: "/candidate/dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
  { to: "/candidate/jobs", label: "Browse Jobs", icon: <Briefcase size={14} /> },
  { to: "/candidate/applications", label: "My Applications", icon: <FileText size={14} /> },
  { to: "/candidate/resume-upload", label: "Resume Upload", icon: <UploadCloud size={14} /> },
  { to: "/candidate/resume-builder", label: "Resume Builder", icon: <FileText size={14} /> },
  { to: "/candidate/ats-score", label: "ATS Score", icon: <Target size={14} /> },
  { to: "/candidate/career-roadmap", label: "Career Roadmap", icon: <Compass size={14} /> },
  { to: "/candidate/mock-interview", label: "Mock Interview", icon: <Brain size={14} /> },
  { to: "/candidate/portfolio", label: "Portfolio", icon: <User size={14} /> },
  { to: "/candidate/saved-jobs", label: "Saved Jobs", icon: <BookmarkCheck size={14} /> },
  { to: "/candidate/profile", label: "Profile", icon: <User size={14} /> },
  { to: "/candidate/payment-history", label: "Billing", icon: <CreditCard size={14} /> },
  { to: "/candidate/notifications", label: "Notifications", icon: <Bell size={14} /> },
];

const RECRUITER_LINKS = [
  { to: "/recruiter/dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
  { to: "/recruiter/jobs", label: "My Jobs", icon: <Briefcase size={14} /> },
  { to: "/recruiter/post-job", label: "Post Job", icon: <FileText size={14} /> },
  { to: "/recruiter/interviews", label: "Interviews", icon: <CalendarDays size={14} /> },
  { to: "/recruiter/compare", label: "Compare", icon: <GitCompareArrows size={14} /> },
  { to: "/recruiter/analytics", label: "Analytics", icon: <BarChart2 size={14} /> },
  { to: "/recruiter/documents", label: "Documents", icon: <FolderOpen size={14} /> },
  { to: "/recruiter/chatbot", label: "AI Chatbot", icon: <MessagesSquare size={14} /> },
  { to: "/recruiter/company-profile", label: "Company Profile", icon: <Building2 size={14} /> },
  { to: "/recruiter/notifications", label: "Notifications", icon: <Bell size={14} /> },
];

const ADMIN_LINKS = [
  { to: "/admin/dashboard", label: "Overview", icon: <LayoutDashboard size={14} /> },
  { to: "/admin/users", label: "Users", icon: <Users size={14} /> },
  { to: "/admin/jobs", label: "Jobs", icon: <Briefcase size={14} /> },
  { to: "/admin/activity-log", label: "Activity Log", icon: <ScrollText size={14} /> },
  { to: "/admin/analytics", label: "Analytics", icon: <Activity size={14} /> },
];

export default function DashboardLayout({ role }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const links = role === "CANDIDATE" ? CANDIDATE_LINKS : role === "RECRUITER" ? RECRUITER_LINKS : ADMIN_LINKS;
  const title = role === "CANDIDATE" ? "Candidate Workspace" : role === "RECRUITER" ? "Recruiter Workspace" : "Admin Console";

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 xl:px-8 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)] gap-4 md:gap-6 min-h-screen text-slate-100">
      {/* Sidebar: horizontal scroll nav on mobile, sticky rail on desktop */}
      <aside className="lg:sticky lg:top-20 h-fit bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 md:p-3 lg:space-y-1 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
        <p className="hidden lg:block px-3 pt-2 pb-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{title}</p>
        <nav className="flex lg:flex-col flex-row overflow-x-auto lg:overflow-visible gap-1 pb-1 lg:pb-0">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkCls}>
              {l.icon}<span className="hidden sm:inline lg:inline">{l.label}</span>
            </NavLink>
          ))}
          <NavLink to="/jobs" className={`${linkCls({ isActive: false })} lg:hidden`}>
            <Map size={14} /><span className="hidden sm:inline">Public Jobs</span>
          </NavLink>
        </nav>
        <div className="hidden lg:block pt-2 mt-2 border-t border-slate-800 space-y-1">
          <NavLink to="/jobs" className={linkCls}><Map size={14} />Public Job Board</NavLink>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all whitespace-nowrap"
          >
            <LogOut size={14} />Logout
          </button>
        </div>
        {user && <p className="hidden lg:block px-3 py-2 text-[10px] text-slate-600 truncate">{user.email} · {location.pathname}</p>}
      </aside>
      {/* Fluid content column — fills all remaining width */}
      <main className="min-w-0 w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
