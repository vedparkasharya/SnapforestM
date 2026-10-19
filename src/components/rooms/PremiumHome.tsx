"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { representativeRoomImage } from "@/lib/representative-room-photos";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Camera, Check,
  CirclePlay, Clapperboard, Headphones, MapPin, Mic2, Music2,
  Play, Search, Video, Waves, Wifi, Sparkles, ShieldCheck as ShieldCheckIcon, Users as UserCircleIcon, ArrowLeft as ArrowLeftIcon
} from "lucide-react";

type Room = {
  _id: string;
  name: string;
  slug: string;
  city?: string;
  category?: string;
  images?: string[];
  pricePerHour?: number;
  rating?: number;
  reviews?: number;
  capacity?: number;
  isAvailable?: boolean;
};

const categories = [
  { name: "Podcast", detail: "Conversations worth hearing", icon: Mic2, number: "01", tone: "coral" },
  { name: "Photography", detail: "Find your perfect light", icon: Camera, number: "02", tone: "blue" },
  { name: "Video & YouTube", detail: "Your next take starts here", icon: Video, number: "03", tone: "orange" },
  { name: "Music", detail: "Make room for your sound", icon: Music2, number: "04", tone: "violet" },
  { name: "Streaming", detail: "Go live, your way", icon: Waves, number: "05", tone: "green" },
  { name: "More spaces", detail: "Room for every big idea", icon: Waves, number: "06", tone: "pink" },
];

const steps = [
  { number: "01", title: "Find your kind of space", copy: "Explore studios by purpose, location, equipment and price." },
  { number: "02", title: "Make sure it fits", copy: "See the setup, capacity, location and rates before you decide." },
  { number: "03", title: "Book your time", copy: "Choose a slot and get on with the part you came to do." },
];

function formatPrice(value?: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? "₹" + value.toLocaleString("en-IN")
    : null;
}

export default function PremiumHome() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All spaces");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/rooms", { headers: { Accept: "application/json" }, signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load rooms");
        return response.json();
      })
      .then((payload) => {
        if (payload?.success && Array.isArray(payload.data)) setRooms(payload.data.slice(0, 6));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const visibleRooms = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rooms.filter((room) => {
      const matchesText = !needle || [room.name, room.city, room.category].some((item) => item?.toLowerCase().includes(needle));
      const matchesCategory = category === "All spaces" || room.category?.toLowerCase().includes(category.toLowerCase());
      return matchesText && matchesCategory;
    }).slice(0, 3);
  }, [rooms, query, category]);

  return (
    <main className="sf-premium sf-longhaul">
      <section className="sf-hero sf-longhaul-hero sf-reference-hero">
        <div className="sf-reference-glow" aria-hidden="true" />
        <div className="sf-wrap sf-reference-layout">
          <motion.div className="sf-reference-copy" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.65}}>
            <div className="sf-reference-kicker"><span><Sparkles size={12} fill="currentColor"/> CREATOR SPACES</span><p>Record <i>•</i> Shoot <i>•</i> Stream <i>•</i> Create</p></div>
            <h1>MAKE<br/><span>GOOD</span><br/>THINGS.</h1>
            <div className="sf-reference-swish" aria-hidden="true"/>
            <p className="sf-reference-lede">Book professional studios for podcasts, YouTube, music, photography and more. A better setup for what you make.</p>
            <div className="sf-hero-actions">
              <Link href="/rooms" className="sf-button sf-button-lime"><span className="sf-cta-icon"><ArrowDown size={17}/></span>Explore Studios <ArrowRight size={18}/></Link>
              <Link href="#how-it-works" className="sf-button sf-button-glass"><CirclePlay size={19} fill="currentColor"/> How it works</Link>
            </div>
            <div className="sf-reference-benefits">
              <div><span><ShieldCheckIcon/></span><p><strong>Verified Studios</strong><small>Quality checked</small></p></div>
              <div><span><Headphones size={20}/></span><p><strong>Flexible Booking</strong><small>Hourly slots</small></p></div>
              <div><span><ShieldCheckIcon size={20}/></span><p><strong>Secure Payments</strong><small>Razorpay powered</small></p></div>
              <div><span><UserCircleIcon/></span><p><strong>For All Creators</strong><small>Podcast · Video · Music</small></p></div>
            </div>
          </motion.div>
          <motion.div className="sf-reference-visual" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:.75,delay:.1}}>
            <Image src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=2000&q=92" alt="Professional music and podcast recording studio with warm lighting" fill priority sizes="(max-width: 800px) 100vw, 62vw" className="sf-reference-photo"/>
            <div className="sf-reference-photo-shade"/>
            <div className="sf-reference-room-label"><span>FEATURED STUDIO</span><strong>Pro Audio Studio</strong><p><MapPin size={15}/> Patna, Bihar</p></div>
            <div className="sf-reference-price"><strong>₹499</strong><span>/ hour</span><Link href="/rooms">Book Now <ArrowRight size={15}/></Link></div>
            <div className="sf-reference-arrows"><Link href="/rooms" aria-label="Previous featured studio"><ArrowLeftIcon/></Link><Link href="/rooms" aria-label="Next featured studio"><ArrowRight size={20}/></Link></div>
            <div className="sf-reference-dots" aria-hidden="true"><i className="active"/><i/><i/><i/></div>
          </motion.div>
        </div>
      </section>

      <section className="sf-category-section" id="spaces">
        <div className="sf-wrap">
          <div className="sf-section-head sf-category-head"><div><p className="sf-overline"><span /> CHOOSE YOUR CREATIVE MODE</p><h2>What are you<br /><em>here to make?</em></h2></div><p className="sf-section-intro">Different ideas need different setups. Start with your format and find a space built around the work.</p></div>
          <div className="sf-category-grid">
            {categories.map(({ name, detail, icon: Icon, number, tone }) => (
              <Link href="/rooms" key={name} className={"sf-category-card sf-tone-" + tone}>
                <div className="sf-category-top"><span>{number} / SPACE</span><ArrowUpRight size={17} className="sf-category-arrow" /></div>
                <span className="sf-category-icon"><Icon size={23} strokeWidth={1.7} /></span><h3>{name}</h3><p>{detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sf-rooms-section">
        <div className="sf-wrap">
          <div className="sf-section-head sf-rooms-head"><div><p className="sf-overline sf-overline-light"><span /> SPACES THAT MAKE IT HAPPEN</p><h2>A room to work.<br /><em>Room to grow.</em></h2></div><div className="sf-rooms-right"><p>Real listings, clear details and rates up front. Find a setup that fits your next session.</p><Link href="/rooms" className="sf-button sf-button-outline">Browse all spaces <ArrowUpRight size={17} /></Link></div></div>
          {rooms.length > 0 && <div className="sf-room-controls"><label className="sf-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by room or city" aria-label="Search available spaces" /></label><div className="sf-filter-pills">{["All spaces", "Podcast", "Photo", "Music"].map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={category === item ? "is-active" : ""}>{item}</button>)}</div></div>}
          {visibleRooms.length > 0 ? <div className="sf-room-grid">{visibleRooms.map((room, index) => <motion.article key={room._id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: .45, delay: index * .06 }} className="sf-room-card"><Link href={"/rooms/" + room.slug} className="sf-room-image"><Image src={representativeRoomImage(room.category)} alt={room.name} fill sizes="(max-width: 700px) 90vw, 31vw" className="sf-cover-image" /><span className="sf-room-category">{room.category || "CREATOR SPACE"}</span><span className="sf-room-image-arrow"><ArrowUpRight size={19} /></span></Link><div className="sf-room-info"><div className="sf-room-title-row"><h3>{room.name}</h3>{formatPrice(room.pricePerHour) && <span className="sf-room-price">{formatPrice(room.pricePerHour)}<small> / hr</small></span>}</div><div className="sf-room-meta"><span><MapPin size={13} />{room.city || "Location on listing"}</span>{room.capacity ? <span><Waves size={13} /> Up to {room.capacity}</span> : null}</div><Link href={"/rooms/" + room.slug} className="sf-room-link">View space <ArrowRight size={15} /></Link></div></motion.article>)}</div> : <div className="sf-room-empty"><div className="sf-empty-icon"><Clapperboard size={23} /></div><div><h3>Your next setup is out there.</h3><p>Explore current room listings for equipment, locations and live rates.</p></div><Link href="/rooms" className="sf-button sf-button-lime">Explore all spaces <ArrowRight size={16} /></Link></div>}
          <div className="sf-listings-note"><span className="sf-listings-dot" /> Room details and prices are taken from the current catalogue.</div>
        </div>
      </section>

      <section className="sf-process-section" id="how-it-works"><div className="sf-wrap sf-process-grid"><div className="sf-process-intro"><p className="sf-overline"><span /> EASY AS ONE, TWO, THREE</p><h2>Less setup.<br /><em>More creating.</em></h2><p>Skip the endless coordination. Find the room, check what’s included, and get back to making something you’re proud of.</p><Link href="/rooms" className="sf-dark-link">Find your space <ArrowUpRight size={16} /></Link></div><div className="sf-steps">{steps.map((step) => <article className="sf-step" key={step.number}><span className="sf-step-num">{step.number}</span><div><h3>{step.title}</h3><p>{step.copy}</p></div><ArrowUpRight size={17} className="sf-step-arrow" /></article>)}<div className="sf-process-aside"><span className="sf-aside-mark"><Check size={16} /></span><p>Clear room details. Transparent rates. A little more time for <em>the work that matters.</em></p></div></div></div></section>

      <section className="sf-location-section"><div className="sf-wrap sf-location-grid"><div className="sf-location-copy"><p className="sf-overline sf-overline-light"><span /> BUILT FOR CREATORS. ROOTED IN BIHAR.</p><h2>Your idea.<br />Your <em>creative space.</em></h2><p>From recording a podcast to shooting your next video, discover creator spaces with the setup, location and pricing details you need before booking.</p><div className="sf-location-tags"><span><MapPin size={14} /> Patna &amp; Gaya, Bihar</span><span><Wifi size={14} /> Creator-ready setups</span><span><Headphones size={14} /> Space for your sound</span></div><Link href="/rooms" className="sf-button sf-button-lime">Explore available rooms <ArrowUpRight size={17} /></Link></div><div className="sf-location-visual"><Image src="/rooms/patna-rehearsal-premium.jpg" alt="Premium recording studio reference photo" fill sizes="(max-width: 800px) 90vw, 44vw" className="sf-cover-image" /><div className="sf-location-overlay" /><div className="sf-location-caption"><span>SNAPFOREST / FIELD NOTES</span><strong>Make something real.</strong></div><div className="sf-location-index">BIHAR · INDIA</div></div></div></section>

      <section className="sf-final-section"><div className="sf-wrap sf-final-inner"><div><p className="sf-overline"><span /> READY WHEN YOU ARE</p><h2>Your next idea<br /><em>starts somewhere.</em></h2></div><div className="sf-final-action"><p>Find a room that fits your session. Check the details. Start creating.</p><Link href="/rooms" className="sf-button sf-button-dark">Find your space <ArrowUpRight size={18} /></Link></div><span className="sf-final-watermark" aria-hidden="true">SF.</span></div></section>
    </main>
  );
}
