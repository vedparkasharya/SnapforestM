import RoomList from "@/components/rooms/RoomList";

export default function RoomsPage() {
  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Browse <span className="text-neon-cyan">Studios</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Find and book the perfect creator space in Patna
        </p>
      </div>
      <RoomList />
    </main>
  );
}
