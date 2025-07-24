import React from "react"
import { motion } from "framer-motion"

const DURATION = 0.25
const STAGGER = 0.025

interface FlipLinkProps {
  children: string
  href?: string
  className?: string
  onClick?: () => void
}

const FlipLink: React.FC<FlipLinkProps> = ({ children, href, className = "", onClick }) => {
  const Component = href ? motion.a : motion.div

  return (
    <Component
      initial="initial"
      whileHover="hovered"
      target={href ? "_blank" : undefined}
      href={href}
      onClick={onClick}
      className={`relative block whitespace-nowrap text-4xl font-semibold uppercase dark:text-white/90 sm:text-7xl md:text-8xl cursor-pointer ${className}`}
      style={{
        lineHeight: 1.1,
        overflow: 'visible',
      }}
    >
      <div className="relative" style={{ overflow: 'hidden', height: '1.1em' }}>
        {children.split("").map((l, i) => (
          <motion.span
            variants={{
              initial: {
                y: 0,
              },
              hovered: {
                y: "-100%",
              },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
            className="inline-block"
            key={i}
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </div>
      <div className="absolute inset-0" style={{ overflow: 'hidden', height: '1.1em' }}>
        {children.split("").map((l, i) => (
          <motion.span
            variants={{
              initial: {
                y: "100%",
              },
              hovered: {
                y: 0,
              },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
            className="inline-block"
            key={i}
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </div>
    </Component>
  )
}

export { FlipLink }
