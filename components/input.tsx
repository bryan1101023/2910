import React, { FC, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { IconEye, IconEyeOff, IconAlertCircle } from "@tabler/icons-react";

type InputVariant = "default" | "outlined" | "filled" | "ghost";
type InputSize = "sm" | "md" | "lg";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  // Backward compatibility props
  classoverride?: string;
  append?: string;
  prepend?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = "default",
      size = "md",
      leftIcon,
      rightIcon,
      fullWidth = false,
      loading = false,
      className,
      type = "text",
      disabled,
      // Backward compatibility props
      classoverride,
      append,
      prepend,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";

    const sizeClasses = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-4 text-sm",
      lg: "h-13 px-4 text-base",
    };

    const variantClasses = {
      default: "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-orbit focus:ring-4 focus:ring-orbit/10 shadow-sm",
      outlined: "bg-transparent border-2 border-gray-300 dark:border-gray-600 focus:border-orbit focus:ring-4 focus:ring-orbit/10",
      filled: "bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 focus:border-orbit focus:ring-4 focus:ring-orbit/10",
      ghost: "bg-transparent border-none focus:ring-4 focus:ring-orbit/10",
    };

    const errorClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
      : "";

    const disabledClasses = disabled || loading
      ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-700"
      : "";

    const widthClasses = fullWidth ? "w-full" : "";

    // Handle backward compatibility
    const finalClassName = twMerge(
      classoverride || className,
      "rounded-xl transition-all duration-200 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 font-medium",
      sizeClasses[size],
      variantClasses[variant],
      errorClasses,
      disabledClasses,
      leftIcon && "pl-11",
      (rightIcon || isPassword) && "pr-11",
      "text-gray-900 dark:text-white"
    );

    // Handle append/prepend
    if (append || prepend) {
      return (
        <div className={twMerge("space-y-2", widthClasses)}>
          {label && (
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              {label}
            </label>
          )}
          
          <div className="flex">
            {prepend && (
              <span className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-xl font-medium">
                {prepend}
              </span>
            )}
            
            <input
              ref={ref}
              type={isPassword && showPassword ? "text" : type}
              disabled={disabled || loading}
              className={twMerge(
                finalClassName,
                prepend && "rounded-l-none",
                append && "rounded-r-none"
              )}
              {...props}
            />
            
            {append && (
              <span className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-xl font-medium">
                {append}
              </span>
            )}
          </div>
          
          {(error || helperText) && (
            <div className="flex items-center gap-2">
              {error && <IconAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
              <p
                className={twMerge(
                  "text-sm font-medium",
                  error
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                {error || helperText}
              </p>
            </div>
          )}
        </div>
      );
    }

    // Default input
    return (
      <div className={twMerge("space-y-2", widthClasses)}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            disabled={disabled || loading}
            className={finalClassName}
            {...props}
          />
          
          {rightIcon && !isPassword && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {rightIcon}
            </div>
          )}
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              {showPassword ? (
                <IconEyeOff className="w-4 h-4" />
              ) : (
                <IconEye className="w-4 h-4" />
              )}
            </button>
          )}
          
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-orbit rounded-full animate-spin" />
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="flex items-center gap-2">
            {error && <IconAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
            <p
              className={twMerge(
                "text-sm font-medium",
                error
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
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

Input.displayName = "Input";

export default Input;
