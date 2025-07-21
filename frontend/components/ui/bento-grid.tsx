"use client";

import { cn } from "@/lib/utils";
import {
    CheckCircle,
    Clock,
    Star,
    TrendingUp,
    Video,
    Globe,
} from "lucide-react";

export interface BentoItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    status?: string;
    tags?: string[];
    meta?: string;
    cta?: string;
    colSpan?: number;
    hasPersistentHover?: boolean;
    onClick?: () => void;
    children?: React.ReactNode;
}

interface BentoGridProps {
    items: BentoItem[];
    className?: string;
}

const itemsSample: BentoItem[] = [
    {
        title: "Analytics Dashboard",
        meta: "v2.4.1",
        description:
            "Real-time metrics with AI-powered insights and predictive analytics",
        icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
        status: "Live",
        tags: ["Statistics", "Reports", "AI"],
        colSpan: 2,
        hasPersistentHover: true,
    },
    {
        title: "User Management",
        meta: "v1.2.0",
        description: "Comprehensive user roles and permissions system",
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        status: "Active",
        tags: ["Users", "Security"],
        colSpan: 1,
    },
    {
        title: "Content Library",
        meta: "v3.1.0",
        description: "Organized media assets with smart categorization",
        icon: <Video className="w-4 h-4 text-purple-500" />,
        status: "Beta",
        tags: ["Media", "Storage"],
        colSpan: 1,
    },
];

function BentoGrid({ items = itemsSample, className }: BentoGridProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-3 p-4 max-w-7xl mx-auto", className)}>
            {items.map((item, index) => (
                <div
                    key={index}
                    onClick={item.onClick}
                    className={cn(
                        "group relative p-4 rounded-xl overflow-hidden transition-all duration-300",
                        "border border-gray-100/80 dark:border-white/10 bg-white dark:bg-black",
                        // Default state now has enhanced styling (swapped)
                        "shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_12px_rgba(255,255,255,0.03)] -translate-y-0.5",
                        // On hover, return to simple state with gradient glow
                        "hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_25px_rgba(255,255,255,0.08)]",
                        "hover:translate-y-0 will-change-transform",
                        item.colSpan || "col-span-1",
                        item.colSpan === 2 ? "md:col-span-2" : "",
                        item.onClick ? "cursor-pointer" : ""
                    )}
                >
                    {/* Classy gradient glow on hover */}
                    <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl rounded-2xl" />
                    </div>

                    {/* Animated background pattern - now default visible */}
                    <div className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
                    </div>

                    <div className="relative flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 bg-gradient-to-br from-black/10 to-black/5 dark:from-white/20 dark:to-white/10 group-hover:bg-black/5 dark:group-hover:bg-white/10">
                                {item.icon}
                            </div>
                            <span
                                className={cn(
                                    "text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm",
                                    "bg-black/10 dark:bg-white/20 text-gray-600 dark:text-gray-300",
                                    "transition-colors duration-300 group-hover:bg-black/5 dark:group-hover:bg-white/10"
                                )}
                            >
                                {item.status || "Active"}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px]">
                                {item.title}
                                {item.meta && (
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                                        {item.meta}
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug font-[425]">
                                {item.description}
                            </p>
                        </div>

                        {item.children && (
                            <div className="mt-3">
                                {item.children}
                            </div>
                        )}

                        {/* Footer with CTA only (removed hashtags) */}
                        <div className="flex items-center justify-end mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 opacity-100 group-hover:opacity-60 transition-opacity">
                                {item.cta || "Explore →"}
                            </span>
                        </div>
                    </div>

                    {/* Gradient border effect - now default visible */}
                    <div className="absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10 opacity-100 group-hover:opacity-60 transition-opacity duration-300" />
                </div>
            ))}
        </div>
    );
}

export { BentoGrid };
