type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-[3px]",
};

interface OGQSpinnerProps {
  size?: Size;
  className?: string;
}

export function OGQSpinner({ size = "md", className = "" }: OGQSpinnerProps) {
  return (
    <div
      className={`${sizeMap[size]} border-[#d8dfdf] dark:border-gray-700 border-t-[#00c389] rounded-full animate-spin ${className}`}
      role="status"
      aria-label="로딩 중"
    />
  );
}
