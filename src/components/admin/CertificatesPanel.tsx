"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { BadgeCheck, Copy, ExternalLink, Loader2, Plus, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { useToast } from "@/providers/ToastProvider";

type Certificate = {
  _id: string; certificateNumber: string; fullName: string; email: string;
  internshipRole: string; department: string; organization: string; issuerName: string; issuerTitle: string;
  allotmentDate: string; startDate: string; endDate: string; issueDate: string; description: string;
  skills: string[]; status: "active" | "revoked";
};
const initialForm = {
  fullName:"", email:"", internshipRole:"", department:"", organization:"Snapforest",
  issuerName:"Snapforest", issuerTitle:"Authorized Signatory", certificateNumber:"",
  allotmentDate:"", startDate:"", endDate:"", issueDate:new Date().toISOString().slice(0,10),
  description:"", skills:"",
};
function adminToken() {
  try { return JSON.parse(localStorage.getItem("snapforest_admin") || "{}").token || ""; } catch { return ""; }
}
function fmt(value: string) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric", timeZone:"UTC" });
}

export default function CertificatesPanel() {
  const toast = useToast();
  // Read the dedicated admin token after mount; client components can also be server-rendered.
  const [token, setToken] = useState("");
  useEffect(() => { setToken(adminToken()); }, []);
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [issued, setIssued] = useState<Certificate | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/certificates", { headers: { Authorization: `Bearer ${token}` }, cache:"no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not load certificates.");
      setItems(result.data);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load certificates."); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { if (token) void load(); else { setLoading(false); setError("Admin session not found. Please sign out and sign in again."); } }, [load, token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setIssued(null);
    if (!token) { setError("Admin session not found. Please sign out and sign in again."); setSaving(false); return; }
    try {
      const response = await fetch("/api/admin/certificates", {
        method:"POST", headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ ...form, skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean) }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not issue certificate.");
      setIssued(result.data); setForm({ ...initialForm, issueDate:new Date().toISOString().slice(0,10) });
      await load();
      toast.showToast("Certificate issued successfully.", "success");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not issue certificate."); }
    finally { setSaving(false); }
  }

  async function toggleStatus(item: Certificate) {
    const status = item.status === "active" ? "revoked" : "active";
    if (status === "revoked" && !window.confirm(`Revoke certificate ${item.certificateNumber}? Public verification will show it as revoked.`)) return;
    try {
      const response = await fetch("/api/admin/certificates", {
        method:"PATCH", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:JSON.stringify({ certificateNumber:item.certificateNumber, status }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not update status.");
      await load();
      toast.showToast(item.certificateNumber + (status === "revoked" ? " revoked." : " reactivated."), status === "revoked" ? "warning" : "success");
    } catch(e) { setError(e instanceof Error ? e.message : "Could not update status."); }
  }

  const visible = items.filter(item => [item.fullName,item.certificateNumber,item.internshipRole,item.email].some(v=>v?.toLowerCase().includes(search.toLowerCase())));
  const verifyUrl = (item: Certificate) => `${window.location.origin}/verify-certificate?number=${encodeURIComponent(item.certificateNumber)}`;
  const qrUrl = (item: Certificate) => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(verifyUrl(item))}`;
  const fields: Array<[keyof typeof initialForm,string,string?]> = [
    ["fullName","Intern full name"],["email","Email (optional)","email"],["internshipRole","Internship role / designation"],["department","Department / team"],["organization","Organization"],["issuerName","Issued by"],["issuerTitle","Issuer designation"],["certificateNumber","Certificate number (leave blank to auto-generate)"],["allotmentDate","Internship allotment date","date"],["startDate","Internship start date","date"],["endDate","Internship end date","date"],["issueDate","Certificate issue date","date"],
  ];
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c9f36a]">People operations / records</p><h2 className="mt-2 text-2xl font-semibold">Internship certificates</h2><p className="mt-1 text-sm text-muted-foreground">Issue a certificate, generate its public verification link and QR, or revoke an invalid record.</p></div><button onClick={()=>void load()} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm"><RefreshCw className="h-4 w-4"/>Refresh records</button></div>
    {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{error}</p>}
    {issued && <div className="grid gap-5 rounded-2xl border border-[#c9f36a]/25 bg-[#c9f36a]/[.04] p-5 md:grid-cols-[1fr_180px]"><div><div className="flex items-center gap-2 text-[#c9f36a]"><BadgeCheck className="h-5 w-5"/><strong>Certificate issued successfully</strong></div><p className="mt-2 text-sm text-white">{issued.fullName} · {issued.certificateNumber}</p><div className="mt-3 flex flex-wrap gap-4"><a className="inline-flex items-center gap-2 text-sm text-[#c9f36a] underline" href={verifyUrl(issued)} target="_blank" rel="noreferrer">Open verification page <ExternalLink className="h-4 w-4"/></a><a className="inline-flex items-center gap-2 text-sm text-[#c9f36a] underline" href={"/certificate/" + encodeURIComponent(issued.certificateNumber)} target="_blank" rel="noreferrer">View printable certificate <ExternalLink className="h-4 w-4"/></a></div><div className="mt-3 flex flex-wrap gap-2"><button className="rounded-lg border border-white/15 px-3 py-2 text-xs" onClick={()=>void navigator.clipboard.writeText(verifyUrl(issued))}><Copy className="mr-1 inline h-3.5 w-3.5"/>Copy verification link</button><button className="rounded-lg border border-white/15 px-3 py-2 text-xs" onClick={()=>window.print()}>Print / save QR</button></div></div><div className="rounded-xl bg-white p-3 text-center"><img className="mx-auto h-36 w-36" src={qrUrl(issued)} alt={`QR code for ${issued.certificateNumber}`}/><p className="mt-2 break-all text-[10px] text-black">{issued.certificateNumber}</p></div></div>}
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[.02] p-4 sm:p-6">
      <div className="mb-5 flex items-center gap-2"><Plus className="h-5 w-5 text-[#c9f36a]"/><h3 className="font-semibold">Issue new certificate</h3></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{fields.map(([key,label,type])=><label key={key} className="block min-w-0 text-xs text-[#a8b1a5]">{label}<input required={["fullName","internshipRole","allotmentDate","startDate","endDate"].includes(key)} type={type || "text"} value={form[key]} onChange={e=>setForm(prev=>({...prev,[key]:e.target.value}))} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none focus:border-[#c9f36a]/50"/></label>)}</div>
      <label className="mt-4 block text-xs text-[#a8b1a5]">Work summary / certificate statement<textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} maxLength={1500} placeholder="Describe the internship responsibilities, project or completion statement." className="mt-2 w-full rounded-xl border border-white/10 bg-[#101410] p-3 text-sm text-white outline-none focus:border-[#c9f36a]/50"/></label>
      <label className="mt-4 block text-xs text-[#a8b1a5]">Skills / areas of work (comma separated)<input value={form.skills} onChange={e=>setForm(p=>({...p,skills:e.target.value}))} placeholder="React, UI design, content research" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none focus:border-[#c9f36a]/50"/></label>
      <div className="mt-5 flex flex-wrap items-center gap-3"><button disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#c9f36a] px-5 text-sm font-semibold text-[#101510] disabled:opacity-60">{saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Plus className="h-4 w-4"/>}{saving?"Issuing…":"Issue certificate"}</button><span className="text-xs text-[#879083]">An official number is generated if you leave the number blank.</span></div>
    </form>
    <div className="rounded-2xl border border-white/10">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold">Issued records</h3><p className="mt-1 text-xs text-muted-foreground">{visible.length} certificate(s)</p></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, number, role…" className="h-10 rounded-xl border border-white/10 bg-[#101410] px-3 text-sm sm:max-w-xs"/></div>
      {loading ? <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Loading certificates…</div> : visible.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">No certificates found.</div> : <div className="divide-y divide-white/10">{visible.map(item=><div key={item._id} className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong>{item.fullName}</strong><span className={`rounded-full border px-2 py-1 text-[10px] ${item.status==="active"?"border-[#c9f36a]/20 text-[#c9f36a]":"border-red-400/20 text-red-200"}`}>{item.status}</span></div><p className="mt-1 font-mono text-xs text-[#c9f36a]">{item.certificateNumber}</p><p className="mt-1 text-xs text-muted-foreground">{item.internshipRole} · {fmt(item.startDate)} – {fmt(item.endDate)}</p></div><div className="flex flex-wrap gap-2"><a href={verifyUrl(item)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs"><ExternalLink className="h-3.5 w-3.5"/>Verify</a><a href={"/certificate/" + encodeURIComponent(item.certificateNumber)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs"><BadgeCheck className="h-3.5 w-3.5"/>Certificate / QR</a><button onClick={()=>void navigator.clipboard.writeText(verifyUrl(item))} className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs"><Copy className="h-3.5 w-3.5"/>Copy link</button><button onClick={()=>void toggleStatus(item)} className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs ${item.status==="active"?"border-red-400/20 text-red-200":"border-[#c9f36a]/20 text-[#c9f36a]"}`}>{item.status==="active"?<><XCircle className="h-3.5 w-3.5"/>Revoke</>:<><ShieldCheck className="h-3.5 w-3.5"/>Reactivate</>}</button></div></div>)}</div>}
    </div>
  </div>;
}
