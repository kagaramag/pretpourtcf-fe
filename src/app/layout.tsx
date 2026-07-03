import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query";
import { AuthProvider } from "@/contexts/auth-context";
import { PermissionProvider } from "@/contexts/permission-context";
import GoogleAnalytics from "@/components/analytics/google-analytics";
import { VersionCheck } from "@/components/version-check";
import "@/styles/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "PrêtPourTCF | Préparation TCF Canada & Québec en ligne",
  description: "Préparez votre TCF Canada ou TCF Québec avec des exercices interactifs, audio et corrigés. Suivez vos progrès et atteignez votre score idéal — 100% en ligne.",
  icons: {
    icon: "/images/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${poppins.variable} bg-white antialiased overflow-x-hidden`}>
          <GoogleAnalytics />
          <VersionCheck />
          <AuthProvider>
            <PermissionProvider>
              <QueryProvider>
                {children}
                <Toaster position="top-right" richColors />
              </QueryProvider>
            </PermissionProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
