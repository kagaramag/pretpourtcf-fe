import { IndexScreen } from "@/screens/home";
import type { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "PrêtPourTCF | Préparez le TCF Canada & Québec en ligne",
  description:
    "Entraînez-vous pour le TCF Canada ou le TCF Québec avec des exercices interactifs, audio et corrigés. Suivez vos progrès et atteignez votre score idéal — 100% en ligne.",
  keywords: [
    "TCF Canada",
    "TCF Québec",
    "préparation TCF",
    "test de français",
    "compréhension orale",
    "compréhension écrite",
    "expression orale",
    "expression écrite",
    "apprendre le français",
    "examen TCF en ligne",
  ],
  authors: [{ name: "PrêtPourTCF" }],
  metadataBase: new URL("https://pretpourtcf.com"),
  openGraph: {
    type: "website",
    url: "https://pretpourtcf.com/",
    title: "PrêtPourTCF | Préparez le TCF Canada & Québec en ligne",
    description:
      "Des exercices audio, corrigés et interactifs pour vous entraîner efficacement au TCF. Améliorez votre score et progressez chaque jour.",
    siteName: "PrêtPourTCF",
    images: [
      {
        url: "/images/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "PrêtPourTCF - Préparation TCF Canada & Québec en ligne",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrêtPourTCF | Préparez le TCF Canada & Québec en ligne",
    description:
      "Entraînez-vous pour le TCF Canada ou Québec avec des exercices audio et des résultats instantanés.",
    images: ["/images/og-cover.jpg"],
  },
  alternates: {
    canonical: "https://pretpourtcf.com",
  },
};

export default function LoginPage() {
  return <IndexScreen />;
}
