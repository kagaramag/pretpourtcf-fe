"use client";

import { useAuth } from "@/contexts/auth-context";
import { NavigationLink } from "@/components/ui/navigation-link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "@/icons";

interface AuthCTAButtonsProps {
  signUpVariant?: "default" | "outline";
}

export default function AuthCTAButtons({ signUpVariant = "default" }: AuthCTAButtonsProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <NavigationLink href="/compte">
        <Button size="lg" variant="tertiary">
          Mon compte <ArrowRight className="mx-2 h-4 w-4" />
        </Button>
      </NavigationLink>
    );
  }

  return (
    <>
      <NavigationLink href="/signup">
        <Button size="lg" variant={signUpVariant}>
          Créer un compte
        </Button>
      </NavigationLink>
      <NavigationLink href="/compte/essai-gratuit">
        <Button variant="tertiary" size="lg">
          Essayer gratuitement
        </Button>
      </NavigationLink>
    </>
  );
}
