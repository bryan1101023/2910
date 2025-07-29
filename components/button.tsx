import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { workspacestate } from "@/state";
import { useRecoilState } from "recoil";
import { IconLoader2 } from "@tabler/icons-react";

type ButtonVariant = 
  | "primary" 
  | "secondary" 
  | "outline" 
  | "ghost" 
  | "destructive" 
  | "success"
  | "workspace";

type ButtonSize = "sm" | "md" | "lg" | "xl";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  onClick?: () => void;
  classoverride?: string;
  loading?: boolean;
  workspace?: boolean;
  compact?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
};

const Button: FC<Props> = ({
  children,
  onPress,
  onClick,
  loading = false,
  classoverride,
  workspace = false,
  compact = false,
  disabled = false,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  iconPosition = "left",
}) => {
  const [workspaceState] = useRecoilState(workspacestate);

  // Size classes
  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-14 px-8 text-lg",
  };

  // Variant classes
  const variantClasses = {
    primary: "bg-orbit hover:bg-orbit/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-orbit/50 focus:ring-offset-2",
    secondary: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700",
    outline: "border-2 border-orbit text-orbit hover:bg-orbit hover:text-white transition-all duration-200",
    ghost: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
    destructive: "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2",
    success: "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2",
    workspace: `bg-[color:rgb(var(--group-theme))] hover:bg-[color:rgb(var(--group-theme)/0.9)] text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-[color:rgb(var(--group-theme)/0.5)] focus:ring-offset-2`,
  };

  // Disabled state
  const disabledClasses = disabled || loading 
    ? "opacity-50 cursor-not-allowed pointer-events-none" 
    : "cursor-pointer";

  // Width classes
  const widthClasses = fullWidth ? "w-full" : "";

  // Compact override
  const compactClasses = compact ? "h-8 px-3 text-xs" : sizeClasses[size];

  return (
    <button
      type={type}
      onClick={onPress || onClick}
      disabled={disabled || loading}
      className={twMerge(
        "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none",
        variantClasses[workspace ? "workspace" : variant],
        compactClasses,
        disabledClasses,
        widthClasses,
        classoverride
      )}
    >
      {loading ? (
        <>
          <IconLoader2 className="w-4 h-4 animate-spin" />
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </button>
  );
};

export default Button;