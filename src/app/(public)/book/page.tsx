import type { Metadata } from "next";
import BookingPage from "./book-client";

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "PrêtPourTCF | Réserver une séance gratuite",
  description: "Réservez une session gratuite de 30 minutes avec un formateur TCF. Discutez de vos objectifs et recevez un plan d'étude personnalisé.",
};

export default function BookServerPage() {
  return <BookingPage />;
}
