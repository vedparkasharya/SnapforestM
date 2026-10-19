"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Copy, ExternalLink, Loader2, Plus, RefreshCw, ShieldCheck, Ban, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

type Offer = {
  _id: string; offerLetterNumber: string; fullName: string; email: string; jobTitle: string;
  department: string; employmentType: string; workLocation: string; salary: string;
  joiningDate: string; issueDate: string; probationPeriod: string; reportingTo: string;
  organization: string; issuerName: string; issuerTitle: string; terms: string; status: "active" | "revoked";
};
const today = new Date().toISOString().slice(0, 10);
const empty = {
  fullName: "", email: "", jobTitle: "", department: "", employmentType: "Internship",
  workLocation: "Remote", salary: "As discussed", joiningDate: "", issueDate: today,
  probationPeriod: "Not applicable", reportingTo: "Team Lead", organization: "Snapforest",
  issuerName: "Snapforest", issuerTitle: "Authorized Signatory", terms: "",
};
export default function OfferLettersPanel() {
  const { user, isLoading: authLoading } = useAuth();
  const token = user?.role === "admin" ? user.token : "";
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [items, setItems] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [created, setCreated] = useState<Offer | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/admin/offer-letters", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await r.json();
      if (!r.ok || !data.success) throw new Error(data.message || "Could not load offer letters.");
      setItems(data.data);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load offer letters."); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { if (!authLoading && token) void load(); }, [authLoading, token, load]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError(""); setCreated(null);
    try {
      const r = await fetch("/api/admin/offer-letters", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok || !data.success) throw new Error(data.message || "Could not create offer letter.");
      setCreated(data.data); setForm({ ...empty, issueDate: today }); await load();
      toast.success("Offer letter created");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create offer letter."); }
    finally { setSaving(false); }
  }
  async function changeStatus(item: Offer) {
    const next = item.status === "active" ? "revoked" : "active";
    if (next === "revoked" && !window.confirm("Withdraw this offer letter? Its share link will show that it has been withdrawn.")) return;
    try {
      const r = await fetch("/api/admin/offer-letters", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ offerLetterNumber: item.offerLetterNumber, status: next }) });
      const data = await r.json();
      if (!r.ok || !data.success) throw new Error(data.message || "Could not update status.");
      await load(); toast.success(next === "active" ? "Offer letter reactivated" : "Offer letter withdrawn");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update status."); }
  }
  const urlFor = (number: string) => typeof window === "undefined" ? "" : `${window.location.origin}/offer-letter/${encodeURIComponent(number)}`;
  const copy = async (number: string) => { try { await navigator.clipboard.writeText(urlFor(number)); toast.success("Offer link copied"); } catch { setError("Copy failed. Open the offer letter and copy its URL from the address bar."); } };
  const filtered = items.filter(x => `${x.fullName} ${x.email} ${x.jobTitle} ${x.offerLetterNumber}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-semibold">Offer letters</h2><p className="mt-1 text-sm text-muted-foreground">Create, share, print and withdraw formal offer letters.</p></div>
      <button onClick={() => void load()} disabled={loading || !token} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}/>Refresh</button>
    </div>
    {!token && !authLoading && <p className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">Admin session not available. Sign in again to manage offer letters.</p>}
    {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{error}</p>}
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-6">
      <h3 className="mb-4 flex items-center gap-2 font-semibold"><Plus className="h-4 w-4"/>Create a new offer</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {([
          ["fullName","Candidate full name","text",true],["email","Candidate email","email",true],["jobTitle","Job title / role","text",true],
          ["department","Department","text",false],["employmentType","Employment type","text",true],["workLocation","Work location","text",true],
          ["salary","Compensation / stipend","text",true],["joiningDate","Joining date","date",true],["issueDate","Issue date","date",true],
          ["probationPeriod","Probation period","text",true],["reportingTo","Reporting to","text",true],["organization","Organization","text",true],
          ["issuerName","Authorized signatory name","text",true],["issuerTitle","Signatory designation","text",true]
        ] as const).map(([key,label,type,required])=><label key={key} className="block text-sm"><span className="mb-1.5 block text-muted-foreground">{label}{required ? " *" : ""}</span><input type={type} required={required} maxLength={160} value={form[key]} onChange={e=>setForm(prev=>({...prev,[key]:e.target.value}))} className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm outline-none focus:border-[#c9f36a]/50"/></label>)}
        <label className="block text-sm sm:col-span-2 lg:col-span-3"><span className="mb-1.5 block text-muted-foreground">Additional terms and conditions</span><textarea rows={4} maxLength={5000} value={form.terms} onChange={e=>setForm(prev=>({...prev,terms:e.target.value}))} placeholder="Working hours, confidentiality, acceptance deadline, policies, etc." className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-[#c9f36a]/50"/></label>
      </div>
      <div className="mt-4 flex justify-end"><button disabled={saving || !token} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#c9f36a] px-4 py-2.5 text-sm font-semibold text-[#101510] disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Plus className="h-4 w-4"/>}{saving ? "Creating…" : "Create offer letter"}</button></div>
    </form>
    {created && <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4"><p className="font-semibold text-emerald-100">Offer letter created for {created.fullName}</p><p className="mt-1 break-all text-xs text-muted-foreground">{urlFor(created.offerLetterNumber)}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>void copy(created.offerLetterNumber)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm"><Copy className="h-4 w-4"/>Copy share link</button><a target="_blank" rel="noreferrer" href={urlFor(created.offerLetterNumber)} className="inline-flex items-center gap-2 rounded-lg bg-[#c9f36a] px-3 py-2 text-sm font-semibold text-[#101510]"><ExternalLink className="h-4 w-4"/>Preview / Print</a></div></div>}
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"><h3 className="font-semibold">Issued offers ({filtered.length})</h3><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, role or reference" className="h-9 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm sm:max-w-sm"/></div>
      {loading ? <div className="p-8 text-center text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin"/>Loading offers…</div>
      : filtered.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">No offer letters found yet.</div>
      : <div className="divide-y divide-white/5">{filtered.map(item=><div key={item._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.fullName}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${item.status==="active"?"bg-emerald-400/10 text-emerald-300":"bg-red-400/10 text-red-300"}`}>{item.status}</span></div><p className="mt-1 text-sm text-muted-foreground">{item.jobTitle} · {item.email}</p><p className="mt-1 break-all font-mono text-xs text-muted-foreground">{item.offerLetterNumber}</p></div><div className="flex flex-wrap gap-2"><button onClick={()=>void copy(item.offerLetterNumber)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs"><Copy className="h-3.5 w-3.5"/>Copy link</button><a href={urlFor(item.offerLetterNumber)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs"><ExternalLink className="h-3.5 w-3.5"/>Open</a><button onClick={()=>void changeStatus(item)} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs ${item.status==="active"?"border-red-300/20 text-red-200":"border-emerald-300/20 text-emerald-200"}`}>{item.status==="active"?<><Ban className="h-3.5 w-3.5"/>Withdraw</>:<><CheckCircle2 className="h-3.5 w-3.5"/>Reactivate</>}</button></div></div>)}</div>}
    </div>
    <p className="flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0"/>Offer links contain a long random reference. Share them only with the intended recipient. Check all terms and compensation before issuing.</p>
  </div>;
}
