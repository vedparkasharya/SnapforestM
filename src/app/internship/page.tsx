import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Clock3, FileText, MonitorSmartphone, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Internship Programme",
  description: "Apply for a Snapforest internship. Choose online or offline mode and submit your details securely.",
};

const domains = [
  "Full Stack Web Development", "MERN Stack Development", "Software Development in Java",
  "Python Programming", "Artificial Intelligence", "Machine Learning", "Data Analytics",
  "Cloud Computing", "Cyber Security", "Android App Development", "Digital Marketing", "Other",
];

export default function InternshipPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#17221b]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Snapforest home">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#dce5dc] bg-[#101511] text-lg font-semibold text-[#d5ef9b]">S</span>
            <span><span className="block text-sm font-semibold tracking-[0.18em]">SNAPFOREST</span><span className="block text-[10px] uppercase tracking-[0.2em] text-[#667268]">People & Culture</span></span>
          </Link>
          <Link href="/admin/internship" className="text-sm text-[#56675b] transition hover:text-[#174c31]">Admin</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d7e4d4] bg-white px-3 py-1.5 text-xs font-medium text-[#285a3d]"><span className="h-2 w-2 rounded-full bg-[#6c9d5c]" /> Applications open</div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#647267]">Snapforest · Internship Programme</p>
          <h1 className="max-w-2xl text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">Build real skills.<br /><span className="font-serif italic text-[#386849]">Create what matters.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#657067]">Apply to join a Snapforest internship programme, share your academic details and choose the available training mode. Your application will be reviewed by our team.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/internship/apply" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#174c31] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#103c25]">Start application <ArrowRight size={17} /></Link>
            <a href="#details" className="inline-flex items-center justify-center rounded-full border border-[#d6ddd5] bg-white px-6 py-3.5 text-sm font-semibold text-[#243a2b] hover:bg-[#f0f4ee]">View programme details</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#667268]"><span className="inline-flex items-center gap-2"><ShieldCheck size={16} /> Secure application</span><span className="inline-flex items-center gap-2"><FileText size={16} /> Resume optional</span><span className="inline-flex items-center gap-2"><Clock3 size={16} /> Review after submission</span></div>
        </div>
        <div className="rounded-[28px] border border-[#e1e6df] bg-white p-5 shadow-[0_24px_80px_-50px_rgba(22,49,30,.28)] sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6a786d]">Programme overview</p><h2 className="mt-2 text-2xl font-medium">Internship at Snapforest</h2></div><span className="rounded-2xl bg-[#eff5e9] p-3 text-[#275c3b]"><MonitorSmartphone size={23} /></span></div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#f7f8f5] p-4"><p className="text-xs text-[#788278]">Training mode</p><p className="mt-1 font-semibold">Online / Offline</p><p className="mt-1 text-xs text-[#788278]">Subject to programme availability</p></div>
            <div className="rounded-2xl bg-[#f7f8f5] p-4"><p className="text-xs text-[#788278]">Application</p><p className="mt-1 font-semibold">Simple form</p><p className="mt-1 text-xs text-[#788278]">No resume required</p></div>
          </div>
          <div className="mt-6 border-t border-[#e9ece7] pt-5"><p className="text-sm font-semibold">Available domains</p><div className="mt-3 flex flex-wrap gap-2">{domains.slice(0,8).map((domain) => <span key={domain} className="rounded-full border border-[#e0e6de] px-3 py-1.5 text-xs text-[#536157]">{domain}</span>)}<span className="rounded-full bg-[#eff5e9] px-3 py-1.5 text-xs font-medium text-[#285a3d]">+ more</span></div></div>
        </div>
      </section>

      <section id="details" className="border-y border-[#e3e8e1] bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-3">
          {[{n:"01",title:"Submit your details",body:"Complete the form with your contact, college and preferred internship domain."},{n:"02",title:"Application review",body:"The Snapforest team reviews submitted details and updates your application status."},{n:"03",title:"Next steps by email",body:"If selected, follow the instructions shared through official Snapforest communication."}].map((item) => <article key={item.n} className="border-l-2 border-[#cbdabf] pl-5"><p className="text-xs font-semibold tracking-[0.2em] text-[#82917f]">{item.n}</p><h3 className="mt-3 text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#6b766d]">{item.body}</p></article>)}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-12 text-center sm:px-8 sm:py-16"><CheckCircle2 className="mx-auto text-[#4e8058]" size={28}/><h2 className="mt-4 text-2xl font-medium">Ready to apply?</h2><p className="mt-2 text-sm text-[#69756b]">Submitting an application does not guarantee selection or completion certification.</p><Link href="/internship/apply" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#174c31] px-6 py-3 text-sm font-semibold text-white hover:bg-[#103c25]">Apply for internship <ArrowRight size={16}/></Link></section>
      <footer className="border-t border-[#e0e5de] bg-[#101511] px-5 py-6 text-center text-xs text-white/60">© {new Date().getFullYear()} Snapforest. All rights reserved.</footer>
    </main>
  );
}
