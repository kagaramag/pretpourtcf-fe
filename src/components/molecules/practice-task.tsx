"use client";

import Link from "next/link";
import { Icon } from "@/icons";
import { Button } from "@/components/ui/button";
import { Practice } from "@/types";
import { PracticeCategoryData } from "@/components/molecules/practice-category";

interface PracticeTaskProps {
  practice: Practice;
  href: string;
  variant?: "card" | "list" | "trainer";
  category?: PracticeCategoryData;
  onClick?: () => void;
}

export function PracticeTask({
  practice,
  href,
  variant = "card",
  category,
  onClick,
}: PracticeTaskProps) {
  if (variant === "list") {
    return (
      <Link href={href} onClick={onClick}>
        <div className="flex lg:flex-row flex-col items-center justify-baseline gap-4 px-4 py-2.5 bg-gray-50/30 border border-gray-100/90 cursor-pointer hover:bg-gray-50 rounded-lg">
          {category && (
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${category.iconBg}`}
            >
              <Icon name={category.icon} size={20} />
            </div>
          )}
          <div className="w-5/12 flex items-center">
            <h3 className="text-sm">{practice.title}</h3>
            {practice.freemium && (
              <span className="bg-green-600 text-green-50 px-2 py-0.5 rounded-full text-xs mx-2">
                Free
              </span>
            )}
            {!practice.freemium && (
              <div className="w-6 h-6 text-primary">
                <Icon name="premium" />
              </div>
            )}
          </div>
          <div className="w-3/12 flex flex-row items-center justify-start gap-4 text-sm">
            <span>Questions: {practice.totalQuestions}</span>
            <span>Durée: {practice.durationMinutes} min</span>
          </div>
          <div className="flex items-center gap-2 justify-end ml-auto">
            <Button
              variant={practice.freemium ? "default" : "ghost"}
              disabled={!practice.freemium}
              icon="arrowRight"
            >
              Commencer
            </Button>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "trainer") {
    return (
      <Link href={href} onClick={onClick}>
        <div className="border border-gray-200 p-3 rounded-lg flex items-center gap-3">
          {category && (
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${category.iconBg}`}
            >
              <Icon name={category.icon} size={16} />
            </div>
          )}
          <h2 className="flex-1 text-sm leading-none">
            {practice.title}
          </h2>
          <div>
            <Button icon="arrowRight">View</Button>
          </div>
        </div>
      </Link>
    );
  }

  // Default: "card" variant
  return (
    <Link href={href} onClick={onClick}>
      <div className="border border-gray-200 p-4 hover:bg-primary/5 hover:border-primary hover:text-primary cursor-pointer flex flex-row items-center gap-3 rounded-2xl">
        {category && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${category.iconBg}`}
          >
            <Icon name={category.icon} size={20} />
          </div>
        )}
        <h3 className="flex-1 text-sm tracking-wide leading-tight">
          {practice.title}
        </h3>
        <div className="w-6 h-6">
          <Icon name="arrowRight" />
        </div>
      </div>
    </Link>
  );
}
