"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BadgeCheck, Printer, ShieldCheck } from "lucide-react";

type Certificate = {
  certificateNumber:string; fullName:string; internshipRole:string; department:string; organization:string;
  issuerName:string; issuerTitle:string; allotmentDate:string; startDate:string; endDate:string; issueDate:string;
  description:string; skills:string[]; status:"active"|"revoked";
};
function date(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric", timeZone:"UTC" });
}

export default function InternshipCertificatePage() {
  const params = useParams<{ certificateNumber:string }>();
  const [certificate, setCertificate] = useState<Certificate|null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const number = String(params.certificateNumber || "");
    fetch("/api/certificates/verify?number=" + encodeURIComponent(number), { cache:"no-store" })
      .then(async response => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Certificate could not be loaded.");
        setCertificate(result.data);
      })
      .catch(e => setError(e instanceof Error ? e.message : "Certificate could not be loaded."))
      .finally(() => setLoading(false));
  }, [params.certificateNumber]);

  const verificationUrl = typeof window !== "undefined" && certificate
    ? window.location.origin + "/verify-certificate?number=" + encodeURIComponent(certificate.certificateNumber) : "";
  const qrUrl = verificationUrl
    ? "https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=" + encodeURIComponent(verificationUrl) : "";

  return <main className="min-h-screen px-4 pb-16 pt-28 sm:px-6">
    <div className="no-print mx-auto mb-5 flex max-w-5xl items-center justify-between gap-3">
      <Link href="/verify-certificate" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white"><ArrowLeft className="h-4 w-4"/>Verification portal</Link>
      {certificate && <button onClick={()=>window.print()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#c9f36a] px-4 text-sm font-semibold text-[#101510]"><Printer className="h-4 w-4"/>Print / Save PDF</button>}
    </div>
    {loading ? <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 p-10 text-center text-sm text-muted-foreground">Loading certificate record…</div>
    : error || !certificate ? <div className="mx-auto max-w-2xl rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-red-200"/><h1 className="mt-3 text-xl font-semibold">Certificate unavailable</h1><p className="mt-2 text-sm text-red-100">{error || "No certificate record was found."}</p><Link href="/verify-certificate" className="mt-5 inline-flex text-sm text-[#c9f36a] underline">Verify another certificate</Link></div>
    : <section className="certificate-document mx-auto max-w-5xl border border-[#b8c49f] bg-[#fbfcf7] p-2 text-[#172117] shadow-[0_30px_100px_rgba(0,0,0,.25)] sm:p-4">
      <div className="relative border-2 border-[#294b31] p-6 sm:p-10 md:p-14">
        <div className="pointer-events-none absolute inset-3 border border-[#294b31]/20"/>
        <div className="relative text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#183d27] text-[#d7f2a4]"><span className="text-xl font-bold">S.</span></div>
          <p className="mt-3 text-[10px] font-semibold tracking-[.28em] text-[#45684a]">{certificate.organization.toUpperCase()} · PEOPLE & CULTURE</p>
          <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight sm:text-5xl">Certificate of Internship</h1>
          <div className="mx-auto mt-4 h-px w-28 bg-[#8a9f70]"/>
          <p className="mt-6 text-sm text-[#526052]">This is to certify that</p>
          <h2 className="mt-2 break-words font-serif text-3xl font-semibold text-[#183d27] sm:text-4xl">{certificate.fullName}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#354235]">{certificate.description || "has been associated with the organization as an intern and completed the internship assignment described below."}</p>
          <p className="mt-5 text-lg font-semibold text-[#183d27]">{certificate.internshipRole}</p>
          {certificate.department && <p className="mt-1 text-sm text-[#526052]">{certificate.department}</p>}
        </div>
        <div className="relative mx-auto mt-8 grid max-w-3xl gap-3 border-y border-[#d5ddcd] py-5 sm:grid-cols-4">
          {[["Allotment date",date(certificate.allotmentDate)],["Start date",date(certificate.startDate)],["End date",date(certificate.endDate)],["Issue date",date(certificate.issueDate)]].map(([label,value])=><div key={label}><p className="text-[10px] uppercase tracking-wider text-[#657264]">{label}</p><p className="mt-1 text-xs font-semibold text-[#263b29]">{value}</p></div>)}
        </div>
        {certificate.skills?.length>0 && <div className="relative mt-5 text-center"><p className="text-[10px] uppercase tracking-[.18em] text-[#657264]">Areas of work</p><p className="mt-2 text-xs text-[#354235]">{certificate.skills.join(" · ")}</p></div>}
        <div className="relative mt-8 flex flex-col items-end justify-between gap-6 sm:flex-row sm:items-end">
          <div className="text-left"><p className="text-[10px] uppercase tracking-wider text-[#657264]">Certificate number</p><p className="mt-1 font-mono text-sm font-bold text-[#183d27]">{certificate.certificateNumber}</p><div className="mt-3 flex items-center gap-2 text-[10px] text-[#45684a]"><BadgeCheck className="h-4 w-4"/>{certificate.status==="active"?"Verification record: Active":"Verification record: Revoked"}</div></div>
          <div className="flex items-end gap-5"><div className="text-right"><p className="font-serif text-lg italic text-[#294b31]">{certificate.issuerName}</p><div className="mt-1 w-40 border-t border-[#83947b] pt-2 text-left"><p className="text-xs font-semibold">{certificate.issuerName}</p><p className="mt-0.5 text-[10px] text-[#657264]">{certificate.issuerTitle}</p></div></div>{qrUrl && <div className="w-24 shrink-0 text-center"><img src={qrUrl} alt="Scan to verify certificate" className="h-24 w-24 bg-white p-1"/><p className="mt-1 text-[8px] text-[#526052]">SCAN TO VERIFY</p></div>}</div>
        </div>
        <p className="relative mt-8 border-t border-[#d5ddcd] pt-3 text-center text-[9px] text-[#657264]">This certificate can be authenticated at snapforest.in/verify-certificate using the certificate number or QR code.</p>
      </div>
      <style jsx global>{`
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          html, body { background: #fff !important; color: #172117 !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          body * { visibility: hidden !important; }
          .certificate-document, .certificate-document * { visibility: visible !important; }
          .certificate-document { position: absolute !important; inset: 0 auto auto 0 !important; width: 100% !important; max-width: none !important; margin: 0 !important; border: 0 !important; box-shadow: none !important; padding: 0 !important; }
          .certificate-document > div { padding: 8mm !important; }
          .no-print, nav, footer { display: none !important; }
        }
      `}</style>
    </section>}
  </main>;
}
