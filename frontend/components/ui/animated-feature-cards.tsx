"use client"

import { useEffect, useState, type MouseEvent } from "react"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type MotionStyle,
  type MotionValue,
} from "framer-motion"
import Balancer from "react-wrap-balancer"
import { Users, Briefcase, TrendingUp, Shield } from "lucide-react"

import { cn } from "@/lib/utils"

type WrapperStyle = MotionStyle & {
  "--x": MotionValue<string>
  "--y": MotionValue<string>
}

interface CardProps {
  title: string
  description: string
  bgClass?: string
  icon: React.ComponentType<{ className?: string }>
}

function FeatureCard({
  title,
  description,
  bgClass,
  icon: Icon,
}: CardProps) {
  const [mounted, setMounted] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const isMobile = useIsMobile()

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    if (isMobile) return
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.div
      className="animated-cards relative w-full rounded-[16px]"
      onMouseMove={handleMouseMove}
      style={
        {
          "--x": useMotionTemplate`${mouseX}px`,
          "--y": useMotionTemplate`${mouseY}px`,
        } as WrapperStyle
      }
    >
      <div
        className={cn(
          "group relative w-full overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-b from-neutral-900/90 to-stone-800 transition duration-300 dark:from-neutral-950/90 dark:to-neutral-800/90",
          "md:hover:border-transparent",
          bgClass
        )}
      >
        <div className="m-10 min-h-[550px] w-full">
          <div className="flex w-4/6 flex-col gap-3">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
              {title}
            </h2>
            <p className="text-sm leading-5 text-neutral-300 dark:text-zinc-400 sm:text-base sm:leading-5">
              <Balancer>{description}</Balancer>
            </p>
          </div>
          {mounted ? (
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl" />
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent
    const isSmall = window.matchMedia("(max-width: 768px)").matches
    const isMobileDevice = Boolean(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.exec(
        userAgent
      )
    )

    const isDev = process.env.NODE_ENV !== "production"
    if (isDev) {
      setIsMobile(isSmall || isMobileDevice)
      return
    }

    setIsMobile(isSmall && isMobileDevice)
  }, [])

  return isMobile
}

export function AnimatedFeatureCards() {
  const features = [
    {
      icon: Users,
      title: "Smart Matching",
      description: "AI-powered matching between students and recruiters based on skills and requirements. Our intelligent algorithm ensures perfect compatibility for successful placements.",
    },
    {
      icon: Briefcase,
      title: "Campus Focused",
      description: "Designed specifically for campus recruitment drives and college placements. Streamlined process for educational institutions and career centers.",
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Track application progress and recruitment metrics in real-time. Get insights that help you make better hiring decisions and optimize your recruitment process.",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security for all your recruitment data and communications. Your data is always protected with industry-standard encryption and compliance.",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-7xl mx-auto px-4">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <FeatureCard
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
          />
        </motion.div>
      ))}
    </div>
  )
}
