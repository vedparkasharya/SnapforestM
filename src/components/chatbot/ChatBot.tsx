"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mic, MicOff, Volume2, VolumeX, User, Loader2 } from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isVoice?: boolean;
}

const KNOWLEDGE_BASE: Record<string, string> = {
  hello: "Hi! I can help you find studios, compare current room rates, explain booking, or answer questions about payments and cancellations.",
  hi: "Hi! What are you looking to create today — a podcast, video, photo shoot, music session or something else?",
  hey: "Hey! Tell me what you need and I’ll point you to the right place.",
  "how are you": "I’m doing well. More importantly, I’m ready to help you find a suitable Snapforest studio.",
  "who are you": "I’m the Snapforest Assistant. I can guide you around the studio listings and booking flow.",
  "what can you do": "I can explain the booking flow, help you choose a studio category, tell you where to check live rates, and answer general questions about bookings and payments.",
  "what is snapforest": "Snapforest is a studio-booking platform focused on creator spaces in Patna. You can browse rooms, compare their setup and book an available slot.",
  rooms: "Open the Explore page to see the studios currently listed. Each room has its own equipment, capacity, location and current rate.",
  studios: "Open Explore to see the current studio listings. Rates and availability are taken from the room listing rather than a fixed platform-wide price.",
  "what rooms": "The current catalogue includes categories such as podcast, YouTube, music, photography, dance, coworking, gaming, streaming and meeting spaces.",
  "how many rooms": "The number of live rooms can change. The Explore page is the source of truth for the current catalogue.",
  podcast: "For podcasts, open Explore and filter for Podcast. Check the equipment list and rate on each room before booking.",
  youtube: "For YouTube, look for YouTube or streaming rooms and compare the listed camera, lighting and backdrop equipment.",
  music: "For music, compare Music rooms and Rehearsal spaces by the equipment and capacity listed on the room page.",
  photo: "For photography, filter for Photography and compare the available lighting and backdrop equipment on each listing.",
  dance: "For dance practice, look for Dance rooms and check the capacity and equipment before selecting a slot.",
  gaming: "For gaming or streaming, compare Gaming and Streaming listings and check the exact equipment included with that room.",
  price: "Room rates are live and can vary by studio. Check the Explore page or the selected room page for the current hourly and full-day rate.",
  pricing: "There is no single platform-wide price. Each room publishes its own hourly and full-day rate, which is what the booking flow uses.",
  "how much": "Open a room to see its current price. The final booking amount is calculated on the server from that room’s stored rate and the selected duration.",
  "half day": "The current booking flow supports hourly and full-day bookings. Check the selected room for its available booking options.",
  "full day": "Full-day bookings use the room’s listed daily rate. The room page shows that rate before checkout.",
  book: "To book: open Explore → choose a studio → select the date and time → enter your details → accept the booking policy → complete payment.",
  booking: "The booking flow is: choose a room, select a future slot, enter your details, review the amount and complete payment. A confirmed booking appears in your Dashboard.",
  "how to book": "Go to Explore, open a studio, choose your date and time, enter your details, review the booking and pay through the checkout shown there.",
  cancel: "Cancellation is handled from your Dashboard for eligible bookings. Paid cancellations are cancelled first; refund processing is handled separately according to the payment workflow.",
  cancellation: "The cancellation cutoff is shown in the booking flow. Please check the selected booking before cancelling because payment refund processing is a separate step.",
  refund: "A cancellation does not itself mean a payment has already been refunded. Refund processing is handled separately for paid bookings.",
  payment: "Online payments use Razorpay when the payment gateway is configured. The server calculates the booking amount and validates the Razorpay payment before confirmation.",
  razorpay: "Razorpay is used for online checkout when it is enabled. The payment callback is validated against the booking order and amount on the server.",
  "how to pay": "After you submit a booking, the checkout opens when online payment is available. Complete the Razorpay payment and the booking is confirmed after server-side verification.",
  demo: "Demo payments are intended for development/testing only and are disabled in production.",
  location: "Snapforest currently focuses on studio listings in Patna. The exact address and map link are shown on each room page.",
  patna: "The current studio catalogue is focused on Patna, Bihar. Check individual room pages for exact locations.",
  address: "Open the studio listing you want and check its room page for the full address and map link.",
  "where are you": "The current catalogue is in Patna, Bihar. Exact locations are shown on each room page.",
  features: "The product is built around room discovery, live room details, slot selection, server-calculated booking amounts, online payment and a personal booking dashboard.",
  equipment: "Equipment is room-specific. Open a room to see exactly what is listed instead of assuming every studio includes the same gear.",
  wifi: "Wi-Fi availability is room-specific. Please check the equipment or amenities listed on the studio page.",
  ac: "Air-conditioning is room-specific. Check the room listing rather than assuming it is included.",
  parking: "Parking information is not guaranteed platform-wide. Check the individual studio listing or contact the venue.",
  "power backup": "Power backup is not a universal platform guarantee. Check the individual room listing for its facilities.",
  help: "I can help with studios, current rates, booking, payments, cancellations and general room information.",
  support: "For booking-specific help, start from your Dashboard or the selected room page so you can use the exact booking details.",
  contact: "For general support, use the contact details published by Snapforest on the live site rather than relying on chatbot text.",
  login: "Use Sign In in the top navigation. Your authenticated bookings are available in Dashboard.",
  register: "Use Sign In and choose the account creation option to create a Snapforest account.",
  "create account": "Open Sign In, switch to account creation, and submit your name, email and password.",
  "my bookings": "Open Dashboard to view your own bookings and manage eligible cancellations.",
  dashboard: "Dashboard is your private booking area. You need to be signed in to access your booking history.",
  "forgot password": "Use the account recovery/support flow available on the live site. Do not send a password through chat.",
  admin: "The admin panel is restricted to authorized admin accounts.",
  default: "I don’t have enough verified information to answer that confidently. Try asking about studios, current pricing, booking, payments, cancellation, location or your Dashboard.",
};

function findBestResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  if (KNOWLEDGE_BASE[lower]) return KNOWLEDGE_BASE[lower];

  const ordered = Object.keys(KNOWLEDGE_BASE)
    .filter((key) => key !== "default")
    .sort((a, b) => b.length - a.length);

  for (const key of ordered) {
    if (lower.includes(key)) return KNOWLEDGE_BASE[key];
  }

  if (/book|reserve|slot|schedule|timing/i.test(lower)) return KNOWLEDGE_BASE.booking;
  if (/price|cost|rate|charge|₹|rs\.|rupees|cheap|expensive/i.test(lower)) return KNOWLEDGE_BASE.price;
  if (/room|studio|space|setup/i.test(lower)) return KNOWLEDGE_BASE.rooms;
  if (/where|location|address|area|near|patna|city/i.test(lower)) return KNOWLEDGE_BASE.location;
  if (/pay|payment|card|upi|money|transaction/i.test(lower)) return KNOWLEDGE_BASE.payment;
  if (/help|assist|support|problem|issue/i.test(lower)) return KNOWLEDGE_BASE.help;
  if (/^(hi|hello|hey|gm|good)/i.test(lower)) return KNOWLEDGE_BASE.hello;

  return KNOWLEDGE_BASE.default;
}

let messageIdCounter = 0;
function generateId() {
  messageIdCounter += 1;
  return `msg_${messageIdCounter}_${Date.now()}`;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      text: "Hi! Ask me about studios, pricing, booking, payments or cancellations.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const addMessage = useCallback((text: string, sender: "user" | "bot", isVoice = false) => {
    setMessages((prev) => [...prev, { id: generateId(), text, sender, timestamp: new Date(), isVoice }]);
  }, []);

  const sendMessage = useCallback(async (text: string, isVoice = false) => {
    const clean = text.trim();
    if (!clean || isTyping) return;
    setInputText("");
    addMessage(clean, "user", isVoice);
    setHasNotification(false);
    setIsTyping(true);

    await new Promise((resolve) => window.setTimeout(resolve, 350));
    const response = findBestResponse(clean);
    addMessage(response, "bot");
    setIsTyping(false);
    speak(response);
  }, [addMessage, isTyping, speak]);

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(inputText);
  }, [inputText, sendMessage]);

  const startVoiceInput = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      addMessage("Voice input is not supported in this browser. Please type your question instead.", "bot");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setIsListening(false);
      void sendMessage(event.results[0][0].transcript, true);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [addMessage, sendMessage]);

  const stopVoiceInput = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const quickReplies = ["How to book?", "Current prices", "Show studios", "Cancellation policy"];

  const formatTime = (date: Date) => date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => { setIsOpen(true); setHasNotification(false); }}
            aria-label="Open Snapforest Assistant"
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#1a472a] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8e6c9]"
          >
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
            {hasNotification && <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500" aria-hidden="true" />}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            className="fixed bottom-6 right-6 z-50 flex h-[560px] max-h-[calc(100vh-2rem)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151515] shadow-2xl"
            aria-label="Snapforest Assistant"
          >
            <header className="flex items-center justify-between border-b border-white/10 bg-[#171717] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Snapforest Assistant</p>
                <p className="text-[11px] text-white/45">Studio help, booking and general info</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setVoiceEnabled((prev) => !prev)} aria-label={voiceEnabled ? "Turn voice off" : "Turn voice on"} className="rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8e6c9]">
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => { setIsOpen(false); window.speechSynthesis?.cancel(); }} aria-label="Close assistant" className="rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8e6c9]"><X className="h-4 w-4" /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-2 ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${message.sender === "user" ? "bg-[#1a472a]" : "bg-white/10"}`}>
                      {message.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-6 ${message.sender === "user" ? "rounded-tr-sm bg-[#1a472a] text-white" : "rounded-tl-sm border border-white/10 bg-white/[0.04] text-white/90"}`}>
                      <p>{message.text}</p>
                      <p className="mt-1 text-[10px] text-white/30">{formatTime(message.timestamp)}{message.isVoice ? " • voice" : ""}</p>
                    </div>
                  </div>
                ))}

                {isTyping && <div className="flex items-center gap-2 text-xs text-white/40"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</div>}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {messages.length <= 2 && (
              <div className="flex flex-wrap gap-2 border-t border-white/5 px-4 py-3">
                {quickReplies.map((reply) => <button type="button" key={reply} onClick={() => void sendMessage(reply)} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white">{reply}</button>)}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/10 bg-[#121212] px-3 py-3">
              <button type="button" onClick={isListening ? stopVoiceInput : startVoiceInput} aria-label={isListening ? "Stop voice input" : "Start voice input"} className={`rounded-xl p-2.5 ${isListening ? "bg-red-500/15 text-red-300" : "bg-white/5 text-white/55 hover:text-white"}`}>
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <input ref={inputRef} value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={isListening ? "Listening…" : "Ask about studios or booking"} disabled={isListening || isTyping} className="h-10 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white placeholder:text-white/30 focus:border-[#c8e6c9]/30 focus:outline-none focus:ring-1 focus:ring-[#c8e6c9]/20" />
              <button type="submit" disabled={!inputText.trim() || isListening || isTyping} aria-label="Send message" className="rounded-xl bg-[#c8e6c9] p-2.5 text-[#111] disabled:cursor-not-allowed disabled:opacity-30"><Send className="h-4 w-4" /></button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
