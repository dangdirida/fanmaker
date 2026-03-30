import Image from "next/image";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { px: number; text: string; cls: string }> = {
  xs: { px: 24, text: "text-[10px]", cls: "w-6 h-6" },
  sm: { px: 32, text: "text-xs", cls: "w-8 h-8" },
  md: { px: 40, text: "text-sm", cls: "w-10 h-10" },
  lg: { px: 56, text: "text-lg", cls: "w-14 h-14" },
  xl: { px: 80, text: "text-2xl", cls: "w-20 h-20" },
};

interface OGQAvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: Size;
  className?: string;
}

export function OGQAvatar({ src, alt = "", name, size = "md", className = "" }: OGQAvatarProps) {
  const s = sizeMap[size];
  const initial = (name || alt || "?").charAt(0).toUpperCase();

  return (
    <div className={`${s.cls} rounded-full overflow-hidden bg-[#00c389] flex items-center justify-center flex-shrink-0 ${className}`}>
      {src ? (
        <Image src={src} alt={alt} width={s.px} height={s.px} className="w-full h-full object-cover" unoptimized />
      ) : (
        <span className={`font-bold text-white ${s.text}`}>{initial}</span>
      )}
    </div>
  );
}
