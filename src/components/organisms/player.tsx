"use client";

import { useEffect, useRef, useState } from "react";
import "plyr/dist/plyr.css";

export default function AudioPlayer({ src }: any) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const initPlayer = async () => {
      if (audioRef.current && !playerRef.current) {
        const Plyr = (await import("plyr")).default;
        playerRef.current = new Plyr(audioRef.current, {
          controls: ["play", "progress", "current-time", "mute", "volume"],
        });
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isClient]);

  useEffect(() => {
    if (playerRef.current && audioRef.current) {
      // Reset the audio when src changes
      audioRef.current.load();
      playerRef.current.currentTime = 0;

      // Play automatically if autoplay is enabled
      if (autoplay) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }
  }, [src, autoplay]);

  return (
    <div className="w-full space-y-2 relative">
      <div className="absolute -top-4 right-3 z-20">
        <button
          onClick={() => setAutoplay(!autoplay)}
          className={`px-3 py-1 text-xs flex items-center rounded-full transition-colors  ${
            autoplay
              ? "bg-accent text-white hover:primary"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Autoplay: <div className="w-8">{autoplay ? "ON" : "OFF"}</div>
        </button>
      </div>
      <audio
        className="w-full"
        ref={audioRef}
        controls
        controlsList="nodownload"
      >
        <source src={src} type="audio/mpeg" />
      </audio>
    </div>
  );
}
