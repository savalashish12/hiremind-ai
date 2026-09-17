export const JobCardSkeleton = () => (
  <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-11 h-11 rounded-xl bg-slate-700" />
      <div><div className="h-4 w-40 bg-slate-700 rounded mb-2" /><div className="h-3 w-24 bg-slate-700 rounded" /></div>
    </div>
    <div className="flex gap-2 mb-3"><div className="h-5 w-20 bg-slate-700 rounded-full" /><div className="h-5 w-16 bg-slate-700 rounded-full" /><div className="h-5 w-24 bg-slate-700 rounded-full" /></div>
    <div className="flex gap-1 mb-4"><div className="h-5 w-14 bg-slate-700 rounded-full" /><div className="h-5 w-16 bg-slate-700 rounded-full" /></div>
    <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
      <div className="h-5 w-20 bg-slate-700 rounded-full" />
      <div className="h-9 w-24 bg-slate-700 rounded-xl" />
    </div>
  </div>
);

export const ApplicantRowSkeleton = () => (
  <tr className="animate-pulse border-b border-slate-700">
    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-700" /><div className="h-4 w-28 bg-slate-700 rounded" /></div></td>
    <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-5 w-16 bg-slate-700 rounded-full" /></td>
    <td className="px-4 py-3"><div className="h-5 w-20 bg-slate-700 rounded-full" /></td>
    <td className="px-4 py-3"><div className="h-8 w-24 bg-slate-700 rounded-lg" /></td>
  </tr>
);

export const StatCardSkeleton = () => (
  <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 animate-pulse">
    <div className="h-3 w-20 bg-slate-700 rounded mb-3" />
    <div className="h-8 w-16 bg-slate-700 rounded mb-2" />
    <div className="h-3 w-24 bg-slate-700 rounded" />
  </div>
);
