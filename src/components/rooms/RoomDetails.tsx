"use client";

import { motion } from "framer-motion";
import {
  Wifi,
  Bed,
  Wind,
  Coffee,
  Utensils,
  Shield,
  Tv,
  Users,
  Clock,
  MapPin,
  AlertCircle,
} from "lucide-react";

interface RoomDetailsProps {
  room: {
    name: string;
    description: string;
    address: string;
    capacity: number;
    equipment: string[];
    amenities: string[];
    facilities: string[];
    rules: string[];
    checkinTime?: string;
    checkoutTime?: string;
    mapLink?: string;
    pricePerHour: number;
    pricePerDay: number;
  };
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-5 h-5" />,
  bed: <Bed className="w-5 h-5" />,
  ac: <Wind className="w-5 h-5" />,
  coffee: <Coffee className="w-5 h-5" />,
  kitchen: <Utensils className="w-5 h-5" />,
  security: <Shield className="w-5 h-5" />,
  tv: <Tv className="w-5 h-5" />,
};

export default function RoomDetails({ room }: RoomDetailsProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Room Info Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Users className="w-5 h-5 text-neon-cyan" />
          <span className="text-sm text-muted-foreground">
            Capacity: <span className="text-white font-semibold">{room.capacity} Guests</span>
          </span>
        </div>
        <p className="text-sm sm:text-base text-[#888888] leading-relaxed">
          {room.description}
        </p>
      </motion.div>

      {/* Location & Timings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 rounded-lg bg-white/5 border border-white/10"
      >
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-1" />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Location</p>
            <p className="text-sm text-white font-medium">{room.address}</p>
            {room.mapLink && (
              <a
                href={room.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neon-cyan hover:underline mt-1 inline-block"
              >
                View on Map
              </a>
            )}
          </div>
        </div>

        {(room.checkinTime || room.checkoutTime) && (
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Check-in/Out</p>
              <p className="text-sm text-white font-medium">
                {room.checkinTime && `Check-in: ${room.checkinTime}`}
                {room.checkinTime && room.checkoutTime && " • "}
                {room.checkoutTime && `Check-out: ${room.checkoutTime}`}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Equipment */}
      {room.equipment && room.equipment.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Equipment</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {room.equipment.map((item, idx) => (
              <div
                key={idx}
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/5 border border-white/10 text-xs sm:text-sm text-white hover:bg-white/10 transition-colors"
              >
                ✓ {item}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Amenities */}
      {room.amenities && room.amenities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {room.amenities.map((amenity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 text-xs sm:text-sm text-white"
              >
                {amenityIcons[amenity.toLowerCase()] || <Wifi className="w-5 h-5 text-neon-cyan" />}
                <span className="font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Facilities */}
      {room.facilities && room.facilities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Facilities</h3>
          <ul className="space-y-2">
            {room.facilities.map((facility, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#888888]">
                <span className="text-neon-cyan font-bold mt-1">✓</span>
                <span>{facility}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Rules */}
      {room.rules && room.rules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="p-4 sm:p-5 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <h3 className="text-base sm:text-lg font-semibold text-red-300">House Rules</h3>
          </div>
          <ul className="space-y-2">
            {room.rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-red-200/80">
                <span className="font-bold mt-1">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Pricing Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 gap-4 p-4 sm:p-5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20"
      >
        <div>
          <p className="text-xs text-neon-cyan/80 mb-1">Hourly Rate</p>
          <p className="text-lg sm:text-xl font-bold text-neon-cyan">₹{room.pricePerHour}</p>
        </div>
        <div>
          <p className="text-xs text-neon-cyan/80 mb-1">Daily Rate</p>
          <p className="text-lg sm:text-xl font-bold text-neon-cyan">₹{room.pricePerDay}</p>
        </div>
      </motion.div>
    </div>
  );
}
