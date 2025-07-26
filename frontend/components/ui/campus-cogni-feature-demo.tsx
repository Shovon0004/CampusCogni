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
import { Users, Briefcase, TrendingUp, Shield, SparklesIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type WrapperStyle = MotionStyle & {
  "--x": MotionValue<string>
  "--y": MotionValue<string>
}

const steps = [
  { id: "1", name: "" },
  { id: "2", name: "" },
  { id: "3", name: "" },
  { id: "4", name: "" },
]


interface CardProps {
  title: string
  description: string
  bgClass?: string
}

function FeatureCard({
  title,
  description,
  bgClass,
  children,
}: CardProps & {
  children: React.ReactNode
}) {
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
            <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
              {title}
            </h2>
            <p className="text-sm leading-5 text-neutral-300 dark:text-zinc-400 sm:text-base sm:leading-5">
              <Balancer>{description}</Balancer>
            </p>
          </div>
          {mounted ? children : null}
        </div>
      </div>
    </motion.div>
  )
}

function IconCheck({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn("size-4", className)}
      {...props}
    >
      <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
    </svg>
  )
}

interface StepsProps {
  steps: { id: string; name: string }[]
  current: number
  onChange: (stepIdx: number) => void
}

export function Steps({ steps, current, onChange }: StepsProps) {
  return (
    <nav aria-label="Progress" className="flex justify-center px-4">
      <ol
        className="flex w-full flex-wrap items-start justify-start gap-2 sm:justify-center md:w-10/12 md:divide-y-0"
        role="list"
      >
        {steps.map((step, stepIdx) => {
          const isCompleted = current > stepIdx
          const isCurrent = current === stepIdx
          const isFuture = !isCompleted && !isCurrent
          return (
            <li
              className={cn(
                "relative z-50 rounded-full px-3 py-1 transition-all duration-300 ease-in-out md:flex",
                isCompleted ? "bg-neutral-500/20" : "bg-neutral-500/10"
              )}
              key={`${step.name}-${stepIdx}`}
            >
              <div
                className={cn(
                  "group flex w-full cursor-pointer items-center focus:outline-none focus-visible:ring-2",
                  (isFuture || isCurrent) && "pointer-events-none"
                )}
                onClick={() => onChange(stepIdx)}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-full duration-300",
                      isCompleted &&
                        "bg-primary/80 size-4 text-white",
                      isCurrent &&
                        "bg-primary/60 size-4 p-2 text-neutral-400 dark:bg-neutral-500/50",
                      isFuture &&
                        "bg-primary/20 size-4 p-2 dark:bg-neutral-500/20"
                    )}
                  >
                    {isCompleted ? (
                      <IconCheck className="size-3 stroke-white stroke-[3] text-white" />
                    ) : (
                      <span
                        className={cn(
                          "text-xs",
                          !isCurrent && "text-white"
                        )}
                      >
                        {stepIdx + 1}
                      </span>
                    )}
                  </span>
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function useNumberCycler() {
  const [currentNumber, setCurrentNumber] = useState(0)
  const [dummy, setDummy] = useState(0)

  const increment = () => {
    setCurrentNumber((prevNumber) => {
      return (prevNumber + 1) % 4
    })
    setDummy((prev) => prev + 1)
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentNumber((prevNumber) => {
        return (prevNumber + 1) % 4
      })
    }, 3000)

    return () => {
      clearInterval(intervalId)
    }
  }, [dummy])

  return {
    increment,
    currentNumber,
  }
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

const features = [
  {
    icon: Users,
    title: "Smart Matching",
    description: "AI-powered matching between students and recruiters based on skills, experience, and requirements. Our intelligent algorithm ensures perfect compatibility for successful placements and career growth.",
  },
  {
    icon: Briefcase,
    title: "Campus Focused", 
    description: "Designed specifically for campus recruitment drives and college placements. Streamlined process for educational institutions, career centers, and placement committees.",
  },
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    description: "Track application progress and recruitment metrics in real-time. Get comprehensive insights that help you make better hiring decisions and optimize your recruitment process.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Enterprise-grade security for all your recruitment data and communications. Your data is always protected with industry-standard encryption, compliance, and privacy measures.",
  },
]

export function CampusCogniFeatureCard() {
  const { currentNumber: step, increment } = useNumberCycler()

  return (
    <FeatureCard 
      title="CampusCogni Features"
      description="Experience the power of intelligent campus recruitment with our cutting-edge platform."
      bgClass="lg:bg-gradient-to-tr"
    >
      {/* Feature content animations based on step */}
      <div className="relative">
        {/* Step 1 - Smart Matching */}
        <motion.div
          className={cn(
            "absolute left-1/4 top-[30%] w-[50%] p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl border border-stone-100/10 transition-all duration-500 dark:border-stone-700/50",
            "md:group-hover:translate-y-2",
            { "-translate-x-36 opacity-0": step > 0 }
          )}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: step === 0 ? 1 : 0, x: step > 0 ? -100 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Smart Matching</h3>
          </div>
          <p className="text-sm text-neutral-300">AI-powered compatibility</p>
        </motion.div>

        <motion.div
          className={cn(
            "absolute left-[69%] top-[21%] w-3/5 p-4 bg-gradient-to-br from-blue-400/15 to-blue-500/5 rounded-2xl border border-stone-100/10 transition-all duration-500 dark:border-stone-700/50",
            "md:group-hover:-translate-y-6",
            { "-translate-x-24 opacity-0": step > 0 }
          )}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: step === 0 ? 1 : 0, x: step > 0 ? -50 : 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-blue-500/30 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-300" />
            </div>
            <p className="text-xs text-neutral-400">Match Score: 98%</p>
          </div>
        </motion.div>

        {/* Step 2 - Campus Focused */}
        <motion.div
          className={cn(
            "absolute left-1/4 top-[30%] w-[50%] p-6 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl border border-stone-100/10 transition-all duration-500 dark:border-stone-700",
            "md:group-hover:translate-y-2",
            { "translate-x-36 opacity-0": step < 1 },
            { "-translate-x-36 opacity-0": step > 1 }
          )}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: step === 1 ? 1 : 0, x: step < 1 ? 100 : step > 1 ? -100 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Briefcase className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Campus Focused</h3>
          </div>
          <p className="text-sm text-neutral-300">Built for universities</p>
        </motion.div>

        <motion.div
          className={cn(
            "absolute left-[calc(50%+27px+1rem)] top-[21%] w-2/5 p-4 bg-gradient-to-br from-green-400/15 to-green-500/5 rounded-2xl border border-stone-100/10 transition-all duration-500 dark:border-stone-700",
            "md:group-hover:-translate-y-6",
            { "translate-x-24 opacity-0": step < 1 },
            { "-translate-x-24 opacity-0": step > 1 }
          )}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: step === 1 ? 1 : 0, x: step < 1 ? 50 : step > 1 ? -50 : 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-green-500/30 rounded-full flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-green-300" />
            </div>
            <p className="text-xs text-neutral-400">Campus Ready</p>
          </div>
        </motion.div>

        {/* Step 3 - Real-time Analytics */}
        <motion.div
          className={cn(
            "absolute left-[68px] top-[30%] w-[90%] p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl border border-stone-100/10 transition-all duration-500 dark:border-stone-700",
            { "translate-x-36 opacity-0": step < 2 },
            { "-translate-x-36 opacity-0": step > 2 },
            { "opacity-90": step === 2 }
          )}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: step === 2 ? 0.9 : 0, x: step < 2 ? 100 : step > 2 ? -100 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Real-time Analytics</h3>
          </div>
          <p className="text-sm text-neutral-300">Track progress and metrics</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="p-2 bg-purple-500/20 rounded text-center">
              <div className="text-lg font-bold text-purple-300">89%</div>
              <div className="text-xs text-neutral-400">Success Rate</div>
            </div>
            <div className="p-2 bg-purple-500/20 rounded text-center">
              <div className="text-lg font-bold text-purple-300">1.2k</div>
              <div className="text-xs text-neutral-400">Applications</div>
            </div>
            <div className="p-2 bg-purple-500/20 rounded text-center">
              <div className="text-lg font-bold text-purple-300">24h</div>
              <div className="text-xs text-neutral-400">Avg Response</div>
            </div>
          </div>
        </motion.div>

        {/* Step 4 - Secure Platform */}
        <motion.div
          className={cn(
            "absolute left-2/4 top-1/3 w-full -translate-x-1/2 -translate-y-[33%] flex flex-col gap-4 text-center transition-all duration-500 md:w-3/5",
            { "translate-x-0 opacity-0": step < 3 }
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: step === 3 ? 1 : 0, scale: step === 3 ? 1 : 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-8 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl border border-stone-100/10 dark:border-zinc-700">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-red-400" />
              <h3 className="text-2xl font-bold text-white">Secure Platform</h3>
            </div>
            <p className="text-neutral-300 mb-6">Enterprise-grade security for all your recruitment data</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <div className="text-sm font-semibold text-red-300">256-bit Encryption</div>
                <div className="text-xs text-neutral-400">Bank-level security</div>
              </div>
              <div className="p-3 bg-red-500/20 rounded-lg">
                <div className="text-sm font-semibold text-red-300">GDPR Compliant</div>
                <div className="text-xs text-neutral-400">Privacy protected</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Steps indicator */}
        <div className="absolute left-48 top-5 z-50 size-full cursor-pointer md:left-0">
          <Steps current={step} onChange={() => {}} steps={steps} />
        </div>
      </div>

      {/* Click area to advance */}
      <div
        className="absolute right-0 top-0 z-50 size-full cursor-pointer md:left-0"
        onClick={() => increment()}
      />
    </FeatureCard>
  )
}

export function CampusCogniFeatureDemo() {
  return (
    <section className="relative my-14 w-full overflow-hidden" id="features">
      <div className="p-2">
        <div className="mb-8 mx-auto pt-4 md:container">
          <div className="mx-auto">
            <div className="flex w-full items-center justify-center">
              <Badge
                variant="outline"
                className="mb-8 rounded-[14px] border border-black/10 bg-white text-base dark:border dark:border-white/10 dark:bg-transparent md:left-6"
              >
                <SparklesIcon className="fill-[#EEBDE0] stroke-1 text-neutral-800" />
                Platform Features
              </Badge>
            </div>

            <div className="mx-auto max-w-4xl rounded-[34px] bg-neutral-700">
              <div className="relative z-10 grid w-full gap-8 rounded-[28px] bg-neutral-950 p-2">
                <FeatureCard title="CampusCogni Features" description="Experience the power of intelligent campus recruitment with our cutting-edge platform.">
                  {/* No additional content for children */}
                  <>
                  </>
                </FeatureCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}