"use client";

import AccountLayout from "@/layouts/account";
import Link from "next/link";
import MethodEO from "./methodology";
import { Button } from "@/components/ui/button";

export default function SpeakingPracticePage() {
  return (
    <AccountLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-2">
          <Link
            href="/compte"
            className="px-0 text-blue-600 hover:text-blue-400"
          >
            &larr; Retour aux pratiques
          </Link>
        </div>
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="lg:text-3xl text-xl font-bold">Expression Orale</h1>
          </div>
          <h5>
            Choisissez un exercice d&apos;expression orale pour pratiquer votre
            expression et prononciation
          </h5>
        </div>
        <MethodEO />
        <div className="mt-6 flex justify-center items-center gap-2">
          <Link href="/compte/pratique/eo/test">
            <Button size={"lg"}>Test aleatoire</Button>
          </Link>
          {/* <Link href="/compte/pratique/eo/sujets">
            <Button variant={"outline"} size={"lg"}>Voir tout les sujets</Button>
          </Link> */}
        </div>
      </div>
    </AccountLayout>
  );
}
