"use client";

import { X } from "lucide-react";
import LearnerNavigation from "@/components/molecules/learner-navigation";

// Mon compte, Pratiques, abonnements, Historique, Series, Parrainages,

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={classNames(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-full",
          "bg-white lg:bg-transparent",
          "transform transition-transform duration-300 ease-in-out lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "flex flex-col h-screen lg:h-auto overflow-y-auto lg:overflow-visible",
          "shadow-xl lg:shadow-none"
        )}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="w-full space-y-2 flex flex-col px-4 lg:px-0">
          <LearnerNavigation onLinkClick={onClose} />
        </div>
      </div>
    </>
  );
}
