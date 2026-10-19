"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, Loader2, Printer, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

type Application = {
  _id: string; applicationNumber: string; fullName: string; email: string; phone: string;
  college: string; branch: string; yearOfStudy: string; registrationNumber: string;
  internshipRole: string; deliveryMode: "online" | "offline"; motivation?: string;
  status: "submitted" | "reviewing" | "accepted" | "rejected"; createdAt: string;
};
type Stats = { total: number; submitted: number; reviewing: number; accepted: number; rejected: number };
const statusLabel: Record<Application["status"], string> = { submitted: "Pending", reviewing: "Under review", accepted: "Selected", rejected: "Rejected" };

export default function InternshipAdminPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, submitted: 0, reviewing: 0, accepted: 0, rejected: 0 });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);

  useEffect(() => { if (!isLoading && (!user || !isAdmin)) router.replace("/admin/login"); }, [isLoading, user, isAdmin, router]);

  const load = useCallback(async () => {
    if (!user?.token || !isAdmin) return;
    setBusy(true); setError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (status !== "all") params.set("status", status);
      const response = await fetch("/api/admin/internship-applications?" + params.toString(), { headers: { Authorization: `Bearer ${user.token}` }, cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "Could not load applications.");
      setItems(json.data.applications || []); setStats(json.data.stats);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load applications."); }
    finally { setBusy(false); }
  }, [user, isAdmin, query, status]);

  useEffect(() => { if (isAdmin && user?.token) void load(); }, [isAdmin, user?.token, load]);

  const exportCsv = () => {
    const headers = ["Application ID","Name","Email","Phone","College","Branch","Registration No","Domain","Mode","Status","Submitted"];
    const rows = items.map(a => [a.applicationNumber,a.fullName,a.email,a.phone,a.college,a.branch,a.registrationNumber,a.internshipRole,a.deliveryMode,statusLabel[a.status],new Date(a.createdAt).toLocaleDateString("en-IN")]);
    const csv = [headers,...rows].map(row => row.map(value => '"' + String(value ?? "").replace(/"/g,'""') + '"').join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = "snapforest-internship-applications.csv"; link.click(); URL.revokeObjectURL(url);
  };

  const updateStatus = async (application: Application, next: Application["status"]) => {
    if (!user?.token) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/internship-applications", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` }, body: JSON.stringify({ id: application._id, status: next }) });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "Could not update status.");
      setSelected({ ...application, status: next }); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update status."); }
    finally { setBusy(false); }
  };

  if (isLoading || (!user && typeof window !== "undefined")) return <main className="grid min-h-screen place-items-center bg-[#f6f8f5]"><Loader2 className="animate-spin text-[#174c31]" /></main>;
  if (!isAdmin) return null;

  return <main className="min-h-screen bg-[#f6f8f5] text-[#18251c]">
    <header className="border-b border-black/10 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8"><Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#5d6b60] hover:text-[#174c31]"><ArrowLeft size={17}/> Admin dashboard</Link><div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={18} className="text-[#28613d]"/> Internship management</div></div></header>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-[#718072]">Snapforest · People & Culture</p><h1 className="mt-2 text-3xl font-medium">Internship applications</h1><p className="mt-2 text-sm text-[#68766b]">Review applications and update each applicant’s status.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-full border border-[#d7dfd5] bg-white px-4 py-2.5 text-sm"><RefreshCw size={15}/> Refresh</button><button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-[#174c31] px-4 py-2.5 text-sm font-semibold text-white"><Download size={15}/> Export CSV</button></div></div>
      <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-5">{[{label:"Total",value:stats.total},{label:"Pending",value:stats.submitted},{label:"Under review",value:stats.reviewing},{label:"Selected",value:stats.accepted},{label:"Rejected",value:stats.rejected}].map(x=><div key={x.label} className="rounded-2xl border border-[#e2e8e0] bg-white p-4"><p className="text-xs text-[#778277]">{x.label}</p><p className="mt-2 text-2xl font-semibold">{x.value}</p></div>)}</div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-3 top-3 text-[#849084]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, email, application ID or roll number" className="w-full rounded-xl border border-[#dce4da] bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#65906d]"/></label><select value={status} onChange={e=>setStatus(e.target.value)} className="rounded-xl border border-[#dce4da] bg-white px-4 py-3 text-sm"><option value="all">All statuses</option><option value="submitted">Pending</option><option value="reviewing">Under review</option><option value="accepted">Selected</option><option value="rejected">Rejected</option></select></div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-5 overflow-hidden rounded-2xl border border-[#e0e7de] bg-white">{busy && <div className="flex items-center gap-2 border-b border-[#edf0eb] px-4 py-3 text-xs text-[#69776c]"><Loader2 size={14} className="animate-spin"/> Loading…</div>}{items.length ? <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#f8faf7] text-xs uppercase tracking-wide text-[#718071]"><tr><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">Domain</th><th className="px-4 py-3">Mode</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{items.map(a=><tr key={a._id} className="border-t border-[#edf0eb] align-top"><td className="px-4 py-4"><button onClick={()=>setSelected(a)} className="text-left font-semibold text-[#214b31] hover:underline">{a.fullName}</button><p className="mt-1 text-xs text-[#748074]">{a.applicationNumber}</p><p className="mt-1 text-xs text-[#748074]">{a.email}</p></td><td className="px-4 py-4">{a.internshipRole}</td><td className="px-4 py-4 capitalize">{a.deliveryMode}</td><td className="px-4 py-4">{new Date(a.createdAt).toLocaleDateString("en-IN")}</td><td className="px-4 py-4"><span className="rounded-full bg-[#f0f4ed] px-2.5 py-1 text-xs">{statusLabel[a.status]}</span></td><td className="px-4 py-4"><select aria-label={`Update status for ${a.fullName}`} value={a.status} onChange={e=>void updateStatus(a,e.target.value as Application["status"])} className="rounded-lg border border-[#dce4da] bg-white px-2 py-2 text-xs"><option value="submitted">Pending</option><option value="reviewing">Under review</option><option value="accepted">Selected</option><option value="rejected">Rejected</option></select></td></tr>)}</tbody></table></div> : <div className="px-5 py-16 text-center"><Users className="mx-auto text-[#9aa79a]" size={30}/><p className="mt-3 font-semibold">{busy ? "Loading applications" : "No applications found"}</p><p className="mt-1 text-sm text-[#7a857b]">New submissions will appear here.</p></div>}</div>
      {selected && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Application details"><div className="mx-auto my-8 max-w-2xl rounded-2xl bg-white p-6 shadow-xl print:my-0 print:max-w-none print:shadow-none"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-[#6d7b6e]">Snapforest application</p><h2 className="mt-1 text-2xl font-semibold">{selected.fullName}</h2><p className="mt-1 text-xs text-[#718071]">{selected.applicationNumber}</p></div><button onClick={()=>setSelected(null)} className="rounded-full border px-3 py-1.5 text-sm print:hidden">Close</button></div><div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">{[["Email",selected.email],["Contact",selected.phone],["College",selected.college],["Branch",selected.branch],["Year / semester",selected.yearOfStudy],["Registration number",selected.registrationNumber],["Internship domain",selected.internshipRole],["Mode",selected.deliveryMode],["Submitted",new Date(selected.createdAt).toLocaleString("en-IN")],["Status",statusLabel[selected.status]]].map(([label,value])=><div key={label} className="rounded-xl bg-[#f7f8f5] p-3"><p className="text-xs text-[#788378]">{label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p></div>)}</div>{selected.motivation && <div className="mt-4 rounded-xl bg-[#f7f8f5] p-3"><p className="text-xs text-[#788378]">Additional information</p><p className="mt-1 whitespace-pre-wrap text-sm">{selected.motivation}</p></div>}<div className="mt-6 flex gap-2 print:hidden"><button onClick={()=>window.print()} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"><Printer size={15}/> Print</button><button onClick={()=>void updateStatus(selected,"reviewing")} className="inline-flex items-center gap-2 rounded-full bg-[#174c31] px-4 py-2 text-sm text-white"><FileText size={15}/> Mark under review</button></div></div></div>}
    </div>
    <style jsx global>{`@media print { body * { visibility: hidden; } [role="dialog"], [role="dialog"] * { visibility: visible; } [role="dialog"] { position: absolute; inset: 0; background: white !important; padding: 0 !important; } }`}</style>
  </main>;
}
