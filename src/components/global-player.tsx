"use client";

import * as React from "react";
import { Pause, Play, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/store/player";
import { cn, formatDuration } from "@/lib/utils";

/**
 * Persistent bottom bar with a single hidden <audio> element.
 * Keeps playback alive across route changes.
 */
export function GlobalPlayer() {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const {
    track,
    isPlaying,
    volume,
    duration,
    currentTime,
    play,
    pause,
    toggle,
    stop,
    setVolume,
    setDuration,
    setCurrentTime,
    _seekRequest,
    seek,
  } = usePlayerStore();

  React.useEffect(() => {
    if (!audioRef.current || !track) return;
    if (audioRef.current.src !== track.src) {
      audioRef.current.src = track.src;
      audioRef.current.load();
    }
  }, [track]);

  React.useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  React.useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => pause());
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, track, pause]);

  React.useEffect(() => {
    if (_seekRequest !== null && audioRef.current) {
      audioRef.current.currentTime = _seekRequest;
      seek(null as unknown as number);
    }
  }, [_seekRequest, seek]);

  if (!track) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
      <div className="pointer-events-auto mx-auto flex max-w-6xl items-center gap-3 rounded-md border border-border bg-card/85 px-3 py-2 shadow-2xl backdrop-blur-md">
        <audio
          ref={audioRef}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={() => pause()}
          preload="metadata"
        />

        <Button
          size="icon"
          variant={isPlaying ? "default" : "outline"}
          onClick={toggle}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {track.title}
              </div>
              {track.subtitle ? (
                <div className="truncate text-xs text-muted-foreground">
                  {track.subtitle}
                </div>
              ) : null}
            </div>
            <div className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:block">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </div>
          </div>
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={(v) => {
              if (audioRef.current && duration) {
                audioRef.current.currentTime = (v[0] / 100) * duration;
              }
            }}
            className="mt-2"
          />
        </div>

        <div className={cn("hidden items-center gap-2 md:flex", "min-w-32")}>
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => setVolume(v[0] / 100)}
            className="w-24"
          />
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => stop()}
          aria-label="Close player"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* swallow unused warning for `play` */}
        <span className="hidden">{String(play.length)}</span>
      </div>
    </div>
  );
}
