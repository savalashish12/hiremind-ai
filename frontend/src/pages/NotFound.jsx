import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Home, LayoutDashboard } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const NotFound = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const dashboardPath = !user
    ? "/login"
    : user.role === "RECRUITER"
      ? "/recruiter/dashboard"
      : user.role === "ADMIN"
        ? "/admin/dashboard"
        : "/candidate/dashboard";

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-8 text-slate-100">
      <p className="text-8xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">404</p>
      <h1 className="text-2xl font-bold text-white mt-4">Page not found</h1>
      <p className="text-slate-400 text-sm mt-2 max-w-sm">
        The page you are looking for doesn't exist or was moved. Let's get you back on track.
      </p>
      <div className="flex flex-wrap gap-3 mt-8 justify-center">
        <Link
          to="/"
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold px-5 py-2.5 rounded-xl text-xs transition-all"
        >
          <Home size={14} /> Go Home
        </Link>
        <button
          onClick={() => navigate(dashboardPath)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all"
        >
          <LayoutDashboard size={14} /> Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
