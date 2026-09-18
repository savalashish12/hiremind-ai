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
  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
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
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 min-h-screen text-slate-100">
      <aside className="lg:sticky lg:top-20 h-fit bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-1">
        <p className="px-3 pt-2 pb-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{title}</p>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={linkCls}>
            {l.icon}{l.label}
          </NavLink>
        ))}
        <div className="pt-2 mt-2 border-t border-slate-800">
          <NavLink to="/jobs" className={linkCls}><Map size={14} />Public Job Board</NavLink>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={14} />Logout
          </button>
        </div>
        {user && <p className="px-3 py-2 text-[10px] text-slate-600 truncate">{user.email} · {location.pathname}</p>}
      </aside>
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
