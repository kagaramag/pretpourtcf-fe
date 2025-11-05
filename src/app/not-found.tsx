"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import PublicLayout from "@/layouts/public";
import animationData from "@/assets/lotties/nodata.json";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16">
        <div className="max-w-md w-full">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            className="w-full h-auto"
          />
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Page Non Trouvée</h1>
          <p className="text-lg text-gray-600 max-w-md">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
            >
              Retour en arrière
            </Button>
            <Link href="/">
              <Button variant="default" size="lg">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
