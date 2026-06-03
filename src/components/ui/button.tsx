import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-3xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#F97316] text-white hover:bg-[#ea6c0a] focus-visible:ring-orange-500",
        secondary: "bg-[#1D1A40] text-white hover:bg-[#2d2960]",
        outline: "border-2 border-[#1D1A40] bg-white text-[#1D1A40] hover:bg-[#1D1A40] hover:text-white",
        ghost: "hover:bg-gray-100 text-[#1D1A40]",
        destructive: "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        sm: "h-9 px-5 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
