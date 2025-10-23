import type { Metadata } from "next";
import { Geist, Fredoka } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query";
import { AuthProvider } from "@/contexts/auth-context";
import { PermissionProvider } from "@/contexts/permission-context";
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PermissionProvider>
              <QueryProvider>
                {children}
                <Toaster position="top-right" richColors />
              </QueryProvider>
            </PermissionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
