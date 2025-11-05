"use client";

import { useEffect, useRef } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

export default function AudioPlayer({ src }: any) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<Plyr | null>(null);

  useEffect(() => {
    if (audioRef.current && !playerRef.current) {
      playerRef.current = new Plyr(audioRef.current, {
        controls: ["play", "progress", "current-time", "mute", "volume"],
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full">
      <audio className="w-full" ref={audioRef} controls controlsList="nodownload">
        <source src={src} type="audio/mpeg" />
      </audio>
    </div>
  );
}
