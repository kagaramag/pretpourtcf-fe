"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Phone, Send, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config";

const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100),
  email: z.string().email("Adresse email invalide"),
  subject: z
    .string()
    .min(3, "Le sujet doit contenir au moins 3 caractères")
    .max(200),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000),
  honeypot: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStartTime] = useState(Date.now());

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      honeypot: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const response = await apiClient.post<{ status: string; message: string }>(
        API_ENDPOINTS.CONTACT,
        {
          ...data,
          timestamp: formStartTime,
        }
      );

      if (response.status === "success") {
        toast.success("Message envoyé avec succès!", {
          description: "Nous vous répondrons dans les plus brefs délais.",
        });
        reset();
      } else {
        toast.error("Échec de l'envoi du message", {
          description: "Veuillez réessayer plus tard.",
        });
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Une erreur inattendue s'est produite. Veuillez réessayer.";
      toast.error("Échec de l'envoi du message", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto mt-12">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Contactez-nous
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Vous avez des questions sur Pret Pour TCF? Nous sommes là pour vous
            aider. Envoyez-nous un message et nous vous répondrons dans les plus
            brefs délais.
          </p>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl p-4 mx-auto lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Envoyez-nous un message</CardTitle>
              <CardDescription>
                Remplissez le formulaire ci-dessous et nous vous répondrons dans
                les 24 heures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Honeypot field - hidden from users, visible to bots */}
                <input
                  type="text"
                  {...register("honeypot")}
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    width: "1px",
                    height: "1px",
                  }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Nom <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="name"
                      placeholder="Jean Dupont"
                      {...register("name")}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean@exemple.com"
                      {...register("email")}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Sujet <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="subject"
                    placeholder="Comment pouvons-nous vous aider?"
                    {...register("subject")}
                    aria-invalid={!!errors.subject}
                  />
                  {errors.subject && (
                    <p className="text-xs text-destructive">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Parlez-nous de votre demande..."
                    className="min-h-32"
                    {...register("message")}
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-muted-foreground">
                    Nous ne partagerons jamais vos informations avec des tiers
                  </p>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Envoyer
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Besoin d'une assistance immédiate? Écrivez-nous directement à{" "}
            <a
              href="mailto:contact@pretpourtcf.com"
              className="text-primary hover:underline font-medium"
            >
              contact@pretpourtcf.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
