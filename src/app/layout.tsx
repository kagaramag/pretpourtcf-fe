import type { Metadata } from "next";
import { Geist, Fredoka } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query";
import { AuthProvider } from "@/contexts/auth-context";
import { PermissionProvider } from "@/contexts/permission-context";
import GoogleAnalytics from "@/components/analytics/google-analytics";
import "@/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});
const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "Pret Pour TCF",
  description: "Analytics and Recovery Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fredoka.variable} antialiased`}>
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
