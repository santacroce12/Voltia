"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Command({ className, ...props }: DivProps) {
    return (
        <div
            className={cn(
                "flex h-full w-full flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground",
                className,
            )}
            {...props}
        />
    );
}

export function CommandList({ className, ...props }: DivProps) {
    return <div className={cn("max-h-60 overflow-y-auto", className)} {...props} />;
}

export function CommandEmpty({ className, ...props }: DivProps) {
    return <div className={cn("py-6 text-center text-sm", className)} {...props} />;
}

export function CommandGroup({ className, ...props }: DivProps) {
    return <div className={cn("overflow-hidden p-1 text-sm", className)} {...props} />;
}

type ItemProps = DivProps & { onSelect?: () => void; value?: string };
export function CommandItem({ className, onSelect, ...props }: ItemProps) {
    return (
        <div
            className={cn(
                "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                className,
            )}
            onClick={onSelect}
            {...props}
        />
    );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export function CommandInput({ className, ...props }: InputProps) {
    return <input className={cn("w-full border-b px-3 py-2 text-sm outline-none", className)} {...props} />;
}
