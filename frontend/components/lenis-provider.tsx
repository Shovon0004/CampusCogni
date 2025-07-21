"use client";

import { useEffect } from "react";

export function LenisProvider() {
  useEffect(() => {
    let lenis: any;
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        lerp: 0.1,
        smooth: true,
      });
      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    });
    return () => {
      if (lenis && lenis.destroy) lenis.destroy();
    };
  }, []);
  return null;
} 