import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
        <p className="text-muted-foreground text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
