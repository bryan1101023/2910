import React, { FC } from "react";
import { twMerge } from "tailwind-merge";
import { IconLoader2 } from "@tabler/icons-react";

type SpinnerSize = "sm" | "md" | "lg" | "xl";
type SpinnerVariant = "default" | "primary" | "white" | "gradient";

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  text?: string;
}

const Spinner: FC<SpinnerProps> = ({
  size = "md",
  variant = "default",
  className,
  text,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const variantClasses = {
    default: "text-gray-500 dark:text-gray-400",
    primary: "text-orbit",
    white: "text-white",
    gradient: "text-transparent bg-clip-text bg-gradient-to-r from-orbit to-pink-600",
  };

  const spinnerVariants = {
    default: (
      <IconLoader2 
        className={twMerge(
          "animate-spin",
          sizeClasses[size],
          variantClasses[variant],
          className
        )} 
      />
    ),
    dots: (
      <div className={twMerge("flex space-x-1", className)}>
        <div className={twMerge(
          "w-2 h-2 rounded-full animate-bounce",
          variant === "primary" ? "bg-orbit" : "bg-gray-400 dark:bg-gray-600"
        )} style={{ animationDelay: '0ms' }} />
        <div className={twMerge(
          "w-2 h-2 rounded-full animate-bounce",
          variant === "primary" ? "bg-orbit" : "bg-gray-400 dark:bg-gray-600"
        )} style={{ animationDelay: '150ms' }} />
        <div className={twMerge(
          "w-2 h-2 rounded-full animate-bounce",
          variant === "primary" ? "bg-orbit" : "bg-gray-400 dark:bg-gray-600"
        )} style={{ animationDelay: '300ms' }} />
      </div>
    ),
    pulse: (
      <div className={twMerge(
        "rounded-full animate-pulse",
        sizeClasses[size],
        variant === "primary" ? "bg-orbit" : "bg-gray-400 dark:bg-gray-600",
        className
      )} />
    ),
  };

  if (text) {
    return (
      <div className="flex flex-col items-center space-y-2">
        {spinnerVariants.default}
        <span className={twMerge(
          "text-sm",
          variantClasses[variant]
        )}>
          {text}
        </span>
      </div>
    );
  }

  return spinnerVariants.default;
};

export default Spinner; 