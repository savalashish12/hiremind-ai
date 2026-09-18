import { Link } from "react-router-dom";

const EmptyState = ({ icon = "📭", title = "Nothing here yet", message = "", action = null }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-6xl mb-4">{icon}</span>
    <h3 className="text-xl font-semibold text-slate-200 mb-2">{title}</h3>
    {message && <p className="text-slate-400 mb-6 max-w-sm text-sm">{message}</p>}
    {action && (
      <Link
        to={action.href}
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all"
      >
        {action.label}
      </Link>
    )}
  </div>
);

export default EmptyState;
