import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Clock3, FileText, Laptop, MapPin, ShieldCheck, Sparkles } from "lucide-react";

const domains = [
  "Web Development", "Frontend Development", "Backend Development", "Full-Stack Development",
  "Java Programming", "Python Programming", "Artificial Intelligence", "Machine Learning",
  "Data Science", "Data Analytics", "Cloud Computing", "Cyber Security", "Android App Development",
  "UI/UX Design", "Graphic Design", "Digital Marketing", "Content Creation", "Internet of Things",
  "C Programming", "C++ Programming", "Database Management", "Software Testing",
];

const steps = [
  { number: "01", title: "Choose your domain", body: "Select the internship area that matches your interests and learning goals." },
  { number: "02", title: "Pick your duration and mode", body: "Choose the available number of weeks and online or offline participation." },
  { number: "03", title: "Register securely", body: "Fill in your details and complete the registration payment through the listed secure checkout." },
  { number: "04", title: "Receive next steps", body: "After payment verification, receive your offer letter and programme instructions. Certificate issuance is subject to completion requirements." },
];

export default function InternshipPage() {
  return (
    <main className="min-h-screen bg-[#f6f8f4] text-[#172117]">
      <header className="sticky top-0 z-20 border-b border-[#e2e8df] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Snapforest home">
            <img src="/logo.png" alt="Snapforest logo" className="h-11 w-11 rounded-xl border border-[#e1e8dd] object-contain p-1" />
            <span><span className="block text-sm font-bold tracking-[0.18em]">SNAPFOREST</span><span className="mt-0.5 block text-[10px] uppercase tracking-[0.19em] text-[#758071]">Internship Programme</span></span>
          </Link>
          <Link href="/internship/apply" className="inline-flex items-center gap-2 rounded-full bg-[#214f31] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#183d27]">Apply now <ArrowRight size={16}/></Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#dcebd1] blur-3xl opacity-70" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8e5d2] bg-white px-3.5 py-2 text-xs font-semibold text-[#285a3d]"><span className="h-2 w-2 rounded-full bg-[#6c9d5c]"/> Internship applications</div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#6a8069]">Learn · Build · Grow</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.06] tracking-tight sm:text-6xl">Turn your curiosity into <span className="font-serif italic text-[#386849]">real-world skills.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#647064]">Explore internship opportunities across technology, design, data and digital domains. Choose your preferred area, duration and participation mode in one simple application.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/internship/apply" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#214f31] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#183d27]">Start your application <ArrowRight size={17}/></Link>
              <a href="#programme" className="inline-flex items-center justify-center rounded-full border border-[#d7dfd3] bg-white px-6 py-3.5 text-sm font-semibold text-[#2b4330] transition hover:bg-[#f0f5ed]">Explore programme</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#687467]">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={16}/> Secure application</span>
              <span className="inline-flex items-center gap-2"><FileText size={16}/> Resume not required</span>
              <span className="inline-flex items-center gap-2"><Clock3 size={16}/> Flexible duration options</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#e1e8dc] bg-white p-5 shadow-[0_24px_90px_-48px_rgba(22,49,30,.32)] sm:p-7">
            <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#edf4e8] text-[#285a3d]"><Sparkles size={23}/></div><div><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#7a8978]">Programme at a glance</p><h2 className="mt-1 text-xl font-semibold">Your next step starts here</h2></div></div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f6f8f4] p-4"><Laptop className="h-5 w-5 text-[#356747]"/><p className="mt-3 text-sm font-semibold">Online mode</p><p className="mt-1 text-xs leading-5 text-[#788276]">Remote participation</p></div>
              <div className="rounded-2xl bg-[#f6f8f4] p-4"><MapPin className="h-5 w-5 text-[#356747]"/><p className="mt-3 text-sm font-semibold">Offline mode</p><p className="mt-1 text-xs leading-5 text-[#788276]">Subject to availability</p></div>
            </div>
            <div className="mt-5 rounded-2xl border border-[#e3eadf] p-4"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#7b8878]">Registration</p><div className="mt-1 flex items-end justify-between gap-3"><p className="text-2xl font-semibold">₹100</p><p className="text-right text-xs text-[#748071]">Secure Razorpay checkout<br/>shown on application page</p></div></div>
            <p className="mt-4 text-xs leading-5 text-[#7a8578]">Offer letter follows successful payment verification. Completion certificates are subject to programme requirements.</p>
          </div>
        </div>
      </section>

      <section id="programme" className="border-y border-[#e2e8df] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6c8b65]">Find your focus</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Domains to explore</h2><p className="mt-3 text-sm leading-6 text-[#687467]">Choose the domain that best fits your interests. Specific roles and availability may vary by programme cycle.</p></div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{domains.map((domain) => <div key={domain} className="flex items-center gap-3 rounded-xl border border-[#e4e9e1] bg-[#fbfcfa] p-4 text-sm font-medium text-[#334735]"><CheckCircle2 size={17} className="shrink-0 text-[#719566]"/>{domain}</div>)}</div>
          <p className="mt-4 text-xs text-[#7b8578]">Not seeing your area? Select “Other” or the closest available domain in the application form.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6c8b65]">Simple process</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((step) => <article key={step.number} className="rounded-2xl border border-[#e1e8dc] bg-white p-5"><p className="text-xs font-bold tracking-[0.2em] text-[#8a9a85]">{step.number}</p><h3 className="mt-4 text-lg font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#697568]">{step.body}</p></article>)}</div>
      </section>

      <section className="bg-[#173b27] px-5 py-14 text-center text-white sm:px-8 sm:py-16"><div className="mx-auto max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c5dbb9]">Ready when you are</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Take the first step.</h2><p className="mt-3 text-sm leading-6 text-white/75">Choose your domain, duration and preferred mode, then submit your application online.</p><Link href="/internship/apply" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#173b27] transition hover:bg-[#edf4e8]">Apply for internship <ArrowRight size={16}/></Link></div></section>
      <footer className="border-t border-[#e0e5de] bg-[#101511] px-5 py-7 text-center text-xs leading-5 text-white/60">© {new Date().getFullYear()} Snapforest. All rights reserved.<br/>Programme details and certificate eligibility are subject to applicable terms. No accreditation claim is made unless officially verified.</footer>
    </main>
  );
}
