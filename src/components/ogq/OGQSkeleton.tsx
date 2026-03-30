interface OGQSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedMap = { sm: "rounded", md: "rounded-lg", lg: "rounded-xl", full: "rounded-full" };

export function OGQSkeleton({ className = "", width, height, rounded = "md" }: OGQSkeletonProps) {
  return (
    <div
      className={`bg-[#eef1f1] dark:bg-gray-800 animate-pulse ${roundedMap[rounded]} ${className}`}
      style={{ width, height }}
    />
  );
}

export function OGQSkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-[#111] rounded-xl border border-[#eef1f1] dark:border-gray-800 overflow-hidden ${className}`}>
      <div className="aspect-video bg-[#eef1f1] dark:bg-gray-800 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-[#eef1f1] dark:bg-gray-800 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-[#eef1f1] dark:bg-gray-800 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}
