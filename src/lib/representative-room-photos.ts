/**
 * Real editorial stock photographs for the demo catalogue.
 * These are representative reference images, not photographs of the named Patna venues.
 * Replace them with venue-owner photos before treating a listing as a verified real location.
 */
const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;

export const representativeRoomPhotos: Record<string, string[]> = {
  music: [
    u("photo-1734383172782-d57707506342"),
    u("photo-1574198443869-a58c763e411d"),
    u("photo-1520523839897-bd0b52f945a0"),
  ],
  podcast: [
    u("photo-1590602847861-f357a9332bbc"),
    u("photo-1734383172782-d57707506342"),
    u("photo-1574198443869-a58c763e411d"),
  ],
  youtube: [
    u("photo-1648740678671-c37d78567ea8"),
    u("photo-1574198443869-a58c763e411d"),
    u("photo-1516035069371-29a1b244cc32"),
  ],
  photography: [
    u("photo-1648740678671-c37d78567ea8"),
    u("photo-1516035069371-29a1b244cc32"),
    u("photo-1526170375885-4d8ecf77b99f"),
  ],
  gaming: [
    u("photo-1726442116417-de02f3116eed"),
    u("photo-1542751371-adc38448a05e"),
    u("photo-1593305841991-05c297ba4575"),
  ],
  streaming: [
    u("photo-1574198443869-a58c763e411d"),
    u("photo-1648740678671-c37d78567ea8"),
    u("photo-1516035069371-29a1b244cc32"),
  ],
  dance: [
    u("photo-1524594152303-9fd13543fe6e"),
    u("photo-1518611012118-696072aa579a"),
    u("photo-1524594152303-9fd13543fe6e"),
  ],
  coworking: [
    u("photo-1497366754035-f200968a6e72"),
    u("photo-1524758631624-e2822e304c36"),
    u("photo-1497366811353-6870744d04b2"),
  ],
  meeting: [
    u("photo-1497366754035-f200968a6e72"),
    u("photo-1524758631624-e2822e304c36"),
    u("photo-1497366811353-6870744d04b2"),
  ],
};

export function representativeRoomImage(category?: string) {
  return representativeRoomPhotos[(category || "").toLowerCase()]?.[0] || u("photo-1648740678671-c37d78567ea8");
}
