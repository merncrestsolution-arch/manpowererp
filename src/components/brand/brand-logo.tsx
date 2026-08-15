import { cn } from "@/lib/utils";

const ASSETS = {
  color: {
    src: "/brand/jk-manpower-logo.png",
    width: 588,
    height: 380,
  },
  onDark: {
    src: "/brand/jk-manpower-logo-on-dark.png",
    width: 588,
    height: 380,
  },
  mark: {
    src: "/brand/jk-manpower-mark.png",
    width: 326,
    height: 231,
  },
} as const;

type BrandLogoProps = {
  variant?: keyof typeof ASSETS;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  variant = "color",
  className,
  priority = false,
}: BrandLogoProps) {
  const asset = ASSETS[variant];

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local PNGs; next/image optimizer fails on this Windows path
    <img
      src={asset.src}
      alt="JK Manpower — Right People. Right Solutions."
      width={asset.width}
      height={asset.height}
      className={cn(
        "max-h-full max-w-full object-contain object-center",
        className,
      )}
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}
