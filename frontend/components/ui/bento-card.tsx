"use client";

import { cn } from "@/lib/utils";
import React from "react";

export interface BentoCardProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    status?: string;
    tags?: string[];
    meta?: string;
    cta?: string;
    hasPersistentHover?: boolean;
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
    variant?: "default" | "large" | "compact";
}

export function BentoCard({
    title,
    description,
    icon,
    status,
    tags,
    meta,
    cta,
    hasPersistentHover = false,
    onClick,
    children,
    className,
    variant = "default"
}: BentoCardProps) {
    const isCompact = variant === "compact";
    const isLarge = variant === "large";

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative rounded-xl overflow-hidden transition-all duration-300",
                "border border-gray-100/80 dark:border-white/10 bg-white dark:bg-black",
                // Default state now has the enhanced styling (swapped from hover)
                "shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_12px_rgba(255,255,255,0.03)] -translate-y-0.5",
                // On hover, return to simple state with gradient glow
                "hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_25px_rgba(255,255,255,0.08)]",
                "hover:translate-y-0 will-change-transform",
                onClick ? "cursor-pointer" : "",
                isCompact ? "p-3" : isLarge ? "p-6" : "p-4",
                className
            )}
        >
            {/* Animated background pattern - now default visible, hidden on hover */}
            <div className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
            </div>

            {/* Classy gradient glow on hover */}
            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl rounded-2xl" />
            </div>

            <div className={cn("relative flex flex-col", isCompact ? "space-y-2" : "space-y-3")}>
                {/* Header with icon and status */}
                {(icon || status) && (
                    <div className="flex items-center justify-between">
                        {icon && (
                            <div className={cn(
                                "rounded-lg flex items-center justify-center transition-all duration-300",
                                // Default state now has gradient (swapped)
                                "bg-gradient-to-br from-black/10 to-black/5 dark:from-white/20 dark:to-white/10",
                                // Hover returns to simple state
                                "group-hover:bg-black/5 dark:group-hover:bg-white/10",
                                isCompact ? "w-6 h-6" : "w-8 h-8"
                            )}>
                                {icon}
                            </div>
                        )}
                        {status && (
                            <span className={cn(
                                "text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm transition-colors duration-300",
                                // Default state enhanced (swapped)
                                "bg-black/10 dark:bg-white/20 text-gray-600 dark:text-gray-300",
                                // Hover returns to simple
                                "group-hover:bg-black/5 dark:group-hover:bg-white/10"
                            )}>
                                {status}
                            </span>
                        )}
                    </div>
                )}

                {/* Title and description */}
                <div className={cn("space-y-2", isCompact && "space-y-1")}>
                    <h3 className={cn(
                        "font-medium text-gray-900 dark:text-gray-100 tracking-tight",
                        isCompact ? "text-sm" : isLarge ? "text-lg" : "text-[15px]"
                    )}>
                        {title}
                        {meta && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                                {meta}
                            </span>
                        )}
                    </h3>
                    {description && (
                        <p className={cn(
                            "text-gray-600 dark:text-gray-300 leading-snug font-[425]",
                            isCompact ? "text-xs" : "text-sm"
                        )}>
                            {description}
                        </p>
                    )}
                </div>

                {/* Custom children content */}
                {children && (
                    <div className={cn(isCompact ? "mt-2" : "mt-3")}>
                        {children}
                    </div>
                )}

                {/* Footer with CTA only (removed tags/hashtags) */}
                {cta && (
                    <div className="flex items-center justify-end mt-2">
                        <span className={cn(
                            "text-xs text-gray-500 dark:text-gray-400 transition-opacity duration-300",
                            // Default visible (swapped)
                            "opacity-100 group-hover:opacity-60"
                        )}>
                            {cta}
                        </span>
                    </div>
                )}
            </div>

            {/* Gradient border effect - now default visible */}
            <div className="absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10 opacity-100 group-hover:opacity-60 transition-opacity duration-300" />
        </div>
    );
}
