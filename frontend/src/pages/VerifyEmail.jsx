import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import API from "../services/api";

const VerifyEmail = () => {
  const { token } = useParams();
  const [state, setState] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await API.post(`/auth/verify-email/${token}`);
        setState("success");
        setMessage(res.data.message || "Email verified! You can now login.");
        toast.success("Email verified!");
      } catch (error) {
        setState("error");
        setMessage(error.response?.data?.message || "Verification failed. The link may be invalid.");
      }
    };
    if (token) verify();
    else {
      setState("error");
      setMessage("Missing verification token.");
    }
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-4">
        {state === "verifying" && (
          <>
            <Loader2 className="mx-auto animate-spin text-blue-500" size={48} />
            <h1 className="text-xl font-bold text-white">Verifying your email...</h1>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle className="mx-auto text-green-500" size={48} />
            <h1 className="text-xl font-bold text-white">Verified!</h1>
            <p className="text-sm text-slate-400">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all"
            >
              Go to Login
            </Link>
          </>
        )}
        {state === "error" && (
          <>
            <AlertCircle className="mx-auto text-red-500" size={48} />
            <h1 className="text-xl font-bold text-white">Verification failed</h1>
            <p className="text-sm text-slate-400">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold px-6 py-2.5 rounded-xl text-xs transition-all"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
