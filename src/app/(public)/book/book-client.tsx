"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, Clock, Loading, Verified, ArrowRight, CaretLeft } from "@/icons";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config";
import { cn } from "@/lib/utils";
import Image from "next/image";

const bookingFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Le nom complet doit contenir au moins 2 caractères")
    .max(100),
  email: z.string().email("Adresse email invalide"),
  country: z
    .string()
    .min(2, "Le pays doit contenir au moins 2 caractères")
    .max(100),
  phone: z
    .string()
    .min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres")
    .max(20),
  honeypot: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Day {
  date: Date;
  dayName: string;
  dayNumber: number;
  month: string;
  isToday: boolean;
  isPast: boolean;
}

// Liste complète de tous les pays du monde
const COUNTRIES = [
  "Afghanistan",
  "Afrique du Sud",
  "Albanie",
  "Algérie",
  "Allemagne",
  "Andorre",
  "Angola",
  "Antigua-et-Barbuda",
  "Arabie Saoudite",
  "Argentine",
  "Arménie",
  "Australie",
  "Autriche",
  "Azerbaïdjan",
  "Bahamas",
  "Bahreïn",
  "Bangladesh",
  "Barbade",
  "Belgique",
  "Belize",
  "Bénin",
  "Bhoutan",
  "Biélorussie",
  "Birmanie",
  "Bolivie",
  "Bosnie-Herzégovine",
  "Botswana",
  "Brésil",
  "Brunei",
  "Bulgarie",
  "Burkina Faso",
  "Burundi",
  "Cambodge",
  "Cameroun",
  "Canada",
  "Cap-Vert",
  "Chili",
  "Chine",
  "Chypre",
  "Colombie",
  "Comores",
  "Congo (Brazzaville)",
  "Congo (Kinshasa)",
  "Corée du Nord",
  "Corée du Sud",
  "Costa Rica",
  "Côte d'Ivoire",
  "Croatie",
  "Cuba",
  "Danemark",
  "Djibouti",
  "Dominique",
  "Égypte",
  "Émirats Arabes Unis",
  "Équateur",
  "Érythrée",
  "Espagne",
  "Estonie",
  "Eswatini",
  "États-Unis",
  "Éthiopie",
  "Fidji",
  "Finlande",
  "France",
  "Gabon",
  "Gambie",
  "Géorgie",
  "Ghana",
  "Grèce",
  "Grenade",
  "Guatemala",
  "Guinée",
  "Guinée équatoriale",
  "Guinée-Bissau",
  "Guyana",
  "Haïti",
  "Honduras",
  "Hongrie",
  "Inde",
  "Indonésie",
  "Irak",
  "Iran",
  "Irlande",
  "Islande",
  "Israël",
  "Italie",
  "Jamaïque",
  "Japon",
  "Jordanie",
  "Kazakhstan",
  "Kenya",
  "Kirghizistan",
  "Kiribati",
  "Kosovo",
  "Koweït",
  "Laos",
  "Lesotho",
  "Lettonie",
  "Liban",
  "Liberia",
  "Libye",
  "Liechtenstein",
  "Lituanie",
  "Luxembourg",
  "Macédoine du Nord",
  "Madagascar",
  "Malaisie",
  "Malawi",
  "Maldives",
  "Mali",
  "Malte",
  "Maroc",
  "Marshall (Îles)",
  "Maurice",
  "Mauritanie",
  "Mexique",
  "Micronésie",
  "Moldavie",
  "Monaco",
  "Mongolie",
  "Monténégro",
  "Mozambique",
  "Namibie",
  "Nauru",
  "Népal",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Norvège",
  "Nouvelle-Zélande",
  "Oman",
  "Ouganda",
  "Ouzbékistan",
  "Pakistan",
  "Palaos",
  "Palestine",
  "Panama",
  "Papouasie-Nouvelle-Guinée",
  "Paraguay",
  "Pays-Bas",
  "Pérou",
  "Philippines",
  "Pologne",
  "Portugal",
  "Qatar",
  "République Centrafricaine",
  "République Dominicaine",
  "République Tchèque",
  "Roumanie",
  "Royaume-Uni",
  "Russie",
  "Rwanda",
  "Saint-Christophe-et-Niévès",
  "Saint-Marin",
  "Saint-Vincent-et-les-Grenadines",
  "Sainte-Lucie",
  "Salomon (Îles)",
  "Salvador",
  "Samoa",
  "São Tomé-et-Príncipe",
  "Sénégal",
  "Serbie",
  "Seychelles",
  "Sierra Leone",
  "Singapour",
  "Slovaquie",
  "Slovénie",
  "Somalie",
  "Soudan",
  "Soudan du Sud",
  "Sri Lanka",
  "Suède",
  "Suisse",
  "Suriname",
  "Syrie",
  "Tadjikistan",
  "Tanzanie",
  "Tchad",
  "Thaïlande",
  "Timor Oriental",
  "Togo",
  "Tonga",
  "Trinité-et-Tobago",
  "Tunisie",
  "Turkménistan",
  "Turquie",
  "Tuvalu",
  "Ukraine",
  "Uruguay",
  "Vanuatu",
  "Vatican",
  "Venezuela",
  "Viêt Nam",
  "Yémen",
  "Zambie",
  "Zimbabwe",
];

const SCHEDULE_CONFIG: Record<number, { start: number; end: number }> = {
  1: { start: 8, end: 14 },
  2: { start: 8, end: 12 },
  3: { start: 8, end: 12 },
  4: { start: 8, end: 12 },
  5: { start: 8, end: 12 },
  6: { start: 8, end: 12 },
  0: { start: 0, end: 0 },
};

function BookingPage() {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formStartTime] = useState(Date.now());

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      honeypot: "",
    },
  });

  // Générer les jours de la semaine actuelle et suivante
  const getWeekDays = (weekOffset: number): Day[] => {
    const days: Day[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + weekOffset * 7);

    // Trouver le lundi de la semaine
    const dayOfWeek = startDate.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isPast = date < today;

      days.push({
        date,
        dayName: date.toLocaleDateString("fr-FR", { weekday: "long" }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString("fr-FR", { month: "short" }),
        isToday: date.getTime() === today.getTime(),
        isPast,
      });
    }

    return days;
  };

  const currentWeekDays = getWeekDays(currentWeekOffset);

  // Générer les créneaux horaires de 30min
  const generateTimeSlots = (day: Day): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dayOfWeek = day.date.getDay();
    const config = SCHEDULE_CONFIG[dayOfWeek];

    if (config.start === 0 && config.end === 0) {
      return []; // Jour fermé
    }

    const now = new Date();
    const isToday = day.date.toDateString() === now.toDateString();

    for (let hour = config.start; hour < config.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

        // Vérifier si le créneau est dans le passé
        let available = true;
        if (isToday) {
          const slotTime = new Date(day.date);
          slotTime.setHours(hour, minute, 0, 0);
          available = slotTime > now;
        } else if (day.isPast) {
          available = false;
        }

        slots.push({
          time: timeString,
          available,
        });
      }
    }

    return slots;
  };

  const timeSlots = selectedDay ? generateTimeSlots(selectedDay) : [];

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedDay || !selectedTimeSlot) {
      toast.error("Erreur", {
        description: "Veuillez sélectionner une date et un créneau horaire.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post<{
        status: string;
        message: string;
      }>(API_ENDPOINTS.BOOKING, {
        ...data,
        date: selectedDay.date.toISOString(),
        timeSlot: selectedTimeSlot,
        timestamp: formStartTime,
      });

      if (response.status === "success") {
        setIsSuccess(true);
        reset();
        setSelectedDay(null);
        setSelectedTimeSlot(null);
      } else {
        toast.error("Échec de la réservation", {
          description: "Veuillez réessayer plus tard.",
        });
      }
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Une erreur inattendue s'est produite. Veuillez réessayer.";
      toast.error("Échec de la réservation", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviousWeek = () => {
    if (currentWeekOffset > 0) {
      setCurrentWeekOffset(currentWeekOffset - 1);
      setSelectedDay(null);
      setSelectedTimeSlot(null);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekOffset < 1) {
      setCurrentWeekOffset(currentWeekOffset + 1);
      setSelectedDay(null);
      setSelectedTimeSlot(null);
    }
  };

  const getWeekLabel = () => {
    if (currentWeekOffset === 0) return "Cette semaine";
    if (currentWeekOffset === 1) return "Semaine prochaine";
    return "";
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen  py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto mt-6">
          <div className="text-center p-12">
            <div className="flex justify-center">
              <Verified className="w-20 h-20 text-green-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Réservation confirmée!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Votre session gratuite a été réservée avec succès.
              </p>
              <p className="text-gray-600">
                Un email de confirmation vous sera envoyé à l'adresse fournie
                avec tous les détails de votre session.
              </p>
            </div>
            <Button
              onClick={() => {
                setIsSuccess(false);
                setCurrentWeekOffset(0);
              }}
              variant="tertiary"
              size="lg"
            >
              Réserver une autre session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mt-12">
        <div className="text-center flex flex-col items-center gap-1 mb-10">
          <h2 className="text-3xl lg:text-4xl leading-tight">
            Réservez votre session gratuite
          </h2>
          <div className="max-w-xl text-gray-600">
            Réservez un créneau de 30 minutes avec notre formateur pour discuter
            de vos objectifs et découvrir comment nous pouvons vous aider à
            réussir le TCF.
          </div>
        </div>
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Side - Image and Info */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <div className="lg:sticky lg:top-8">
              <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden mb-6">
                <Image
                  src="/images/book.jpg"
                  alt="Réservez votre session gratuite"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Right Side - Booking Form */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <h1 className="text-4xl font-bold tracking-tight mb-8 lg:hidden">
              Réservez votre session gratuite
            </h1>

            {/* Week Navigation */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  onClick={handlePreviousWeek}
                  disabled={currentWeekOffset === 0}
                  className="gap-2"
                >
                  <CaretLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-semibold">{getWeekLabel()}</h2>
                <Button
                  variant="outline"
                  onClick={handleNextWeek}
                  disabled={currentWeekOffset >= 1}
                  className="gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-1">
                {currentWeekDays.map((day, index) => {
                  const isSelected =
                    selectedDay?.date.getTime() === day.date.getTime();
                  const isClosed =
                    SCHEDULE_CONFIG[day.date.getDay()].start === 0;

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (!day.isPast && !isClosed) {
                          setSelectedDay(day);
                          setSelectedTimeSlot(null);
                        }
                      }}
                      disabled={day.isPast || isClosed}
                      className={cn(
                        "p-2 rounded-lg border transition-all duration-200",
                        "flex flex-col items-center gap-1",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:shadow-sm",
                        (day.isPast || isClosed) &&
                          "opacity-50 cursor-not-allowed",
                        day.isToday &&
                          !isSelected &&
                          "border-primary/30 bg-primary/5"
                      )}
                    >
                      <span className="text-xs font-medium uppercase">
                        {day.dayName}
                      </span>
                      <span className="text-xl font-semibold">
                        {day.dayNumber}
                      </span>
                      <span className="text-xs">{day.month}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDay && (
              <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">
                      Choisissez un créneau horaire (30 minutes - GMT)
                    </h3>
                  </div>
                  <div className="text-sm mb-4 uppercase font-medium text-primary">
                    {selectedDay.dayName} {selectedDay.dayNumber}{" "}
                    {selectedDay.month}
                  </div>
                  {timeSlots.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">
                      Aucun créneau disponible pour ce jour.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() =>
                            slot.available && setSelectedTimeSlot(slot.time)
                          }
                          disabled={!slot.available}
                          className={cn(
                            "py-1.5 px-4 rounded-md border transition-all duration-200",
                            "font-medium text-sm",
                            selectedTimeSlot === slot.time
                              ? "bg-primary text-white border-primary"
                              : "border-border hover:border-primary/50 hover:bg-primary/5",
                            !slot.available && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Booking Form */}
            {selectedDay && selectedTimeSlot && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                  <h3 className="font-semibold mb-2">Vos informations</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Complétez vos informations pour finaliser la réservation
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Honeypot field */}
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
                    <div className="flex lg:flex-row flex-col gap-2">
                      <div className="flex-1 space-y-2">
                        <label
                          htmlFor="fullName"
                          className="text-sm font-medium"
                        >
                          Nom complet{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="fullName"
                          {...register("fullName")}
                          aria-invalid={!!errors.fullName}
                        />
                        {errors.fullName && (
                          <p className="text-xs text-destructive">
                            {errors.fullName.message}
                          </p>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="email"
                          type="email"
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
                    <div className="flex lg:flex-row flex-col gap-2">
                      <div className="flex-1 space-y-2">
                        <label
                          htmlFor="country"
                          className="text-sm font-medium"
                        >
                          Pays <span className="text-destructive">*</span>
                        </label>
                        <Controller
                          name="country"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onChange={field.onChange}
                              value={field.value}
                              options={COUNTRIES.map((country) => ({
                                value: country,
                                label: country,
                              }))}
                              placeholder="Sélectionnez votre pays"
                              className={cn(
                                errors.country && "border-destructive"
                              )}
                            />
                          )}
                        />
                        {errors.country && (
                          <p className="text-xs text-destructive">
                            {errors.country.message}
                          </p>
                        )}
                      </div>

                      <div className="flex-2 space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          Numéro de téléphone(avec code pays)
                          <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register("phone")}
                          aria-invalid={!!errors.phone}
                        />
                        {errors.phone && (
                          <p className="text-xs text-destructive">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">
                        Récapitulatif :
                      </p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <Calendar className="inline w-4 h-4 mr-2" />
                          {selectedDay.dayName} {selectedDay.dayNumber}{" "}
                          {selectedDay.month}
                        </p>
                        <p>
                          <Clock className="inline w-4 h-4 mr-2" />
                          {selectedTimeSlot} (30 minutes)
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600">
                      En réservant, vous acceptez de recevoir un email de
                      confirmation. Vos données ne seront jamais partagées avec
                      des tiers.
                    </p>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="w-full gap-2"
                      variant="tertiary"
                    >
                      {isSubmitting ? (
                        <>
                          <Loading className="w-4 h-4 animate-spin" />
                          Réservation en cours...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          Confirmer la réservation
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* Help Section */}
            {!selectedDay && (
              <div>
                <div className="space-y-1 pt-2 pb-6 grid grid-cols-2 gap-1 justify-center">
                  <div className="flex items-start gap-3 bg-tertiary/30 rounded-2xl p-3 flex-1">
                    <Verified className="w-5 h-5 text-primary" />
                    <p className="text-sm">
                      Session personnalisée de 30 minutes
                    </p>
                  </div>
                  <div className="flex items-start gap-3 bg-tertiary/30 rounded-2xl p-3 flex-1">
                    <Verified className="w-5 h-5 text-primary" />
                    <p className="text-sm">Conseils adaptés à votre niveau</p>
                  </div>
                  <div className="flex items-start gap-3 bg-tertiary/30 rounded-2xl p-3 flex-1">
                    <Verified className="w-5 h-5 text-primary" />
                    <p className="text-sm">Réponses à toutes vos questions</p>
                  </div>
                  <div className="flex items-start gap-3 bg-tertiary/30 rounded-2xl p-3 flex-1">
                    <Verified className="w-5 h-5 text-primary" />
                    <p className="text-sm">Plan d'étude sur mesure</p>
                  </div>
                </div>
                <div className="text-center mt-12">
                  <p className="text-sm text-gray-600">
                    Besoin d'aide? Contactez-nous à{" "}
                    <a
                      href="mailto:contact@pretpourtcf.com"
                      className="text-primary hover:underline font-medium"
                    >
                      contact@pretpourtcf.com
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
