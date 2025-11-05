"use client";

import TrainerLayout from "@/layouts/trainer";

export default function AccountLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TrainerLayout>{children}</TrainerLayout>;
}
