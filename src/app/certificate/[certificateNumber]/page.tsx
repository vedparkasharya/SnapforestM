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
    const beforePrint = () => document.body.classList.add("certificate-printing");
    const afterPrint = () => document.body.classList.remove("certificate-printing");
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
      document.body.classList.remove("certificate-printing");
    };
  }, []);
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
    ? "https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=4&data=" + encodeURIComponent(verificationUrl) : "";

  return <main className="min-h-screen px-4 pb-16 pt-28 sm:px-6">
    <div className="no-print mx-auto mb-5 flex max-w-5xl items-center justify-between gap-3">
      <Link href="/verify-certificate" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white"><ArrowLeft className="h-4 w-4"/>Verification portal</Link>
      {certificate && <button onClick={()=>window.print()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#c9f36a] px-4 text-sm font-semibold text-[#101510]"><Printer className="h-4 w-4"/>Print / Save PDF</button>}
    </div>
    {loading ? <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 p-10 text-center text-sm text-muted-foreground">Loading certificate record…</div>
    : error || !certificate ? <div className="mx-auto max-w-2xl rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-red-200"/><h1 className="mt-3 text-xl font-semibold">Certificate unavailable</h1><p className="mt-2 text-sm text-red-100">{error || "No certificate record was found."}</p><Link href="/verify-certificate" className="mt-5 inline-flex text-sm text-[#c9f36a] underline">Verify another certificate</Link></div>
    : <section className="certificate-document mx-auto max-w-5xl border border-[#d9d5bf] bg-[#fffefb] p-2 text-[#203126] shadow-[0_24px_70px_rgba(35,48,32,.12)] sm:p-4">
      <div className="relative border-2 border-[#8a9b7a] p-6 sm:p-10 md:p-14">
        <div className="pointer-events-none absolute inset-3 border border-[#c9b778]/70"/>
        <div className="relative text-center">
          <div className="print-logo mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-[#e6e3d8] bg-white p-1"><img src="/logo.png" alt="Snapforest logo" width="300" height="300" className="h-full w-full rounded-lg object-contain" /></div>
          <p className="mt-3 text-xs font-bold tracking-[.24em] text-[#52634f]">{certificate.organization.toUpperCase()} · PEOPLE & CULTURE</p>
          <h1 className="mt-4 font-serif text-4xl font-extrabold tracking-wide text-[#244b35] sm:text-6xl" style={{ color: "#183d27", WebkitTextFillColor: "#183d27", opacity: 1, filter: "none", background: "none" }}>CERTIFICATE OF INTERNSHIP</h1>
          <div className="mx-auto mt-4 h-1 w-28 rounded-full bg-[#b4c2a0]"/>
          <p className="mt-5 text-base font-semibold tracking-[.16em] text-[#52634f]">PROUDLY PRESENTED TO</p>
          <h2 className="mt-2 break-words font-serif text-5xl font-extrabold leading-tight tracking-tight text-[#24553a] sm:text-6xl" style={{ color: "#123d27", WebkitTextFillColor: "#123d27", opacity: 1, filter: "none", background: "none" }}>{certificate.fullName}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#344536]">{certificate.description || "has been associated with the organization as an intern and completed the internship assignment described below."}</p>
          <p className="mt-5 text-xl font-bold text-[#2d5138]">{certificate.internshipRole}</p>
          {certificate.department && <p className="mt-1 text-sm text-[#66705f]">{certificate.department}</p>}
        </div>
        <div className="relative mx-auto mt-7 flex max-w-3xl flex-wrap items-center justify-center gap-2 border-y border-[#e2e3d7] py-3 text-[9px] font-bold uppercase tracking-wider text-[#536a50] sm:gap-3">
          <span className="rounded-full border border-[#d4dfcc] bg-[#f3f6ed] px-3 py-1.5">AICTE Approved</span>
          <span className="rounded-full border border-[#9eb69b] bg-[#edf4e8] px-3 py-1.5">Startup Bihar</span>
          <span className="rounded-full border border-[#9eb69b] bg-[#edf4e8] px-3 py-1.5">MSME / Udyam</span>
        </div>
        <div className="relative mx-auto mt-4 grid max-w-3xl gap-3 border-b border-[#e2e3d7] pb-5 sm:grid-cols-4">
          {[["Allotment date",date(certificate.allotmentDate)],["Start date",date(certificate.startDate)],["End date",date(certificate.endDate)],["Issue date",date(certificate.issueDate)]].map(([label,value])=><div key={label}><p className="text-[10px] uppercase tracking-wider text-[#687366]">{label}</p><p className="mt-1 text-xs font-semibold text-[#344536]">{value}</p></div>)}
        </div>
        {certificate.skills?.length>0 && <div className="relative mt-5 text-center"><p className="text-[10px] uppercase tracking-[.18em] text-[#657264]">Areas of work</p><p className="mt-2 text-xs text-[#455344]">{certificate.skills.join(" · ")}</p></div>}
        <div className="relative mt-7 flex flex-col items-end justify-between gap-6 sm:flex-row sm:items-end">
          <div className="text-left"><p className="text-[10px] uppercase tracking-wider text-[#657264]">Certificate number</p><p className="mt-1 font-mono text-sm font-bold text-[#2d5138]">{certificate.certificateNumber}</p><div className="mt-3 flex items-center gap-2 text-[10px] text-[#526f55]"><BadgeCheck className="h-4 w-4"/>{certificate.status==="active"?"Verification record: Active":"Verification record: Revoked"}</div></div>
          <div className="flex items-end gap-5"><div className="text-right"><p className="font-serif text-lg italic text-[#52694f]">{certificate.issuerName}</p><div className="mt-1 w-40 border-t border-[#83947b] pt-2 text-left"><p className="text-xs font-semibold">{certificate.issuerName}</p><p className="mt-0.5 text-[10px] text-[#657264]">{certificate.issuerTitle}</p></div></div>{qrUrl && <div className="w-28 shrink-0 text-center"><img src={qrUrl} alt="Scan to verify certificate" className="h-28 w-28 bg-white p-1"/><p className="mt-1 text-[8px] text-[#526052]">SCAN TO VERIFY</p></div>}</div>
        </div>
        <p className="relative mt-8 border-t border-[#e2e3d7] pt-3 text-center text-[9px] text-[#657264]">This certificate can be authenticated at snapforest.in/verify-certificate using the certificate number or QR code.</p>
      </div>
      <style jsx global>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }

          :root,
          html,
          body,
          body > *,
          main,
          body::before,
          body::after,
          html::before,
          html::after {
            background: #fffefb !important;
            background-color: #fffefb !important;
            background-image: none !important;
            color: #172117 !important;
            color-scheme: light !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          /* Paint the complete printable sheet ivory, including any exposed page
             area around the certificate. This prevents the site's dark theme
             from leaking into the PDF as a black frame. */
          body::before {
            content: "" !important;
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: #fffefb !important;
            z-index: -1 !important;
            pointer-events: none !important;
          }
          html, body {
            background: #fbfcf7 !important;
            background-image: none !important;
            color: #172117 !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            width: 297mm !important;
            height: 210mm !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          body {
            display: block !important;
            background: #fbfcf7 !important;
            background-image: none !important;
            color: #172117 !important;
          }
          main {
            display: block !important;
            background: #fbfcf7 !important;
            background-image: none !important;
            color: #172117 !important;
            width: 297mm !important;
            height: 210mm !important;
            min-height: 0 !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          * { visibility: hidden !important; }
          .certificate-document,
          .certificate-document * { visibility: visible !important; }
          .no-print,
          nav,
          footer { display: none !important; }

          .certificate-document {
            position: relative !important;
            display: block !important;
            width: 297mm !important;
            height: 210mm !important;
            min-width: 0 !important;
            min-height: 0 !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 3mm !important;
            border: 0 !important;
            outline: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
            background: #fbfcf7 !important;
            color: #172117 !important;
            box-sizing: border-box !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .certificate-document > div {
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            width: 100% !important;
            height: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 3.5mm 6mm !important;
            overflow: visible !important;
            border: 0.8mm solid #82977a !important;
            box-sizing: border-box !important;
            background: #fbfcf7 !important;
            color: #172117 !important;
          }
          .certificate-document > div > .pointer-events-none {
            display: block !important;
            position: absolute !important;
            inset: 2mm !important;
            border: 0.4mm double #c7b77e !important;
            opacity: 0.8 !important;
            pointer-events: none !important;
          }
          .certificate-document .relative.text-center {
            visibility: visible !important;
            opacity: 1 !important;
            color: #263b29 !important;
            -webkit-text-fill-color: #263b29 !important;
            filter: none !important;
            mix-blend-mode: normal !important;
          }
          .certificate-document .relative.text-center h1 {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            color: #244b35 !important;
            -webkit-text-fill-color: #244b35 !important;
            font-family: Georgia, "Times New Roman", serif !important;
            font-size: 29pt !important;
            font-weight: 900 !important;
            line-height: 1.12 !important;
            letter-spacing: 0.02em !important;
            text-shadow: none !important;
            filter: none !important;
            mix-blend-mode: normal !important;
            background: transparent !important;
            background-image: none !important;
            -webkit-background-clip: border-box !important;
          }
          .certificate-document .relative.text-center h2 {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            color: #24553a !important;
            -webkit-text-fill-color: #24553a !important;
            font-family: Georgia, "Times New Roman", serif !important;
            font-size: 34pt !important;
            font-weight: 900 !important;
            line-height: 1.12 !important;
            letter-spacing: 0 !important;
            text-shadow: none !important;
            filter: none !important;
            mix-blend-mode: normal !important;
            background: transparent !important;
            background-image: none !important;
            -webkit-background-clip: border-box !important;
          }
          .certificate-document .relative.text-center p,
          .certificate-document .relative.text-center span {
            visibility: visible !important;
            opacity: 1 !important;
            color: #263b29 !important;
            -webkit-text-fill-color: #263b29 !important;
            text-shadow: none !important;
          }
          .certificate-document .relative.text-center > .print-logo {
            display: flex !important;
            width: 17mm !important;
            height: 17mm !important;
            margin-left: auto !important;
            margin-right: auto !important;
            padding: 0.8mm !important;
            border: 0.3mm solid #e6e3d8 !important;
            border-radius: 2mm !important;
            background: #ffffff !important;
            box-sizing: border-box !important;
          }
          .certificate-document .relative.text-center > .print-logo img {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            object-fit: contain !important;
            opacity: 1 !important;
            visibility: visible !important;
            filter: none !important;
          }
          .certificate-document > div > * { position: relative !important; min-width: 0 !important; flex-shrink: 0 !important; }
          .certificate-document .relative.text-center { flex-shrink: 1 !important; }
          .certificate-document .relative.mx-auto.mt-7.flex {
            margin-top: 1.5mm !important;
            padding-top: 1mm !important;
            padding-bottom: 1mm !important;
          }
          .certificate-document .relative.mx-auto.mt-4.grid {
            margin-top: 1mm !important;
            padding-bottom: 1mm !important;
          }
          .certificate-document .relative.mt-5.text-center { margin-top: 1mm !important; }
          .certificate-document .relative.mt-7.flex.flex-col {
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-end !important;
            justify-content: space-between !important;
            width: 100% !important;
            margin-top: 1.5mm !important;
            gap: 4mm !important;
          }
          .certificate-document .relative.mt-7.flex.flex-col > div:first-child {
            flex: 1 1 45% !important;
            min-width: 0 !important;
            overflow: visible !important;
            padding-left: 1mm !important;
          }
          .certificate-document .relative.mt-7.flex.flex-col > div:last-child {
            flex: 0 0 auto !important;
            min-width: 0 !important;
            gap: 3mm !important;
          }
          .certificate-document .relative.mt-7.flex.flex-col > div:first-child p {
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }
          .certificate-document .relative.mt-7.flex.flex-col > div:last-child img {
            width: 25mm !important;
            height: 25mm !important;
          }
          .certificate-document .relative.mt-8.border-t {
            margin-top: 1.5mm !important;
            padding-top: 1mm !important;
          }
          .certificate-document p,
          .certificate-document span {
            overflow-wrap: anywhere !important;
          }
        }
      `}</style>
    </section>}
  </main>;
}
