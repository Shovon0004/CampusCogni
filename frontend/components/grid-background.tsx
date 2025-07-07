"use client"

import { motion } from "framer-motion"

export function GridBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />

      {/* Main grid pattern - with blur effect */}
      <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.25] blur-[0.5px]">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(currentColor 1px, transparent 1px),
              linear-gradient(90deg, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
          animate={{
            backgroundPosition: ["0px 0px", "40px 40px"],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="text-black/60 dark:text-white/60"
        />
      </div>

      {/* Secondary grid pattern - larger squares with more blur */}
      <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15] blur-[1px]">
        <div
          className="w-full h-full text-black/40 dark:text-white/40"
          style={{
            backgroundImage: `
              linear-gradient(currentColor 1px, transparent 1px),
              linear-gradient(90deg, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "120px 120px",
          }}
        />
      </div>

      {/* Diagonal lines - subtle with blur */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.12] blur-[1.5px]">
        <div
          className="w-full h-full text-black/30 dark:text-white/30"
          style={{
            backgroundImage: `
              linear-gradient(45deg, currentColor 0.5px, transparent 0.5px),
              linear-gradient(-45deg, currentColor 0.5px, transparent 0.5px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Dot pattern overlay - very subtle */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] blur-[2px]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle, rgb(0 0 0 / 0.6) 0.5px, transparent 0.5px)`,
            backgroundSize: "25px 25px",
          }}
          className="text-black dark:text-white"
        />
      </div>

      {/* Floating geometric elements - softer and blurred */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-3 h-3 bg-black/20 dark:bg-white/20 rounded-full blur-[1px]"
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/3 w-2 h-12 bg-black/15 dark:bg-white/15 blur-[1.5px]"
          animate={{
            rotate: [0, 180, 360],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-4 h-4 bg-black/18 dark:bg-white/18 rotate-45 blur-[1px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.18, 0.35, 0.18],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 w-1.5 h-1.5 bg-black/25 dark:bg-white/25 rounded-full blur-[0.5px]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.25, 0.5, 0.25],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-2/3 left-1/3 w-1 h-6 bg-black/12 dark:bg-white/12 blur-[2px]"
          animate={{
            rotate: [0, 90, 180],
            opacity: [0.12, 0.25, 0.12],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Radial gradients for depth - softer with blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-black/6 dark:from-white/6 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-radial from-black/6 dark:from-white/6 to-transparent blur-3xl" />

      {/* Additional corner accents - very subtle */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-radial from-black/4 dark:from-white/4 to-transparent blur-2xl" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-gradient-radial from-black/4 dark:from-white/4 to-transparent blur-2xl" />

      {/* Overlay to further soften the entire background */}
      <div className="absolute inset-0 bg-background/10 backdrop-blur-[0.5px]" />
    </div>
  )
}
