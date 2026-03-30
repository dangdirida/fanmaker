import { type ReactNode } from "react";

type BadgeColor = "primary" | "mono" | "error" | "purple" | "blue" | "red" | "green" | "orange" | "yellow";
type BadgeSize = "sm" | "md";

const colorStyles: Record<BadgeColor, string> = {
  primary: "bg-[#dff4ea] text-[#00996e] dark:bg-[#00c389]/15 dark:text-[#58dab1]",
  mono: "bg-[#f4f6f6] text-[#57676b] dark:bg-gray-800 dark:text-gray-400",
  error: "bg-red-50 text-[#e21235] dark:bg-red-900/20 dark:text-red-400",
  purple: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  red: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  green: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  orange: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[10px] px-1.5 py-0.5 rounded",
  md: "text-xs px-2.5 py-1 rounded-md",
};

interface OGQBadgeProps {
  color?: BadgeColor;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function OGQBadge({ color = "mono", size = "sm", icon, children, className = "" }: OGQBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-medium ${colorStyles[color]} ${sizeStyles[size]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}
