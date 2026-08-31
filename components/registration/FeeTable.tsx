const FEES = [
  { category: "APTI Life Member",          early: "₹3,000", regular: "₹3,500", spot: "₹4,000" },
  { category: "APTI Annual Member",        early: "₹3,500", regular: "₹4,000", spot: "₹4,500" },
  { category: "Non-Member",               early: "₹5,000", regular: "₹5,500", spot: "₹6,000" },
  { category: "PG Student / Research Scholar", early: "₹2,500", regular: "₹3,000", spot: "₹3,500" },
  { category: "UG Student",               early: "₹2,000", regular: "₹2,500", spot: "₹3,000" },
  { category: "Accompanying Person",      early: "₹1,000", regular: "₹1,500", spot: "₹2,000" },
];

const DATES = [
  { label: "Early Bird Deadline",  date: "15 September 2026",  color: "text-emerald-600" },
  { label: "Regular Registration", date: "16 Sep – 10 Oct 2026", color: "text-[var(--secondary-800)]" },
  { label: "On-Spot Registration", date: "24–25 October 2026", color: "text-[var(--primary-800)]" },
];

export default function FeeTable() {
  return (
    <div className="space-y-8">
      {/* Important dates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {DATES.map((d) => (
          <div key={d.label} className="rounded-xl bg-white border border-[var(--accent-500)]/20 p-4">
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--muted-text)] mb-1">{d.label}</p>
            <p className={`font-display font-bold text-lg ${d.color}`}>{d.date}</p>
          </div>
        ))}
      </div>

      {/* Fee table */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--accent-500)]/20 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--primary-800)] text-white">
              <th className="text-left px-5 py-4 font-semibold text-xs uppercase tracking-wide">Category</th>
              <th className="text-center px-4 py-4 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                Early Bird<br/>
                <span className="text-[var(--accent-400)] normal-case text-[10px]">Till 15 Sep</span>
              </th>
              <th className="text-center px-4 py-4 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                Regular<br/>
                <span className="text-[var(--accent-400)] normal-case text-[10px]">Sep – Oct 10</span>
              </th>
              <th className="text-center px-4 py-4 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                On-Spot<br/>
                <span className="text-[var(--accent-400)] normal-case text-[10px]">At Venue</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {FEES.map((row, i) => (
              <tr
                key={row.category}
                className={`border-t border-[var(--accent-500)]/10 transition-colors hover:bg-[var(--surface-100)] ${i % 2 === 0 ? "bg-white" : "bg-[var(--surface-50)]"}`}
              >
                <td className="px-5 py-3.5 font-medium text-[var(--dark-text)]">{row.category}</td>
                <td className="px-4 py-3.5 text-center font-bold text-emerald-700">{row.early}</td>
                <td className="px-4 py-3.5 text-center font-bold text-[var(--secondary-800)]">{row.regular}</td>
                <td className="px-4 py-3.5 text-center font-bold text-[var(--primary-800)]">{row.spot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2 text-xs text-[var(--muted-text)]">
        <p>* All amounts shown here are in Indian Rupees (INR). GST shall be applicable extra, as per prevailing government regulations.</p>
        <p><span className="font-semibold text-[var(--dark-text)]">Remark:</span> Accompanying persons will not be entitled for issuance of Registration Kit, however they will be provided the access to Food Court.</p>
      </div>
    </div>
  );
}
