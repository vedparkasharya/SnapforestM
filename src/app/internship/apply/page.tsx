"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Laptop, MapPin, ShieldCheck } from "lucide-react";

const roles = [
  "Civil Engineering Design & Site Visit", "Mechanical Engineering Design & Workshop Visit", "AutoCAD (Civil)", "AutoCAD (Mechanical)", "AutoCAD (Electrical)", "CATIA", "STAAD PRO", "3D Modelling / Works (CE)", "3D Modelling / Works (ME)", "3D MAX", "Revit Design", "Steel Structure Design", "Building Construction Management", "Township Development Management", "Manufacturing Process Management", "Automobile Project Management", "PLC Programming", "Industrial Automation using PLC & SCADA", "Embedded System", "Robotics", "Electrical Measurement & Instrumentation", "Electronics Measurement and Instrumentation", "Electrical Wiring and Control", "Electrical Maintenance", "Solar System Installation", "Communication System", "Web Design using HTML, CSS & JavaScript", "Web Development using PHP & MySQL", "Software Development in .NET", "Web Development in .NET", "Software Development in Java", "Web Development in Java", "Android App Development", "Python Programming", "Digital Marketing", "System Analytics", "C Programming", "C++ Programming", "Java Programming", "Full Stack Web Development", "Full Stack Software Development", "MATLAB", "Internet of Things", "Artificial Intelligence", "J2EE (Advanced Java)", "Data Science using Python", "Machine Learning using Python", "MERN Stack Development (MongoDB, Express, React, Node.js)", "Database Administrator", "Data Analytics", "Big Data Analytics", "Cloud Computing", "Cyber Security", "Ethical Hacking",
];

type FormState = {
  fullName: string; email: string; phone: string; college: string; branch: string;
  yearOfStudy: string; registrationNumber: string; internshipRole: string; durationWeeks: string;
  deliveryMode: "online" | "offline"; motivation: string; referralCode: string; referralSource: string; boardCollegeUniversity: string; paymentMethod: "upi" | "razorpay";
};
const initial: FormState = {
  fullName: "", email: "", phone: "", college: "", branch: "", yearOfStudy: "",
  registrationNumber: "", internshipRole: "", durationWeeks: "4", deliveryMode: "online", motivation: "", referralCode: "", referralSource: "", boardCollegeUniversity: "", paymentMethod: "razorpay",
};

export default function InternshipApplyPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [utrNumber, setUtrNumber] = useState("");
  const [collegeIdUrl, setCollegeIdUrl] = useState("");
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState("");
  const [nocLetterUrl, setNocLetterUrl] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [razorpayPayment, setRazorpayPayment] = useState<{ razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ applicationNumber: string; fullName: string; deliveryMode: string } | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function uploadDocument(file: File | undefined, kind: "collegeId" | "paymentScreenshot" | "nocLetter") {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please upload a JPG, PNG or WebP image."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("File must be 10 MB or smaller."); return; }
    setUploading(kind); setError("");
    try {
      const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read file."));
        reader.onerror = () => reject(new Error("Could not read file."));
        reader.readAsDataURL(file);
      });
      const response = await fetch("/api/internship-uploads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ file: dataUri, kind }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Upload failed.");
      if (kind === "collegeId") setCollegeIdUrl(data.data.url);
      if (kind === "paymentScreenshot") setPaymentScreenshotUrl(data.data.url);
      if (kind === "nocLetter") setNocLetterUrl(data.data.url);
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    finally { setUploading(null); }
  }

  async function payWithRazorpay() {
    setError("");
    try {
      const orderResponse = await fetch("/api/internship-payment/order", { method: "POST" });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok || !orderData.success) throw new Error(orderData.message || "Razorpay is currently unavailable. Please try again later.");
      const loadScript = () => new Promise<boolean>((resolve) => {
        if ((window as any).Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
      if (!await loadScript()) throw new Error("Could not load Razorpay checkout. Please try again later.");
      const RazorpayCtor = (window as any).Razorpay;
      const checkout = new RazorpayCtor({
        key: orderData.data.keyId, amount: orderData.data.amount, currency: "INR",
        name: "Snapforest", description: "Internship registration fee",
        order_id: orderData.data.orderId,
        prefill: { name: form.fullName, email: form.email, contact: form.phone },
        theme: { color: "#214f31" },
        handler: (result: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          setRazorpayPayment(result);
          setForm(prev => ({ ...prev, paymentMethod: "razorpay" }));
        },
        modal: { ondismiss: () => setError("Payment window closed. You can retry the Razorpay payment.") }
      });
      checkout.open();
    } catch (e) { setError(e instanceof Error ? e.message : "Razorpay payment could not start."); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setSuccess(null);
    try {
      if (form.paymentMethod === "upi") throw new Error("UPI payments are no longer available. Please use Razorpay.");
      if (form.paymentMethod === "razorpay" && !razorpayPayment) throw new Error("Complete the ₹100 Razorpay payment first.");
      const payload = { ...form, utrNumber: utrNumber.trim(), collegeIdUrl, paymentScreenshotUrl, nocLetterUrl, ...(razorpayPayment || {}) };
      const response = await fetch("/api/internship-applications", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Application submission failed.");
      setSuccess(data.data);
      setForm(initial); setUtrNumber(""); setCollegeIdUrl(""); setPaymentScreenshotUrl(""); setNocLetterUrl(""); setRazorpayPayment(null);
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
            <div><p className="text-xs font-bold tracking-[.2em] text-[#214f31]">SNAPFOREST</p><p className="mt-1 text-xs text-[#6b7668]">Internship Programme 2026</p></div>
          </div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[.16em] text-[#6b8b5c]">Internship applications</p>
          <h1 className="mt-2 font-serif text-3xl leading-tight text-[#172117] sm:text-4xl">Start your journey with Snapforest</h1>
          <p className="mt-3 text-sm leading-6 text-[#596456]">Choose your preferred domain, internship duration and online or offline mode. Complete the form carefully; required fields are marked with an asterisk.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-[#f2f6ee] p-3.5"><GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[#315e38]"/><div><p className="text-sm font-semibold">Flexible duration</p><p className="mt-1 text-xs leading-5 text-[#63715e]">Choose 2, 4, 6, 8 or 12 weeks.</p></div></div>
            <div className="flex items-start gap-3 rounded-xl bg-[#f2f6ee] p-3.5"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#315e38]"/><div><p className="text-sm font-semibold">₹100 registration fee</p><p className="mt-1 text-xs leading-5 text-[#63715e]">Pay securely through Razorpay at registration.</p></div></div>
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
            <label className={labelClass}>Student Name *<input className={fieldClass} autoComplete="name" required maxLength={120} value={form.fullName} onChange={e=>setField("fullName",e.target.value)} placeholder="As shown on your college ID"/></label>
            <label className={labelClass}>Student Email *<input className={fieldClass} type="email" autoComplete="email" required maxLength={160} value={form.email} onChange={e=>setField("email",e.target.value)} placeholder="you@example.com"/></label>
            <label className={labelClass}>Contact number (optional)<input className={fieldClass} type="tel" autoComplete="tel" inputMode="tel" maxLength={20} value={form.phone} onChange={e=>setField("phone",e.target.value)} placeholder="10-digit mobile number"/></label>
            <label className={labelClass}>Board / College / University (optional)<input className={fieldClass} maxLength={180} value={form.college} onChange={e=>setField("college",e.target.value)} placeholder="Enter your institution name"/></label>
            <label className={labelClass}>Branch / Course (optional)<input className={fieldClass} maxLength={120} value={form.branch} onChange={e=>setField("branch",e.target.value)} placeholder="e.g. B.Tech Computer Science"/></label>
            <label className={labelClass}>Current year / semester (optional)<select className={fieldClass} value={form.yearOfStudy} onChange={e=>setField("yearOfStudy",e.target.value)}><option value="">Select year / semester</option><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option><option>Recent graduate</option><option>Other</option></select></label>
            <label className={labelClass}>College roll / registration number (optional)<input className={fieldClass} maxLength={80} value={form.registrationNumber} onChange={e=>setField("registrationNumber",e.target.value)} placeholder="Enter your college registration number"/></label>
          </div>
        </section>

        <section className={cardClass}>
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#6b8b5c]">Section 02</p><h2 className="mt-1 text-lg font-bold">Internship preferences</h2><p className="mt-1 text-xs text-[#727d70]">Choose your preferred domain, duration and training mode.</p></div>
          <fieldset><legend className={labelClass}>Area / Internship role (optional)</legend><div className="mt-3 space-y-2">{roles.map(role=><label key={role} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition ${form.internshipRole===role?"border-[#719564] bg-[#f2f6ee]":"border-[#e5e8e1] hover:bg-[#fafbf8]"}`}><input type="radio" name="internshipRole" checked={form.internshipRole===role} onChange={()=>setField("internshipRole",role)} className="h-4 w-4 accent-[#315e38]"/><span>{role}</span></label>)}</div></fieldset>
          <div className="mt-6"><label className={labelClass}>Internship duration *<select required className={fieldClass} value={form.durationWeeks} onChange={e=>setField("durationWeeks",e.target.value)}><option value="2">2 weeks</option><option value="4">4 weeks (1 month)</option><option value="6">6 weeks</option><option value="8">8 weeks (2 months)</option><option value="12">12 weeks (3 months)</option></select><p className="mt-1 text-xs font-normal text-[#727d70]">Choose the duration you want to apply for.</p></label></div>
          <fieldset className="mt-6"><legend className={labelClass}>Internship mode (optional)</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={`cursor-pointer rounded-xl border p-4 ${form.deliveryMode==="online"?"border-[#719564] bg-[#f2f6ee]":"border-[#e5e8e1]"}`}><input type="radio" name="deliveryMode" checked={form.deliveryMode==="online"} onChange={()=>setField("deliveryMode","online")} className="sr-only"/><Laptop className="h-5 w-5 text-[#315e38]"/><p className="mt-2 text-sm font-bold">Online Internship</p><p className="mt-1 text-xs leading-5 text-[#687363]">Remote participation.</p></label>
            <label className={`cursor-pointer rounded-xl border p-4 ${form.deliveryMode==="offline"?"border-[#719564] bg-[#f2f6ee]":"border-[#e5e8e1]"}`}><input type="radio" name="deliveryMode" checked={form.deliveryMode==="offline"} onChange={()=>setField("deliveryMode","offline")} className="sr-only"/><MapPin className="h-5 w-5 text-[#315e38]"/><p className="mt-2 text-sm font-bold">Offline Internship</p><p className="mt-1 text-xs leading-5 text-[#687363]">In-person participation, subject to confirmation.</p></label>
          </div></fieldset>
          <label className={`${labelClass} mt-6 block`}>Why are you interested? <span className="font-normal text-[#7b8578]">(optional)</span><textarea rows={4} maxLength={1500} value={form.motivation} onChange={e=>setField("motivation",e.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe4db] bg-white p-3.5 text-sm font-normal text-[#172117] outline-none focus:border-[#6c8f58] focus:ring-2 focus:ring-[#6c8f58]/15" placeholder="Tell us briefly about your interests and what you hope to learn."/></label>
        </section>

        <section className={cardClass}>
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#6b8b5c]">Section 03</p><h2 className="mt-1 text-lg font-bold">Registration payment</h2><p className="mt-1 text-xs text-[#727d70]">Registration fee: ₹100. Pay securely through Razorpay.</p></div>
          <div className="mt-2">
            <button type="button" onClick={()=>void payWithRazorpay()} className="w-full rounded-xl border border-[#214f31] px-4 py-3 text-sm font-semibold text-[#214f31]">{razorpayPayment?"₹100 payment completed ✓":"Pay ₹100 securely with Razorpay"}</button>
            <p className="mt-2 text-xs text-[#687363]">{razorpayPayment ? "Payment reference received. Submit the form to verify and register." : "Complete payment in the secure Razorpay checkout before submitting."}</p>
          </div>
          <label className={labelClass + " mt-5 block"}>College ID Card / Admission Slip (optional)<input type="file" accept="image/*" onChange={e=>void uploadDocument(e.target.files?.[0],"collegeId")} className={fieldClass}/>{uploading==="collegeId"&&<span className="mt-1 block text-xs">Uploading…</span>}{collegeIdUrl&&<span className="mt-1 block text-xs text-emerald-700">Uploaded successfully</span>}</label>
          <label className={labelClass + " mt-5 block"}>NOC Letter (optional)<input type="file" accept="image/*" onChange={e=>void uploadDocument(e.target.files?.[0],"nocLetter")} className={fieldClass}/>{uploading==="nocLetter"&&<span className="mt-1 block text-xs">Uploading…</span>}{nocLetterUrl&&<span className="mt-1 block text-xs text-emerald-700">Uploaded successfully</span>}</label>
          <div className="mt-6"><h3 className="text-sm font-semibold">Certificate sample</h3><img src="/images/snapforest-certificate-sample.svg" alt="Snapforest internship certificate sample" className="mt-2 w-full rounded-lg border border-[#e2e7de]"/></div>
          <div className="mt-6"><h3 className="text-sm font-semibold">Offer letter sample</h3><img src="/images/snapforest-offer-letter-sample.svg" alt="Snapforest offer letter sample" className="mt-2 w-full rounded-lg border border-[#e2e7de]"/></div>
        </section>

        <section className="rounded-2xl border border-[#dce4d7] bg-[#edf3e8] p-5 sm:p-6"><h2 className="font-bold text-[#214f31]">Before you submit</h2><ul className="mt-3 space-y-2 text-sm leading-5 text-[#4e5c4a]"><li>• Complete the ₹100 Razorpay payment before submitting.</li><li>• Keep your Razorpay payment reference for verification.\n            • Offer letter follows successful payment verification; certificate depends on programme completion.</li><li>• Resume is not required. Submitting an application does not guarantee selection.</li></ul><label className="mt-4 flex items-start gap-3 border-t border-[#d4dfcd] pt-4 text-sm text-[#334431]"><input required type="checkbox" className="mt-1 h-4 w-4 accent-[#315e38]"/><span>I confirm that the information provided is accurate and consent to its use for reviewing my internship application.</span></label></section>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
        <button type="submit" disabled={busy || Boolean(uploading)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#214f31] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#183d27] disabled:cursor-not-allowed disabled:opacity-60">{busy?"Submitting application…":uploading?"Uploading document…":"Submit internship application"}{!busy&&<ArrowRight className="h-4 w-4"/>}</button>
        <p className="pb-4 text-center text-xs leading-5 text-[#778173]">Snapforest · Internship Applications · Please keep your application reference after submission.</p>
      </form>
    </div>
  </main>;
}
