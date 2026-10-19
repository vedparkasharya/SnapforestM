"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Laptop, MapPin, ShieldCheck } from "lucide-react";

const roles = [
  "Software Developer Intern",
  "Frontend Developer Intern",
  "Backend Developer Intern",
  "Full Stack Developer Intern",
  "UI/UX Design Intern",
  "AI / Machine Learning Intern",
  "Data Analytics Intern",
  "Digital Marketing Intern",
  "Content & Social Media Intern",
];

type FormState = {
  fullName: string; email: string; phone: string; college: string; branch: string;
  yearOfStudy: string; registrationNumber: string; internshipRole: string;
  deliveryMode: "online" | "offline"; motivation: string;
};
const initial: FormState = {
  fullName: "", email: "", phone: "", college: "", branch: "", yearOfStudy: "",
  registrationNumber: "", internshipRole: "", deliveryMode: "online", motivation: "",
};

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read file."));
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export default function InternshipApplyPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [collegeId, setCollegeId] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ applicationNumber: string; fullName: string; deliveryMode: string } | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }
  function onFileChange(event: ChangeEvent<HTMLInputElement>, kind: "id" | "resume") {
    const file = event.target.files?.[0] || null;
    if (file && file.size > 3 * 1024 * 1024) {
      setError("Each file must be 3 MB or smaller.");
      event.target.value = "";
      return;
    }
    if (file && !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a PDF, JPG, PNG or WEBP file.");
      event.target.value = "";
      return;
    }
    setError("");
    if (kind === "id") setCollegeId(file); else setResume(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setSuccess(null);
    try {
      if (!collegeId) throw new Error("Please upload your college ID card or admission slip.");
      const payload = {
        ...form,
        collegeId: await fileToDataUrl(collegeId),
        resume: resume ? await fileToDataUrl(resume) : "",
      };
      const response = await fetch("/api/internship-applications", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Application submission failed.");
      setSuccess(data.data);
      setForm(initial); setCollegeId(null); setResume(null);
      const formElement = event.currentTarget;
      formElement.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit your application.");
    } finally { setBusy(false); }
  }

  const fieldClass = "mt-2 h-12 w-full rounded-xl border border-[#dfe4db] bg-white px-3.5 text-sm text-[#172117] outline-none transition focus:border-[#6c8f58] focus:ring-2 focus:ring-[#6c8f58]/15";
  const labelClass = "block text-sm font-semibold text-[#253126]";
  const cardClass = "rounded-2xl border border-[#e5e8e1] bg-white p-5 shadow-[0_2px_12px_rgba(22,34,22,0.035)] sm:p-7";

  return <main className="min-h-screen bg-[#f4f6f1] px-3 py-6 text-[#172117] sm:px-5 sm:py-10">
    <div className="mx-auto max-w-2xl">
      <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm text-[#5d6b5a] transition hover:text-[#214f31]"><ArrowLeft className="h-4 w-4"/>Back to Snapforest</Link>
      <header className="overflow-hidden rounded-2xl border border-[#dce4d7] bg-white shadow-sm">
        <div className="h-2 bg-[#214f31]"/>
        <div className="p-5 sm:p-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Snapforest logo" className="h-12 w-12 rounded-xl border border-[#e2e7de] object-contain p-1"/>
            <div><p className="text-xs font-bold tracking-[.2em] text-[#214f31]">SNAPFOREST</p><p className="mt-1 text-xs text-[#6b7668]">Creator spaces · Digital experiences</p></div>
          </div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[.16em] text-[#6b8b5c]">Internship applications</p>
          <h1 className="mt-2 font-serif text-3xl leading-tight text-[#172117] sm:text-4xl">Start your journey with Snapforest</h1>
          <p className="mt-3 text-sm leading-6 text-[#596456]">Apply for a one-month internship and learn by working on practical projects with our team. Complete the form carefully; required fields are marked with an asterisk.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-[#f2f6ee] p-3.5"><GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[#315e38]"/><div><p className="text-sm font-semibold">One-month internship</p><p className="mt-1 text-xs leading-5 text-[#63715e]">Certificate after successful completion.</p></div></div>
            <div className="flex items-start gap-3 rounded-xl bg-[#f2f6ee] p-3.5"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#315e38]"/><div><p className="text-sm font-semibold">No registration fee</p><p className="mt-1 text-xs leading-5 text-[#63715e]">₹100 certificate delivery fee applies only after successful completion.</p></div></div>
          </div>
        </div>
      </header>

      {success && <section role="status" className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
        <CheckCircle2 className="h-7 w-7 text-emerald-700"/><h2 className="mt-2 text-lg font-bold">Application submitted</h2>
        <p className="mt-1 text-sm">Thank you, {success.fullName}. Keep this application reference for your records:</p>
        <p className="mt-3 rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-sm">{success.applicationNumber}</p>
        <p className="mt-3 text-sm">Selected mode: <strong>{success.deliveryMode === "online" ? "Online internship" : "Offline internship"}</strong>. Snapforest will review your application.</p>
      </section>}

      <form onSubmit={submit} className="mt-5 space-y-4">
        <section className={cardClass}>
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#6b8b5c]">Section 01</p><h2 className="mt-1 text-lg font-bold">Your details</h2><p className="mt-1 text-xs text-[#727d70]">Enter the contact details you actively use.</p></div>
          <div className="space-y-5">
            <label className={labelClass}>Student full name *<input className={fieldClass} autoComplete="name" required maxLength={120} value={form.fullName} onChange={e=>setField("fullName",e.target.value)} placeholder="As shown on your college ID"/></label>
            <label className={labelClass}>Student email *<input className={fieldClass} type="email" autoComplete="email" required maxLength={160} value={form.email} onChange={e=>setField("email",e.target.value)} placeholder="you@example.com"/></label>
            <label className={labelClass}>Contact number *<input className={fieldClass} type="tel" autoComplete="tel" inputMode="tel" required maxLength={20} value={form.phone} onChange={e=>setField("phone",e.target.value)} placeholder="10-digit mobile number"/></label>
            <label className={labelClass}>College / University name *<input className={fieldClass} required maxLength={180} value={form.college} onChange={e=>setField("college",e.target.value)} placeholder="Enter your institution name"/></label>
            <label className={labelClass}>Branch / Course *<input className={fieldClass} required maxLength={120} value={form.branch} onChange={e=>setField("branch",e.target.value)} placeholder="e.g. B.Tech Computer Science"/></label>
            <label className={labelClass}>Current year / semester *<select className={fieldClass} required value={form.yearOfStudy} onChange={e=>setField("yearOfStudy",e.target.value)}><option value="">Select year / semester</option><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option><option>Recent graduate</option><option>Other</option></select></label>
            <label className={labelClass}>College roll / registration number *<input className={fieldClass} required maxLength={80} value={form.registrationNumber} onChange={e=>setField("registrationNumber",e.target.value)} placeholder="Enter your college registration number"/></label>
          </div>
        </section>

        <section className={cardClass}>
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#6b8b5c]">Section 02</p><h2 className="mt-1 text-lg font-bold">Internship preferences</h2><p className="mt-1 text-xs text-[#727d70]">Choose one role and your preferred training mode.</p></div>
          <fieldset><legend className={labelClass}>Area / Internship role *</legend><div className="mt-3 space-y-2">{roles.map(role=><label key={role} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition ${form.internshipRole===role?"border-[#719564] bg-[#f2f6ee]":"border-[#e5e8e1] hover:bg-[#fafbf8]"}`}><input type="radio" name="internshipRole" required checked={form.internshipRole===role} onChange={()=>setField("internshipRole",role)} className="h-4 w-4 accent-[#315e38]"/><span>{role}</span></label>)}</div></fieldset>
          <fieldset className="mt-6"><legend className={labelClass}>Internship mode *</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={`cursor-pointer rounded-xl border p-4 ${form.deliveryMode==="online"?"border-[#719564] bg-[#f2f6ee]":"border-[#e5e8e1]"}`}><input type="radio" name="deliveryMode" checked={form.deliveryMode==="online"} onChange={()=>setField("deliveryMode","online")} className="sr-only"/><Laptop className="h-5 w-5 text-[#315e38]"/><p className="mt-2 text-sm font-bold">Online Internship</p><p className="mt-1 text-xs leading-5 text-[#687363]">Remote participation.</p></label>
            <label className={`cursor-pointer rounded-xl border p-4 ${form.deliveryMode==="offline"?"border-[#719564] bg-[#f2f6ee]":"border-[#e5e8e1]"}`}><input type="radio" name="deliveryMode" checked={form.deliveryMode==="offline"} onChange={()=>setField("deliveryMode","offline")} className="sr-only"/><MapPin className="h-5 w-5 text-[#315e38]"/><p className="mt-2 text-sm font-bold">Offline Internship</p><p className="mt-1 text-xs leading-5 text-[#687363]">In-person participation, subject to confirmation.</p></label>
          </div></fieldset>
          <label className={`${labelClass} mt-6 block`}>Why are you interested? <span className="font-normal text-[#7b8578]">(optional)</span><textarea rows={4} maxLength={1500} value={form.motivation} onChange={e=>setField("motivation",e.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe4db] bg-white p-3.5 text-sm font-normal text-[#172117] outline-none focus:border-[#6c8f58] focus:ring-2 focus:ring-[#6c8f58]/15" placeholder="Tell us briefly about your interests and what you hope to learn."/></label>
        </section>

        <section className={cardClass}>
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#6b8b5c]">Section 03</p><h2 className="mt-1 text-lg font-bold">Supporting documents</h2><p className="mt-1 text-xs text-[#727d70]">PDF, JPG, PNG or WEBP · Maximum 3 MB per file.</p></div>
          <label className={labelClass}>College ID card / admission slip *<div className="mt-2 rounded-xl border border-dashed border-[#cbd5c5] bg-[#fafbf8] p-4"><div className="flex items-center gap-3"><FileUp className="h-5 w-5 text-[#54734b]"/><div className="min-w-0 flex-1"><p className="text-sm font-medium">{collegeId?.name || "Choose a file to upload"}</p><p className="mt-1 text-xs font-normal text-[#778173]">Required for student verification</p></div><span className="text-xs font-semibold text-[#315e38]">Browse</span></div><input className="mt-3 block w-full text-xs font-normal text-[#596456] file:mr-3 file:rounded-lg file:border-0 file:bg-[#e8efe3] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#315e38]" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" required onChange={e=>onFileChange(e,"id")}/></div></label>
          <label className={`${labelClass} mt-5 block`}>Resume / CV <span className="font-normal text-[#7b8578]">(optional)</span><div className="mt-2 rounded-xl border border-dashed border-[#cbd5c5] bg-[#fafbf8] p-4"><div className="flex items-center gap-3"><FileUp className="h-5 w-5 text-[#54734b]"/><div className="min-w-0 flex-1"><p className="text-sm font-medium">{resume?.name || "Choose your resume"}</p><p className="mt-1 text-xs font-normal text-[#778173]">PDF or image format</p></div></div><input className="mt-3 block w-full text-xs font-normal text-[#596456] file:mr-3 file:rounded-lg file:border-0 file:bg-[#e8efe3] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#315e38]" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={e=>onFileChange(e,"resume")}/></div></label>
        </section>

        <section className="rounded-2xl border border-[#dce4d7] bg-[#edf3e8] p-5 sm:p-6"><h2 className="font-bold text-[#214f31]">Before you submit</h2><ul className="mt-3 space-y-2 text-sm leading-5 text-[#4e5c4a]"><li>• Internship application is free; no registration payment is required.</li><li>• The ₹100 certificate delivery fee applies only after successful internship completion.</li><li>• Submitting an application does not guarantee selection. Your details will be reviewed by Snapforest.</li></ul><label className="mt-4 flex items-start gap-3 border-t border-[#d4dfcd] pt-4 text-sm text-[#334431]"><input required type="checkbox" className="mt-1 h-4 w-4 accent-[#315e38]"/><span>I confirm that the information provided is accurate and consent to its use for reviewing my internship application.</span></label></section>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
        <button type="submit" disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#214f31] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#183d27] disabled:cursor-not-allowed disabled:opacity-60">{busy?"Submitting application…": "Submit internship application"}{!busy&&<ArrowRight className="h-4 w-4"/>}</button>
        <p className="pb-4 text-center text-xs leading-5 text-[#778173]">Snapforest · Internship Applications · Please keep your application reference after submission.</p>
      </form>
    </div>
  </main>;
}
