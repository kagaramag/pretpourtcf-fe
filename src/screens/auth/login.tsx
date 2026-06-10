"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading, Open, Close, Icon } from "@/icons";
import { useAuth } from "@/contexts/auth-context";
import { loginSchema, LoginFormValues } from "@/validations/auth-schema";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>("");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsPending(true);
      setLoginError("");
      setUserEmail(data.email);

      // Get redirect parameter from URL
      const redirectTo = searchParams.get("redirect");
      await login(data, redirectTo || undefined);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password";
      setLoginError(errorMessage);

      // Check if error is about email verification
    } finally {
      setIsPending(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      const { authService } = await import("@/services/auth");
      await authService.resendVerificationEmail(userEmail);
      const { toast } = await import("sonner");
      toast.success(
        "Email de vérification renvoyé! Vérifiez votre boîte de réception."
      );
    } catch (error: any) {
      const { toast } = await import("sonner");
      toast.error("Erreur lors de l'envoi de l'email");
    }
  };

  return (
    <div>
      <h3 className="text-4xl">Accès au compte</h3>
      <h5 className="text-sm text-gray-500 mb-4">
        Entrez vos identifiants pour accéder à votre compte.
      </h5>
      <div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {loginError && (
            <div className="space-y-2">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{loginError}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input id="email" type="email" {...register("email")} />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute cursor-pointer rounded-lg p-1 right-1 top-1"
              >
                {showPassword ? (
                  <Icon name="eyeClosed" size={20} />
                ) : (
                  <Icon name="eyeOpen" size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Mot de passe oublié?
            </Link>
          </div>

          <Button
            size={"lg"}
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loading className="mr-2 h-4 w-4 animate-spin" />
                En cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Vous n'avez pas de compte?{" "}
            <Link
              href={
                searchParams.get("redirect")
                  ? `/signup?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
                  : "/signup"
              }
              className="text-primary hover:underline"
            >
              Inscrivez-vous
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
