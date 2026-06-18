"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
} from "@/components/ui/card";
import { ArrowLeft, Email } from "@/icons";
import Link from "next/link";
import { toast } from "sonner";
import { authService } from "@/services/auth";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Veuillez entrer votre adresse e-mail");
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success("Les instructions de réinitialisation ont été envoyées à votre e-mail");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Échec de l'envoi de l'e-mail de réinitialisation";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div>
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Email className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl">Vérifiez votre e-mail</h3>
          <div>
            Nous avons envoyé les instructions de réinitialisation du mot de passe à <strong>{email}</strong>
          </div>
          <div>
            <div className="space-y-4 mt-3">
              <div className="text-sm text-gray-600">
                Vous n'avez pas reçu l'e-mail ? Vérifiez votre dossier spam ou réessayez.
              </div>
              <Button
                size={"lg"}
                variant="outline"
                className="w-full"
                onClick={() => setIsSubmitted(false)}
              >
                Essayer un autre e-mail
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full max-w-md">
        <h3 className="text-2xl font-semibold">Mot de passe oublié?</h3>
        <div className="text-sm text-gray-500 mb-4">
          Entrez votre adresse e-mail et nous vous enverrons les instructions
          pour réinitialiser votre mot de passe.
        </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              size={"lg"}
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Envoyer les instructions"}
            </Button>

            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
