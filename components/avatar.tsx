import React, { FC, useState } from "react";
import { twMerge } from "tailwind-merge";
import { IconUser } from "@tabler/icons-react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  className?: string;
  fallback?: string;
  status?: "online" | "offline" | "away" | "busy";
  ring?: boolean;
}

const Avatar: FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  className,
  fallback,
  status,
  ring = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-20 h-20 text-xl",
  };

  const statusClasses = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    away: "bg-yellow-500",
    busy: "bg-red-500",
  };

  const statusSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
    "2xl": "w-5 h-5",
  };

  const ringClasses = ring ? "ring-2 ring-white/20 dark:ring-gray-700/50" : "";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative inline-block">
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          onError={() => setImageError(true)}
          className={twMerge(
            "rounded-xl object-cover bg-gray-200 dark:bg-gray-700",
            sizeClasses[size],
            ringClasses,
            className
          )}
        />
      ) : (
        <div
          className={twMerge(
            "rounded-xl bg-gradient-to-br from-orbit to-pink-600 flex items-center justify-center text-white font-semibold",
            sizeClasses[size],
            ringClasses,
            className
          )}
        >
          {fallback ? (
            getInitials(fallback)
          ) : (
            <IconUser className="w-1/2 h-1/2" />
          )}
        </div>
      )}
      
      {status && (
        <span
          className={twMerge(
            "absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-800",
            statusClasses[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
};

export default Avatar; 