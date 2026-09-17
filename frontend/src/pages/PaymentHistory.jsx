import { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { playHoverSound } from "../utils/SoundEffects";
import { Download, Search, CreditCard, Filter, AlertCircle, CheckCircle } from "lucide-react";

const PaymentHistory = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, SUCCESS, FAILED, PENDING, REJECTED
  const [methodFilter, setMethodFilter] = useState("ALL"); // ALL, Card, UPI, QR Code, etc.
  const [downloadingId, setDownloadingId] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Manual-UPI history includes legacy fake rows + new PENDING/SUCCESS rows
      const res = await api.get("/payment/manual/history").catch(() => null);
      if (res?.data?.payments) {
        setPayments(res.data.payments);
      } else {
        const legacy = await api.get("/payment/fake/history");
        setPayments(legacy.data.payments);
      }
      setPayments(res.data.payments);
    } catch {
      toast.error("Failed to fetch payment history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const downloadInvoice = async (paymentId, txnId) => {
    playHoverSound();
    setDownloadingId(paymentId);
    try {
      const response = await api.get(`/payment/fake/invoice/${paymentId}`, {
        responseType: "blob",
      });
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const fileLink = document.createElement("a");
      fileLink.href = fileURL;
      fileLink.download = `Invoice_${txnId}.pdf`;
      fileLink.click();
      toast.success("Invoice downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingId("");
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((pay) => {
    const matchesSearch = pay.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || pay.status === statusFilter;
    const matchesMethod = methodFilter === "ALL" || pay.paymentMethod.toLowerCase().includes(methodFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-screen text-slate-100 space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Payment History & Billing
        </h1>
        <p className="text-slate-450 text-xs md:text-sm mt-1">
          Review invoices, subscription history, and verify transactions logs.
        </p>
      </div>

      {/* Current Plan Summary Card */}
      <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-full">
            Active Plan Details
          </span>
          <h2 className="text-xl font-extrabold text-white mt-3">
            {user?.subscriptionTier || "FREE"} Plan
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Status: {user?.subscriptionTier && user.subscriptionTier !== "FREE" ? "Active Subscription" : "Basic Access Only"}
          </p>
        </div>

        {user?.subscriptionEndsAt && (
          <div className="text-left md:text-right bg-slate-950/60 p-4 border border-slate-800 rounded-2xl">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Renewal / Expiry Date</p>
            <p className="text-slate-200 mt-1 text-sm font-semibold">
              {new Date(user.subscriptionEndsAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/20 border border-slate-850/60 p-4 rounded-2xl">
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-550" />
          <input
            type="text"
            placeholder="Search transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-3.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-transparent text-slate-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Methods</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="QR Code">QR Code</option>
              <option value="NetBanking">Net Banking</option>
              <option value="Wallet">Wallet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments History Table */}
      {loading ? (
        <div className="space-y-3.5 animate-pulse">
          <div className="h-10 bg-slate-900/40 rounded-xl" />
          <div className="h-10 bg-slate-900/40 rounded-xl" />
          <div className="h-10 bg-slate-900/40 rounded-xl" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/20 border border-slate-850/60 rounded-3xl space-y-2">
          <CreditCard className="mx-auto text-slate-500" size={35} />
          <p className="text-slate-400 text-xs italic">No transactions found matching the selected filters.</p>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-850 rounded-3xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-semibold">
                  <th className="p-4 border-b border-slate-850">Date</th>
                  <th className="p-4 border-b border-slate-850">Transaction ID</th>
                  <th className="p-4 border-b border-slate-850">Method</th>
                  <th className="p-4 border-b border-slate-850">Amount</th>
                  <th className="p-4 border-b border-slate-850">Status</th>
                  <th className="p-4 border-b border-slate-850 text-right">Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-855 text-slate-300">
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 text-slate-500 font-mono text-[10px]">
                      {new Date(pay.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-200">{pay.transactionId}</td>
                    <td className="p-4 text-slate-350">{pay.paymentMethod}</td>
                    <td className="p-4 font-extrabold text-white">₹{pay.amount}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 w-max ${
                        pay.status === "SUCCESS"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : pay.status === "PENDING"
                          ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {pay.status === "SUCCESS" ? (
                          <>
                            <CheckCircle size={10} />
                            SUCCESS
                          </>
                        ) : pay.status === "PENDING" ? (
                          <>
                            <AlertCircle size={10} />
                            PENDING
                          </>
                        ) : (
                          <>
                            <AlertCircle size={10} />
                            {pay.status}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {pay.status === "SUCCESS" ? (
                        <button
                          onClick={() => downloadInvoice(pay.id, pay.transactionId)}
                          disabled={downloadingId === pay.id}
                          className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 hover:border-transparent px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          {downloadingId === pay.id ? "Loading..." : (
                            <>
                              <Download size={12} />
                              Invoice
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-slate-650 italic text-[10px]">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
