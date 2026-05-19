import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Fredoka } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query";
import { AuthProvider } from "@/contexts/auth-context";
import { PermissionProvider } from "@/contexts/permission-context";
import GoogleAnalytics from "@/components/analytics/google-analytics";
import "@/styles/globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "PRET POUR TCF",
  description: "Analytics and Recovery Management System",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${fredoka.variable} bg-white antialiased`}>
          <GoogleAnalytics />
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
