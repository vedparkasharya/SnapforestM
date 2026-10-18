"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Search, ShieldCheck, FileBadge2 } from "lucide-react";

export default function VerifyCertificatePage() {
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [certificate, setCertificate] = useState<any>(null);

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("number");
    if (initial) { setNumber(initial); void verify(initial); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verify(value: string) {
    const cleaned = value.trim().toUpperCase();
    if (!cleaned) { setError("Please enter the certificate number."); return; }
    setLoading(true); setError(""); setCertificate(null);
    try {
      const response = await fetch(`/api/certificates/verify?number=${encodeURIComponent(cleaned)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Verification failed.");
      setCertificate(result.data);
      setNumber(cleaned);
      window.history.replaceState(null, "", `/verify-certificate?number=${encodeURIComponent(cleaned)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify this certificate.");
    } finally { setLoading(false); }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void verify(number);
  }

  function date(value?: string) {
    if (!value) return "Not provided";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "Not provided" : parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
  }

  return (
    <main className="min-h-screen px-4 pb-20 pt-28 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Snapforest</Link>
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#101510] shadow-[0_28px_90px_rgba(0,0,0,.3)]">
          <div className="border-b border-white/10 bg-[radial-gradient(ellipse_at_top_right,rgba(201,243,106,.12),transparent_45%)] px-6 py-8 sm:px-9 sm:py-10">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-[#c9f36a]/20 bg-[#c9f36a]/10 text-[#c9f36a]"><ShieldCheck className="h-6 w-6" /></div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-[#c9f36a]">Official verification portal</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Verify an internship certificate</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#a8b1a5]">Confirm whether an internship certificate was issued by Snapforest. Enter the certificate number printed on the document or scan its QR code.</p>
            <form onSubmit={submit} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <label className="relative min-w-0 flex-1"><span className="sr-only">Certificate number</span><FileBadge2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8b1a5]" /><input value={number} onChange={e=>setNumber(e.target.value)} placeholder="e.g. SF-INT-2026-A1B2C3" className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none focus:border-[#c9f36a]/60" aria-label="Certificate number" /></label>
              <button disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9f36a] px-5 text-sm font-semibold text-[#11170e] disabled:opacity-60">{loading ? "Verifying…" : "Verify certificate"} <Search className="h-4 w-4" /></button>
            </form>
            {error && <p role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">{error}</p>}
          </div>
          {certificate && <div className="px-6 py-7 sm:px-9 sm:py-9">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
              <div><p className="text-xs uppercase tracking-[.16em] text-[#a8b1a5]">Certificate record</p><h2 className="mt-1 text-2xl font-semibold">{certificate.fullName}</h2><p className="mt-1 font-mono text-sm text-[#c9f36a]">{certificate.certificateNumber}</p></div>
              <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${certificate.status === "active" ? "border-[#c9f36a]/25 bg-[#c9f36a]/10 text-[#d8ff9a]" : "border-red-400/25 bg-red-400/10 text-red-200"}`}><BadgeCheck className="h-4 w-4" />{certificate.status === "active" ? "Verified · Active" : "Revoked · Not valid"}</span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["Internship role", certificate.internshipRole],
                ["Department", certificate.department || "Not provided"],
                ["Organization", certificate.organization],
                ["Allotment date", date(certificate.allotmentDate)],
                ["Internship start date", date(certificate.startDate)],
                ["Internship end date", date(certificate.endDate)],
                ["Certificate issue date", date(certificate.issueDate)],
                ["Issued by", certificate.issuerName],
                ["Issuer designation", certificate.issuerTitle],
              ].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[.025] p-4"><p className="text-xs text-[#a8b1a5]">{label}</p><p className="mt-1 text-sm font-medium text-[#f5f7f2]">{value}</p></div>)}
            </div>
            {certificate.description && <div className="mt-4 rounded-xl border border-white/10 p-4"><p className="text-xs text-[#a8b1a5]">Certificate details</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7">{certificate.description}</p></div>}
            {certificate.skills?.length > 0 && <div className="mt-4"><p className="mb-2 text-xs text-[#a8b1a5]">Skills / areas of work</p><div className="flex flex-wrap gap-2">{certificate.skills.map((skill: string)=><span key={skill} className="rounded-full border border-[#c9f36a]/15 bg-[#c9f36a]/5 px-3 py-1.5 text-xs text-[#dce8d5]">{skill}</span>)}</div></div>}
            <Link href={"/certificate/" + encodeURIComponent(certificate.certificateNumber)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c9f36a] px-4 py-3 text-sm font-semibold text-[#101510]">View / print certificate <ArrowRight className="h-4 w-4" /></Link>
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[.025] p-4 text-xs leading-6 text-[#a8b1a5]"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[#c9f36a]" /><p>This result reflects the current record stored in the Snapforest verification system. If the certificate is revoked or details appear incorrect, contact the issuing organization before relying on it.</p></div>
          </div>}
        </section>
        <p className="mt-5 text-center text-xs text-[#7f897d]">Snapforest · Certificate verification service</p>
      </div>
    </main>
  );
}
