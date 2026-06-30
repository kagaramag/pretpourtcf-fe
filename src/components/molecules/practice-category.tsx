"use client";

import { Icon } from "@/icons";
import Link from "next/link";
import { PracticeType } from "@/types";

export type PracticeCategorySlug = "co" | "ce" | "eo" | "ee";

export type PracticeCategoryData = {
  type: PracticeType;
  label: string;
  slug: PracticeCategorySlug;
  description: string;
  icon: "listen" | "read" | "speak" | "write";
  color: string;
  iconBg: string;
  textColor: string;
  border: string;
  selectedBg: string;
  minutes: number;
  itemCount: number;
  itemLabel: string;
};

export const PRACTICE_CATEGORIES: PracticeCategoryData[] = [
  {
    type: "listening",
    label: "Compréhension Orale",
    slug: "co",
    description: "Tendez l'oreille — chaque son compte",
    icon: "listen",
    color: "bg-primary",
    iconBg: "bg-primary/70",
    textColor: "text-primary",
    border: "border-primary/30",
    selectedBg: "bg-primary/10",
    minutes: 35,
    itemCount: 39,
    itemLabel: "questions",
  },
  {
    type: "reading",
    label: "Compréhension Ecrite",
    slug: "ce",
    description: "Décodez les mots, maîtrisez le sens",
    icon: "read",
    color: "bg-secondary",
    iconBg: "bg-secondary/70",
    textColor: "text-secondary",
    border: "border-secondary/30",
    selectedBg: "bg-secondary/10",
    minutes: 60,
    itemCount: 39,
    itemLabel: "questions",
  },
  {
    type: "speaking",
    label: "Expression Orale",
    slug: "eo",
    description: "Prenez la parole avec assurance",
    icon: "speak",
    color: "bg-purple-300",
    iconBg: "bg-purple-400",
    textColor: "text-purple-500",
    border: "border-purple-200/30",
    selectedBg: "bg-purple-50/10",
    minutes: 60,
    itemCount: 3,
    itemLabel: "tâches",
  },
  {
    type: "writing",
    label: "Expression Ecrite",
    slug: "ee",
    description: "Transformez vos idées en mots justes",
    icon: "write",
    color: "bg-orange-400",
    iconBg: "bg-orange-500",
    textColor: "text-orange-600",
    border: "border-orange-200",
    selectedBg: "bg-orange-50",
    minutes: 12,
    itemCount: 3,
    itemLabel: "tâches",
  },
];

interface PracticeCategoryCardProps {
  category: PracticeCategoryData;
  variant?: "default" | "compact";
  href?: string;
  selected?: boolean;
  onClick?: () => void;
}

export function PracticeCategoryCard({
  category,
  variant = "default",
  href,
  selected,
  onClick,
}: PracticeCategoryCardProps) {
  const isCompact = variant === "compact";

  const card = (
    <div
      className={`relative overflow-hidden rounded-2xl border ${category.border} ${
        isCompact ? "p-4" : "p-5"
      } transition-all duration-200 hover:shadow-md ${
        selected ? category.selectedBg : "bg-white"
      }`}
    >
      <div
        className={`flex ${isCompact ? "items-center gap-3" : "items-start gap-4"}`}
      >
        <div
          className={`flex shrink-0 items-center justify-center text-white ${category.iconBg} ${
            isCompact ? "h-8 w-8 rounded-lg" : "h-12 w-12 rounded-xl"
          }`}
        >
          <Icon
            name={category.icon}
            size={isCompact ? 16 : 24}
            // color={category.textColor}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`text-gray-900 ${isCompact ? "text-sm" : "font-semibold text-base"}`}
          >
            {category.label}
          </h3>
          {!isCompact && (
            <>
              <p className="text-sm text-gray-700 leading-relaxed">
                {category.description}
              </p>
              <div className={`flex items-center gap-3 mt-2 text-xs ${category.textColor}`}>
                <span className="flex items-center gap-1">
                  <Icon name="clock" size={20} />
                  {category.minutes} minutes
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="fileQuestion" size={20} />
                  {category.itemCount} {category.itemLabel}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="shrink-0 mt-1 transition-transform group-hover:translate-x-1">
          <Icon
            name="arrowRight"
            size={isCompact ? 16 : 18}
            className="text-gray-400"
          />
        </div>
      </div>
      <div
        className={`absolute bottom-0 left-0 h-1 w-full ${category.color}`}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group" onClick={onClick}>
        {card}
      </Link>
    );
  }

  return (
    <button type="button" className="group text-left w-full" onClick={onClick}>
      {card}
    </button>
  );
}
