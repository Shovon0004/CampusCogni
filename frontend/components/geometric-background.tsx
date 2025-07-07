"use client"

import { motion } from "framer-motion"

export function GeometricBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />

      {/* Geometric shapes */}
      <div className="absolute inset-0">
        {/* Large circles */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/5 to-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-secondary/5 to-secondary/10 blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary/20 rounded-full"
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-6 h-6 bg-secondary/20 rotate-45"
          animate={{
            y: [20, -20, 20],
            rotate: [45, 135, 45],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-3 h-3 bg-accent/30 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  )
}
