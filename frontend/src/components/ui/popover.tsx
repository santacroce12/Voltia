"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PopoverContextValue = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

type PopoverProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
};

export function Popover({ open: openProp, onOpenChange, children }: PopoverProps) {
    const [openState, setOpenState] = React.useState(false);
    const open = openProp !== undefined ? openProp : openState;
    const setOpen = (val: boolean) => {
        if (onOpenChange) onOpenChange(val);
        else setOpenState(val);
    };
    return <PopoverContext.Provider value={{ open, setOpen }}>{children}</PopoverContext.Provider>;
}

export function PopoverTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
    const ctx = React.useContext(PopoverContext);
    if (!ctx) return children;
    const triggerProps = {
        onClick: () => ctx.setOpen(!ctx.open),
        "aria-expanded": ctx.open,
    };
    return asChild ? React.cloneElement(children, triggerProps) : <button {...triggerProps}>{children}</button>;
}

export const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        const ctx = React.useContext(PopoverContext);
        if (!ctx?.open) return null;
        return (
            <div
                ref={ref}
                className={cn(
                    "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
                    className,
                )}
                {...props}
            >
                {children}
            </div>
        );
    },
);
PopoverContent.displayName = "PopoverContent";
