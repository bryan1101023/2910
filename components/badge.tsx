import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type BadgeVariant = 
  | "default" 
  | "primary" 
  | "secondary" 
  | "success" 
  | "warning" 
  | "destructive" 
  | "outline";

type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

const Badge: FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className,
  icon,
  iconPosition = "left",
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const variantClasses = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    primary: "bg-orbit/10 text-orbit border border-orbit/20",
    secondary: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20",
    success: "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20",
    destructive: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
    outline: "bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300",
  };

  return (
    <span
      className={twMerge(
        "inline-flex items-center gap-1.5 font-medium rounded-lg transition-all duration-200",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </span>
  );
};

export default Badge; 