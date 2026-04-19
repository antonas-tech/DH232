"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayerStore, type PlayerTrack } from "@/store/player";

export function PlayBeatButton({ track }: { track: PlayerTrack }) {
  const { track: current, isPlaying, load, toggle } = usePlayerStore();
  const isCurrent = current?.id === track.id;
  const showPause = isCurrent && isPlaying;

  return (
    <Button
      size="icon"
      variant={isCurrent ? "default" : "outline"}
      onClick={() => {
        if (isCurrent) toggle();
        else load(track);
      }}
      aria-label={showPause ? "Pause" : "Play"}
    >
      {showPause ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </Button>
  );
}
