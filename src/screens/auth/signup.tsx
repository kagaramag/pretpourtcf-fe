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
import { Card } from "@/components/ui/card";
import { Loading, Open, Close, Email, Plus } from "@/icons";
import { authService } from "@/services/auth";
import { referralService } from "@/services/referral";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const signupSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
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
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [referralToken, setReferralToken] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [referralEmail, setReferralEmail] = useState<string | null>(null);
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"client" | "trainer" | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      role: undefined,
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
            if (response.data.inviteeEmail) {
              setReferralEmail(response.data.inviteeEmail);
              setValue("email", response.data.inviteeEmail);
            }
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

          // Get redirect parameter from URL
          const redirectTo = searchParams.get('redirect');
          const redirectPath = redirectTo || (data.role === "trainer" ? "/trainer" : "/compte");

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

  const handleRoleConfirm = () => {
    if (selectedRole) {
      setValue("role", selectedRole);
      setShowForm(true);
    }
  };

  // Show verification message after successful signup
  if (showVerificationMessage) {
    return (
      <div>
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-tertiary/20 p-7">
            <Email className="h-12 w-12 text-tertiary" />
          </div>
        </div>
        <h5 className="text-2xl text-center mb-4">Vérifiez votre email</h5>
        <div className="space-y-4">
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
            block
            variant={"tertiary"}
          >
            Aller à la page de connexion
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-500 mb-2">
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
        </div>
      </div>
    );
  }

  // Show role selection screen first
  if (!showForm) {
    return (
      <div>
        <h3 className="text-4xl">Créer un compte</h3>
        <h5 className="text-sm text-gray-500 mb-6">
          Choisissez votre type de compte pour commencer
        </h5>

        {/* Referral indicator */}
        {referrerName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <Plus className="h-5 w-5 text-blue-600 mt-0.5" />
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

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedRole("client")}
              className={`flex flex-col items-center justify-center space-y-3 border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedRole === "client"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-gray-300"
              }`}
            >
              <div className="text-4xl">👨‍🎓</div>
              <span className="font-semibold text-lg">Apprenant</span>
              <p className="text-sm text-gray-600 text-center">
                Je veux m'entraîner et passer des tests
              </p>
            </button>

            <button
              onClick={() => setSelectedRole("trainer")}
              className={`flex flex-col items-center justify-center space-y-3 border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedRole === "trainer"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-gray-300"
              }`}
            >
              <div className="text-4xl">👨‍🏫</div>
              <span className="font-semibold text-lg">Formateur</span>
              <p className="text-sm text-gray-600 text-center">
                Je veux créer et gérer des tests
              </p>
            </button>
          </div>

          <Button
            size="lg"
            onClick={handleRoleConfirm}
            className="w-full"
            disabled={!selectedRole}
          >
            Continuer
          </Button>

        </div>
      </div>
    );
  }

  // Show signup form after role selection
  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setShowForm(false);
          setSelectedRole(null);
        }}
        className="w-auto"
      >
        Retour
      </Button>
      <h3 className="text-2xl font-semibold">Créer un compte</h3>
      <div className="text-sm text-gray-500 mb-4">
        Inscrivez-vous en tant que{" "}
        <span className="font-semibold">
          {selectedRole === "client" ? "Apprenant" : "Formateur"}
        </span>
      </div>

      {/* Referral indicator */}
      {referrerName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <Plus className="h-5 w-5 text-blue-600 mt-0.5" />
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
              <Label htmlFor="first_name">
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
              <Label htmlFor="last_name">
                Prenom
              </Label>
              <div className="relative">
                <Input id="last_name" type="text" {...register("last_name")} />
              </div>
              {errors.last_name && (
                <p className="text-sm text-red-500">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                {...register("email")}
                disabled={!!referralEmail}
                className={referralEmail ? "bg-muted" : ""}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Numéro de téléphone
            </Label>
            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 md:text-sm">
              <PhoneInput
                international
                defaultCountry="RW"
                value={phoneNumber}
                onChange={(value) => {
                  setPhoneNumber(value || "");
                  setValue("phone", value || "", { shouldValidate: true });
                }}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
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
                className="absolute right-3 top-3 text-gray-600 hover:bg-gray-500"
              >
                {showPassword ? (
                  <Close className="h-4 w-4" />
                ) : (
                  <Open className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size={"lg"}
              type="submit"
              className="flex-1"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loading className="mr-2 h-4 w-4 animate-spin" />
                  En cours...
                </>
              ) : (
                "S'inscrire"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
