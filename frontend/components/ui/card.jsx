import * as React from "react"
import { cn } from "@/lib/utils"


const Card = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-lg border bg-card text-card-foreground shadow-sm bg-white p-8",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

export { Card }
