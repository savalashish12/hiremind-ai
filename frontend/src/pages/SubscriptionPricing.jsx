import toast from "react-hot-toast";

const SubscriptionPricing = () => {
  const handleUpgrade = () => {
    toast.success("Payment integration coming soon!");
  };

  const planFeatures = [
    { name: "Basic Resume Upload", free: "✓", pro: "✓", enterprise: "✓" },
    { name: "Job Search & Filter", free: "✓", pro: "✓", enterprise: "✓" },
    { name: "ATS Resume Analysis", free: "3 / mo", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "AI Mock Interviews", free: "—", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "AI Cover Letter Generator", free: "—", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "Skill Gap Analysis", free: "—", pro: "✓", enterprise: "✓" },
    { name: "Dedicated Support", free: "—", pro: "Priority Support", enterprise: "24/7 Dedicated Account Manager" },
    { name: "Team Accounts", free: "—", pro: "—", enterprise: "Up to 25 Users" },
    { name: "Custom Platform API Access", free: "—", pro: "—", enterprise: "Included" },
  ];

  return (
    <div className="p-10 max-w-6xl mx-auto text-white space-y-16">
      {/* Headings */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Choose the right platform plan to supercharge your hiring process or advance your technical career search.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 flex flex-col justify-between relative shadow-lg">
          <span className="absolute top-4 right-4 bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Current Plan
          </span>
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
            Current Active Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-slate-800 p-8 rounded-3xl border-2 border-blue-500/80 flex flex-col justify-between relative shadow-xl transform scale-105">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Recommended
          </span>
          <div>
            <h3 className="text-xl font-bold">Pro Plan</h3>
            <p className="text-xs text-slate-400 mt-1">For active developers seeking advanced career intelligence.</p>
            <div className="my-6">
              <span className="text-4xl font-black">₹499</span>
              <span className="text-xs text-slate-500 font-semibold"> / month</span>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-300 border-t border-slate-750/60 pt-6">
              <li>• Unlimited ATS Analysis</li>
              <li>• Unlimited AI Mock Interviews</li>
              <li>• Unlimited AI Cover Letters</li>
              <li>• Unlimited Skill Gap Dashboards</li>
              <li>• Priority Support Access</li>
            </ul>
          </div>
          <button
            onClick={handleUpgrade}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-8 text-xs transition-all shadow-md active:scale-95"
          >
            Upgrade to Pro
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 flex flex-col justify-between relative shadow-lg">
          <div>
            <h3 className="text-xl font-bold">Enterprise Plan</h3>
            <p className="text-xs text-slate-400 mt-1">For hiring managers and university recruitment hubs.</p>
            <div className="my-6">
              <span className="text-3xl font-black">Custom Pricing</span>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-300 border-t border-slate-700/60 pt-6">
              <li>• Multi-user Recruiter seats</li>
              <li>• Dedicated support managers</li>
              <li>• Full database search API keys</li>
              <li>• Customized AI Prompting templates</li>
            </ul>
          </div>
          <button
            onClick={handleUpgrade}
            className="w-full bg-slate-750 hover:bg-slate-700 text-white font-bold py-3 rounded-xl mt-8 text-xs transition-all border border-slate-700 active:scale-95"
          >
            Contact Sales
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
                <th className="p-4 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-slate-300">
              {planFeatures.map((f, i) => (
                <tr key={i} className="hover:bg-slate-700/10">
                  <td className="p-4 font-semibold">{f.name}</td>
                  <td className="p-4 text-center font-bold text-slate-400">{f.free}</td>
                  <td className="p-4 text-center font-bold text-blue-400">{f.pro}</td>
                  <td className="p-4 text-center font-bold text-green-400">{f.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPricing;
