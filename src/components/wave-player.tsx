"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

type WS = import("wavesurfer.js").default;

/**
 * Compact WaveSurfer-based audio player for the judge panel.
 */
export function WavePlayer({
  src,
  height = 64,
}: {
  src: string;
  height?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const wsRef = React.useRef<WS | null>(null);
  const [ready, setReady] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    let cleanup: () => void = () => {};
    (async () => {
      const { default: WaveSurfer } = await import("wavesurfer.js");
      if (!active || !containerRef.current) return;
      const ws = WaveSurfer.create({
        container: containerRef.current,
        height,
        waveColor: "#444",
        progressColor: "hsl(84 100% 59%)",
        cursorColor: "#fff",
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        normalize: true,
      });
      ws.load(src);
      wsRef.current = ws;
      const onReady = () => {
        setReady(true);
        setDuration(ws.getDuration());
      };
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onFinish = () => setIsPlaying(false);
      const onTime = (t: number) => setCurrent(t);
      ws.on("ready", onReady);
      ws.on("play", onPlay);
      ws.on("pause", onPause);
      ws.on("finish", onFinish);
      ws.on("timeupdate", onTime);
      cleanup = () => {
        try {
          ws.destroy();
        } catch {
          /* ignore */
        }
      };
    })();
    return () => {
      active = false;
      cleanup();
    };
  }, [src, height]);

  function toggle() {
    wsRef.current?.playPause();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant={isPlaying ? "default" : "outline"}
          onClick={toggle}
          disabled={!ready}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <div className="flex-1">
          <div ref={containerRef} className="ws-wrap" />
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {formatDuration(current)} / {formatDuration(duration)}
        </div>
      </div>
    </div>
  );
}
