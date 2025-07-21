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
                "hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]",
                "hover:-translate-y-0.5 will-change-transform",
                onClick ? "cursor-pointer" : "",
                isCompact ? "p-3" : isLarge ? "p-6" : "p-4",
                {
                    "shadow-[0_2px_12px_rgba(0,0,0,0.03)] -translate-y-0.5":
                        hasPersistentHover,
                    "dark:shadow-[0_2px_12px_rgba(255,255,255,0.03)]":
                        hasPersistentHover,
                },
                className
            )}
        >
            {/* Animated background pattern */}
            <div
                className={`absolute inset-0 ${
                    hasPersistentHover
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                } transition-opacity duration-300`}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
            </div>

            <div className={cn("relative flex flex-col", isCompact ? "space-y-2" : "space-y-3")}>
                {/* Header with icon and status */}
                {(icon || status) && (
                    <div className="flex items-center justify-between">
                        {icon && (
                            <div className={cn(
                                "rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 group-hover:bg-gradient-to-br transition-all duration-300",
                                isCompact ? "w-6 h-6" : "w-8 h-8"
                            )}>
                                {icon}
                            </div>
                        )}
                        {status && (
                            <span
                                className={cn(
                                    "text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm",
                                    "bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300",
                                    "transition-colors duration-300 group-hover:bg-black/10 dark:group-hover:bg-white/20"
                                )}
                            >
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

                {/* Footer with tags and CTA */}
                {(tags?.length || cta) && (
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            {tags?.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/20"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        {cta && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                {cta}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Gradient border effect */}
            <div
                className={`absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10 ${
                    hasPersistentHover
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                } transition-opacity duration-300`}
            />
        </div>
    );
}
