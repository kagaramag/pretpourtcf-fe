import type { Metadata } from "next";
import ContactPage from "./contact-client";

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "PrêtPourTCF | Contactez-nous",
  description: "Contactez l'équipe PrêtPourTCF pour toute question sur la préparation au TCF Canada ou TCF Québec. Nous vous répondons sous 24h.",
};

export default function ContactServerPage() {
  return <ContactPage />;
}
