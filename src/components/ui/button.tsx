import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-[15px] font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg border-0",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                outline:
                    "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent/50 hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-12 px-6 py-3",
                sm: "h-9 rounded-xl px-4 text-xs",
                lg: "h-14 rounded-2xl px-10 text-lg",
                icon: "h-10 w-10 rounded-xl",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

import { MovingBorderButton } from "./moving-border"

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        // Apply Moving Border ONLY for 'default' variant (Primary)
        // and when NOT being used as a Slot (asChild) since MovingBorderButton is a complex wrapper
        if (variant === "default" && !asChild) {
            return (
                <MovingBorderButton
                    // MovingBorderButton expects containerClassName for wrapper, className for inner content
                    containerClassName={cn("p-[1px]", className)} // external Margin/Positioning might go here, but usually buttonVariants handles it?
                    // actually standard button usage puts margin/display on the button itself.
                    // MovingBorderButton wrapper needs to act like the button.
                    className={cn(buttonVariants({ variant, size, className }), "bg-primary text-primary-foreground border-0")} // Inner content styling
                    borderRadius="0.75rem" // Match rounded-xl/2x typically. defaults to 1.75rem. let's use 0.75rem (12px) or 1rem.
                    duration={3000}
                    {...props}
                />
            )
        }

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
