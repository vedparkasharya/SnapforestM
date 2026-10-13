"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, AudioLines, Camera,
  Check, CirclePlay, Clapperboard, Headphones, MapPin, Mic2,
  Music2, Search, Video, Waves, Wifi
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
  { name: "Podcast", detail: "For conversations worth hearing", icon: Mic2, number: "01" },
  { name: "Photography", detail: "Light, space, and the right frame", icon: Camera, number: "02" },
  { name: "Video & YouTube", detail: "A setup that gets you rolling", icon: Video, number: "03" },
  { name: "Music", detail: "Room to find your sound", icon: Music2, number: "04" },
  { name: "Streaming", detail: "Go live without the setup stress", icon: AudioLines, number: "05" },
  { name: "More spaces", detail: "Gaming, dance, work, and more", icon: Waves, number: "06" },
];

const steps = [
  { number: "01", title: "Find your kind of space", copy: "Explore rooms by purpose, location, equipment, and price." },
  { number: "02", title: "Check the details", copy: "Know what is included, how much it costs, and where you will go." },
  { number: "03", title: "Choose your time", copy: "Pick a slot and follow the booking steps in one place." },
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
      .then((response) => response.json())
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
    <main className="sf-premium">
      <section className="sf-hero sf-hero-centered">
        <div className="sf-hero-grain" aria-hidden="true" />
        <div className="sf-wrap sf-centered-wrap">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, ease: [.2, .7, .2, 1] }} className="sf-centered-copy">
            <div className="sf-centered-mark"><span className="sf-centered-mark-line" /> SNAPFOREST <span className="sf-centered-mark-line" /></div>
            <h1><span>CREATE</span><span className="sf-centered-second">SPACE</span></h1>
            <p className="sf-centered-lede">Book professional creator studios in<br className="sf-desktop-break" /> Patna &amp; Gaya, Bihar — by the hour.</p>
            <div className="sf-hero-actions sf-centered-actions">
              <Link href="/rooms" className="sf-button sf-button-lime">Explore Studios <ArrowRight size={18} /></Link>
              <Link href="#how-it-works" className="sf-button sf-button-outline sf-centered-how"><CirclePlay size={17} /> How It Works</Link>
            </div>
            <div className="sf-centered-foot"><span className="sf-centered-dot" /> SPACES FOR BIGGER STORIES <span className="sf-centered-foot-line" /> MADE FOR CREATORS</div>
          </motion.div>
        </div>
      </section>

      <section className="sf-category-section">
        <div className="sf-wrap">
          <div className="sf-section-head sf-category-head">
            <div><p className="sf-overline">THE RIGHT ROOM CHANGES EVERYTHING</p><h2>What are you<br /><em>making today?</em></h2></div>
            <p className="sf-section-intro">Every idea needs a different kind of space. Start with what you want to create—we’ll help you find the room.</p>
          </div>
          <div className="sf-category-grid">
            {categories.map(({ name, detail, icon: Icon, number }) => (
              <Link href="/rooms" key={name} className="sf-category-card">
                <div className="sf-category-top"><span>{number}</span><ArrowUpRight size={17} className="sf-category-arrow" /></div>
                <span className="sf-category-icon"><Icon size={22} strokeWidth={1.6} /></span>
                <h3>{name}</h3><p>{detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sf-rooms-section" id="spaces">
        <div className="sf-wrap">
          <div className="sf-section-head sf-rooms-head">
            <div><p className="sf-overline sf-overline-light">A PLACE TO START</p><h2>Spaces with<br /><em>purpose.</em></h2></div>
            <div className="sf-rooms-right"><p>Browse the available rooms, compare what’s included, and choose the space that feels right for your next session.</p><Link href="/rooms" className="sf-button sf-button-outline">View all spaces <ArrowUpRight size={17} /></Link></div>
          </div>
          {rooms.length > 0 && (
            <div className="sf-room-controls">
              <label className="sf-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by room or city" aria-label="Search available spaces" /></label>
              <div className="sf-filter-pills">
                {["All spaces", "Podcast", "Photo", "Music"].map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={category === item ? "is-active" : ""}>{item}</button>)}
              </div>
            </div>
          )}
          {visibleRooms.length > 0 ? (
            <div className="sf-room-grid">
              {visibleRooms.map((room, index) => (
                <motion.article key={room._id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: .5, delay: index * .07 }} className="sf-room-card">
                  <Link href={`/rooms/${room.slug}`} className="sf-room-image">
                    <Image src={room.images?.[0] || "/rooms/photo-studio.jpg"} alt={room.name} fill sizes="(max-width: 700px) 90vw, 31vw" className="sf-cover-image" />
                    <span className="sf-room-category">{room.category || "CREATOR SPACE"}</span><span className="sf-room-image-arrow"><ArrowUpRight size={19} /></span>
                  </Link>
                  <div className="sf-room-info">
                    <div className="sf-room-title-row"><h3>{room.name}</h3>{formatPrice(room.pricePerHour) && <span className="sf-room-price">{formatPrice(room.pricePerHour)}<small> / hr</small></span>}</div>
                    <div className="sf-room-meta"><span><MapPin size={13} />{room.city || "Location on listing"}</span>{room.capacity ? <span><Waves size={13} /> Up to {room.capacity}</span> : null}</div>
                    <Link href={`/rooms/${room.slug}`} className="sf-room-link">View space <ArrowRight size={15} /></Link>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="sf-room-empty"><div className="sf-empty-icon"><Clapperboard size={23} /></div><div><h3>Find your next setup.</h3><p>Explore the current room listings for available spaces, equipment, and live rates.</p></div><Link href="/rooms" className="sf-button sf-button-lime">Explore all spaces <ArrowRight size={16} /></Link></div>
          )}
          <div className="sf-listings-note"><span className="sf-listings-dot" /> Listings and prices come from the current room catalogue.</div>
        </div>
      </section>

      <section className="sf-process-section" id="how-it-works">
        <div className="sf-wrap sf-process-grid">
          <div className="sf-process-intro"><p className="sf-overline">NO GUESSWORK. JUST THE WORK.</p><h2>Less organising.<br /><em>More creating.</em></h2><p>We keep the details up front so you can spend less time coordinating and more time doing what you came to do.</p><Link href="/rooms" className="sf-dark-link">Find your space <ArrowUpRight size={16} /></Link></div>
          <div className="sf-steps">
            {steps.map((step) => <article className="sf-step" key={step.number}><span className="sf-step-num">{step.number}</span><div><h3>{step.title}</h3><p>{step.copy}</p></div><ArrowUpRight size={17} className="sf-step-arrow" /></article>)}
            <div className="sf-process-aside"><span className="sf-aside-mark"><Check size={16} /></span><p>Room details, equipment, location and rates should be clear <em>before</em> you book.</p></div>
          </div>
        </div>
      </section>

      <section className="sf-location-section">
        <div className="sf-wrap sf-location-grid">
          <div className="sf-location-copy"><p className="sf-overline sf-overline-light">ROOTED LOCALLY. MADE FOR IDEAS.</p><h2>Good work<br />needs <em>good space.</em></h2><p>Snapforest helps creators discover spaces for recording, filming, photography, music and focused work—with room details available before you make a decision.</p><div className="sf-location-tags"><span><MapPin size={14} /> Patna, Bihar</span><span><Wifi size={14} /> Creator-ready setups</span><span><Headphones size={14} /> Different ways to create</span></div><Link href="/rooms" className="sf-button sf-button-lime">Explore available rooms <ArrowUpRight size={17} /></Link></div>
          <div className="sf-location-visual"><Image src="/rooms/photo-studio.jpg" alt="Studio space for creative work" fill sizes="(max-width: 800px) 90vw, 44vw" className="sf-cover-image" /><div className="sf-location-overlay" /><div className="sf-location-caption"><span>SNAPFOREST / FIELD NOTES</span><strong>A space for the next take.</strong></div><div className="sf-location-index">PATNA · BIHAR</div></div>
        </div>
      </section>

      <section className="sf-final-section">
        <div className="sf-wrap sf-final-inner"><div><p className="sf-overline">YOUR IDEA IS WAITING</p><h2>Make the next<br /><em>thing happen.</em></h2></div><div className="sf-final-action"><p>Find a room that fits your session. Check the details. Get started.</p><Link href="/rooms" className="sf-button sf-button-dark">Find your space <ArrowUpRight size={18} /></Link></div><span className="sf-final-watermark" aria-hidden="true">SF.</span></div>
      </section>
    </main>
  );
}
