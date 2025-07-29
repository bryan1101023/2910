import React, { FC, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { IconAlertCircle } from "@tabler/icons-react";

type TextareaVariant = "default" | "outlined" | "filled" | "ghost";
type TextareaSize = "sm" | "md" | "lg";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: TextareaVariant;
  size?: TextareaSize;
  fullWidth?: boolean;
  // Backward compatibility props
  classoverride?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      variant = "default",
      size = "md",
      fullWidth = false,
      className,
      disabled,
      // Backward compatibility props
      classoverride,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-sm",
      lg: "px-4 py-4 text-base",
    };

    const variantClasses = {
      default: "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-orbit focus:ring-2 focus:ring-orbit/20",
      outlined: "bg-transparent border-2 border-gray-300 dark:border-gray-600 focus:border-orbit focus:ring-2 focus:ring-orbit/20",
      filled: "bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 focus:border-orbit focus:ring-2 focus:ring-orbit/20",
      ghost: "bg-transparent border-none focus:ring-2 focus:ring-orbit/20",
    };

    const errorClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "";

    const disabledClasses = disabled
      ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700"
      : "";

    const widthClasses = fullWidth ? "w-full" : "";

    const finalClassName = twMerge(
      classoverride || className,
      "rounded-lg transition-all duration-200 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 resize-none",
      sizeClasses[size],
      variantClasses[variant],
      errorClasses,
      disabledClasses,
      "text-gray-900 dark:text-white",
      "min-h-[100px]"
    );

    return (
      <div className={twMerge("space-y-1", widthClasses)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          disabled={disabled}
          className={finalClassName}
          {...props}
        />
        
        {(error || helperText) && (
          <div className="flex items-center gap-1">
            {error && <IconAlertCircle className="w-4 h-4 text-red-500" />}
            <p
              className={twMerge(
                "text-sm",
                error
                  ? "text-red-500"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              {error || helperText}
            </p>
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea; 