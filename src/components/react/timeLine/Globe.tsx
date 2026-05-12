"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [18 / 255, 14 / 255, 34 / 255],
  markerColor: [220 / 255, 212 / 255, 255 / 255],
  glowColor: [201 / 255, 191 / 255, 255 / 255],
  markers: [
    { location: [14.5995, 120.9842], size: 0.025 },
    { location: [19.076, 72.8777], size: 0.065 },
    { location: [23.8103, 90.4125], size: 0.04 },
    { location: [30.0444, 31.2357], size: 0.05 },
    { location: [39.9042, 116.4074], size: 0.055 },
    { location: [-23.5505, -46.6333], size: 0.065 },
    { location: [19.4326, -99.1332], size: 0.06 },
    { location: [40.7128, -74.006], size: 0.065 },
    { location: [34.6937, 135.5022], size: 0.04 },
    { location: [41.0082, 28.9784], size: 0.045 },
  ],
};

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
}) {
  let phi = 0;
  let width = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };

    window.addEventListener("resize", onResize);
    onResize();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderScale = reducedMotion ? 1 : 2;

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      devicePixelRatio: reducedMotion ? 1 : config.devicePixelRatio,
      mapSamples: reducedMotion ? 6000 : config.mapSamples,
      width: width * renderScale,
      height: width * renderScale,
      onRender: (state) => {
        phi += reducedMotion ? 0 : 0.005;
        state.phi = phi;
        state.width = width * renderScale;
        state.height = width * renderScale;
      },
    });

    setTimeout(() => (canvasRef.current!.style.opacity = "1"), 0);
    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [config]);

  return (
    <div
      className={cn(
        "absolute inset-0 -z-10 aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 ml-32 [contain:layout_paint_size] md:group-hover:scale-[1.02] transition-all duration-500",
        )}
        ref={canvasRef}
      />
    </div>
  );
}
