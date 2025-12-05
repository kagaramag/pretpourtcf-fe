"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token de vérification manquant dans l'URL");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await authService.verifyEmail(token);

      setStatus("success");
      setMessage(
        response.message ||
          "Email vérifié avec succès! Votre compte est maintenant actif."
      );
      toast.success("Email vérifié avec succès!");

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/compte");
        router.refresh();
      }, 2000);
    } catch (error: any) {
      setStatus("error");
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de la vérification de votre email";
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-6" className="flex flex-col items-center space-y-6">
          {status === "loading" && (
            <>
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
              <p className="text-center text-muted-foreground">
                Veuillez patienter pendant que nous vérifions votre email...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-lg font-medium bg-gray-500">
                  {message}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vous allez être redirigé vers votre compte...
                </p>
              </div>
              <Button
                onClick={() => router.push("/compte")}
                className="w-full"
              >
                Aller à mon compte
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 p-3">
                  <XCircle className="h-16 w-16 text-red-600" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-lg font-medium bg-gray-500">{message}</p>
                <p className="text-sm text-muted-foreground">
                  Le lien de vérification est peut-être expiré ou invalide.
                </p>
              </div>
              <div className="w-full space-y-2">
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full"
                  variant="outline"
                >
                  Aller à la page de connexion
                </Button>
                <Link href="/signup" className="block w-full">
                  <Button variant="ghost" className="w-full">
                    Créer un nouveau compte
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="p-6" className="flex flex-col items-center space-y-6">
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
              <p className="text-center text-muted-foreground">
                Veuillez patienter pendant que nous vérifions votre email...
              </p>
            </div>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
