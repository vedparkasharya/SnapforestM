"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Printer, ShieldCheck, ArrowLeft } from "lucide-react";

type Offer = {
  offerLetterNumber: string; fullName: string; jobTitle: string; department: string;
  employmentType: string; workLocation: string; salary: string; joiningDate: string; issueDate: string;
  probationPeriod: string; reportingTo: string; organization: string; issuerName: string;
  issuerTitle: string; terms: string; deliveryMode: "online" | "offline"; status: "active" | "revoked";
};
function fmt(value: string) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}
export default function OfferLetterPage() {
  const params = useParams<{ offerLetterNumber: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/offer-letters/verify?number=" + encodeURIComponent(String(params.offerLetterNumber || "")), { cache: "no-store" })
      .then(async r => { const data = await r.json(); if (!r.ok || !data.success) throw new Error(data.message || "Offer letter could not be loaded."); setOffer(data.data); })
      .catch(e => setError(e instanceof Error ? e.message : "Offer letter could not be loaded."))
      .finally(() => setLoading(false));
  }, [params.offerLetterNumber]);
  return <main className="min-h-screen bg-[#111610] px-4 py-8 text-[#172117] sm:px-6">
    <div className="no-print mx-auto mb-5 flex max-w-4xl items-center justify-start gap-3">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"><ArrowLeft className="h-4 w-4"/>Snapforest</Link>
    </div>
    {loading ? <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 p-10 text-center text-white/70">Loading offer letter…</div>
    : error || !offer ? <div className="mx-auto max-w-xl rounded-2xl border border-red-300/20 bg-red-300/5 p-8 text-center text-white"><ShieldCheck className="mx-auto h-8 w-8"/><h1 className="mt-3 text-xl font-semibold">Offer letter unavailable</h1><p className="mt-2 text-sm text-white/70">{error || "No offer letter was found."}</p></div>
    : <section className="offer-letter-document mx-auto max-w-4xl bg-[#fffdf8] p-6 shadow-2xl sm:p-12">
      {offer.status === "revoked" && <div className="mb-5 border-2 border-red-700 p-3 text-center font-bold uppercase tracking-widest text-red-700">Offer withdrawn — not valid for acceptance</div>}
      <div className="border-t-4 border-[#214f31] pt-7">
        <div className="flex items-start justify-between gap-4 border-b border-[#d9dfd2] pb-5">
          <div><p className="text-xs font-bold tracking-[.24em] text-[#214f31]">{offer.organization.toUpperCase()}</p><h1 className="mt-2 font-serif text-3xl font-bold text-[#183d27] sm:text-4xl">Letter of Offer</h1><p className="mt-2 text-sm text-[#5a655a]">Offer reference: {offer.offerLetterNumber}</p></div>
          <img src="/logo.png" alt="Snapforest logo" className="h-16 w-16 rounded-xl border border-[#d9dfd2] bg-white object-contain p-1"/>
        </div>
        <div className="mt-5 border border-[#d9dfd2] bg-[#f4f6ef] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#214f31]">{offer.deliveryMode === "offline" ? "Offline issue · Physical copy for handover" : "Online issue · Digital delivery · No physical collection required"}</div>
        <div className="mt-7 space-y-3 text-sm leading-6 text-[#263b29]">
          <p>{fmt(offer.issueDate)}</p><p className="font-semibold">{offer.fullName}</p>
          <p>Dear {offer.fullName},</p>
          <p>We are pleased to offer you the position of <strong>{offer.jobTitle}</strong>{offer.department ? <> in the <strong>{offer.department}</strong> department</> : null} at <strong>{offer.organization}</strong>, subject to the terms outlined in this letter.</p>
          <p>We look forward to welcoming you on <strong>{fmt(offer.joiningDate)}</strong>. Your engagement details are listed below.</p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden border border-[#d9dfd2] bg-[#d9dfd2] sm:grid-cols-2">
          {[[ "Employment type", offer.employmentType ],["Work location",offer.workLocation],["Compensation",offer.salary],["Probation period",offer.probationPeriod],["Reporting to",offer.reportingTo],["Joining date",fmt(offer.joiningDate)]].map(([label,value])=><div key={label} className="bg-[#fffdf8] p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-[#697469]">{label}</p><p className="mt-1 text-sm font-semibold text-[#263b29]">{value}</p></div>)}
        </div>
        {offer.terms && <div className="mt-6"><h2 className="font-semibold text-[#183d27]">Terms and conditions</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#263b29]">{offer.terms}</p></div>}
        <p className="mt-6 text-sm leading-6 text-[#263b29]">Please confirm your acceptance of this offer in writing before your joining date. If you have questions about this offer, please contact the issuing organization through its official communication channel.</p>
        <div className="mt-7 grid grid-cols-1 items-end gap-5 border-t border-[#d9dfd2] pt-5 sm:grid-cols-[1fr_auto]">
          <div><p className="font-serif text-lg italic text-[#214f31]">{offer.issuerName}</p><p className="mt-1 border-t border-[#83947b] pt-2 text-sm font-semibold">{offer.issuerName}</p><p className="text-xs text-[#697469]">{offer.issuerTitle}</p></div>
          <div className="flex items-end justify-between gap-4 sm:justify-end">
            <div className="text-left text-[10px] leading-4 text-[#697469] sm:text-right"><p className="font-semibold uppercase tracking-wider text-[#214f31]">Digital document</p><p>Issued by {offer.organization}</p><p className="mt-1">Ref: {offer.offerLetterNumber}</p><p className="mt-1">Scan to verify authenticity</p></div>
            <div className="shrink-0 rounded-lg border border-[#d9dfd2] bg-white p-2 text-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=112x112&margin=2&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin + "/offer-letter/" + offer.offerLetterNumber : "")}`} alt="QR code to verify this offer letter" className="h-[25mm] w-[25mm]" />
              <p className="mt-1 text-[8px] font-semibold tracking-wide text-[#214f31]">SNAPFOREST VERIFY</p>
            </div>
          </div>
        </div>
      </div>
    </section>}
    {!loading && !error && offer && offer.status === "active" && <div className="no-print mx-auto mt-5 flex max-w-4xl flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-sm font-semibold text-white">Need a copy for your records?</p><p className="mt-1 text-xs text-white/60">Save a clean A4 PDF or print the offer letter with its verification QR.</p></div>
      <button onClick={() => window.print()} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#c9f36a] px-5 py-3 text-sm font-semibold text-[#101510] sm:w-auto"><Printer className="h-4 w-4"/>Print / Save PDF</button>
    </div>}
      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          html, body { background: #fffdf8 !important; color: #172117 !important; margin: 0 !important; padding: 0 !important; print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
          body { display: block !important; }
          body * { visibility: hidden !important; }
          .offer-letter-document, .offer-letter-document * { visibility: visible !important; }
          .no-print, nav, footer { display: none !important; }
          .offer-letter-document { position: absolute !important; left: 0 !important; top: 0 !important; width: 186mm !important; max-width: none !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; background: #fffdf8 !important; }
          .offer-letter-document img { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
        }
      `}</style>
  </main>;
}
