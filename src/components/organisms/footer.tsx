import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

const navigation = {
  main: [
    { name: "Accueil", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Tarifs", href: "/tarifs" },
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
    <footer className="bg-blue-50">
      <div className="mx-auto max-w-7xl overflow-hidden px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:px-8">
        <nav
          aria-label="Footer"
          className="-mb-6 flex flex-wrap justify-center gap-x-6 sm:gap-x-8 md:gap-x-12 gap-y-2 sm:gap-y-3 text-xs sm:text-sm"
        >
          {navigation.main.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
          {navigation.legal.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="hover:text-gray-900 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-xs sm:text-sm text-gray-600 px-4">
            &copy; 2025 PRET POUR TCF. Tous les droits sont réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
