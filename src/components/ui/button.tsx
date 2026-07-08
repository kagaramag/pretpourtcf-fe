import * as React from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/icons";

import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "ghost"
  | "outline"
  | "tertiary"
  | "accent";
type ButtonSize = "sm" | "md" | "lg";
type ButtonShape = "default" | "pill";

// Legacy aliases for backwards compatibility with existing code
type LegacyVariant =
  | ButtonVariant
  | "default"
  | "destructive"
  | "tertiary"
  | "accent"
  | "link";
type LegacySize = ButtonSize | "default" | "icon" | "icon-sm" | "icon-lg";

const resolveVariant = (v: LegacyVariant): ButtonVariant => {
  if (v === "default") return "primary";
  if (v === "destructive") return "danger";
  if (v === "tertiary") return "tertiary";
  if (v === "accent") return "primary";
  if (v === "link") return "ghost";
  return v;
};

const resolveSizeStyles = (s: LegacySize, iconOnly: boolean): string => {
  const legacySizeMap: Record<string, string> = {
    default: sizes.md,
    icon: iconOnlySizes.md,
    "icon-sm": iconOnlySizes.sm,
    "icon-lg": iconOnlySizes.lg,
  };
  if (legacySizeMap[s]) return legacySizeMap[s];
  return iconOnly ? iconOnlySizes[s as ButtonSize] : sizes[s as ButtonSize];
};

interface ButtonProps extends React.ComponentProps<"button"> {
  children?: React.ReactNode;
  variant?: LegacyVariant;
  size?: LegacySize;
  isLoading?: boolean;
  href?: string;
  iconOnly?: boolean;
  block?: boolean;
  icon?: IconName;
  fill?: boolean;
  shape?: ButtonShape;
  target?: "_blank" | "_self" | "_parent" | "_top";
}

const baseStyles =
  "inline-flex items-center justify-center transition-colors focus:outline-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";

const filledVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-500/70 border border-primary",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200/80 border border-gray-100",
  tertiary:
    "bg-tertiary text-black hover:bg-tertiary-500/70 border border-tertiary",
  accent: "bg-tertiary text-black hover:bg-tertiary/70 border border-tertiary",
  danger: "bg-red-500 text-white hover:bg-red-400 border border-red-500",
  success: "bg-green-600 text-white hover:bg-green-700 border border-green-600",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
  outline:
    "bg-white border border-primary text-primary hover:border-primary hover:text-primary hover:bg-white",
};

const outlineVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-white border border-primary-500 text-primary-700 hover:bg-primary hover:text-black",
  secondary:
    "bg-gray-100 border border-gray-100 text-gray-900 hover:bg-gray-200/80",
  accent: "bg-tertiary border border-tertiary text-white hover:bg-gray-200/80",
  tertiary:
    "bg-tertiary border border-tertiary text-black hover:bg-tertiary hover:text-white",
  danger: "bg-white border border-red-500 text-red-500 hover:bg-red-100",
  success: "bg-white border border-green-500 text-green-500 hover:bg-green-50",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
  outline:
    "bg-white border border-primary text-primary hover:border-primary hover:text-primary hover:bg-white",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-2 py-1 text-[11px] h-6",
  md: "lg:px-3.5 px-2 text-sm text-xs lg:h-8 h-6",
  lg: "px-7 h-10 text-[15px]",
};

const iconOnlySizes: Record<ButtonSize, string> = {
  sm: "p-1 text-xs w-6 h-6",
  md: "p-2 text-sm w-8 h-8",
  lg: "p-3 text-lg w-12 h-12",
};

const iconSizeMap: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 20,
};

function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  href,
  iconOnly = false,
  icon,
  block = false,
  fill = true,
  shape = "default",
  target,
  ...props
}: ButtonProps) {
  const resolvedVariant = resolveVariant(variant);
  const variants = fill ? filledVariants : outlineVariants;
  const sizeStyles = resolveSizeStyles(size, iconOnly);
  const blockStyles = block ? "w-full" : "";
  const shapeStyles = shape === "pill" ? "rounded-full" : "rounded-full";
  const combinedClassName = cn(
    baseStyles,
    variants[resolvedVariant],
    sizeStyles,
    blockStyles,
    shapeStyles,
    className
  );
  const resolvedSize: ButtonSize =
    size === "icon" || size === "icon-sm" || size === "default"
      ? size === "default"
        ? "md"
        : "sm"
      : size === "icon-lg"
        ? "lg"
        : size;
  const iconSize = iconSizeMap[resolvedSize];

  const content = isLoading ? (
    <>
      <Icon name="loading" size={16} className="mr-2" />
      Loading...
    </>
  ) : iconOnly && icon ? (
    <Icon name={icon} size={iconSize} />
  ) : (
    <>
      {icon && <Icon name={icon} size={iconSize} className="mr-2" />}
      {children}
    </>
  );

  if (href) {
    const isExternal =
      href.startsWith("http://") || href.startsWith("https://");

    if (isExternal || target === "_blank") {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedClassName}
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={combinedClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={combinedClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
}

/**
 * Helper to generate button class names without rendering a Button component.
 * Used by alert-dialog, calendar, pagination, etc.
 */
function buttonVariants(opts?: {
  variant?: LegacyVariant;
  size?: LegacySize | "default";
  className?: string;
}) {
  const { variant = "primary", size = "md", className } = opts ?? {};
  const resolved = resolveVariant(variant);
  const sizeVal: LegacySize = size === "default" ? "md" : size;
  const sizeStyle = resolveSizeStyles(sizeVal, false);
  return cn(baseStyles, filledVariants[resolved], sizeStyle, className);
}

export { Button, buttonVariants };
export type { ButtonProps };
