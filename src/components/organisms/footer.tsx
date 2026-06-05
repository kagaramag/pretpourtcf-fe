import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

const navigation = {
  main: [
    { name: "Accueil", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Tarifs", href: "/tarifs" },
    { name: "Séance gratuite", href: "/book" },
    { name: "Contact", href: "/contactez-nous" },
  ],
  legal: [
    { name: "Politique de confidentialité", href: "#" },
    { name: "Conditions d'utilisation", href: "#" },
    { name: "Mentions légales", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        {/* Main Navigation */}
        <nav
          aria-label="Footer"
          className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 md:gap-x-8 lg:gap-x-12 gap-y-3 sm:gap-y-4 text-sm sm:text-base"
        >
          {navigation.main.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-white/80 hover:text-white transition-colors duration-200 touch-manipulation"
            >
              {item.name}
            </Link>
          ))}
        </nav>


        {/* Legal Links */}
        {/* <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-2 sm:gap-y-3 text-xs sm:text-sm text-white/60">
          {navigation.legal.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="hover:text-white/80 transition-colors duration-200 touch-manipulation"
            >
              {item.name}
            </Link>
          ))}
        </div> */}

        {/* Copyright */}
        <div className="mt-8 sm:mt-10 border-t border-border/5 pt-6 sm:pt-8">
          <p className="text-center text-xs sm:text-sm text-white/60 px-4">
            &copy; {new Date().getFullYear()} PrêtPourTCF. Tous les droits sont réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
