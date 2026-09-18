import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { playHoverSound } from "../utils/SoundEffects";
import UpiPaymentModal from "../components/UpiPaymentModal";

const SubscriptionPricing = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly or yearly
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    planName: "",
    amount: 0,
    orderId: ""
  });
  const [loadingPlan, setLoadingPlan] = useState("");

  const currentTier = user?.subscriptionTier?.toUpperCase() || "FREE";

  const handleUpgradeClick = async (planName) => {
    if (!token) {
      toast.error("Please log in to upgrade your subscription!");
      navigate("/login");
      return;
    }

    setLoadingPlan(planName);
    try {
      // 1. Create manual-UPI order (owner QR + UPI IDs shown in modal)
      const response = await api.post("/payment/manual/create", {
        planName,
        billingCycle
      });

      const { orderId, amount } = response.data;

      setCheckoutData({
        planName,
        amount,
        orderId
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to initialize payment order");
    } finally {
      setLoadingPlan("");
    }
  };

  const planFeatures = [
    { name: "Basic Resume Upload", free: "✓", pro: "✓", premium: "✓" },
    { name: "Job Search & Filter", free: "✓", pro: "✓", premium: "✓" },
    { name: "ATS Resume Analysis", free: "3 / mo", pro: "Unlimited", premium: "Unlimited" },
    { name: "AI Mock Interviews", free: "—", pro: "10 / mo", premium: "Unlimited" },
    { name: "AI Cover Letter Generator", free: "—", pro: "10 / mo", premium: "Unlimited" },
    { name: "Skill Gap Analysis", free: "—", pro: "✓", premium: "✓" },
    { name: "Dedicated Support", free: "—", pro: "Priority Support", premium: "24/7 Dedicated Manager" },
    { name: "Team Accounts", free: "—", pro: "—", premium: "Up to 25 Users" },
    { name: "Custom Platform API Access", free: "—", pro: "—", premium: "Included" },
  ];

  // Price calculations
  const proPrice = billingCycle === "monthly" ? 99 : 990;
  const premiumPrice = billingCycle === "monthly" ? 299 : 2990;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 xl:p-8 text-white space-y-12 md:space-y-16">
      {/* Headings */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Choose the right platform plan to supercharge your hiring process or advance your technical career search.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="flex items-center justify-center gap-3 pt-6">
          <span className={`text-xs font-semibold ${billingCycle === "monthly" ? "text-white" : "text-slate-400"}`}>
            Monthly
          </span>
          <button
            onClick={() => {
              playHoverSound();
              setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly");
            }}
            className="w-12 h-6 bg-slate-800 border border-slate-700 rounded-full p-0.5 relative transition-all"
          >
            <div
              className={`w-4.5 h-4.5 bg-blue-500 rounded-full absolute top-0.5 transition-all ${
                billingCycle === "yearly" ? "left-6" : "left-0.5"
              }`}
            />
          </button>
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-white" : "text-slate-400"}`}>
            Yearly
            <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] px-2 py-0.5 rounded-full font-bold">
              Save ~17%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <div className={`bg-slate-800 p-8 rounded-3xl border flex flex-col justify-between relative shadow-lg transition-transform hover:scale-[1.02] ${currentTier === "FREE" ? "border-blue-500/50" : "border-slate-700"}`}>
          {currentTier === "FREE" && (
            <span className="absolute top-4 right-4 bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Current Plan
            </span>
          )}
          <div>
            <h3 className="text-xl font-bold">Free Plan</h3>
            <p className="text-xs text-slate-400 mt-1">For basic searching and resume tracking.</p>
            <div className="my-6">
              <span className="text-4xl font-black">₹0</span>
              <span className="text-xs text-slate-500 font-semibold"> / month</span>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-300 border-t border-slate-700/60 pt-6">
              <li>• Basic Resume Upload</li>
              <li>• 3 ATS Analysis / month</li>
              <li>• Browse and Apply to Jobs</li>
            </ul>
          </div>
          <button
            disabled
            className="w-full bg-slate-700 text-slate-400 font-bold py-3 rounded-xl mt-8 text-xs cursor-not-allowed"
          >
            {currentTier === "FREE" ? "Current Active Plan" : "Downgrade unavailable"}
          </button>
        </div>

        {/* Pro Plan - Highlighted */}
        <div
          className={`bg-slate-800 p-8 rounded-3xl flex flex-col justify-between relative shadow-xl transform scale-105 transition-all duration-300 border-2 ${
            currentTier === "PRO"
              ? "border-green-500/80 shadow-green-500/10"
              : "border-blue-500/80 shadow-blue-500/10 hover:border-blue-400"
          }`}
        >
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Most Popular
          </span>
          <div>
            <h3 className="text-xl font-bold">Pro Plan</h3>
            <p className="text-xs text-slate-400 mt-1">For active developers seeking advanced career intelligence.</p>
            <div className="my-6">
              <span className="text-4xl font-black">₹{proPrice}</span>
              <span className="text-xs text-slate-500 font-semibold"> / {billingCycle === "monthly" ? "month" : "year"}</span>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-300 border-t border-slate-700/60 pt-6">
              <li>• Unlimited ATS Analysis</li>
              <li>• 10 AI Mock Interviews / mo</li>
              <li>• 10 AI Cover Letters / mo</li>
              <li>• Skill Gap Dashboards</li>
              <li>• Priority Support Access</li>
            </ul>
          </div>
          <button
            onClick={() => {
              playHoverSound();
              if (currentTier !== "PRO" && currentTier !== "PREMIUM") {
                handleUpgradeClick("PRO");
              }
            }}
            disabled={currentTier === "PRO" || currentTier === "PREMIUM" || loadingPlan === "PRO"}
            className={`w-full font-bold py-3 rounded-xl mt-8 text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
              currentTier === "PRO"
                ? "bg-green-600 text-white cursor-not-allowed"
                : currentTier === "PREMIUM"
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loadingPlan === "PRO" ? (
              "Initializing..."
            ) : currentTier === "PRO" ? (
              "Active Plan"
            ) : currentTier === "PREMIUM" ? (
              "Included in Premium"
            ) : (
              "Upgrade Now"
            )}
          </button>
        </div>

        {/* Premium Plan */}
        <div
          className={`bg-slate-800 p-8 rounded-3xl flex flex-col justify-between relative shadow-lg transition-transform hover:scale-[1.02] border ${
            currentTier === "PREMIUM" ? "border-green-500/80" : "border-slate-700"
          }`}
        >
          <div>
            <h3 className="text-xl font-bold">Premium Plan</h3>
            <p className="text-xs text-slate-400 mt-1">Unlock candidate mock interviews & recruiter sourcing suites.</p>
            <div className="my-6">
              <span className="text-4xl font-black">₹{premiumPrice}</span>
              <span className="text-xs text-slate-500 font-semibold"> / {billingCycle === "monthly" ? "month" : "year"}</span>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-300 border-t border-slate-700/60 pt-6">
              <li>• Unlimited ATS Analysis</li>
              <li>• Unlimited AI Mock Interviews</li>
              <li>• Unlimited AI Cover Letters</li>
              <li>• Full Team Access (up to 25 accounts)</li>
              <li>• 24/7 Dedicated Account Manager</li>
            </ul>
          </div>
          <button
            onClick={() => {
              playHoverSound();
              if (currentTier !== "PREMIUM") {
                handleUpgradeClick("PREMIUM");
              }
            }}
            disabled={currentTier === "PREMIUM" || loadingPlan === "PREMIUM"}
            className={`w-full font-bold py-3 rounded-xl mt-8 text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
              currentTier === "PREMIUM"
                ? "bg-green-600 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loadingPlan === "PREMIUM" ? (
              "Initializing..."
            ) : currentTier === "PREMIUM" ? (
              "Active Plan"
            ) : (
              "Upgrade Now"
            )}
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Feature Comparison Table</h2>
        <div className="overflow-x-auto bg-slate-800 rounded-3xl border border-slate-700">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/60 text-slate-300 font-bold border-b border-slate-700">
                <th className="p-4">Feature Details</th>
                <th className="p-4 text-center">Free</th>
                <th className="p-4 text-center">Pro</th>
                <th className="p-4 text-center">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-slate-300">
              {planFeatures.map((f, i) => (
                <tr key={i} className="hover:bg-slate-700/10">
                  <td className="p-4 font-semibold">{f.name}</td>
                  <td className="p-4 text-center font-bold text-slate-400">{f.free}</td>
                  <td className="p-4 text-center font-bold text-blue-400">{f.pro}</td>
                  <td className="p-4 text-center font-bold text-green-400">{f.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Modal overlay */}
      <UpiPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planName={checkoutData.planName}
        billingCycle={billingCycle}
        amount={checkoutData.amount}
        orderId={checkoutData.orderId}
        onPaymentComplete={() => {
          // Additional success callback if needed
        }}
      />
    </div>
  );
};

export default SubscriptionPricing;
