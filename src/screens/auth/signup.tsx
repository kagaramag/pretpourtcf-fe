"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Eye, EyeOff, Mail, UserPlus } from "lucide-react";
import { authService } from "@/services/auth";
import { referralService } from "@/services/referral";
import { toast } from "sonner";

const signupSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["client", "trainer"], {
    required_error: "Please select your account type",
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [signupError, setSignupError] = useState<string>("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [referralToken, setReferralToken] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "client",
    },
  });

  // Check for referral token in URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setIsValidatingReferral(true);
      referralService
        .validateToken(ref)
        .then((response) => {
          if (response.success && response.data) {
            setReferralToken(ref);
            setReferrerName(
              `${response.data.referrer.first_name} ${response.data.referrer.last_name}`
            );
          }
        })
        .catch(() => {
          // Invalid or expired token
          toast.error("Le lien d'invitation est invalide ou a expiré");
        })
        .finally(() => {
          setIsValidatingReferral(false);
        });
    }
  }, [searchParams]);

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsPending(true);
      setSignupError("");

      const response = await authService.register({
        ...data,
        referralToken: referralToken || undefined,
      });

      if (response.data) {
        // Check if email verification is required
        if (response.data.requiresEmailVerification) {
          setUserEmail(response.data.user.email);
          setShowVerificationMessage(true);
          toast.success("Compte créé! Vérifiez votre email.");
        } else {
          // Old flow: direct login (for backward compatibility)
          toast.success("Account created successfully!");
          const redirectPath = data.role === "trainer" ? "/trainer" : "/compte";
          setTimeout(() => {
            router.push(redirectPath);
            router.refresh();
          }, 100);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create account";
      setSignupError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsPending(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      await authService.resendVerificationEmail(userEmail);
      toast.success("Email de vérification renvoyé!");
    } catch (error: any) {
      toast.error("Erreur lors de l'envoi de l'email");
    }
  };

  // Show verification message after successful signup
  if (showVerificationMessage) {
    return (
      <Card className="">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <Mail className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Vérifiez votre email</CardTitle>
          <CardDescription>
            Un email de vérification a été envoyé à <strong>{userEmail}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-sm text-blue-800">
              Veuillez vérifier votre boîte de réception et cliquer sur le lien
              pour activer votre compte avant de vous connecter.
            </p>
            <p className="text-xs text-blue-600">
              N'oubliez pas de vérifier vos spams si vous ne trouvez pas
              l'email.
            </p>
          </div>

          <Button
            onClick={() => router.push("/login")}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Aller à la page de connexion
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Vous n'avez pas reçu l'email?
            </p>
            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="w-full"
            >
              Renvoyer l'email de vérification
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-semibold">Créer un compte</h3>
      <div className="text-sm text-gray-500 mb-4">
        Inscrivez-vous pour accéder aux tests d'entraînement
        <br /> et suivre votre progression.
      </div>

      {/* Referral indicator */}
      {referrerName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <UserPlus className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Invitation de {referrerName}
            </p>
            <p className="text-xs text-blue-600">
              Vous créez un compte suite à une invitation
            </p>
          </div>
        </div>
      )}

      <div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {signupError && <p className="text-red-400 text-sm">{signupError}</p>}

          <div className="flex flex-col lg:flex-row gap-2">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-foreground">
                Nom
              </Label>
              <div className="relative">
                <Input
                  id="first_name"
                  type="text"
                  {...register("first_name")}
                />
              </div>
              {errors.first_name && (
                <p className="text-sm text-red-500">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-foreground">
                Prenom
              </Label>
              <div className="relative">
                <Input
                  id="last_name"
                  type="text"
                  {...register("last_name")}
                />
              </div>
              {errors.last_name && (
                <p className="text-sm text-red-500">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-foreground">
              Type de compte
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center space-x-2 border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  watch("role") === "client"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  value="client"
                  {...register("role")}
                  className="sr-only"
                />
                <span className="font-medium">Apprenant</span>
              </label>
              <label
                className={`flex items-center justify-center space-x-2 border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  watch("role") === "trainer"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  value="trainer"
                  {...register("role")}
                  className="sr-only"
                />
                <span className="font-medium">Formateur</span>
              </label>
            </div>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <div className="relative">
              <Input id="email" type="email" {...register("email")} />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            size={"lg"}
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                En cours...
              </>
            ) : (
              "S’inscrire"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Vous avez déjà un compte?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Connectez-vous
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
