"use client";

import { create } from "zustand";

export type PlayerTrack = {
  id: string;
  title: string;
  subtitle?: string;
  src: string;
  coverUrl?: string | null;
};

type PlayerState = {
  track: PlayerTrack | null;
  isPlaying: boolean;
  volume: number;
  duration: number;
  currentTime: number;

  load: (track: PlayerTrack) => void;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  setDuration: (d: number) => void;
  setCurrentTime: (t: number) => void;
  seek: (t: number) => void;
  _seekRequest: number | null;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  track: null,
  isPlaying: false,
  volume: 0.85,
  duration: 0,
  currentTime: 0,
  _seekRequest: null,

  load: (track) =>
    set(() => ({
      track,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    })),

  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () =>
    set({
      track: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    }),

  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
  setDuration: (d) => set({ duration: d }),
  setCurrentTime: (t) => set({ currentTime: t }),
  seek: (t) => set({ _seekRequest: t }),
}));
