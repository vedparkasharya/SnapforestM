"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Loader2,
  Sparkles,
  Compass,
  Heart,
  HelpCircle,
  Star,
  MapPin,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  Clock,
  Shield,
  Wifi,
  Camera,
  Music,
  Mic2,
  Video,
  Monitor,
  CheckCircle,
  AlertCircle,
  Zap,
  Users,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────
interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isVoice?: boolean;
}

// ─── Knowledge Base ───────────────────────────────────
const KNOWLEDGE_BASE: Record<string, string> = {
  // Greetings
  hello: "Hello! Welcome to Snapforest. I am your personal assistant. I can help you book studios, check prices, explore rooms, or answer any questions about our creator spaces in Patna!",
  hi: "Hi there! Welcome to Snapforest. How can I assist you today with our creator studios in Patna?",
  hey: "Hey! Welcome to Snapforest. Ready to book an amazing creator studio? I can help you find the perfect space!",
  "good morning": "Good morning! Welcome to Snapforest. How can I help you start your creative day in Patna?",
  "good afternoon": "Good afternoon! Welcome to Snapforest. Looking for a studio to create something amazing?",
  "good evening": "Good evening! Welcome to Snapforest. Need a studio for tonight or planning ahead?",
  "how are you": "I am doing great, thank you for asking! I am here and ready to help you find the perfect creator studio in Patna. How can I assist you today?",
  "who are you": "I am the Snapforest Assistant — your friendly guide to finding and booking creator studios in Patna. I can help with studio recommendations, pricing, bookings, and any questions you have!",
  "what can you do": "I can help you with: finding the perfect studio, checking prices and packages, explaining how to book, answering questions about equipment, locations, payments, cancellations, and refunds. Just ask me anything!",
  "what is snapforest": "Snapforest is Patna's first creator studio booking platform. We connect content creators with professional, fully-equipped studio spaces across Patna — podcast studios, YouTube setups, music recording rooms, photo studios, and more!",
  "about snapforest": "Snapforest is Patna's premier creator studio platform founded by Ved Parkash Arya. We provide professional, affordable studio spaces for podcasters, YouTubers, musicians, photographers, dancers, and all types of content creators. Our mission is to make professional creative spaces accessible to everyone in Bihar!",

  // Room queries
  rooms: "We have 12+ professional creator studios in Patna including: Podcast Hub, YouTube Setup, Sound Lab, Photo Lab, Dance Floor, Creators Hub, Gaming Zone, LiveStream Studio, Rehearsal Central, Mini Studio Express, Corporate Meet Hub, and CreatorSpace Kankarbagh. Each is fully equipped with professional gear. Which type are you looking for?",
  studios: "Our studios in Patna include: Podcast Hub (₹499/hr), YouTube Setup (₹599/hr), Sound Lab (₹699/hr), Photo Lab (₹449/hr), Dance Floor (₹399/hr), Creators Hub (₹349/hr), Gaming Zone (₹549/hr), LiveStream Studio (₹649/hr), Rehearsal Central (₹749/hr), Mini Studio Express (₹249/hr), and Corporate Meet Hub (₹449/hr). What type of content do you create?",
  "what rooms": "We offer 12+ creator studios in Patna: Podcast studios, YouTube filming setups, Music recording rooms, Photo studios, Dance rehearsal spaces, Co-working spaces, Gaming/streaming rooms, Livestream studios, and Meeting rooms. Browse them all on our Explore page!",
  "how many rooms": "We currently have 12+ fully equipped creator studios across Patna, with plans to expand to more locations in Bihar soon!",
  "which studio": "The best studio depends on your content type! For podcasts, try Podcast Hub (₹499/hr). For YouTube videos, YouTube Setup (₹599/hr) is perfect. For music, Sound Lab (₹699/hr) has the best acoustics. For photos, Photo Lab (₹449/hr) has great lighting. What do you create?",
  "best studio": "Our most popular studios are: Sound Lab for music (₹699/hr), YouTube Setup for videos (₹599/hr), Podcast Hub for podcasts (₹499/hr), and LiveStream Studio for streaming (₹649/hr). Each has top-tier equipment and great reviews from creators!",
  "popular studio": "Our most booked studios are: Podcast Hub, YouTube Setup, Sound Lab, and LiveStream Studio. These are always in high demand, so I recommend booking in advance to secure your preferred time slot!",
  podcast: "Our Podcast Hub at ₹499/hour is perfect for podcast recording! It includes professional microphones, soundproofing, mixing console, and editing software. We also have the Sound Lab at ₹699/hour for higher-end audio production. Would you like to book?",
  youtube: "Our YouTube Setup at ₹599/hour is designed for YouTubers! It includes 4K cameras, ring lights, green screen, teleprompter, and professional audio. Perfect for vlogs, tutorials, and reviews!",
  music: "Our Sound Lab at ₹699/hour is our premium music studio with acoustically treated walls, studio monitors, audio interface, mixing console, and instruments. The Rehearsal Central at ₹749/hour is great for band practice. Both have excellent acoustics!",
  photo: "Our Photo Lab at ₹449/hour is perfect for photographers! It includes professional lighting setup, backdrop stands, reflectors, and editing workstation. Great for portraits, product shoots, and portfolio work!",
  dance: "Our Dance Floor at ₹399/hour is a spacious studio with mirrors, sprung flooring, sound system, and great lighting. Perfect for rehearsals, choreography practice, and dance content creation!",
  gaming: "Our Gaming Zone at ₹549/hour is built for gamers and streamers! It includes gaming PC setup, streaming equipment, RGB lighting, comfortable gaming chairs, and high-speed internet. Perfect for game streaming!",

  // Pricing
  price: "Our studio prices in Patna range from ₹249/hour (Mini Studio Express) to ₹749/hour (Rehearsal Central). Most popular studios are between ₹399-₹699/hour. We also offer half-day (5 hours) and full-day (10 hours) packages at discounted rates. Check our Pricing section for details!",
  pricing: "We have 3 pricing tiers: Hourly (₹249-₹749/hr), Half Day at ₹999 for 5 hours, and Full Day at ₹1,999 for 10 hours. All bookings include basic equipment, WiFi, and insurance. Visit our Pricing page for full details!",
  "how much": "Studio rates in Patna start from just ₹249/hour for our Mini Studio Express. Premium studios like the Sound Lab and LiveStream Studio are ₹649-₹749/hour. Half-day packages are ₹999 and full-day is ₹1,999. What type of studio do you need?",
  cheap: "Our most affordable option is Mini Studio Express at ₹249/hour — perfect for solo recordings and voiceovers. The Creators Hub at ₹349/hour is great for co-working, and Dance Floor at ₹399/hour for rehearsals. Would you like to book one?",
  affordable: "Our most affordable studios are: Mini Studio Express (₹249/hr), Creators Hub (₹349/hr), Dance Floor (₹399/hr), and Photo Lab (₹449/hr). All include professional equipment and WiFi!",
  discount: "We offer discounted Half-Day packages (5 hours at ₹999) and Full-Day packages (10 hours at ₹1,999) which save you up to 40% compared to hourly rates. Follow us on social media for seasonal promotions too!",
  "half day": "Our Half-Day package gives you 5 hours of studio time for just ₹999 — that is up to 40% savings compared to booking hourly! Perfect for longer recording sessions or content batching.",
  "full day": "Our Full-Day package gives you 10 hours of studio time for just ₹1,999 — that is our best value offer, saving you up to 50% compared to hourly rates! Ideal for professional shoots or intensive content creation days.",
  package: "We offer three packages: Hourly (pay per hour, most flexible), Half-Day (5 hours for ₹999, save 40%), and Full-Day (10 hours for ₹1,999, save 50%). All include equipment, WiFi, and basic insurance!",

  // Booking
  book: "Booking is easy! 1) Browse studios on the Explore page, 2) Select your studio and click 'Book This Studio', 3) Choose hourly or full-day, pick your date and time, 4) Agree to the damage policy, and 5) Pay securely via Razorpay. You will get instant confirmation!",
  booking: "To book a studio: Go to Explore, select a room, choose your date and time slot, and complete payment via Razorpay. You will receive instant confirmation. Cancellation is free up to 30 minutes before your booking!",
  "how to book": "Booking takes just 2 minutes: 1) Browse studios at /rooms, 2) Click on any studio card, 3) Select date, start time, and end time, 4) Click 'Book Now', 5) Pay via Razorpay (or demo mode), 6) Get instant confirmation with booking ID!",
  "booking process": "Here is how booking works: Step 1 — Browse and select a studio. Step 2 — Choose your date and time slot. Step 3 — Select hourly, half-day, or full-day. Step 4 — Review the damage policy. Step 5 — Pay securely via Razorpay. Step 6 — Get instant confirmation with your booking ID!",
  "how do i book": "Booking is simple: First, go to the Explore page and browse our studios. Click on any studio to see details. Then select your preferred date and time, choose your package (hourly/half-day/full-day), and click 'Book Now'. Complete payment via Razorpay, and you will receive instant confirmation!",
  "steps to book": "Here are the steps to book: 1) Visit /rooms to browse studios, 2) Click a studio card for details, 3) Pick date & time, 4) Select package type, 5) Accept damage policy, 6) Pay via Razorpay, 7) Get booking confirmation!",
  cancel: "You can cancel any booking up to 30 minutes before your scheduled time for a full refund. No questions asked! Go to your Dashboard to manage bookings.",
  cancellation: "Our cancellation policy is flexible — cancel up to 30 minutes before your booking for a full refund. After that, partial refunds may apply. Contact us if you need help!",
  "how to cancel": "To cancel a booking: Go to your Dashboard, find the booking you want to cancel, and click the Cancel button. If you cancel at least 30 minutes before your booking time, you get a full refund automatically!",
  refund: "Full refunds are available for cancellations made at least 30 minutes before the booking. Refunds are processed back to your original payment method within 5-7 business days.",
  "damage policy": "Our damage policy is simple: treat the equipment with care. Any intentional or negligent damage to studio equipment may be charged to your account. Basic wear and tear is expected and not charged. You will be asked to agree to this policy before booking.",

  // Payment
  payment: "We accept payments via Razorpay — India's most trusted payment gateway. You can pay using UPI, Credit/Debit cards, Net Banking, Wallets, and more. All transactions are 256-bit SSL encrypted and fully secure!",
  razorpay: "Razorpay is our secure payment partner. It supports UPI, Cards, Net Banking, and all major wallets. Your payment data is encrypted and never stored on our servers. Demo mode is also available for testing!",
  "how to pay": "Payments are handled securely through Razorpay. After booking, you will be redirected to Razorpay where you can pay via UPI, Card, Net Banking, or Wallet. After payment, you will be redirected back with confirmation!",
  demo: "Yes! We have a demo mode where you can test the entire booking flow without making a real payment. Just click 'Book Now' and select demo payment. This is perfect for trying out the platform!",
  "payment method": "We accept all major payment methods through Razorpay: UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking (all major banks), and Wallets. All transactions are 100% secure!",
  upi: "Yes, we accept UPI payments through Razorpay! You can pay using Google Pay, PhonePe, Paytm, or any UPI app. Just select UPI at checkout and enter your VPA or scan the QR code.",
  card: "Yes, we accept all major Credit and Debit cards through Razorpay — Visa, Mastercard, RuPay, and more. Your card details are never stored on our servers and are fully encrypted.",
  "is payment safe": "Absolutely! We use Razorpay, India's most trusted payment gateway. All transactions are 256-bit SSL encrypted, and your payment details are never stored on our servers. Your financial data is completely secure!",

  // Location
  location: "All our studios are located in Patna, Bihar across areas like Boring Road, Kankarbagh, Fraser Road, Gardanibagh, Rajendra Nagar, Dak Bungalow, Bailey Road, Patliputra Colony, Anandpuri, and Saguna More. Each location is easily accessible!",
  patna: "Yes! All our studios are in Patna, Bihar — spread across prime locations including Boring Road, Kankarbagh, Patliputra, Bailey Road, and more. We are Patna's first dedicated creator studio platform!",
  address: "Our studios are at: Boring Road, Kankarbagh, Fraser Road, Gardanibagh, Rajendra Nagar, Dak Bungalow, Bailey Road, Patliputra Colony, Anandpuri, and Saguna More. Visit any studio page for the exact address and Google Maps link!",
  "where are you": "We are based in Patna, Bihar! All our studios are located across prime areas of Patna. You can find the exact address and Google Maps directions on each studio's page.",
  "how to reach": "Each studio page has the full address and a Google Maps link for easy navigation. Most of our studios are near major landmarks and are easily accessible by auto, cab, or public transport in Patna.",
  boring: "We have multiple studios on Boring Road — one of Patna's prime locations! Check the Explore page and filter by 'Boring Road' to see available studios in that area.",
  kankarbagh: "Yes, we have studios in Kankarbagh including our CreatorSpace Kankarbagh location! It is a great area with easy connectivity. Filter by Kankarbagh on the Explore page to see all options.",

  // Features
  features: "All studios include: High-speed WiFi, Professional equipment (cameras, mics, lights), Basic insurance, Flexible cancellation, 24/7 support, Instant booking confirmation, Damage protection, and Clean, sanitized spaces. Premium studios have additional gear!",
  equipment: "Our studios come equipped with professional gear including: 4K Cameras, Studio Microphones, LED Light Panels, Green Screens, Teleprompters, Audio Interfaces, Studio Monitors, Mixing Consoles, and more. Each studio page lists its specific equipment!",
  wifi: "Yes! All our studios have high-speed fiber internet (100+ Mbps) perfect for live streaming, uploading large files, and video conferencing. WiFi is complimentary with every booking!",
  "what is included": "Every booking includes: high-speed WiFi, professional equipment specific to that studio, basic insurance coverage, clean and sanitized space, flexible cancellation (up to 30 mins before), 24/7 customer support, and instant booking confirmation!",
  ac: "Yes, all our studios are air-conditioned for your comfort during long recording or work sessions!",
  parking: "Most of our studio locations have nearby parking facilities. Check the specific studio page for parking details, or contact us for assistance.",
  food: "While we do not provide food, most of our studio locations are near restaurants and cafes where you can grab a bite. Some studios also have tie-ups with nearby food delivery services.",
  "power backup": "Yes, all our studios have power backup systems (UPS/Inverter) to ensure uninterrupted recording and work sessions even during power cuts!",

  // Support
  help: "I can help you with: finding studios, checking prices, booking a room, understanding our policies, payment methods, or anything about Snapforest. What would you like to know?",
  support: "Our support team is available 24/7. You can reach us at hello@snapforest.in or call +91 98765 43210. For urgent issues, use this live chat!",
  contact: "You can reach us at: Email: hello@snapforest.in, Phone: +91 98765 43210, Address: Patna, Bihar, India. We are available 24/7 for your support!",
  "customer care": "Our customer care is available 24/7! Call us at +91 98765 43210, email hello@snapforest.in, or just continue chatting with me here. We are always happy to help!",
  emergency: "For urgent issues, call us directly at +91 98765 43210. Our emergency support line is available 24/7. You can also email hello@snapforest.in for quick responses!",
  feedback: "We love feedback! Please email your suggestions to hello@snapforest.in or share them here. Your feedback helps us improve and serve creators better!",
  complaint: "We are sorry to hear you have a complaint. Please email us at hello@snapforest.in with details, or call +91 98765 43210. We take all complaints seriously and will resolve them as quickly as possible.",

  // Account
  login: "You can sign in by clicking the 'Sign In' button on the top right. You can also create a new account if you do not have one. It takes less than a minute!",
  register: "You can create an account by clicking 'Sign In' and then 'Create Account'. Just enter your name, email, and password. It is quick and free!",
  "create account": "Creating an account is easy! Click 'Sign In' at the top, then 'Create Account'. Enter your name, email, and a password. That is it — you are ready to book studios!",
  "my bookings": "You can view all your bookings in the Dashboard. Click on 'Dashboard' in the navigation menu to see your upcoming and past bookings, manage cancellations, and download invoices.",
  dashboard: "Your Dashboard shows all your bookings, payment history, and profile settings. Click 'Dashboard' in the navigation menu to access it. You need to be logged in to view your dashboard.",
  "forgot password": "If you forgot your password, please contact our support at hello@snapforest.in or call +91 98765 43210. We will help you reset it quickly!",

  // Admin
  admin: "The admin portal is for authorized personnel only. If you are an admin, visit /admin/login and sign in with your credentials. The system has multi-layer authentication for security.",
  owner: "Snapforest was built by Ved Parkash Arya, a creator from Patna who wanted to solve the problem of finding professional studio spaces in Bihar. The admin email is vedprakasharya9973@gmail.com",
  "who built": "Snapforest was founded by Ved Parkash Arya, a passionate creator from Patna. He built this platform to help fellow creators in Bihar access professional studio spaces easily and affordably!",
  "who made": "Snapforest was created by Ved Parkash Arya from Patna, Bihar. His vision is to build India's largest network of creator studios, starting from Patna!",
  ved: "Ved Parkash Arya is the founder of Snapforest. He is a creator and tech entrepreneur from Patna, Bihar, dedicated to building infrastructure for content creators. You can reach him at vedprakasharya9973@gmail.com!",

  // Default fallback
  default: "That is an interesting question! I can help you explore our studios, check pricing, understand the booking process, or guide you through payment. You can also browse all studios on the Explore page. What would you like to do?",
};

// ─── Keyword Matcher ─────────────────────────────────
function findBestResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  // Direct match
  if (KNOWLEDGE_BASE[lower]) return KNOWLEDGE_BASE[lower];

  // Check for keyword inclusion
  const keywords = Object.keys(KNOWLEDGE_BASE).filter((k) => k !== "default");
  for (const keyword of keywords) {
    if (lower.includes(keyword)) return KNOWLEDGE_BASE[keyword];
  }

  // Fuzzy match — check if any keyword is in the input
  for (const keyword of keywords) {
    const parts = keyword.split(/\s+/);
    if (parts.length > 1 && parts.every((p) => lower.includes(p))) {
      return KNOWLEDGE_BASE[keyword];
    }
  }

  // Booking intent detection
  if (/book|reserve|slot|available|timing|schedule/i.test(lower)) {
    return KNOWLEDGE_BASE.booking;
  }
  // Pricing intent
  if (/price|cost|rate|charge|₹|rs\.|rupees|cheap|expensive/i.test(lower)) {
    return KNOWLEDGE_BASE.price;
  }
  // Room intent
  if (/room|studio|space|place|setup/i.test(lower)) {
    return KNOWLEDGE_BASE.rooms;
  }
  // Location intent
  if (/where|location|address|area|near|patna|city/i.test(lower)) {
    return KNOWLEDGE_BASE.location;
  }
  // Payment intent
  if (/pay|payment|card|upi|money|transaction/i.test(lower)) {
    return KNOWLEDGE_BASE.payment;
  }
  // Greeting intent
  if (/^(hi|hello|hey|gm|ga|ge|good)/i.test(lower)) {
    return KNOWLEDGE_BASE.hello;
  }
  // Help intent
  if (/help|assist|support|problem|issue/i.test(lower)) {
    return KNOWLEDGE_BASE.help;
  }

  return KNOWLEDGE_BASE.default;
}

// ─── Unique ID ────────────────────────────────────────
let messageIdCounter = 0;
function generateId() {
  return `msg_${++messageIdCounter}_${Date.now()}`;
}

// ─── ChatBot Component ────────────────────────────────
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      text: "Hey there! I am your Snapforest Assistant. I can help you find studios, check prices, explain the booking process, or answer any questions. Just ask me anything — I am here to help!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasNotification, setHasNotification] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Speech synthesis
  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = "en-IN";

      // Try to use a good Indian English voice
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(
        (v) => v.lang.includes("en-IN") || v.lang.includes("en-GB")
      );
      if (indianVoice) utterance.voice = indianVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [voiceEnabled]
  );

  // Add message
  const addMessage = useCallback(
    (text: string, sender: "user" | "bot", isVoice = false) => {
      const message: ChatMessage = {
        id: generateId(),
        text,
        sender,
        timestamp: new Date(),
        isVoice,
      };
      setMessages((prev) => [...prev, message]);
      return message;
    },
    []
  );

  // Send message handler
  const sendMessage = useCallback(
    async (text: string, isVoice = false) => {
      if (!text.trim()) return;
      setInputText("");
      addMessage(text, "user", isVoice);
      setHasNotification(false);
      setIsTyping(true);

      // Simulate AI processing delay
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000));

      const response = findBestResponse(text);
      addMessage(response, "bot", isVoice);
      setIsTyping(false);

      // Speak the response
      speak(response);
    },
    [addMessage, speak]
  );

  // Form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(inputText);
    },
    [inputText, sendMessage]
  );

  // Voice input (Speech Recognition)
  const startVoiceInput = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      addMessage("Sorry, voice input is not supported in your browser. Please type your message instead.", "bot");
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      sendMessage(transcript, true);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [sendMessage, addMessage]);

  const stopVoiceInput = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // Quick replies
  const quickReplies = [
    "How to book?",
    "Show all studios",
    "Pricing details",
    "What is Snapforest?",
  ];

  const handleQuickReply = useCallback(
    (reply: string) => {
      sendMessage(reply);
    },
    [sendMessage]
  );

  // Toggle voice
  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      if (!next) window.speechSynthesis.cancel();
      return next;
    });
  }, []);

  // Format time
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", damping: 15 }}
            onClick={() => {
              setIsOpen(true);
              setHasNotification(false);
            }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#ff6b8a] to-[#ff8e53] shadow-lg shadow-[#ff6b8a]/30 flex items-center justify-center hover:scale-110 transition-transform group"
          >
            {/* Humanoid icon on button */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="10" r="5" fill="white" fillOpacity="0.95"/>
              <circle cx="10.5" cy="9.5" r="0.9" fill="#1a1a1a"/>
              <circle cx="13.5" cy="9.5" r="0.9" fill="#1a1a1a"/>
              <path d="M9.5 11.5 Q12 13.5 14.5 11.5" stroke="#1a1a1a" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
              <path d="M6 9 Q7 3 12 3 Q17 3 18 9" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
              <path d="M4 21 Q4 15 12 15 Q20 15 20 21" fill="white" fillOpacity="0.3"/>
            </svg>
            {hasNotification && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center animate-pulse font-medium">
                1
              </span>
            )}
            <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-sm text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Ask Snapforest Assistant
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-2rem)] glass-card border border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-neon-cyan/20 via-neon-purple/10 to-transparent border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* Humanoid Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff6b8a] to-[#ff8e53] flex items-center justify-center overflow-hidden shadow-lg shadow-[#ff6b8a]/20">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Face */}
                      <circle cx="12" cy="10" r="5" fill="white" fillOpacity="0.9"/>
                      {/* Eyes */}
                      <circle cx="10.5" cy="9.5" r="0.8" fill="#1a1a1a"/>
                      <circle cx="13.5" cy="9.5" r="0.8" fill="#1a1a1a"/>
                      {/* Smile */}
                      <path d="M9.5 11.5 Q12 13.5 14.5 11.5" stroke="#1a1a1a" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
                      {/* Hair */}
                      <path d="M6 9 Q7 3 12 3 Q17 3 18 9" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
                      {/* Body */}
                      <path d="M4 21 Q4 15 12 15 Q20 15 20 21" fill="white" fillOpacity="0.3"/>
                    </svg>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1a1a1a] animate-pulse" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Snapforest Assistant</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    {isTyping ? (
                      <>
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-neon-cyan" />
                        <span className="text-neon-cyan">typing...</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                        <span className="text-green-400">Online</span> — Ready to help
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleVoice}
                  className={`p-2 rounded-lg transition-colors ${
                    voiceEnabled
                      ? "text-neon-cyan hover:bg-neon-cyan/10"
                      : "text-muted-foreground hover:bg-white/5"
                  }`}
                  title={voiceEnabled ? "Voice ON" : "Voice OFF"}
                >
                  {voiceEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.speechSynthesis.cancel();
                  }}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${
                    msg.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                      msg.sender === "user"
                        ? "bg-[#1a472a]"
                        : "bg-gradient-to-br from-[#ff6b8a] to-[#ff8e53] shadow-sm"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <User className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="10" r="5" fill="white" fillOpacity="0.9"/>
                        <circle cx="10.5" cy="9.5" r="0.8" fill="#1a1a1a"/>
                        <circle cx="13.5" cy="9.5" r="0.8" fill="#1a1a1a"/>
                        <path d="M9.5 11.5 Q12 13.5 14.5 11.5" stroke="#1a1a1a" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-neon-cyan/20 text-white rounded-tr-sm"
                        : "bg-white/5 text-white/90 rounded-tl-sm border border-white/5"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.sender === "user"
                          ? "text-neon-cyan/50"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                      {msg.isVoice && (
                        <Volume2 className="w-2.5 h-2.5 inline ml-1" />
                      )}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff6b8a] to-[#ff8e53] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="10" r="5" fill="white" fillOpacity="0.9"/>
                      <circle cx="10.5" cy="9.5" r="0.8" fill="#1a1a1a"/>
                      <circle cx="13.5" cy="9.5" r="0.8" fill="#1a1a1a"/>
                      <path d="M9.5 11.5 Q12 13.5 14.5 11.5" stroke="#1a1a1a" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#ff6b8a] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-[#ff8e53] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/70 hover:bg-neon-cyan/10 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="px-3 py-3 border-t border-white/5 flex items-center gap-2 flex-shrink-0 bg-black/20"
            >
              <button
                type="button"
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                  isListening
                    ? "bg-red-500/20 text-red-400 animate-pulse"
                    : "bg-white/5 text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/10"
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isListening
                    ? "Listening... speak now"
                    : "Type a message..."
                }
                className="flex-1 h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all"
                disabled={isListening}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isListening}
                className="p-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Listening Overlay */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff6b8a] to-[#ff8e53] flex items-center justify-center shadow-lg shadow-[#ff6b8a]/30"
                  >
                    <Mic className="w-8 h-8 text-white" />
                  </motion.div>
                  <p className="mt-4 text-white font-medium">Listening...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Speak clearly in English
                  </p>
                  <button
                    onClick={stopVoiceInput}
                    className="mt-4 px-4 py-2 rounded-lg bg-white/10 text-sm hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
