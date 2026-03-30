import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "default" | "outline" | "ghost" | "text";
type Color = "primary" | "mono" | "error";
type Size = "sm" | "md" | "lg";

interface OGQButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  color?: Color;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const styles: Record<Variant, Record<Color, string>> = {
  default: {
    primary: "bg-[#00c389] text-white hover:bg-[#00b57f] active:bg-[#00996e]",
    mono: "bg-[#262d2e] text-white hover:bg-[#425052] active:bg-[#57676b]",
    error: "bg-[#e21235] text-white hover:bg-[#c90e2e]",
  },
  outline: {
    primary: "border border-[#00c389] text-[#00c389] hover:bg-[#00c389]/5",
    mono: "border border-[#d8dfdf] text-[#425052] hover:bg-[#f4f6f6] dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
    error: "border border-[#e21235] text-[#e21235] hover:bg-[#e21235]/5",
  },
  ghost: {
    primary: "text-[#00c389] hover:bg-[#00c389]/5",
    mono: "text-[#57676b] hover:bg-[#f4f6f6] dark:text-gray-400 dark:hover:bg-gray-800",
    error: "text-[#e21235] hover:bg-[#e21235]/5",
  },
  text: {
    primary: "text-[#00c389] hover:underline",
    mono: "text-[#57676b] hover:underline dark:text-gray-400",
    error: "text-[#e21235] hover:underline",
  },
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-[10px]",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
};

export const OGQButton = forwardRef<HTMLButtonElement, OGQButtonProps>(
  ({ variant = "default", color = "primary", size = "md", loading, leftIcon, rightIcon, fullWidth, className = "", children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none ${sizes[size]} ${styles[variant][color]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
);
OGQButton.displayName = "OGQButton";
