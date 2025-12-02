import * as React from "react"
import { cn } from "@/lib/utils"

const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/50"
                onClick={() => onOpenChange(false)}
            />
            <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]">
                {children}
            </div>
        </>
    )
}

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "w-full max-w-lg rounded-lg border bg-white p-6 shadow-lg",
            className
        )}
        {...props}
    >
        {children}
    </div>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => (
    <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-gray-500", className)}
        {...props}
    />
))
DialogDescription.displayName = "DialogDescription"

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription }
