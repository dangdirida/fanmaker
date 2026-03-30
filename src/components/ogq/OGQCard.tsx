import { type HTMLAttributes, forwardRef } from "react";

interface OGQCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = { none: "", sm: "p-3", md: "p-4", lg: "p-6" };

export const OGQCard = forwardRef<HTMLDivElement, OGQCardProps>(
  ({ hoverable, padding = "none", className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-white dark:bg-[#111] rounded-xl border border-[#eef1f1] dark:border-gray-800 overflow-hidden transition-all duration-200 ${hoverable ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : ""} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
OGQCard.displayName = "OGQCard";
