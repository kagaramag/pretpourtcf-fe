import { type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/icons";

export type MenuItem =
  | {
      type: "button";
      label: ReactNode;
      onClick?: () => void;
      icon?: IconName;
      variant?: "default" | "danger";
      disabled?: boolean;
    }
  | {
      type: "link";
      label: ReactNode;
      to: string;
      icon?: IconName;
      variant?: "default" | "danger";
    }
  // | ;

interface MenuProps {
  trigger: ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
  className?: string;
}

const variantStyles = {
  default: "text-gray-700 hover:bg-gray-100",
  danger: "text-red-600 hover:bg-red-50",
};

export function Menu({ trigger, items, align = "right", className }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dropdownRef.current && menuRef.current) {
      const triggerRect = dropdownRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const menuWidth = menuRef.current.offsetWidth;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      const top =
        spaceBelow < menuHeight && spaceAbove > menuHeight
          ? triggerRect.top - menuHeight - 8
          : triggerRect.bottom + 8;

      const left =
        align === "right"
          ? Math.max(0, triggerRect.right - menuWidth)
          : Math.min(triggerRect.left, window.innerWidth - menuWidth);

      setMenuStyle({ top, left });
    }
  }, [isOpen, align]);

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={menuRef}
          style={menuStyle}
          className="fixed min-w-50 bg-white border border-border py-1 z-50 shadow-lg"
        >
          {items.map((item, index) => {
            const itemClasses = cn(
              "w-full px-3.5 py-2 text-sm text-left transition-colors flex items-center gap-3 cursor-pointer",
              variantStyles[item.variant || "default"]
            );

            if (item.type === "link") {
              return (
                <Link
                  key={index}
                  href={item.to}
                  className={itemClasses}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <span className="shrink-0"><Icon name={item.icon} size={16} /></span>}
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={index}
                className={itemClasses}
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
              >
                {item.icon && <span className="shrink-0"><Icon name={item.icon} size={16} /></span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
