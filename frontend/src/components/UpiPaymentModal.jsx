import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Smartphone,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  ShieldCheck,
  Clock,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { playSuccessSound, playErrorSound, playHoverSound } from "../utils/SoundEffects";
import toast from "react-hot-toast";

// Manual UPI checkout: shows owner's QR + UPI IDs, collects UTR for admin verification.
// No Razorpay / gateway involved.
const ManualUpiPaymentModal = ({ isOpen, onClose, planName, billingCycle, amount, orderId, onPaymentComplete }) => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("qr"); // qr | upi
  const [payee, setPayee] = useState(null);
  const [payerUpi, setPayerUpi] = useState("");
  const [utr, setUtr] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [state, setState] = useState("idle"); // idle | submitting | pending | error
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedUtr, setSubmittedUtr] = useState("");
  const [qrTimer, setQrTimer] = useState(600); // 10 mins realism

  useEffect(() => {
    if (isOpen) {
      setState("idle");
      setErrorMsg("");
      setAgreed(false);
      setQrTimer(600);
      api
        .get("/payment/manual/payee", { params: { amount, orderId } })
        .then((res) => setPayee(res.data))
        .catch(() => setPayee(null));
    }
  }, [isOpen, amount, orderId]);

  useEffect(() => {
    if (!isOpen) return;
    if (qrTimer <= 0) return;
    const t = setInterval(() => setQrTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [isOpen, qrTimer]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  // Payee details come ONLY from the server env (GET /payment/manual/payee).
  // No hardcoded IDs/names here — if the server has none configured, we show
  // a notice instead of someone else's payment details.
  const upiIds = payee?.upiIds?.length ? payee.upiIds : [];
  const payeeName = payee?.payeeName || "";
  const isConfigured = upiIds.length > 0;
  const qrSrc = payee?.qrImageUrl || "/upi-qr.jpg";
  const autoUpiString = payee?.upiString || (isConfigured ? `upi://pay?pa=${upiIds[0]}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${orderId}` : "");

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied!`);
    } catch {
      toast.error("Copy failed — long-press to copy manually");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUtr = utr.replace(/\s+/g, "").toUpperCase();
    if (!payerUpi.includes("@")) {
      toast.error("Enter your UPI ID (e.g. yourname@okhdfc)");
      return;
    }
    if (!/^[A-Za-z0-9]{6,22}$/.test(cleanUtr)) {
      toast.error("Enter the 12-digit UTR / Ref No. from your UPI app history");
      return;
    }
    if (!agreed) {
      toast.error("Please confirm you have completed the payment");
      return;
    }
    setState("submitting");
    setErrorMsg("");
    try {
      const res = await api.post("/payment/manual/submit", {
        orderId,
        planName,
        billingCycle,
        amount,
        payerUpi: payerUpi.trim(),
        utr: cleanUtr,
      });
      playSuccessSound();
      setSubmittedUtr(res.data.transactionId || cleanUtr);
      setState("pending");
      toast.success("Payment submitted for verification!");
      if (onPaymentComplete) onPaymentComplete(res.data);
    } catch (err) {
      playErrorSound();
      setErrorMsg(err.response?.data?.message || "Submission failed. Try again.");
      setState("error");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row min-h-[540px] max-h-[92vh]"
        >
          {/* Order summary */}
          <div className="bg-slate-950 p-6 flex flex-col justify-between md:w-5/12 border-b md:border-b-0 md:border-r border-slate-800">
            <div>
              <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider bg-green-500/10 px-2.5 py-1 rounded-full">
                Manual UPI Checkout
              </span>
              <h2 className="text-xl font-extrabold text-white mt-4">{planName} Plan</h2>
              <p className="text-xs text-slate-400 mt-1 capitalize">{billingCycle} Billing</p>
              <div className="mt-8 space-y-3.5 text-xs text-slate-300">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Order ID</p>
                  <p className="font-mono text-slate-200 mt-0.5 break-all">{orderId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Payee (Merchant)</p>
                  <p className="text-slate-200 mt-0.5 font-semibold">{payeeName ? `${payeeName} · HireMind AI` : "HireMind AI"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Billed To</p>
                  <p className="text-slate-200 mt-0.5">{user?.fullName || "Guest"}</p>
                  <p className="text-slate-400 text-[11px]">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-800 mt-6">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Pay exactly:</span>
                <span className="text-2xl font-black text-white">₹{amount}</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1">Inclusive of 18% GST · UPI only</p>
            </div>
          </div>

          {/* Checkout interaction */}
          <div className="flex-1 flex flex-col bg-slate-900/40 relative overflow-y-auto">
            {state === "submitting" && (
              <div className="absolute inset-0 z-10 bg-slate-900 flex flex-col items-center justify-center p-6 space-y-4">
                <Loader2 className="animate-spin text-green-500" size={46} />
                <p className="text-sm text-white font-extrabold">Submitting UTR for verification…</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Do not close this window</p>
              </div>
            )}

            {state === "pending" && (
              <div className="absolute inset-0 z-10 bg-slate-900 flex flex-col items-center justify-between p-6 text-center overflow-y-auto">
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-white p-1 rounded-full bg-slate-950/20 hover:bg-slate-800 transition-all">
                  <X size={15} />
                </button>
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-6">
                  <Clock className="text-yellow-400 animate-pulse" size={52} />
                  <h3 className="text-xl font-black text-white">Payment Pending Verification</h3>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    UTR <span className="font-mono text-slate-200 font-bold">{submittedUtr}</span> for ₹{amount} was submitted.
                    Admin will verify it against the merchant account and activate your <span className="text-white font-bold">{planName}</span> plan.
                    Track status in <span className="text-blue-400 font-semibold">Payment History</span>.
                  </p>
                  <div className="bg-slate-950 p-4 rounded-2xl w-full max-w-sm text-[11px] text-slate-300 space-y-2 text-left border border-slate-800">
                    <div className="flex justify-between"><span className="text-slate-500">Order ID:</span><span className="font-mono">{orderId}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Amount:</span><span className="font-bold text-white">₹{amount}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Status:</span><span className="text-yellow-400 font-bold">PENDING</span></div>
                  </div>
                </div>
                <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-all">
                  Done — I'll wait for approval
                </button>
              </div>
            )}

            {state === "error" && (
              <div className="absolute inset-0 z-10 bg-slate-900 flex flex-col items-center justify-between p-6 text-center">
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-white p-1 rounded-full bg-slate-950/20 hover:bg-slate-800 transition-all">
                  <X size={15} />
                </button>
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <AlertCircle className="text-red-500" size={52} />
                  <h3 className="text-xl font-black text-white">Submission Failed</h3>
                  <p className="text-xs text-slate-400 max-w-sm">{errorMsg}</p>
                </div>
                <div className="w-full space-y-2">
                  <button onClick={() => { playHoverSound(); setState("idle"); }} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5">
                    <RefreshCw size={13} /> Try Again
                  </button>
                  <button onClick={onClose} className="w-full bg-slate-800 border border-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {(state === "idle") && (
              <>
                <div className="flex border-b border-slate-800 text-[11px] text-slate-400 font-semibold bg-slate-950/40">
                  <button onClick={() => { playHoverSound(); setActiveTab("qr"); }} className={`flex-1 py-3.5 flex flex-col items-center gap-1.5 border-b-2 transition-all ${activeTab === "qr" ? "border-green-500 text-green-400 bg-slate-900/60" : "border-transparent hover:text-white"}`}>
                    <QrCode size={15} /> Scan QR
                  </button>
                  <button onClick={() => { playHoverSound(); setActiveTab("upi"); }} className={`flex-1 py-3.5 flex flex-col items-center gap-1.5 border-b-2 transition-all ${activeTab === "upi" ? "border-green-500 text-green-400 bg-slate-900/60" : "border-transparent hover:text-white"}`}>
                    <Smartphone size={15} /> Pay via UPI ID
                  </button>
                </div>
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-white p-1 rounded-full bg-slate-950/20 hover:bg-slate-800 transition-all z-10">
                  <X size={15} />
                </button>

                <form onSubmit={handleSubmit} className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                  {!isConfigured && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-semibold px-4 py-3 rounded-xl text-center">
                      Payment details are not configured yet. Please contact support to complete your purchase.
                    </div>
                  )}
                  {activeTab === "qr" && (
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="bg-white p-3 rounded-2xl shadow-md">
                        <img
                          src={qrSrc}
                          alt={`Pay ₹${amount} to ${payeeName}`}
                          className="w-44 h-44 object-contain"
                          onError={(e) => { e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(autoUpiString)}`; }}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-200 font-semibold">Scan with GPay / PhonePe / Paytm / BHIM</p>
                        <p className="text-[10px] text-slate-400">Payee: {payeeName} · Amount: ₹{amount}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                        <Clock size={13} className="animate-pulse" />
                        <span>QR valid: {formatTime(qrTimer)}</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "upi" && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Pay to any one UPI ID (₹{amount})</p>
                      {upiIds.map((id) => (
                        <div key={id} className="flex items-center justify-between gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5">
                          <div>
                            <p className="font-mono text-xs text-white font-bold">{id}</p>
                            <p className="text-[10px] text-slate-500">{payeeName}</p>
                          </div>
                          <button type="button" onClick={() => copyText(id, "UPI ID")} className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg text-slate-200 font-bold">
                            <Copy size={12} /> Copy
                          </button>
                        </div>
                      ))}
                      <div className="bg-slate-950/60 border border-slate-800/40 p-4 rounded-2xl text-[11px] text-slate-400 space-y-1.5">
                        <p className="font-semibold text-slate-200">How to pay:</p>
                        <p>1. Copy a UPI ID above → open your UPI app → Send ₹{amount}.</p>
                        <p>2. Note the 12-digit UTR / Ref No. from payment history.</p>
                        <p>3. Paste it below with your UPI ID → Submit.</p>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-800 pt-4 space-y-3.5">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Your UPI ID (you paid from)</label>
                      <input type="text" placeholder="yourname@okhdfc" value={payerUpi} onChange={(e) => setPayerUpi(e.target.value)} required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 mt-1.5 text-xs text-white focus:outline-none focus:border-green-500 font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase">UTR / UPI Ref No. (12 digits)</label>
                      <input type="text" placeholder="e.g. 423891774512" value={utr} onChange={(e) => setUtr(e.target.value.replace(/\s+/g, ""))} required minLength={6} maxLength={22}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 mt-1.5 text-xs text-white focus:outline-none focus:border-green-500 font-mono tracking-widest" />
                      <p className="text-[10px] text-slate-500 mt-1.5">Find it in GPay/PhonePe → History → This payment → UTR / Ref No.</p>
                    </div>
                    <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-green-600" />
                      <span>I have paid <b>₹{amount}</b> to <b>{payeeName}</b> and this UTR belongs to my payment for order <span className="font-mono">{orderId}</span>.</span>
                    </label>
                  </div>

                  <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-extrabold py-3.5 rounded-xl text-xs tracking-wide shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5">
                    <ShieldCheck size={14} /> I Have Paid — Submit UTR (₹{amount})
                  </button>
                  <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                    <CheckCircle size={11} /> Admin verifies every UTR before activation — invalid entries are rejected.
                  </p>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ManualUpiPaymentModal;
