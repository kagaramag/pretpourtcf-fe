"use client";

import { useRef, useState, useEffect } from "react";
import { config } from "@/config";

export type TacheType = 1 | 2 | 3;

export const TACHE_TIME_LIMITS: Record<TacheType, number> = {
  1: 120,
  2: 240,
  3: 240,
};

export const CONSIGNE_AUDIO: Record<TacheType, string> = {
  1: `${config.cloudFlarePublicUrl}instruction/pretpourtcf-eo-1.mp3`,
  2: `${config.cloudFlarePublicUrl}instruction/pretpourtcf-eo-2.mp3`,
  3: `${config.cloudFlarePublicUrl}instruction/pretpourtcf-eo-3.mp3`,
};

// ─── Flip-clock digit ────────────────────────────────────────────────
function FlipDigit({ value }: { value: string }) {
  return (
    <div className="w-10 h-14 flex items-center justify-center text-lg">
      {value}
    </div>
  );
}

export function CountdownTimer({ timeRemaining }: { timeRemaining: number }) {
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const d = (n: number, i: number) =>
    String(Math.floor(i === 0 ? n / 10 : n % 10));

  return (
    <div className="flex items-center gap-1 bg-gray-50 rounded-xl ">
      <FlipDigit value={d(mins, 0)} />
      <FlipDigit value={d(mins, 1)} />
      <span className="text-3xl text-gray-900 mx-1">:</span>
      <FlipDigit value={d(secs, 0)} />
      <FlipDigit value={d(secs, 1)} />
    </div>
  );
}

// ─── Waveform visualiser (canvas + AnalyserNode) ─────────────────────
const WAVE_COLORS = ["#4e56c0", "#69edcd", "#d78fee", "#d0342f"];

export function WaveformVisualizer({
  analyserNode,
  isActive,
}: {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setColorIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setColorIndex((i) => (i + 1) % WAVE_COLORS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!analyserNode || !isActive) {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserNode.getByteTimeDomainData(dataArray);
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = WAVE_COLORS[colorIndex];
      ctx.beginPath();
      const sliceWidth = width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };
    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyserNode, isActive, colorIndex]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={80}
      className="w-full max-w-sm h-20 rounded-lg"
    />
  );
}
