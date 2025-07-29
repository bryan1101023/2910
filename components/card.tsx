import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type CardVariant = "default" | "elevated" | "outlined" | "glass" | "interactive";

type Props = {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
};

const Card: FC<Props> = ({
  children,
  className,
  variant = "default",
  padding = "md",
  hover = false,
  onClick,
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  const variantClasses = {
    default: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    elevated: "bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-200",
    outlined: "bg-transparent border-2 border-gray-200 dark:border-gray-700",
    glass: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50",
    interactive: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer",
  };

  return (
    <div
      className={twMerge(
        "rounded-xl transition-all duration-200",
        variantClasses[variant],
        paddingClasses[padding],
        hover && "hover:shadow-lg hover:scale-[1.01] transition-all duration-200",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Card Header Component
export const CardHeader: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={twMerge("mb-4", className)}>
    {children}
  </div>
);

// Card Title Component
export const CardTitle: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <h3 className={twMerge("text-lg font-semibold text-gray-900 dark:text-white", className)}>
    {children}
  </h3>
);

// Card Description Component
export const CardDescription: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <p className={twMerge("text-sm text-gray-600 dark:text-gray-400", className)}>
    {children}
  </p>
);

// Card Content Component
export const CardContent: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={twMerge("", className)}>
    {children}
  </div>
);

// Card Footer Component
export const CardFooter: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={twMerge("mt-4 pt-4 border-t border-gray-200 dark:border-gray-700", className)}>
    {children}
  </div>
);

export default Card; 